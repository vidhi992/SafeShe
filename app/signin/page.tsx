import { Suspense } from 'react';
import { AuthCardLayout } from '@/components/auth/auth-card-layout';
import { SignInForm } from '@/components/auth/signin-form';

export default function SignInPage() {
  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Sign in to manage your journeys, trusted contacts, and security vault."
    >
      <Suspense fallback={<div className="p-4 text-xs text-navy-400">Loading Sign In Form...</div>}>
        <SignInForm />
      </Suspense>
    </AuthCardLayout>
  );
}
