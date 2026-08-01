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
  HandCoins,
  SearchCheck,
  Flag,
  Gavel,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { LegalPageLayout, LegalSection } from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED } from "../../lib/siteInfo";

/**
 * Community Guidelines.
 *
 * IMPORTANT: written to match the actual features of the application
 * (listings, offers, Lost & Found, in-app reporting, human moderation).
 * Keep in sync when features change.
 */
const GUIDELINES = [
  {
    icon: Heart,
    title: "Respect Other Users",
    body: "Treat every member of the community with courtesy. Be honest in your listings, respond to offers in good faith, and show up on time for agreed meetups. Discrimination or hostility of any kind has no place here.",
  },
  {
    icon: ShieldAlert,
    title: "No Scams or Fraud",
    body: "Never attempt to deceive other users. This includes fake payment confirmations, bait-and-switch tactics, phishing links, taking payment without handing over the item, and any other form of dishonest dealing.",
  },
  {
    icon: HandCoins,
    title: "Make Offers in Good Faith",
    body: "Only make an offer if you genuinely intend to buy at that price. Don't lowball to harass a seller, and don't abandon offers you've had accepted. Sellers: respond to offers when you can — your response rate and typical response time are shown on your profile.",
  },
  {
    icon: MessageSquareOff,
    title: "No Harassment",
    body: "Do not threaten, intimidate, stalk, or repeatedly contact users who have asked you to stop — including by phone numbers shared in Lost & Found posts. Hate speech, bullying, and unwanted advances will result in immediate action against your account.",
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
    body: "You may only list items that you legitimately own and have the right to sell. Listing stolen property is prohibited and may be reported to the appropriate authorities.",
  },
  {
    icon: SearchCheck,
    title: "Use Lost & Found Honestly",
    body: "Lost & Found is for reuniting people with their belongings. If you find someone's item, help return it — never keep it, sell it, or demand payment for its return. Mark your own posts as found once your item is recovered.",
  },
  {
    icon: EyeOff,
    title: "No Misleading Listings",
    body: "Describe items accurately, use real photos of the actual item, disclose defects, and price honestly. Price changes are recorded, and listings that misrepresent condition, authenticity, or availability will be removed.",
  },
  {
    icon: MailWarning,
    title: "No Spam",
    body: "Do not post duplicate listings, irrelevant content, or advertisements for external services, and do not abuse offers or reports to flood other users with notifications. Keep the marketplace clean and useful for everyone.",
  },
  {
    icon: Flag,
    title: "Report Suspicious Activity",
    body: "If a listing or user seems fraudulent, unsafe, or against these guidelines, use the Report option on the listing page, the report entry in your profile menu, or our Contact page. Every report is reviewed by a human administrator and helps keep the community safe.",
  },
];

export default function CommunityGuidelines() {
  const { websiteName } = useSettings();

  return (
    <LegalPageLayout
      eyebrow="Community"
      title="Community Guidelines"
      intro={`Simple rules that keep ${websiteName} a safe, trusted place for students to buy, sell, and recover lost items.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      metaTitle="Community Guidelines"
      metaDescription="Our community guidelines: respect other users, make offers in good faith, use Lost & Found honestly, no scams or illegal items, and how to report suspicious activity."
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
          Violations of these guidelines are reviewed by our administrators
          and handled based on their severity and frequency. Depending on the
          situation, we may remove or hide listings and Lost & Found posts,
          temporarily suspend an account, or permanently ban a user from the
          platform. Serious matters — such as fraud, threats, or the sale of
          stolen or illegal goods — may also be referred to the appropriate
          authorities.
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
