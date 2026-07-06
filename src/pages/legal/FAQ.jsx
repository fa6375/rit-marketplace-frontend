import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { useSettings } from "../../context/SettingsContext";
import { LegalPageLayout } from "../../components/LegalPageLayout";
import { FALLBACK_SUPPORT_EMAIL } from "../../lib/siteInfo";

export default function FAQ() {
  const { websiteName, supportEmail } = useSettings();
  const email = supportEmail || FALLBACK_SUPPORT_EMAIL;

  const faqs = [
    {
      q: "How do I create an account?",
      a: (
        <>
          Click <span className="font-medium">"Create an account"</span> on the
          sign-in page, enter your name, email address, and a password, and
          agree to our Terms of Service, Privacy Policy, and Community
          Guidelines. We'll send a verification link to your email — once you
          confirm it, you're in.
        </>
      ),
    },
    {
      q: "How do I post a listing?",
      a: (
        <>
          After signing in, click the <span className="font-medium">"Post a listing"</span>{" "}
          button in the navigation bar. Add a title, description, price,
          category, and photos of your item, then publish. Your listing
          appears on the marketplace in real time.
        </>
      ),
    },
    {
      q: "Is the marketplace free?",
      a: (
        <>
          Yes — {websiteName} is completely free to use. There are no listing
          fees, commissions, or subscription charges. Buyers and sellers
          arrange payment directly between themselves.
        </>
      ),
    },
    {
      q: "How do I report a listing?",
      a: (
        <>
          Use the <span className="font-medium">"Send a report"</span> option in your
          profile menu, or the report option on the listing itself. You can
          also reach us through the{" "}
          <Link to="/contact?topic=report" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          . Our moderation team reviews every report.
        </>
      ),
    },
    {
      q: "How do I edit a listing?",
      a: (
        <>
          Go to <span className="font-medium">"My listings"</span> from your profile
          menu, find the listing you want to change, and choose the edit
          option. You can update the title, description, price, category, and
          photos at any time.
        </>
      ),
    },
    {
      q: "How do I delete my account?",
      a: (
        <>
          Open <span className="font-medium">"Account settings"</span> from your
          profile menu and follow the account deletion option. If you run
          into any trouble, email us at{" "}
          <a href={`mailto:${email}`} className="text-[#FF5A1F] hover:underline">
            {email}
          </a>{" "}
          and we'll take care of it. See our{" "}
          <Link to="/privacy" className="text-[#FF5A1F] hover:underline">
            Privacy Policy
          </Link>{" "}
          for details on what happens to your data.
        </>
      ),
    },
    {
      q: "How do I stay safe when buying or selling?",
      a: (
        <>
          Meet in public, well-lit places on campus, inspect items before
          paying, and never share sensitive personal or financial
          information. Trust your instincts — if a deal feels off, walk away
          and report it. Our{" "}
          <Link to="/guidelines" className="text-[#FF5A1F] hover:underline">
            Community Guidelines
          </Link>{" "}
          have more safety tips.
        </>
      ),
    },
    {
      q: "How can I contact support?",
      a: (
        <>
          Email us anytime at{" "}
          <a href={`mailto:${email}`} className="text-[#FF5A1F] hover:underline">
            {email}
          </a>{" "}
          or use the form on our{" "}
          <Link to="/contact" className="text-[#FF5A1F] hover:underline">
            Contact page
          </Link>
          . We aim to respond as quickly as possible.
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      eyebrow="Help center"
      title="Frequently Asked Questions"
      intro={`Quick answers to the most common questions about using ${websiteName}.`}
      metaTitle="FAQ"
      metaDescription="Frequently asked questions about Campus Marketplace: creating an account, posting listings, staying safe, reporting problems, and contacting support."
      testId="faq-page"
    >
      <div className="rounded-2xl bg-white border border-gray-200 px-5 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-gray-900 hover:text-[#FF5A1F] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-gray-600">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Still have questions? Visit our{" "}
        <Link to="/contact" className="text-[#FF5A1F] hover:underline">
          Contact page
        </Link>{" "}
        — we're happy to help.
      </p>
    </LegalPageLayout>
  );
}
