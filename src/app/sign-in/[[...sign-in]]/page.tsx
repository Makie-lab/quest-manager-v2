import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">⛏️ SIDE QUESTS</h1>
        <SignIn />
      </div>
    </div>
  );
}
