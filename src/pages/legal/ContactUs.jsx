import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Briefcase, Flag, Send } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { LegalPageLayout } from "../../components/LegalPageLayout";
import { FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

const TOPICS = [
  { value: "support", label: "General support" },
  { value: "business", label: "Business inquiry" },
  { value: "report", label: "Report a problem" },
];

const inputClasses =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";

export default function ContactUs() {
  const { websiteName, supportEmail } = useSettings();
  const email = supportEmail || FALLBACK_SUPPORT_EMAIL;
  const [searchParams] = useSearchParams();

  const initialTopic = TOPICS.some((t) => t.value === searchParams.get("topic"))
    ? searchParams.get("topic")
    : "support";

  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [topic, setTopic] = useState(initialTopic);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !fromEmail.trim() || !message.trim()) {
      toast.error("Please fill in all fields before sending.");
      return;
    }
    const topicLabel =
      TOPICS.find((t) => t.value === topic)?.label || "General support";
    const subject = encodeURIComponent(`[${topicLabel}] Message from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${fromEmail.trim()}\nTopic: ${topicLabel}\n\n${message.trim()}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app to send the message…");
  };

  const channels = [
    {
      icon: Mail,
      title: "Support",
      description: "Account issues, listing help, and general questions.",
      action: email,
      href: `mailto:${email}`,
    },
    {
      icon: Briefcase,
      title: "Business Inquiries",
      description: "Partnerships, press, and collaboration requests.",
      action: email,
      href: `mailto:${email}?subject=${encodeURIComponent("Business inquiry")}`,
    },
    {
      icon: Flag,
      title: "Report a Problem",
      description: "Flag a suspicious listing, user, or safety concern.",
      action: "Use the form below",
      href: null,
    },
  ];

  return (
    <LegalPageLayout
      eyebrow="Get in touch"
      title="Contact Us"
      intro={`Questions, feedback, or something to report? The ${websiteName} team is here to help.`}
      metaTitle="Contact Us"
      metaDescription="Contact the Campus Marketplace team for support, business inquiries, or to report a problem with a listing or user."
      testId="contact-page"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {channels.map(({ icon: Icon, title, description, action, href }) => (
          <div
            key={title}
            className="rounded-2xl bg-white border border-gray-200 p-5 transition-colors hover:border-[#FF5A1F]/40"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Icon className="w-[18px] h-[18px] text-[#FF5A1F]" />
            </div>
            <h2 className="mt-3 text-base font-semibold tracking-tight text-gray-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              {description}
            </p>
            {href ? (
              <a
                href={href}
                className="mt-3 inline-block text-sm font-medium text-[#FF5A1F] hover:underline break-all"
              >
                {action}
              </a>
            ) : (
              <p className="mt-3 text-sm font-medium text-gray-500">{action}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-white border border-gray-200 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
          Send us a message
        </h2>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          Fill out the form and we'll open a pre-filled email to our team in
          your mail app.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" data-testid="contact-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                data-testid="contact-name-input"
                className={`mt-1.5 ${inputClasses}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Your email
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="you@youremail.com"
                required
                data-testid="contact-email-input"
                className={`mt-1.5 ${inputClasses}`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              data-testid="contact-topic-select"
              className={`mt-1.5 ${inputClasses}`}
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help…"
              required
              rows={5}
              data-testid="contact-message-input"
              className={`mt-1.5 resize-y ${inputClasses}`}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            data-testid="contact-submit-btn"
            className="inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] text-white text-sm font-medium px-6 py-3 rounded-full transition-colors shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
          >
            <Send className="w-4 h-4" />
            Send message
          </motion.button>
        </form>
      </div>
    </LegalPageLayout>
  );
}
