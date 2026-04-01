import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem("ku_current_user");
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
