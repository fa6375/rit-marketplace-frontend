import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Store, Loader2, ArrowRight, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!user) return;
    if (!user.emailVerified) {
      navigate("/verify-email", { replace: true });
    } else {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "login") {
        const u = await login(email.trim(), password);
        toast.success("Welcome back");
        if (!u.emailVerified) navigate("/verify-email");
        else navigate(redirect, { replace: true });
      } else {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setBusy(false);
          return;
        }
        await signup(email.trim(), password, name.trim());
        toast.success("Account created. Check your inbox to verify.");
        navigate("/verify-email");
      }
    } catch (err) {
      const msg =
        err?.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err?.code === "auth/email-already-in-use"
          ? "Email is already in use"
          : err?.code === "auth/weak-password"
          ? "Weak password"
          : err?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F9FA]">
      {/* Left visual */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/a3285b10-36bd-49b9-9338-07c91fd858fa/images/b77aff55ea914c4f992eef78f2c28f73336bbfed7b3d375cd9d4003fde9f5168.png"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#FF5A1F] flex items-center justify-center">
              <Store className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              Marketplace
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#FF5A1F]">
              Built for students
            </p>
            <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight mt-3 max-w-md">
              Buy, sell, and trade across your campus.
            </h1>
            <p className="text-white/70 mt-4 max-w-md leading-relaxed">
              Textbooks, electronics, dorm gear and more — a clean, trusted
              place to swap with verified students.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-[#FF5A1F] flex items-center justify-center">
              <Store className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-lg text-gray-900">
              Marketplace
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
                {mode === "login" ? "Welcome back" : "Get started"}
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2">
                {mode === "login" ? "Sign in to continue" : "Create your account"}
              </h2>
              <p className="text-gray-500 mt-2 leading-relaxed">
                {mode === "login"
                  ? "Use your verified student email to access the marketplace."
                  : "We'll send a verification link to your email."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4" data-testid="auth-form">
                {mode === "signup" && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Full name
                    </label>
                    <div className="relative mt-1.5">
                      <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        required
                        data-testid="signup-name-input"
                        className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      required
                      autoComplete="email"
                      data-testid="auth-email-input"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      data-testid="auth-password-input"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={busy}
                  data-testid="auth-submit-btn"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors mt-2 shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign in" : "Create account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-sm text-gray-500 mt-6 text-center">
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-medium text-[#FF5A1F] hover:text-[#E04812]"
                  data-testid="auth-toggle-mode-btn"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
