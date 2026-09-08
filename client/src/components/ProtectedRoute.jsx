"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute — wraps children and redirects unauthenticated users to /login.
 *
 * After the user logs in or signs up, they are automatically redirected back
 * to the page they originally tried to access (via the `returnTo` query param).
 *
 * Props:
 *   - children: React nodes to render when authenticated
 *   - fallback: (optional) custom loading UI while auth state is resolving
 */
export default function ProtectedRoute({ children, fallback }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Encode current path so after login user comes back here
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  // While auth state is loading, show a loader
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-white/60 backdrop-blur-md">
          <video
            src="/loader.webm"
            autoPlay
            muted
            loop
            playsInline
            className="w-[166px] h-[166px] object-contain"
          />
        </div>
      )
    );
  }

  // Not authenticated — don't render children (redirect is in progress)
  if (!isAuthenticated) return null;

  return children;
}
