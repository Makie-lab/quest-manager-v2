import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureUser, getPosts } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import PostsFeed from '@/components/PostsFeed';

export default async function PostsPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();
  const postsData = await getPosts();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">💬 TAVERN</h1>
          <PostsFeed
            posts={postsData.map(({ post, user: u }) => ({
              id: post.id,
              content: post.content,
              likes: post.likes || 0,
              createdAt: post.createdAt.toISOString(),
              userName: u.name,
              userImage: u.imageUrl,
              isOwner: u.id === userId,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
