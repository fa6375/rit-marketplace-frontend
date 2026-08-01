import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import {
  LegalPageLayout,
  LegalSection,
  LegalList,
} from "../../components/LegalPageLayout";
import { LEGAL_LAST_UPDATED, FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

/**
 * Terms of Service.
 *
 * IMPORTANT: every statement in this page is written to match the actual
 * behavior of the application. If a feature changes, this page must be
 * updated in the same change.
 */
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
      metaDescription="Read the Terms of Service for Campus Marketplace, including eligibility, marketplace rules, offers, Lost & Found, prohibited items, and limitations of liability."
      testId="terms-page"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          These Terms of Service ("Terms") form a binding agreement between
          you and {websiteName} ("we", "us", or "the Platform"). By creating
          an account, posting a listing, making an offer, publishing a Lost &
          Found post, or otherwise using the Platform, you confirm that you
          have read, understood, and agree to be bound by these Terms, our{" "}
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

      <LegalSection title="2. Eligibility and Accounts">
        <LegalList
          items={[
            "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account.",
            "You must register with a valid email address that you own and verify it when prompted. Unverified accounts cannot access the marketplace.",
            "You may only maintain one account, and you may not create a new account to evade a suspension or ban.",
            "Keep your login credentials confidential; you are responsible for all activity under your account.",
            "Provide accurate information in your profile — your display name, photo, and bio are visible to other users.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. The Platform Is a Marketplace Only">
        <p>
          {websiteName} is solely a venue that connects student buyers and
          sellers. We are not a party to any transaction between users. We do
          not own, inspect, store, ship, or guarantee any items listed, and
          we do not process, hold, or transfer payments of any kind. Prices
          and offers shown on the Platform are informational; all
          negotiations, payments, exchanges, and meetups are arranged and
          completed directly between the buyer and the seller, off the
          Platform, at their own risk and responsibility.
        </p>
      </LegalSection>

      <LegalSection title="4. Listings">
        <LegalList
          items={[
            "Only list items or services that you own or have the legal right to offer, described accurately, with real photos of the actual item.",
            "Set honest prices. Price changes are recorded and a listing's price history is visible to buyers.",
            "Choose an appropriate category, listing type, condition, and campus pickup location.",
            "Mark items as sold when a transaction is completed, and honor the agreements you make with other users.",
            "Available listing types (for example products, tutoring, services, events, jobs, or roommate posts) are configured by the Platform's administrators and may change over time.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Offers and Negotiation">
        <LegalList
          items={[
            "Making an offer is an expression of intent to buy at that price; it is not a payment and does not reserve the item.",
            "Sellers may accept, reject, or counter an offer, and buyers may withdraw an offer or accept a counter-offer. The negotiation history is visible to both parties.",
            "You may hold one open offer per listing at a time, and repeated rapid offers on the same listing are rate-limited to prevent spam.",
            "Do not make offers you do not intend to honor. Repeatedly abandoning accepted offers may be treated as a violation of these Terms.",
            "Sellers' response rates and typical response times, calculated from their actual offer activity, are displayed on their public profiles.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Lost & Found">
        <LegalList
          items={[
            "The Lost & Found section may only be used to genuinely seek lost personal property or to help return found property to its owner.",
            "Contact details you include in a Lost & Found post (such as a phone number) are visible to all signed-in users. Only share details you are comfortable making visible.",
            "Demanding payment or a reward as a condition for returning found property is prohibited.",
            "Keeping, selling, or listing found property that belongs to someone else is prohibited and may be unlawful.",
            "Mark your post as found once the item is recovered. Administrators may edit visibility of, or remove, Lost & Found posts that violate these Terms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Prohibited Items and Conduct">
        <p>The following may not be listed, sold, or requested on the Platform:</p>
        <LegalList
          items={[
            "Illegal items or services of any kind, including drugs and drug paraphernalia.",
            "Weapons, ammunition, explosives, and other dangerous materials.",
            "Alcohol, tobacco, vaping products, and other age-restricted goods.",
            "Stolen goods or items obtained through fraud, including found property that belongs to someone else.",
            "Counterfeit, replica, or unauthorized copies of branded products.",
            "Prescription medication, medical devices, and recalled products.",
            "Academic dishonesty services, such as completed assignments or exam materials.",
            "Live animals, hazardous chemicals, and adult content.",
            "Anything that infringes the intellectual property or privacy rights of others.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Fraud Prevention and Reporting">
        <p>
          Fraudulent behavior is strictly prohibited. This includes posting
          fake or misleading listings, misrepresenting an item's condition,
          accepting payment without delivering an item, phishing, and any
          attempt to scam other users. Moderation on the Platform is
          performed by human administrators and relies substantially on user
          reports: every listing has an in-app report option, and general
          reports can be submitted from the profile menu. Reports are
          reviewed by administrators, who may remove listings, restrict
          features, or suspend or ban accounts involved in suspected fraud.
          You can also reach us through our{" "}
          <Link to="/contact" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. User-Generated Content">
        <p>
          You retain ownership of the content you post, including listing
          descriptions, photos, your bio, and Lost & Found posts. By posting
          content, you grant us a worldwide, non-exclusive, royalty-free
          license to host, display, and distribute that content as needed to
          operate the Platform — for example, showing your listings in
          search results, trending sections, and other users' saved
          collections and notifications. You represent that you have all
          rights necessary to post your content and that it does not violate
          any law or third-party right.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual Property">
        <p>
          The Platform, including its design, branding, and software, is
          owned by us or our licensors and is protected by intellectual
          property laws. You may not copy, modify, distribute, or create
          derivative works from the Platform without our prior written
          consent. Trademarks and product names that appear in listings
          belong to their respective owners.
        </p>
      </LegalSection>

      <LegalSection title="11. Moderation, Listing Removal, and Account Suspension">
        <p>
          We may, at our sole discretion and without prior notice, remove or
          hide any listing or Lost & Found post, restrict account features,
          or suspend or ban any account that we believe violates these
          Terms, our Community Guidelines, or applicable law, or that poses
          a risk to other users or the Platform. Suspended and banned
          accounts lose access to the marketplace. Repeated or severe
          violations may result in permanent removal from the Platform.
          Administrative moderation actions are logged.
        </p>
      </LegalSection>

      <LegalSection title="12. Service Availability">
        <p>
          The Platform is provided free of charge and may occasionally be
          placed into maintenance mode, during which access is limited.
          Features (including available listing types, categories, pickup
          locations, and achievements) are configurable by administrators
          and may be added, changed, or removed at any time.
        </p>
      </LegalSection>

      <LegalSection title="13. Disclaimer of Warranties">
        <p>
          The Platform is provided "as is" and "as available", without
          warranties of any kind, whether express or implied, including
          warranties of merchantability, fitness for a particular purpose,
          and non-infringement. We do not warrant that the Platform will be
          uninterrupted, error-free, or secure, or that any listing, offer,
          Lost & Found post, seller statistic, or badge is accurate, lawful,
          or safe. The "verified" badge on profiles indicates only that the
          user has verified their email address; it is not an endorsement or
          a guarantee of identity or trustworthiness.
        </p>
      </LegalSection>

      <LegalSection title="14. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, we and our team members
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or for any loss of profits,
          data, or goodwill, arising out of or related to your use of the
          Platform or any transaction with another user. This includes,
          without limitation, disputes between buyers and sellers, defective
          or misrepresented items, failed payments, in-person meetups, and
          interactions arising from Lost & Found posts. Where liability
          cannot be excluded, our total liability shall not exceed the
          amount you paid us to use the Platform (currently zero, as the
          Platform is free).
        </p>
      </LegalSection>

      <LegalSection title="15. Termination">
        <p>
          You may stop using the Platform at any time and may request
          deletion of your account by contacting us (see our{" "}
          <Link to="/privacy" className="text-[#FF5A1F] hover:underline">
            Privacy Policy
          </Link>{" "}
          for details). We may suspend or terminate your access at any time
          for violations of these Terms or to protect the Platform and its
          users. Sections that by their nature should survive termination
          (including content licenses, disclaimers, and limitations of
          liability) will survive.
        </p>
      </LegalSection>

      <LegalSection title="16. Governing Law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which
          the Platform's operator is established, without regard to conflict
          of law principles. Any disputes arising from these Terms or your
          use of the Platform shall be resolved in the courts of that
          jurisdiction, unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection title="17. Changes to These Terms">
        <p>
          We may update these Terms from time to time, including to reflect
          new or changed features. When we do, we will revise the "Last
          updated" date at the top of this page. Continued use of the
          Platform after changes take effect constitutes acceptance of the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="18. Contact">
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
