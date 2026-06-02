import { Mail, ShoppingBag, ShieldCheck, Users } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-500 p-3 shadow-lg shadow-orange-500/30">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">RIT Marketplace</h2>
              <p className="text-sm text-gray-300">Built for students, powered by community.</p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-6 text-gray-400">
            A modern marketplace platform helping RIT students safely buy, sell, and connect with others on campus.
          </p>

          <div className="mt-6 flex gap-4 text-sm text-gray-300">
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
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <div className="mt-5 grid gap-3 text-sm text-gray-300">
            <a href="/" className="transition hover:text-orange-400">Home</a>
            <a href="/create" className="transition hover:text-orange-400">Create Listing</a>
            <a href="/my-listings" className="transition hover:text-orange-400">My Listings</a>
            <a href="/account" className="transition hover:text-orange-400">Account Settings</a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Founding Team</h3>

          <div className="mt-5 space-y-4">
            {[
              {
                name: 'Aliyev Faraj',
                role: 'Founder',
                email: 'fa6375@rit.edu',
              },
              {
                name: 'Andrej Biljaka',
                role: 'Co-Founder',
                email: 'ab1538@rit.edu',
              },
              {
                name: 'Fran Brezanin',
                role: 'Co-Founder',
                email: 'fb1060@g.rit.edu',
              },
            ].map((member) => (
              <div
                key={member.email}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-orange-400/50 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-orange-300">{member.role}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                  <Mail size={15} />
                  <a href={`mailto:${member.email}`} className="hover:text-orange-400">
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-gray-400">
        © 2026 RIT Marketplace • Connecting students through smarter campus trading.
      </div>
    </footer>
  );
};
