import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import {
  LegalPageLayout,
  LegalSection,
  LegalList,
} from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED, FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

export default function PrivacyPolicy() {
  const { websiteName, supportEmail } = useSettings();
  const email = supportEmail || FALLBACK_SUPPORT_EMAIL;

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`How ${websiteName} collects, uses, stores, and protects your information.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      metaTitle="Privacy Policy"
      metaDescription="Learn how Campus Marketplace collects, uses, stores, and protects your personal information, and how to exercise your privacy rights."
      testId="privacy-page"
    >
      <LegalSection title="1. Introduction">
        <p>
          {websiteName} ("we", "us", or "the Platform") is an online
          marketplace that helps students buy and sell items within their
          campus community. This Privacy Policy explains what information we
          collect, how we use it, and the choices you have. By creating an
          account or using the Platform, you agree to the practices described
          in this policy.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We collect the following categories of information:</p>
        <LegalList
          items={[
            "Account information: your name, email address, and password (passwords are handled by our authentication provider and are never visible to us in plain text).",
            "Listing information: titles, descriptions, prices, categories, and any other details you include when posting an item for sale.",
            "Uploaded images: photos you attach to your listings, which are stored securely and displayed to other users browsing the marketplace.",
            "Usage information: basic technical data such as device type, browser, and general interaction patterns used to keep the Platform reliable and secure.",
            "Communications: messages you send to our support team, reports you submit about listings or users, and contact form submissions.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cookies and Local Storage">
        <p>
          We use cookies and browser local storage for essential purposes
          only, such as keeping you signed in, remembering your theme
          preference (light or dark mode), and maintaining session security.
          We do not use cookies to sell your data to advertisers. You can
          clear cookies and local storage through your browser settings, but
          doing so may sign you out or reset your preferences.
        </p>
      </LegalSection>

      <LegalSection title="4. Authentication">
        <p>
          Account creation and sign-in are handled through a secure
          authentication service. When you register, a verification email is
          sent to confirm ownership of your email address. We require email
          verification to help keep the marketplace trustworthy and to reduce
          fraudulent accounts.
        </p>
      </LegalSection>

      <LegalSection title="5. Firebase Services">
        <p>
          The Platform is built on Google Firebase, which provides our
          authentication, database (Cloud Firestore), and file storage
          infrastructure. Your account details, listings, and uploaded images
          are processed and stored by Firebase on our behalf. Google's
          handling of this data is governed by its own privacy and security
          commitments, and access is restricted by security rules that limit
          who can read and write data.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Storage and Security">
        <LegalList
          items={[
            "Data is stored on secure, industry-standard cloud infrastructure with encryption in transit.",
            "Access to user data is restricted by database security rules and limited to what is necessary to operate the Platform.",
            "Administrative access is limited to authorized personnel for moderation, support, and safety purposes.",
            "No method of transmission or storage is 100% secure; we work to protect your information but cannot guarantee absolute security.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. How We Use Your Information">
        <LegalList
          items={[
            "To create and manage your account and verify your email address.",
            "To display your listings and profile name to other users of the marketplace.",
            "To moderate content, investigate reports, and enforce our Terms of Service and Community Guidelines.",
            "To respond to support requests and communicate important service updates.",
            "To maintain the security, reliability, and performance of the Platform.",
          ]}
        />
        <p>We do not sell your personal information to third parties.</p>
      </LegalSection>

      <LegalSection title="8. Your Rights">
        <p>Depending on your location, you may have the right to:</p>
        <LegalList
          items={[
            "Access the personal information we hold about you.",
            "Correct inaccurate or outdated information.",
            "Request deletion of your account and associated data.",
            "Object to or restrict certain processing of your information.",
          ]}
        />
        <p>
          To exercise any of these rights, contact us using the details in the
          "Contact Us" section below.
        </p>
      </LegalSection>

      <LegalSection title="9. Account Deletion and Data Deletion Requests">
        <p>
          You may delete your account at any time from your account settings.
          When your account is deleted, your profile information and active
          listings are removed from the marketplace. Uploaded images
          associated with your listings are also scheduled for deletion.
        </p>
        <p>
          If you are unable to delete your account yourself, or would like to
          request the deletion of specific data, email us at{" "}
          <a href={`mailto:${email}`} className="text-[#FF5A1F] hover:underline">
            {email}
          </a>{" "}
          and we will process your request within a reasonable timeframe.
          Limited records may be retained where required for security, fraud
          prevention, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="10. Third-Party Services">
        <p>
          We rely on a small number of third-party service providers (such as
          Firebase for infrastructure and analytics tooling for basic usage
          insights) to operate the Platform. These providers only receive the
          information necessary to perform their services and are not
          permitted to use it for their own purposes. The Platform may
          contain links to external websites; we are not responsible for the
          privacy practices of those sites.
        </p>
      </LegalSection>

      <LegalSection title="11. Children's Privacy">
        <p>
          The Platform is intended for students who are at least 18 years old
          or the age of majority in their jurisdiction. We do not knowingly
          collect information from children. If you believe a minor has
          created an account, please contact us so we can take appropriate
          action.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect
          changes to the Platform or applicable law. When we make material
          changes, we will update the "Last updated" date at the top of this
          page and, where appropriate, notify you through the Platform. Your
          continued use of the Platform after changes take effect constitutes
          acceptance of the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact Us">
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
