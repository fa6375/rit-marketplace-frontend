import { Link } from 'react-router-dom';
import { Mail, ShoppingBag, ShieldCheck, Users } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Founders', to: '/about#founders' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
  { label: 'Report Listing', to: '/contact?topic=report' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Community Guidelines', to: '/guidelines' },
];

const accountLinks = [
  { label: 'Create Listing', to: '/create' },
  { label: 'My Listings', to: '/my-listings' },
  { label: 'Account Settings', to: '/account' },
];

export const Footer = () => {
  const { websiteName, supportEmail } = useSettings();
  const name = websiteName || 'Campus Marketplace';

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white" data-testid="main-footer">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-500 p-3 shadow-lg shadow-orange-500/30">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-sm text-gray-300">Built for students, powered by community.</p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-gray-400">
            A modern marketplace platform helping students safely buy, sell, and connect with others on campus.
          </p>

          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-orange-400 transition"
            >
              <Mail size={15} /> Support: {supportEmail}
            </a>
          )}

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <ShieldCheck size={16} />
              Trusted Listings
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Users size={16} />
              Student Community
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Explore</h3>
          <div className="mt-5 grid gap-3 text-sm text-gray-300">
            {exploreLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="transition hover:text-orange-400"
                data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Legal</h3>
          <div className="mt-5 grid gap-3 text-sm text-gray-300">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="transition hover:text-orange-400"
                data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Your Account</h3>
          <div className="mt-5 grid gap-3 text-sm text-gray-300">
            {accountLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="transition hover:text-orange-400"
                data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-gray-400">
        © 2026 {name} • Connecting students through smarter campus trading.
      </div>
    </footer>
  );
};
