import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import AccountStatusScreen from "./AccountStatusScreen";

export const ProtectedRoute = ({ children, requireVerified = true }) => {
  const { user, profile, profileReady, loading } = useAuth();
  const location = useLocation();

  // Wait for auth AND the Firestore profile (needed for status enforcement)
  if (loading || (user && !profileReady)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0b0d12]"
        data-testid="auth-loading"
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce account status: banned and suspended users cannot use the site.
  if (profile?.status === "banned") {
    return <AccountStatusScreen status="banned" />;
  }
  if (profile?.status === "suspended") {
    return <AccountStatusScreen status="suspended" />;
  }

  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};
