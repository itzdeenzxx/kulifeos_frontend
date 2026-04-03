import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}

export function ProtectedRoute({ children, requireOnboarded = true }: ProtectedRouteProps) {
  const { authUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !userProfile) {
    return <Navigate to="/auth" replace />;
  }

  // Prevent teachers from accessing student app
  if (userProfile.role === "teacher") {
    return <Navigate to="/auth" replace />;
  }

  // If onboarding is required and user hasn't completed it
  if (requireOnboarded && userProfile.onboardingStep < 4) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
