import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Target, Telescope, ShieldCheck, Sparkles, Users, Mail, Quote } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { LegalPageLayout } from "../../components/LegalPageLayout";

const FOUNDERS = [
  {
    name: "Faraj Aliyev",
    role: "Founder",
    email: "fa6375@rit.edu",
    quote:
      "Great ideas start small — ours started with a textbook nobody wanted to carry home.",
  },
  {
    name: "Andrej Biljaka",
    role: "Co-Founder",
    email: "ab1538@rit.edu",
    quote:
      "A campus is a community. We just gave it a marketplace to match.",
  },
  {
    name: "Fran Brezanin",
    role: "Co-Founder",
    email: "fb1060@rit.edu",
    quote:
      "Build something students actually need, and keep it simple enough that they love using it.",
  },
];

const SECTIONS = [
  {
    icon: Target,
    title: "Our Mission",
    body: "To give students a trusted, campus-focused place to buy and sell — where textbooks find their next reader, dorm gear gets a second life, and every deal happens between verified members of the same community.",
  },
  {
    icon: Telescope,
    title: "Our Vision",
    body: "A campus where nothing useful goes to waste. We imagine student communities everywhere trading sustainably and affordably, keeping money in students' pockets and perfectly good items out of landfills.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    body: "Every account is verified by email, listings are actively moderated, and built-in reporting tools let the community flag anything suspicious. Clear guidelines and a responsive moderation team keep bad actors out.",
  },
  {
    icon: Sparkles,
    title: "Built for Simplicity",
    body: "Post a listing in under a minute. Browse by category, search in real time, and connect with sellers directly — no clutter, no confusing fees, no unnecessary steps between you and a great deal.",
  },
  {
    icon: Users,
    title: "A Student Community",
    body: "This platform is made by students, for students. Trading with people on your own campus means faster meetups, familiar faces, and a community that looks out for one another.",
  },
];

export default function AboutUs() {
  const { websiteName } = useSettings();
  const { hash } = useLocation();

  // Support deep links like /about#founders (React Router doesn't
  // scroll to hash targets automatically).
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <LegalPageLayout
      eyebrow="Who we are"
      title={`About ${websiteName}`}
      intro="A modern online marketplace built for students to safely buy and sell within their campus community."
      metaTitle="About Us"
      metaDescription="Learn about Campus Marketplace — a modern online marketplace built for students to safely buy and sell within their campus community."
      testId="about-page"
    >
      <div className="space-y-4">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <section
            key={title}
            className="rounded-2xl bg-white border border-gray-200 p-6 transition-colors hover:border-[#FF5A1F]/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-[#FF5A1F]" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                {title}
              </h2>
            </div>
            <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-gray-600">
              {body}
            </p>
          </section>
        ))}
      </div>

      <section id="founders" className="mt-12">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          The people behind it
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mt-2">
          Founders
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3" data-testid="founders-section">
          {FOUNDERS.map(({ name, role, email, quote }) => (
            <div
              key={email}
              className="flex flex-col rounded-2xl bg-white border border-gray-200 p-6 transition-colors hover:border-[#FF5A1F]/40"
            >
              <Quote className="w-5 h-5 text-[#FF5A1F]" />
              <p className="mt-3 flex-1 text-sm italic leading-relaxed text-gray-600">
                "{quote}"
              </p>
              <div className="mt-5 border-t border-gray-100 pt-4">
                <h3 className="font-semibold tracking-tight text-gray-900">
                  {name}
                </h3>
                <p className="text-sm font-medium text-[#FF5A1F]">{role}</p>
                <a
                  href={`mailto:${email}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF5A1F] transition-colors break-all"
                >
                  <Mail size={14} className="shrink-0" />
                  {email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Ready to join the community?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-300 max-w-xl">
          Create a free account, verify your email, and start browsing
          listings from students on your campus in minutes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Get started
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Read the FAQ
          </Link>
        </div>
      </div>
    </LegalPageLayout>
  );
}
