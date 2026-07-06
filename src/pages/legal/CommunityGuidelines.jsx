import { Link } from "react-router-dom";
import {
  Heart,
  ShieldAlert,
  MessageSquareOff,
  Ban,
  Copy,
  PackageX,
  EyeOff,
  MailWarning,
  Flag,
  Gavel,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { LegalPageLayout, LegalSection } from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED } from "../../lib/siteInfo";

const GUIDELINES = [
  {
    icon: Heart,
    title: "Respect Other Users",
    body: "Treat every member of the community with courtesy. Be honest in your listings, reply to messages in good faith, and show up on time for agreed meetups. Discrimination or hostility of any kind has no place here.",
  },
  {
    icon: ShieldAlert,
    title: "No Scams or Fraud",
    body: "Never attempt to deceive other users. This includes fake payment confirmations, bait-and-switch tactics, phishing links, taking payment without handing over the item, and any other form of dishonest dealing.",
  },
  {
    icon: MessageSquareOff,
    title: "No Harassment",
    body: "Do not threaten, intimidate, stalk, or repeatedly contact users who have asked you to stop. Hate speech, bullying, and unwanted sexual advances will result in immediate action against your account.",
  },
  {
    icon: Ban,
    title: "No Illegal Items",
    body: "Listings for drugs, weapons, alcohol, prescription medication, or anything else prohibited by law or by our Terms of Service are strictly forbidden and will be removed.",
  },
  {
    icon: Copy,
    title: "No Counterfeit Products",
    body: "Only sell authentic items. Replicas, knock-offs, and unauthorized copies of branded goods — even if disclosed as such — are not allowed on the marketplace.",
  },
  {
    icon: PackageX,
    title: "No Stolen Goods",
    body: "You may only list items that you legitimately own and have the right to sell. Listing stolen or found property is prohibited and may be reported to the appropriate authorities.",
  },
  {
    icon: EyeOff,
    title: "No Misleading Listings",
    body: "Describe items accurately, use real photos of the actual item, disclose defects, and price honestly. Listings that misrepresent condition, authenticity, or availability will be removed.",
  },
  {
    icon: MailWarning,
    title: "No Spam",
    body: "Do not post duplicate listings, irrelevant content, advertisements for external services, or mass unsolicited messages. Keep the marketplace clean and useful for everyone.",
  },
  {
    icon: Flag,
    title: "Report Suspicious Activity",
    body: "If you see a listing or user that seems fraudulent, unsafe, or against these guidelines, report it using the in-app report tools or through our Contact page. Reports are reviewed by our moderation team and help keep the community safe.",
  },
];

export default function CommunityGuidelines() {
  const { websiteName } = useSettings();

  return (
    <LegalPageLayout
      eyebrow="Community"
      title="Community Guidelines"
      intro={`Simple rules that keep ${websiteName} a safe, trusted place for students to buy and sell.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      metaTitle="Community Guidelines"
      metaDescription="Our community guidelines: respect other users, no scams, no harassment, no illegal or counterfeit items, and how to report suspicious activity."
      testId="guidelines-page"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDELINES.map(({ icon: Icon, title, body }) => (
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
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p>
          </div>
        ))}
      </div>

      <LegalSection title="Consequences for Violations">
        <p>
          Violations of these guidelines are handled based on their severity
          and frequency. Depending on the situation, we may issue a warning,
          remove or hide listings, temporarily suspend an account, or
          permanently ban a user from the platform. Serious matters — such as
          fraud, threats, or the sale of stolen or illegal goods — may also be
          referred to the appropriate authorities.
        </p>
        <p className="flex items-start gap-2">
          <Gavel className="w-4 h-4 mt-0.5 shrink-0 text-[#FF5A1F]" />
          <span>
            Moderation decisions are made at our discretion under our{" "}
            <Link to="/terms" className="text-[#FF5A1F] hover:underline">
              Terms of Service
            </Link>
            . If you believe an action was taken in error, you can reach out
            via our{" "}
            <Link to="/contact" className="text-[#FF5A1F] hover:underline">
              Contact page
            </Link>
            .
          </span>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
