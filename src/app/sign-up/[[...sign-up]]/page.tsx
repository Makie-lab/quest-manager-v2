import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">⛏️ SIDE QUESTS</h1>
        <SignUp />
      </div>
    </div>
  );
}
