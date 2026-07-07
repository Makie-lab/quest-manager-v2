'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { quests, activityLog, users, calendarEvents, posts, teams, teamMembers } from '@/db/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ====== EMAIL NOTIFICATIONS ======

async function notifyAllMembers(subject: string, body: string) {
  if (!resend) return;
  try {
    const allUsers = await db.select().from(users).where(eq(users.notificationsEnabled, true));
    const emails = allUsers.map(u => u.email).filter(Boolean);
    if (emails.length === 0) return;

    for (const email of emails) {
      try {
        await resend.emails.send({
          from: 'Quest Manager <onboarding@resend.dev>',
          to: email,
          subject,
          html: `
            <div style="font-family: 'Courier New', monospace; background: #1a1a2e; color: #e8d5b7; padding: 24px; border: 4px solid #5c4a2a; max-width: 500px;">
              <h1 style="color: #ffd700; font-size: 16px; margin-bottom: 16px;">⛏️ QUEST MANAGER</h1>
              <hr style="border-color: #5c4a2a;" />
              ${body}
              <hr style="border-color: #5c4a2a; margin-top: 16px;" />
              <p style="color: #5c4a2a; font-size: 11px;">Keep adventuring! 🗡️</p>
            </div>
          `,
        });
      } catch (e) {
        console.error(`Failed to email ${email}:`, e);
      }
    }
  } catch (e) {
    console.error('Notification error:', e);
  }
}

// ====== USER ======

export async function ensureUser() {
  const user = await currentUser();
  if (!user) throw new Error('Not authenticated');

  const existing = await db.select().from(users).where(eq(users.id, user.id));
  if (existing.length === 0) {
    await db.insert(users).values({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName || user.username || 'Adventurer',
      imageUrl: user.imageUrl,
    });
  }
  return user;
}

// ====== QUESTS ======

export async function createQuest(formData: FormData) {
  const user = await ensureUser();
  const name = formData.get('name') as string;
  const deadline = formData.get('deadline') as string;
  const priority = parseInt(formData.get('priority') as string) || 1;

  if (!name || !deadline) throw new Error('Name and deadline required');

  const [quest] = await db.insert(quests).values({
    userId: user.id,
    name,
    deadline: new Date(deadline),
    priority,
    status: 'resting',
    equipment: '[]',
  }).returning();

  await db.insert(activityLog).values({
    userId: user.id,
    questId: quest.id,
    action: 'created',
    details: JSON.stringify({ name, priority }),
  });

  const priorityLabels = ['', 'Easy', 'Medium', 'Urgent'];
  await notifyAllMembers(
    `🆕 New Quest: ${name}`,
    `<h2 style="color:#4a8c3f;">🆕 NEW QUEST FORGED</h2>
     <p><strong>Quest:</strong> ${name}</p>
     <p><strong>Priority:</strong> ${priorityLabels[priority]}</p>
     <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
     <p><strong>By:</strong> ${user.firstName || 'Adventurer'}</p>`
  );

  revalidatePath('/');
  revalidatePath('/quests');
  return quest;
}

export async function updateQuestStatus(questId: string, newStatus: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');
  const user = await currentUser();

  const [quest] = await db.select().from(quests).where(
    and(eq(quests.id, questId), eq(quests.userId, userId))
  );
  if (!quest) throw new Error('Quest not found');

  const oldStatus = quest.status;
  let equipment = JSON.parse(quest.equipment || '[]') as string[];

  if (oldStatus !== newStatus) {
    if (newStatus === 'wip' && !equipment.includes('sword')) equipment.push('sword');
    else if (newStatus === 'done' && !equipment.includes('shield')) equipment.push('shield');
    else if (newStatus === 'resting' && equipment.length > 0 && !equipment.includes('armor')) equipment.push('armor');
  }

  await db.update(quests).set({
    status: newStatus,
    equipment: JSON.stringify(equipment),
    updatedAt: new Date(),
  }).where(eq(quests.id, questId));

  await db.insert(activityLog).values({
    userId,
    questId,
    action: newStatus === 'done' ? 'completed' : 'status_changed',
    details: JSON.stringify({ name: quest.name, from: oldStatus, to: newStatus }),
  });

  const emoji: Record<string, string> = { wip: '⚒️', done: '✅', resting: '💤' };
  const label: Record<string, string> = { wip: 'In Progress', done: 'Completed', resting: 'Resting' };

  await notifyAllMembers(
    `${emoji[newStatus] || '🔄'} Quest ${label[newStatus] || 'Updated'}: ${quest.name}`,
    `<h2 style="color:${newStatus === 'done' ? '#4a8c3f' : '#ffd700'};">${emoji[newStatus] || '🔄'} QUEST ${(label[newStatus] || 'UPDATED').toUpperCase()}</h2>
     <p><strong>Quest:</strong> ${quest.name}</p>
     <p><strong>Status:</strong> ${label[oldStatus] || oldStatus} → <strong>${label[newStatus] || newStatus}</strong></p>
     <p><strong>By:</strong> ${user?.firstName || 'Adventurer'}</p>`
  );

  revalidatePath('/');
  revalidatePath('/quests');
}

