"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Skip if already authenticated or already checked
    if (isAuthenticated || hasChecked.current) {
      setIsChecking(false);
      return;
    }

    const verifyAuth = async () => {
      hasChecked.current = true;
      setIsChecking(true);
      const isValid = await checkAuth();
      setIsChecking(false);

      if (!isValid) {
        router.push("/auth");
      }
    };

    verifyAuth();
  }, [isAuthenticated, checkAuth, router]);

  // Show loading state while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
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

