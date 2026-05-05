import React, { useEffect, useState } from 'react';
import { HiOutlineMenu, HiOutlineX, HiBriefcase, HiGlobeAlt } from 'react-icons/hi';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { publicNav } from '../../data/publicSiteContent';

const brandLogo = '/images/AUREON9_Logo.png';
const odieLogo  = '/images/Powered_By_ODIEBOARD.png';

function NavButton({ label, to, fullWidth = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${fullWidth ? 'w-full justify-start' : ''} inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-[var(--aureon-ink)] text-white shadow-lg shadow-[rgba(10,37,64,0.14)]'
            : 'text-slate-600 hover:bg-white hover:text-[var(--aureon-ink)]'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu AND scroll to top on every route change
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--aureon-bg)] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[rgba(10,37,64,0.16)] blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-80 w-80 rounded-full bg-[rgba(0,168,168,0.14)] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[rgba(212,175,55,0.10)] blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-8 lg:pr-4">
          <NavLink to="/" className="flex shrink-0 items-center gap-2 text-left -ml-3 sm:-ml-4 sm:gap-3 lg:-ml-8">
            <img src={brandLogo} alt="AUREON9 logo" className="h-12 w-12 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-tight text-[var(--aureon-ink)] sm:text-lg lg:text-xl">AUREON9</p>
              <p className="hidden text-xs text-slate-500 xs:block sm:whitespace-nowrap">Global membership and rewards</p>
            </div>
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
            {publicNav.map((item) => (
              <NavButton key={item.route} label={item.label} to={item.route} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex xl:gap-4">
            <Button asChild className="whitespace-nowrap rounded-full bg-[var(--aureon-ink)] px-4 py-2 text-sm hover:bg-[#14385f] xl:px-5">
              <NavLink to="/register">
                Become a Member
              </NavLink>
            </Button>
            <button className="cursor-pointer transition hover:opacity-70">
              <HiGlobeAlt className="h-5 w-5 text-black" />
            </button>
            <button className="cursor-pointer transition hover:opacity-70">
              <HiBriefcase className="h-5 w-5 text-black" />
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 sm:h-11 sm:w-11 xl:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <HiOutlineX className="h-5 w-5" /> : <HiOutlineMenu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full border-t border-slate-200 bg-white xl:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 sm:px-4">
              {publicNav.map((item) => (
                <NavButton key={item.route} label={item.label} to={item.route} fullWidth />
              ))}
              <div className="mt-2 flex flex-col items-center gap-3">
                <Button asChild className="w-full rounded-full bg-[var(--aureon-ink)] hover:bg-[#14385f]">
                  <NavLink to="/register">
                    Become a Member
                  </NavLink>
                </Button>
                <div className="flex items-center gap-4">
                  <button className="cursor-pointer transition hover:opacity-70">
                    <HiGlobeAlt className="h-6 w-6 text-black" />
                  </button>
                  <button className="cursor-pointer transition hover:opacity-70">
                    <HiBriefcase className="h-6 w-6 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-12 border-t border-[#14385f] bg-[var(--aureon-ink)] text-white sm:mt-16">
        {/* Main footer grid */}
        <div className="mx-auto grid max-w-7xl gap-8 px-3 py-8 sm:gap-10 sm:px-4 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.8fr_0.9fr_0.9fr_0.9fr_0.9fr_0.9fr] lg:gap-6 lg:px-8">

          {/* Brand column */}
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1 items-center lg:items-start text-center lg:text-left lg:pr-8">
            <img src={brandLogo} alt="AUREON9 logo" className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
            <p className="max-w-md text-sm leading-6 text-slate-400 sm:leading-7">
              Enterprise-grade membership, identity, verification, and rewards infrastructure
            </p>
          </div>

          {/* Public Pages */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Public Pages</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300 sm:mt-4">
              {publicNav.map((item) => (
                <NavLink key={item.route} className="block transition hover:text-white" to={item.route}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Access */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Access</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300 sm:mt-4">
              <NavLink className="block transition hover:text-white" to="/request-access">Request Access</NavLink>
              <NavLink className="block transition hover:text-white" to="/login">Login</NavLink>
              <NavLink className="block transition hover:text-white" to="/register">Register</NavLink>
              <NavLink className="block transition hover:text-white" to="/dashboard/member">Member Dashboard</NavLink>
              <NavLink className="block transition hover:text-white" to="/dashboard/admin-review">Admin Review</NavLink>
              <NavLink className="block transition hover:text-white" to="/dashboard/admin-settings">Admin Settings</NavLink>
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Ecosystem</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300 sm:mt-4">
              <span className="block">ODIEBOARD</span>
              <span className="block">ODIECLOUD²π</span>
              <span className="block">ODIEXA</span>
              <span className="block">AUREX</span>
              <span className="block">Oπ</span>
              <span className="block">AAL</span>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Legal</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300 sm:mt-4">
              <NavLink className="block transition hover:text-white" to="/terms">Terms of Service</NavLink>
              <NavLink className="block transition hover:text-white" to="/privacy">Privacy Policy</NavLink>
              <NavLink className="block transition hover:text-white" to="/cookies">Cookie Policy</NavLink>
              <NavLink className="block transition hover:text-white" to="/disclaimer">Disclaimer</NavLink>
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Support</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300 sm:mt-4">
              <NavLink className="block transition hover:text-white" to="/help">Help Center</NavLink>
              <NavLink className="block transition hover:text-white" to="/contact">Contact Us</NavLink>
              <NavLink className="block transition hover:text-white" to="/faq">FAQ</NavLink>
              <NavLink className="block transition hover:text-white" to="/support">Support Ticket</NavLink>
            </div>
          </div>
        </div>

        {/* Bottom legal bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-3 py-5 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:items-center lg:px-8">
            <div className="space-y-1 text-sm leading-6 text-slate-400">
              <p>All Oderson Holdings subsidiaries are Members of the ODIECLOUD²π Ecosystem.</p>
              <p>ODIECLOUD²π, ODIEBOARD, Oπ, ODIEXA, and AUREX are Registered Trademark and Service Marks of Oderson Holdings Ltd.</p>
              <p>© Copyright Aureon9. All Rights Reserved.</p>
            </div>
            <img
              src={odieLogo}
              alt="Powered by ODIEBOARD"
              className="h-24 w-auto object-contain opacity-90 sm:h-32 mx-auto lg:mx-0"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