export async function deleteQuest(questId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');
  const user = await currentUser();

  const [quest] = await db.select().from(quests).where(
    and(eq(quests.id, questId), eq(quests.userId, userId))
  );

  await db.delete(quests).where(
    and(eq(quests.id, questId), eq(quests.userId, userId))
  );

  await db.insert(activityLog).values({
    userId,
    questId: null,
    action: 'deleted',
    details: JSON.stringify({ name: quest?.name }),
  });

  if (quest) {
    await notifyAllMembers(
      `🗑️ Quest Deleted: ${quest.name}`,
      `<h2 style="color:#e63946;">🗑️ QUEST DELETED</h2>
       <p><strong>Quest:</strong> ${quest.name}</p>
       <p><strong>By:</strong> ${user?.firstName || 'Adventurer'}</p>`
    );
  }

  revalidatePath('/');
  revalidatePath('/quests');
}

export async function getQuests(sort: 'deadline' | 'priority' = 'deadline') {
  const { userId } = auth();
  if (!userId) return [];

  return db.select().from(quests)
    .where(eq(quests.userId, userId))
    .orderBy(sort === 'priority' ? desc(quests.priority) : quests.deadline);
}

// ====== CALENDAR EVENTS ======

export async function createCalendarEvent(formData: FormData) {
  const user = await ensureUser();
  const title = formData.get('title') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!title || !startDate || !endDate) throw new Error('Title and dates required');

  const [event] = await db.insert(calendarEvents).values({
    createdBy: user.id,
    title,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    color: '#ffd700',
  }).returning();

  await db.insert(activityLog).values({
    userId: user.id,
    action: 'event_created',
    details: JSON.stringify({ title }),
  });

  revalidatePath('/team/calendar');
  return event;
}

export async function getCalendarEvents() {
  const { userId } = auth();
  if (!userId) return [];

  return db.select().from(calendarEvents)
    .where(eq(calendarEvents.createdBy, userId))
    .orderBy(calendarEvents.startDate);
}

export async function deleteCalendarEvent(eventId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  await db.delete(calendarEvents).where(
    and(eq(calendarEvents.id, eventId), eq(calendarEvents.createdBy, userId))
  );

  revalidatePath('/team/calendar');
}

// ====== ACTIVITY ======

export async function getActivityHeatmap() {
  const { userId } = auth();
  if (!userId) return [];

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return db.select({
    date: sql<string>`DATE(${activityLog.date})`,
    count: sql<number>`COUNT(*)::int`,
  })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), gte(activityLog.date, oneYearAgo)))
    .groupBy(sql`DATE(${activityLog.date})`)
    .orderBy(sql`DATE(${activityLog.date})`);
}

export async function getRecentActivity(limit = 10) {
  const { userId } = auth();
  if (!userId) return [];

  return db.select().from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.date))
    .limit(limit);
}

// ====== POSTS (Twitter-like) ======

export async function createPost(formData: FormData) {
  const user = await ensureUser();
  const content = formData.get('content') as string;

  if (!content || content.trim().length === 0) throw new Error('Content required');
  if (content.length > 280) throw new Error('Max 280 characters');

  const [post] = await db.insert(posts).values({
    userId: user.id,
    content: content.trim(),
  }).returning();

  await db.insert(activityLog).values({
    userId: user.id,
    action: 'posted',
    details: JSON.stringify({ content: content.substring(0, 50) }),
  });

  revalidatePath('/posts');
  return post;
}

