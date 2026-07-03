import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMaintenance } from "../hooks/useMaintenance";
import MaintenancePage from "../MaintenancePage";

export function MaintenanceGate({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const enabled = useMaintenance();

  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login");

  if (!loading && enabled && !isAdmin && !isAdminPage) {
    return <MaintenancePage />;
  }

  return children;
}
