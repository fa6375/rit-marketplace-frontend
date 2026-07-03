import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ban, PauseCircle, LogOut, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

const COPY = {
  banned: {
    icon: Ban,
    iconWrap: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
    title: "You are banned",
    body: "Your account has been banned by an administrator and you can no longer access the marketplace.",
  },
  suspended: {
    icon: PauseCircle,
    iconWrap:
      "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
    title: "Your account is suspended",
    body: "Your account has been temporarily suspended by an administrator. Access will be restored once the suspension is lifted.",
  },
};

export default function AccountStatusScreen({ status = "banned" }) {
  const { logout, user } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();
  const copy = COPY[status] || COPY.banned;
  const Icon = copy.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0b0d12] p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#141821] rounded-2xl border border-gray-100 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 text-center"
        data-testid={`account-${status}-screen`}
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${copy.iconWrap}`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-5">
          {copy.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          {copy.body}
        </p>
        {user?.email && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Signed in as {user.email}
          </p>
        )}
        {settings.supportEmail && (
          <a
            href={`mailto:${settings.supportEmail}`}
            className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-[#FF5A1F] hover:underline"
          >
            <Mail className="w-4 h-4" /> Contact support ({settings.supportEmail})
          </a>
        )}
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white font-medium py-3 rounded-full transition-colors"
          data-testid="status-signout-btn"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </motion.div>
    </div>
  );
}