export async function getPosts() {
  const allPosts = await db
    .select({
      post: posts,
      user: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return allPosts;
}

export async function deletePost(postId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  await db.delete(posts).where(
    and(eq(posts.id, postId), eq(posts.userId, userId))
  );

  revalidatePath('/posts');
}

export async function likePost(postId: string) {
  await db.update(posts).set({
    likes: sql`${posts.likes} + 1`,
  }).where(eq(posts.id, postId));

  revalidatePath('/posts');
}

// ====== TEAMS ======

export async function createTeam(formData: FormData) {
  const user = await ensureUser();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string || '';

  if (!name || name.trim().length === 0) throw new Error('Team name required');

  const [team] = await db.insert(teams).values({
    name: name.trim(),
    description,
    ownerId: user.id,
  }).returning();

  // Add owner as team member
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  await db.insert(activityLog).values({
    userId: user.id,
    teamId: team.id,
    action: 'team_created',
    details: JSON.stringify({ name: team.name }),
  });

  revalidatePath('/team/settings');
  revalidatePath('/members');
  return team;
}

export async function getMyTeam() {
  const { userId } = auth();
  if (!userId) return null;

  // Find team where user is owner or member
  const membership = await db.select({
    team: teams,
    role: teamMembers.role,
  })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (membership.length === 0) return null;
  return { ...membership[0].team, myRole: membership[0].role };
}

export async function getTeamMembers() {
  const { userId } = auth();
  if (!userId) return [];

  // Find user's team
  const membership = await db.select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (membership.length === 0) return [];

  const members = await db.select({
    member: teamMembers,
    user: users,
  })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, membership[0].teamId));

  return members;
}

export async function kickMember(memberUserId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  // Verify caller is owner
  const callerMembership = await db.select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (callerMembership.length === 0) throw new Error('You are not in a team');

  const team = await db.select().from(teams)
    .where(eq(teams.id, callerMembership[0].teamId))
    .limit(1);

  if (team.length === 0 || team[0].ownerId !== userId) {
    throw new Error('Only the team owner can kick members');
  }

  // Can't kick yourself
  if (memberUserId === userId) throw new Error('Cannot kick yourself');

  // Remove from team
  await db.delete(teamMembers).where(
    and(
      eq(teamMembers.teamId, team[0].id),
      eq(teamMembers.userId, memberUserId)
    )
  );

  await db.insert(activityLog).values({
    userId,
    teamId: team[0].id,
    action: 'member_kicked',
    details: JSON.stringify({ kickedUserId: memberUserId }),
  });

  revalidatePath('/members');
  revalidatePath('/team/settings');
}

export async function inviteMember(email: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  // Find caller's team
  const callerMembership = await db.select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (callerMembership.length === 0) throw new Error('You are not in a team');

  const team = await db.select().from(teams)
    .where(eq(teams.id, callerMembership[0].teamId))
    .limit(1);

  if (team.length === 0 || team[0].ownerId !== userId) {
    throw new Error('Only the team owner can invite members');
  }

  // Find user by email
  const invitee = await db.select().from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (invitee.length === 0) throw new Error('User not found. They need to sign up first.');

  // Check if already a member
  const existing = await db.select().from(teamMembers)
    .where(and(
      eq(teamMembers.teamId, team[0].id),
      eq(teamMembers.userId, invitee[0].id)
    ))
    .limit(1);

  if (existing.length > 0) throw new Error('User is already a team member');

  // Add to team
  await db.insert(teamMembers).values({
    teamId: team[0].id,
    userId: invitee[0].id,
    role: 'member',
  });

  await db.insert(activityLog).values({
    userId,
    teamId: team[0].id,
    action: 'member_invited',
    details: JSON.stringify({ invitedEmail: email }),
  });

  revalidatePath('/members');
  revalidatePath('/team/settings');
}

export async function deleteTeam() {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  const team = await db.select().from(teams)
    .where(eq(teams.ownerId, userId))
    .limit(1);

  if (team.length === 0) throw new Error('You do not own a team');

  await db.delete(teams).where(eq(teams.id, team[0].id));

  revalidatePath('/team/settings');
  revalidatePath('/members');
}

// ====== CHARACTER CUSTOMIZATION ======

export async function getCharacterConfig() {
  const { userId } = auth();
  if (!userId) return null;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return null;

  try {
    return JSON.parse(user[0].characterConfig || '{}');
  } catch {
    return {};
  }
}

export async function updateCharacterConfig(config: {
  hairColor?: string;
  skinColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  bootsColor?: string;
}) {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  await db.update(users).set({
    characterConfig: JSON.stringify(config),
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  revalidatePath('/');
}
