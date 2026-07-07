import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  return <Dashboard />;
}
