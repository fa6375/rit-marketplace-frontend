import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import {
  LegalPageLayout,
  LegalSection,
  LegalList,
} from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED, FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

/**
 * Privacy Policy.
 *
 * IMPORTANT: every statement in this page is written to match the actual
 * behavior of the application. If a feature changes what data is collected,
 * displayed, or stored, this page must be updated in the same change.
 */
export default function PrivacyPolicy() {
  const { websiteName, supportEmail } = useSettings();
  const email = supportEmail || FALLBACK_SUPPORT_EMAIL;

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`How ${websiteName} collects, uses, stores, and shares your information.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      metaTitle="Privacy Policy"
      metaDescription="Learn exactly what information Campus Marketplace collects, how it is stored on Firebase, what other users can see, and how to request deletion."
      testId="privacy-page"
    >
      <LegalSection title="1. Introduction">
        <p>
          {websiteName} ("we", "us", or "the Platform") is an online
          marketplace that helps students buy, sell, and recover lost items
          within their campus community. This Privacy Policy describes, as
          accurately as possible, the information the Platform actually
          collects and stores today, how it is used, who can see it, and the
          choices you have. By creating an account or using the Platform, you
          agree to the practices described here.
        </p>
      </LegalSection>

      <LegalSection title="2. Information You Provide to Us">
        <p>We store the following information that you enter yourself:</p>
        <LegalList
          items={[
            "Account details: your email address and display name. Passwords are handled entirely by our authentication provider (Firebase Authentication) and are never visible to us or stored by the Platform in readable form.",
            "Profile information: an optional profile photo and an optional short bio, along with the date your account was created.",
            "Listings: the title, description, price, category, listing type, item condition, chosen campus pickup location, and the photos you upload. Your display name, profile photo, and the email address on your account are attached to each listing record.",
            "Offers: the amounts you offer on listings, any optional message you include, and the full negotiation history (offers, counter-offers, acceptances, rejections, and withdrawals) with timestamps.",
            "Saved items and wishlist collections: which listings you save and the names of any collections you create to organize them.",
            "Lost & Found posts: the item title and description, photos, the last place the item was seen, the date it was lost, and the contact phone number and/or alternative contact method you choose to provide.",
            "Reports: when you report a listing or user, we store the report category, your written description, and your name, email address, and account ID so our moderators can follow up. Reports are visible to administrators only.",
            "Account settings: your display name, bio, and profile photo as edited on the Account Settings page.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Information Generated as You Use the Platform">
        <p>
          Some records are created automatically as you interact with the
          marketplace:
        </p>
        <LegalList
          items={[
            "View records: when you open a listing or a seller profile that isn't your own, a one-time record linking your account to that listing or profile is stored so that each person is only counted once. The interface only ever shows sellers aggregate view counts and daily totals — it never displays a list of who viewed something.",
            "Follows: which sellers you follow, so we can show follower counts and notify you when they post new listings.",
            "Notifications: short in-app notifications (for example about offers, new listings from sellers you follow, price drops on saved items, achievements, and Lost & Found updates), including whether you have read them.",
            "Achievements: which milestone badges your account has unlocked, based on your activity (such as listings posted or items sold).",
            "Response metrics: aggregate counters of how many offers you have received and responded to, and cumulative response time. These are used to calculate the response rate and typical response time shown on your public profile. Individual message contents are not analyzed.",
            "Price history: previous prices of your listings, so buyers can see when a price has dropped.",
            "Timestamps: creation and update times on your account, listings, offers, reports, notifications, and other records.",
            "Administrator activity: actions taken in the admin panel (such as removing a listing or suspending an account) are logged with the administrator's identity for accountability.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. What Other Users Can See">
        <p>
          The Platform is only accessible to signed-in, email-verified users.
          Within that community:
        </p>
        <LegalList
          items={[
            "Your public seller profile shows your display name, profile photo, bio, the month and year you joined, a verified badge (meaning your email address has been verified), your follower count, profile view count, your active and sold listings, unlocked achievements, and your response rate and typical response time.",
            "Your listings show their title, description, photos, price and price history, category, type, condition, pickup location, view and save counts, and whether the item has been sold.",
            "Your Lost & Found posts show the item details, photos, last-seen location, date lost, and the contact phone number or contact method you provided, so that anyone who finds your item can reach you. Only share contact details you are comfortable making visible to other signed-in users.",
            "Your email address is not displayed to other users anywhere in the interface. It is, however, stored with your account, your listings, and your reports, and is visible to administrators.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. What We Do NOT Collect">
        <p>To be explicit, the Platform currently does not:</p>
        <LegalList
          items={[
            "Process payments or collect any payment, banking, or card information. All transactions are arranged and completed directly between users, off the Platform.",
            "Use analytics or advertising SDKs, trackers, or pixels. The usage statistics shown to sellers and administrators are computed solely from the marketplace records described above.",
            "Track your device location. \"Location\" on the Platform means a campus pickup spot chosen from an admin-managed list, or a last-seen location you type into a Lost & Found post.",
            "Use automated or AI-based content moderation. Moderation is performed by human administrators, based in large part on user reports.",
            "Perform background checks or identity verification beyond confirming that you control your email address.",
            "Sell or share your personal information with advertisers or data brokers.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Cookies and Browser Storage">
        <p>
          The Platform itself does not set cookies. It uses your browser's
          local storage (and related browser storage used by Firebase
          Authentication) for essential purposes only:
        </p>
        <LegalList
          items={[
            "Keeping you signed in between visits (managed by Firebase Authentication).",
            "Remembering your theme preference (light or dark mode).",
            "Remembering that you have completed the first-time product tour, so it isn't shown again.",
            "Temporarily remembering listings you have selected for comparison (cleared when your browser session ends).",
            "For administrators, remembering when admin notifications were last checked.",
          ]}
        />
        <p>
          Clearing your browser storage may sign you out, reset your theme,
          and cause the product tour to appear again. None of this storage is
          used for advertising or cross-site tracking.
        </p>
      </LegalSection>

      <LegalSection title="7. Where Your Data Is Stored (Firebase)">
        <p>
          The Platform is built on Google Firebase. Sign-in is handled by
          Firebase Authentication, records (accounts, listings, offers,
          reports, notifications, and so on) are stored in Cloud Firestore,
          and uploaded images (listing photos, profile photos, and Lost &
          Found photos) are stored in Firebase Cloud Storage. Data is
          transmitted over encrypted HTTPS connections, and Google encrypts
          data at rest on its infrastructure. Access to data is restricted by
          security rules: for example, reports and admin logs can only be
          read by administrators, notifications can only be read by their
          recipient, and only you can modify your own account, listings, and
          posts.
        </p>
      </LegalSection>

      <LegalSection title="8. How We Use Your Information">
        <LegalList
          items={[
            "To create and manage your account and verify your email address.",
            "To display your listings, profile, and Lost & Found posts to other signed-in users, as described in section 4.",
            "To operate marketplace features: offers and negotiations, saved items, follows, notifications, view counts, trending and recommendation sections, seller analytics, achievements, and listing comparison.",
            "To moderate content, review reports, and enforce our Terms of Service and Community Guidelines.",
            "To respond when you contact our support email. The in-app contact form does not upload anything to our servers — it opens a pre-filled message in your own email app, and the conversation then happens over ordinary email.",
            "To maintain the security and reliability of the Platform.",
          ]}
        />
        <p>We do not sell your personal information to anyone.</p>
      </LegalSection>

      <LegalSection title="9. Administrators">
        <p>
          A small number of administrators moderate the Platform. Through the
          admin panel they can view user accounts (including email
          addresses and account status), all listings, reports (including
          who submitted them), offers, Lost & Found posts, and aggregate
          statistics. Administrators can remove content, and suspend or ban
          accounts that violate our rules. Administrative actions are
          logged.
        </p>
      </LegalSection>

      <LegalSection title="10. Data Retention and Deletion">
        <LegalList
          items={[
            "You can delete your own listings and Lost & Found posts at any time; their uploaded photos are deleted from storage along with them.",
            "You can update or replace your display name, bio, and profile photo at any time from Account Settings; replaced profile photos are removed from storage.",
            "You can delete individual notifications, remove saved items, delete wishlist collections, unfollow sellers, and withdraw offers you have made.",
            "Account deletion is not yet available as a self-service button. To delete your account and associated data, email us and we will process the request within a reasonable timeframe.",
            "Some derived records may persist after related content is removed — for example, aggregate counters, view records used to keep counts accurate, and administrator logs kept for security and accountability.",
          ]}
        />
      </LegalSection>

      <LegalSection title="11. Your Rights">
        <p>Depending on your location, you may have the right to:</p>
        <LegalList
          items={[
            "Access the personal information we hold about you.",
            "Correct inaccurate or outdated information (much of which you can edit yourself in Account Settings).",
            "Request deletion of your account and associated data.",
            "Object to or restrict certain processing of your information.",
          ]}
        />
        <p>
          To exercise any of these rights, contact us using the details in
          section 14. Limited records may be retained where required for
          security, fraud prevention, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="12. Children's Privacy">
        <p>
          The Platform is intended for students who are at least 18 years old
          or the age of majority in their jurisdiction. We do not knowingly
          collect information from children. If you believe a minor has
          created an account, please contact us so we can take appropriate
          action.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy as the Platform evolves. This
          page is maintained to reflect what the application actually does,
          so when features change, this policy changes with them. When we
          make material changes, we will update the "Last updated" date at
          the top of this page. Your continued use of the Platform after
          changes take effect constitutes acceptance of the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact Us">
        <p>
          Questions about this Privacy Policy or our data practices? Reach us
          at{" "}
          <a href={`mailto:${email}`} className="text-[#FF5A1F] hover:underline">
            {email}
          </a>{" "}
          or through our{" "}
          <Link to="/contact" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
