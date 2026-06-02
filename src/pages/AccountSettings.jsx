import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Settings
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Account
        </h1>
      </motion.div>

      <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
          Profile
        </h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-5">
          <Field label="Name" value={user?.displayName || "—"} />
          <Field label="Email" value={user?.email} testId="account-email" />
          <Field
            label="Verified"
            value={user?.emailVerified ? "Yes" : "No"}
          />
          <Field
            label="User ID"
            value={user?.uid}
            mono
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            More settings coming soon — profile photo, password change, etc.
          </p>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            data-testid="account-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, mono, testId }) => (
  <div>
    <p className="text-xs uppercase tracking-wider font-medium text-gray-500">
      {label}
    </p>
    <p
      className={`mt-1 text-sm text-gray-900 break-all ${mono ? "font-mono" : ""}`}
      data-testid={testId}
    >
      {value}
    </p>
  </div>
);
