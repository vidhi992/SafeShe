import { AuthCardLayout } from '@/components/auth/auth-card-layout';
import { SignUpForm } from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <AuthCardLayout
      title="Create SafeShe Account"
      subtitle="Join the AI-powered safety platform protecting women 24/7."
    >
      <SignUpForm />
    </AuthCardLayout>
  );
}
