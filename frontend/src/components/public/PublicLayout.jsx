import React, { useEffect, useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { publicNav } from '../../data/publicSiteContent';

const brandLogo = '/images/AUREON9.png';
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <NavLink to="/" className="flex shrink-0 items-center gap-2 text-left -ml-3 sm:-ml-4 sm:gap-3 lg:-ml-8">
            <img src={brandLogo} alt="AUREON9 logo" className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-tight text-[var(--aureon-ink)] sm:text-lg lg:text-xl">AUREON9</p>
              <p className="hidden text-xs text-slate-500 xs:block sm:whitespace-nowrap">Global membership and rewards</p>
            </div>
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <NavButton key={item.route} label={item.label} to={item.route} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <Button asChild variant="outline" className="rounded-full border-slate-300 px-4 text-sm">
              <NavLink to="/login">Login</NavLink>
            </Button>
            <Button asChild className="whitespace-nowrap rounded-full bg-[var(--aureon-ink)] px-4 text-sm hover:bg-[#14385f] xl:px-5">
              <NavLink to="/register">Become a Member</NavLink>
            </Button>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 sm:h-11 sm:w-11 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <HiOutlineX className="h-5 w-5" /> : <HiOutlineMenu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-4 sm:px-4">
              {publicNav.map((item) => (
                <NavButton key={item.route} label={item.label} to={item.route} fullWidth />
              ))}
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" className="w-full rounded-full border-slate-300">
                  <NavLink to="/login">Login</NavLink>
                </Button>
                <Button asChild className="w-full rounded-full bg-[var(--aureon-ink)] hover:bg-[#14385f]">
                  <NavLink to="/register">Become a Member</NavLink>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 lg:px-8 lg:pt-8">
          <Outlet />
        </section>
      </main>

      <footer className="relative z-10 mt-12 border-t border-[#14385f] bg-[var(--aureon-ink)] text-white sm:mt-16">
        {/* Main footer grid */}
        <div className="mx-auto grid max-w-7xl gap-8 px-3 py-8 sm:gap-10 sm:px-4 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">

          {/* Brand column */}
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={brandLogo} alt="AUREON9 logo" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
              <div>
                <p className="font-heading text-xl font-semibold text-white sm:text-2xl">AUREON9</p>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">Global membership and rewards</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400 sm:leading-7 lg:max-w-xs">
              Enterprise-grade membership, identity, verification, and rewards infrastructure — powered by ODIEBOARD.
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
        </div>

        {/* Bottom legal bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-3 py-5 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:items-center lg:px-8">
            <div className="space-y-1 text-[10px] leading-5 text-slate-400 sm:text-xs sm:leading-6">
              <p>All Oderson Holdings subsidiaries are Members of the ODIECLOUD²π Ecosystem.</p>
              <p>ODIECLOUD²π, ODIEBOARD, Oπ, ODIEXA, and AUREX are Registered Trademark and Service Marks of Oderson Holdings Ltd.</p>
              <p>© Copyright Aureon9. All Rights Reserved.</p>
            </div>
            <img
              src={odieLogo}
              alt="Powered by ODIEBOARD"
              className="h-16 w-auto object-contain opacity-90 sm:h-20"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
