import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { user, resendVerification, refreshUser, logout, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
    if (user?.emailVerified) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Poll every 4s so verification picks up automatically
  useEffect(() => {
    const i = setInterval(async () => {
      await refreshUser();
    }, 4000);
    return () => clearInterval(i);
  }, [refreshUser]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setBusy(true);
    try {
      await resendVerification();
      toast.success("Verification email sent");
      setCooldown(45);
    } catch (e) {
      toast.error("Could not send email. Try again shortly.");
    } finally {
      setBusy(false);
    }
  };

  const handleCheck = async () => {
    setBusy(true);
    await refreshUser();
    setBusy(false);
    if (!user?.emailVerified) toast("Not verified yet — check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 text-center"
        data-testid="verify-email-card"
      >
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
          <MailCheck className="w-6 h-6 text-[#FF5A1F]" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mt-5">
          Verify your email
        </h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          We sent a verification link to{" "}
          <span className="font-medium text-gray-900">{user?.email}</span>.
          Click it, then come back and refresh.
        </p>

        <div className="mt-7 space-y-2.5">
          <button
            onClick={handleCheck}
            disabled={busy}
            data-testid="verify-check-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            I have verified — continue
          </button>
          <button
            onClick={handleResend}
            disabled={busy || cooldown > 0}
            data-testid="verify-resend-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 font-medium py-3 rounded-full hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 text-sm pt-2"
            data-testid="verify-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
