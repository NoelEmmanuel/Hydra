"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Form */}
      <div className="flex items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center overflow-hidden relative">
                <Image 
                  src="/logo.png" 
                  alt="Hydra" 
                  width={40}
                  height={40}
                  className="object-contain p-0.5"
                  style={{ transform: 'rotate(-15deg)' }}
                  unoptimized
                />
              </div>
              <span className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors">
                HYDRA
              </span>
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="text-h4 text-center mb-6">
              {isSignIn ? "Sign in" : "Create your account"}
            </h1>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isSignIn && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {isSignIn && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-input text-green-600 focus:ring-green-600"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-green-600 hover:text-green-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              {!isSignIn && (
                <div>
                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-input text-green-600 focus:ring-green-600"
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 transition-colors text-base"
              >
                {isSignIn ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-input rounded-2xl hover:bg-muted transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-input rounded-2xl hover:bg-muted transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignIn ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
