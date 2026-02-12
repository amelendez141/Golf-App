import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient grain-overlay relative flex-col justify-between p-12">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <GolfIcon className="h-10 w-10 text-white" />
            <span className="font-serif text-2xl font-semibold text-white">
              LinkUp
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-4xl font-bold text-white mb-4">
            Welcome back
          </h1>
          <p className="text-white/80 text-lg">
            Sign in to discover open tee times and connect with professionals on the course.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} LinkUp Golf. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - sign in form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <GolfIcon className="h-8 w-8 text-primary" />
              <span className="font-serif text-xl font-semibold text-primary">
                LinkUp
              </span>
            </Link>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-8">
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">Sign In</h2>
            <p className="text-text-muted mb-6">Enter your credentials to continue</p>

            <div className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com" />
              <Input label="Password" type="password" placeholder="Enter your password" />

              <Button fullWidth size="lg">
                Sign In
              </Button>

              <p className="text-center text-sm text-text-muted">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-accent hover:text-accent-600">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-secondary rounded-lg space-y-3">
              <p className="text-sm text-text-muted text-center">
                Authentication requires Clerk API keys. Add your keys to <code className="text-xs bg-primary/10 px-1 py-0.5 rounded">.env.local</code> to enable sign in.
              </p>
              <Link href="/feed" className="block">
                <Button variant="secondary" fullWidth>
                  Continue as Dev User
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GolfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}
