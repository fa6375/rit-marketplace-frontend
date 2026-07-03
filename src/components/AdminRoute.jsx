import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AccountStatusScreen from "./AccountStatusScreen";

export function AdminRoute({ children }) {
  const { user, profile, profileReady, loading, isAdmin } = useAuth();
  if (loading || (user && !profileReady)) return <div className="min-h-screen grid place-items-center bg-[#080a0f]"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.status === "banned") return <AccountStatusScreen status="banned" />;
  if (profile?.status === "suspended") return <AccountStatusScreen status="suspended" />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
