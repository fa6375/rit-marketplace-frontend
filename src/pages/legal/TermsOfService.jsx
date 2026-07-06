import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import {
  LegalPageLayout,
  LegalSection,
  LegalList,
} from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED, FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

export default function TermsOfService() {
  const { websiteName, supportEmail } = useSettings();
  const email = supportEmail || FALLBACK_SUPPORT_EMAIL;

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro={`The rules and conditions that govern your use of ${websiteName}.`}
      lastUpdated={LEGAL_LAST_UPDATED}
      metaTitle="Terms of Service"
      metaDescription="Read the Terms of Service for Campus Marketplace, including eligibility, marketplace rules, prohibited items, and limitations of liability."
      testId="terms-page"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          These Terms of Service ("Terms") form a binding agreement between
          you and {websiteName} ("we", "us", or "the Platform"). By creating
          an account, posting a listing, or otherwise using the Platform, you
          confirm that you have read, understood, and agree to be bound by
          these Terms, our{" "}
          <Link to="/privacy" className="text-[#FF5A1F] hover:underline">
            Privacy Policy
          </Link>
          , and our{" "}
          <Link to="/guidelines" className="text-[#FF5A1F] hover:underline">
            Community Guidelines
          </Link>
          . If you do not agree, you may not use the Platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <LegalList
          items={[
            "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account.",
            "You must register with a valid email address that you own and verify it when prompted.",
            "You may only maintain one account, and you may not use the Platform if your account has previously been suspended or banned.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. The Platform Is a Marketplace Only">
        <p>
          {websiteName} is solely a venue that connects student buyers and
          sellers. We are not a party to any transaction between users. We do
          not own, inspect, store, ship, or guarantee any items listed, and we
          do not process payments between users. All negotiations, payments,
          exchanges, and meetups are arranged directly between the buyer and
          the seller, at their own risk and responsibility.
        </p>
      </LegalSection>

      <LegalSection title="4. User Responsibilities">
        <LegalList
          items={[
            "Provide accurate, current information in your account and listings.",
            "Keep your login credentials confidential; you are responsible for all activity under your account.",
            "Only list items that you own and have the legal right to sell.",
            "Communicate honestly with other users and honor agreements you make.",
            "Meet in safe, public locations when completing in-person transactions.",
            "Comply with all applicable laws and campus policies when using the Platform.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Marketplace Rules and Prohibited Items">
        <p>The following may not be listed or sold on the Platform:</p>
        <LegalList
          items={[
            "Illegal items or services of any kind, including drugs and drug paraphernalia.",
            "Weapons, ammunition, explosives, and other dangerous materials.",
            "Alcohol, tobacco, vaping products, and other age-restricted goods.",
            "Stolen goods or items obtained through fraud.",
            "Counterfeit, replica, or unauthorized copies of branded products.",
            "Prescription medication, medical devices, and recalled products.",
            "Academic dishonesty services, such as completed assignments or exam materials.",
            "Live animals, hazardous chemicals, and adult content.",
            "Anything that infringes the intellectual property or privacy rights of others.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Fraud Prevention and Fake Listings">
        <p>
          Fraudulent behavior is strictly prohibited. This includes posting
          fake or misleading listings, misrepresenting an item's condition,
          accepting payment without delivering an item, phishing, and any
          attempt to scam other users. We may use automated and manual review
          to detect suspicious activity, and we may remove listings, restrict
          features, or suspend accounts involved in suspected fraud. Users are
          encouraged to report suspicious listings or behavior through the
          in-app reporting tools or our{" "}
          <Link to="/contact" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. User-Generated Content">
        <p>
          You retain ownership of the content you post, including listing
          descriptions and photos. By posting content, you grant us a
          worldwide, non-exclusive, royalty-free license to host, display, and
          distribute that content as needed to operate and promote the
          Platform. You represent that you have all rights necessary to post
          your content and that it does not violate any law or third-party
          right.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual Property">
        <p>
          The Platform, including its design, branding, and software, is
          owned by us or our licensors and is protected by intellectual
          property laws. You may not copy, modify, distribute, or create
          derivative works from the Platform without our prior written
          consent. Trademarks and product names that appear in listings belong
          to their respective owners.
        </p>
      </LegalSection>

      <LegalSection title="9. Moderation, Listing Removal, and Account Suspension">
        <p>
          We may, at our sole discretion and without prior notice, remove or
          hide any listing, restrict account features, or suspend or ban any
          account that we believe violates these Terms, our Community
          Guidelines, or applicable law, or that poses a risk to other users
          or the Platform. Repeated or severe violations may result in
          permanent removal from the Platform.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimer of Warranties">
        <p>
          The Platform is provided "as is" and "as available", without
          warranties of any kind, whether express or implied, including
          warranties of merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant that the Platform will be
          uninterrupted, error-free, or secure, or that any listing is
          accurate, lawful, or safe.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, we and our team members
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or for any loss of profits,
          data, or goodwill, arising out of or related to your use of the
          Platform or any transaction with another user. This includes, without
          limitation, disputes between buyers and sellers, defective or
          misrepresented items, failed payments, and in-person meetups. Where
          liability cannot be excluded, our total liability shall not exceed
          the amount you paid us to use the Platform (currently zero, as the
          Platform is free).
        </p>
      </LegalSection>

      <LegalSection title="12. Termination">
        <p>
          You may stop using the Platform and delete your account at any
          time. We may suspend or terminate your access at any time for
          violations of these Terms or to protect the Platform and its users.
          Sections that by their nature should survive termination (including
          content licenses, disclaimers, and limitations of liability) will
          survive.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing Law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which
          the Platform's operator is established, without regard to conflict
          of law principles. Any disputes arising from these Terms or your
          use of the Platform shall be resolved in the courts of that
          jurisdiction, unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to These Terms">
        <p>
          We may update these Terms from time to time. When we do, we will
          revise the "Last updated" date at the top of this page. Continued
          use of the Platform after changes take effect constitutes acceptance
          of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>
          Questions about these Terms? Email us at{" "}
          <a href={`mailto:${email}`} className="text-[#FF5A1F] hover:underline">
            {email}
          </a>{" "}
          or visit our{" "}
          <Link to="/contact" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
