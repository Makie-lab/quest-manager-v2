import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/db';
import { quests, users } from '@/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

// This route is called by Vercel Cron (every hour)
export async function GET(request: Request) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find quests with deadlines in the next 24 hours that haven't been notified
    const upcomingQuests = await db
      .select({
        quest: quests,
        user: users,
      })
      .from(quests)
      .innerJoin(users, eq(quests.userId, users.id))
      .where(
        and(
          eq(quests.notificationSent, false),
          eq(users.notificationsEnabled, true),
          lte(quests.deadline, in24Hours),
          gte(quests.deadline, now),
          // Only notify for non-done quests
          eq(quests.status, 'wip'),
        )
      );

    let sentCount = 0;

    for (const { quest, user } of upcomingQuests) {
      const hoursLeft = Math.round(
        (quest.deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      try {
        await resend.emails.send({
          from: 'Side Quests <quests@notifications.questmanager.app>',
          to: user.email,
          subject: `⚔️ Quest deadline approaching: ${quest.name}`,
          html: `
            <div style="font-family: monospace; background: #1a1a2e; color: #e8d5b7; padding: 24px; border: 4px solid #5c4a2a;">
              <h1 style="color: #ffd700; font-size: 16px;">⛏️ SIDE QUESTS</h1>
              <hr style="border-color: #5c4a2a;" />
              <h2 style="color: #e63946;">⏰ Deadline Approaching!</h2>
              <p><strong>Quest:</strong> ${quest.name}</p>
              <p><strong>Priority:</strong> ${['', '⬜ Easy', '🟨 Medium', '🟥 Urgent'][quest.priority]}</p>
              <p><strong>Time remaining:</strong> ~${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}</p>
              <p><strong>Deadline:</strong> ${quest.deadline.toLocaleString()}</p>
              <hr style="border-color: #5c4a2a;" />
              <p style="color: #7a6b3a; font-size: 12px;">
                Keep adventuring! Your character needs you. 🗡️
              </p>
            </div>
          `,
        });

        // Mark as notified
        await db.update(quests).set({
          notificationSent: true,
        }).where(eq(quests.id, quest.id));

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      checked: upcomingQuests.length,
      sent: sentCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Notification cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
