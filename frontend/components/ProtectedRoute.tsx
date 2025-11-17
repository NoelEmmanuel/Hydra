"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef<string | null>(null);

  useEffect(() => {
    // Skip if already authenticated
    if (isAuthenticated) {
      setIsChecking(false);
      return;
    }

    // Skip if we've already checked this path
    if (hasChecked.current === pathname) {
      setIsChecking(false);
      return;
    }

    // Skip if still loading initial auth state
    if (authLoading) {
      return;
    }

    const verifyAuth = async () => {
      hasChecked.current = pathname;
      setIsChecking(true);
      const isValid = await checkAuth();
      setIsChecking(false);

      if (!isValid) {
        router.push("/auth");
      }
    };

    verifyAuth();
  }, [pathname, isAuthenticated, authLoading, checkAuth, router]);

  // Show loading state while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent" style={{ borderColor: '#341f4f' }}></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

