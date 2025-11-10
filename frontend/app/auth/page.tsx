"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;

    try {
      const endpoint = isSignIn ? `${API_URL}/api/auth/signin` : `${API_URL}/api/auth/signup`;
      const body = isSignIn 
        ? { email, password }
        : { email, password, full_name: fullName || null };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Store token in localStorage and update auth context
      if (data.access_token && data.refresh_token) {
        login(data.access_token, data.refresh_token, data.user);
      }

      // Redirect to home
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Form */}
      <div className="flex items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#341f4f' }}>
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
                    className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderColor = '';
                    }}
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
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = '';
                  }}
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
                  className="w-full px-4 py-3 border border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = '';
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              {isSignIn && (
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm transition-colors" style={{ color: '#341f4f' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a1840'} onMouseLeave={(e) => e.currentTarget.style.color = '#341f4f'}>
                    Forgot password?
                  </a>
                </div>
              )}

              {!isSignIn && (
                <div>
                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-input"
                      style={{ accentColor: '#341f4f' }}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="transition-colors" style={{ color: '#341f4f' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a1840'} onMouseLeave={(e) => e.currentTarget.style.color = '#341f4f'}>
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="transition-colors" style={{ color: '#341f4f' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a1840'} onMouseLeave={(e) => e.currentTarget.style.color = '#341f4f'}>
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white rounded-2xl font-semibold transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#341f4f' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#2a1840')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#341f4f')}
              >
                {isLoading ? "Please wait..." : isSignIn ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignIn ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="font-medium transition-colors"
                  style={{ color: '#341f4f' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#2a1840'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#341f4f'}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="font-medium transition-colors"
                  style={{ color: '#341f4f' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#2a1840'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#341f4f'}
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
