'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/feed');
    }
  }, [isAuthenticated, router]);

  // Clear errors on input change
  useEffect(() => {
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setLocalError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      setShowSuccess(true);
      // Small delay for success animation
      setTimeout(() => {
        router.push('/feed');
      }, 800);
    } catch {
      // Error is handled by the auth store
    }
  };

  const displayError = localError || error;

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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 safe-top safe-bottom">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 sm:mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 touch-manipulation">
              <GolfIcon className="h-10 w-10 text-primary" />
              <span className="font-serif text-2xl font-semibold text-primary">
                LinkUp
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card p-5 sm:p-8"
          >
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
              Sign In
            </h2>
            <p className="text-text-muted text-sm sm:text-base mb-5 sm:mb-6">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Error message */}
              <AnimatePresence mode="wait">
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-error/10 border border-error/20 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ErrorIcon className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-error">{displayError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success message */}
              <AnimatePresence mode="wait">
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-success/10 border border-success/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
                      >
                        <SuccessIcon className="h-5 w-5 text-success" />
                      </motion.div>
                      <p className="text-sm text-success font-medium">
                        Sign in successful! Redirecting...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                inputSize="lg"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || showSuccess}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  inputSize="lg"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || showSuccess}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-text-muted hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                fullWidth
                size="xl"
                className="mt-2"
                isLoading={isLoading}
                disabled={showSuccess}
              >
                {showSuccess ? 'Signed In!' : 'Sign In'}
              </Button>

              <p className="text-center text-sm sm:text-base text-text-muted py-2">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-accent hover:text-accent-600 font-medium touch-manipulation"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </motion.div>
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

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}
