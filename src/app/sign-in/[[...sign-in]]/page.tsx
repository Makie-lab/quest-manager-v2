import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">⛏️ QUEST MANAGER</h1>
        <SignIn />
      </div>
    </div>
  );
}
