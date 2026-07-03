import { Wrench } from "lucide-react";
import { useMaintenance } from "../hooks/useMaintenance";

export const MaintenanceBanner = () => {
  const enabled = useMaintenance();
  if (!enabled) return null;
  return (
    <div
      className="w-full bg-amber-100 border-b border-amber-200 text-amber-900 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-300 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2"
      data-testid="maintenance-banner"
      role="status"
    >
      <Wrench className="w-4 h-4 shrink-0" />
      Website is under maintenance — some features may be temporarily unavailable.
    </div>
  );
};
