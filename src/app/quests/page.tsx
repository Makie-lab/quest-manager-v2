import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getQuests, ensureUser } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import QuestForm from '@/components/QuestForm';
import QuestList from '@/components/QuestList';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function QuestsPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();
  const quests = await getQuests();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">⚔️ QUESTS</h1>
          <div className="quests-layout">
            <div><QuestForm /></div>
            <div><QuestList quests={quests} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
