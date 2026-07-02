import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  if (loading || (user && profile === null)) return <div className="min-h-screen grid place-items-center bg-[#080a0f]"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
