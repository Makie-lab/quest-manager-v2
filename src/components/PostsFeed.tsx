'use client';

import { useRef, useState } from 'react';
import { createPost, deletePost, likePost } from '@/app/actions';

interface PostData {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  userName: string;
  userImage: string | null;
  isOwner: boolean;
}

interface Props {
  posts: PostData[];
}

export default function PostsFeed({ posts }: Props) {
  const [pending, setPending] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createPost(formData);
      formRef.current?.reset();
      setCharCount(0);
    } catch (e: any) {
      alert(e.message || 'Failed to post');
    }
    setPending(false);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="posts-container">
      {/* Compose */}
      <div className="post-compose">
        <form ref={formRef} action={handleSubmit}>
          <textarea
            name="content"
            placeholder="Share your thoughts, adventurer..."
            maxLength={280}
            rows={3}
            required
            className="post-textarea"
            onChange={e => setCharCount(e.target.value.length)}
          />
          <div className="post-compose-footer">
            <span className={`char-count ${charCount > 250 ? 'warn' : ''}`}>
              {charCount}/280
            </span>
            <button type="submit" className="btn-post" disabled={pending}>
              {pending ? '⏳' : '📮 POST'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="posts-feed">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>🍺 The tavern is empty</p>
            <p className="sub">Be the first to share your thoughts!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-avatar">
                {post.userImage ? (
                  <img src={post.userImage} alt="" className="post-avatar-img" />
                ) : (
                  <span className="post-avatar-placeholder">
                    {post.userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="post-body">
                <div className="post-header">
                  <span className="post-author">{post.userName}</span>
                  <span className="post-time">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="post-actions-row">
                  <button className="post-action-btn" onClick={() => likePost(post.id)}>
                    ❤️ {post.likes > 0 ? post.likes : ''}
                  </button>
                  {post.isOwner && (
                    <button className="post-action-btn delete" onClick={() => deletePost(post.id)}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
