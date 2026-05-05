import React from 'react';
import { NavLink } from 'react-router-dom';
import { ScrollReveal } from '../../components/ScrollReveal';
import {
  HiChevronRight,
  HiArrowRight,
  HiAcademicCap,
  HiLightningBolt,
  HiStar,
  HiTrendingUp,
  HiKey,
  HiSparkles,
  HiLockClosed,
  HiFingerPrint,
  HiIdentification,
  HiDocumentText,
  HiBriefcase,
  HiOfficeBuilding,
  HiCash,
  HiBadgeCheck,
  HiUsers,
} from 'react-icons/hi';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { ShowcaseCard } from '../../components/public/PublicPrimitives';
import { ecosystemLinks, homeTierCards, verificationLevels } from '../../data/publicSiteContent';

// 6 unique solid icons — one per tier card
const tierIcons = [
  HiAcademicCap,
  HiLightningBolt,
  HiStar,
  HiTrendingUp,
  HiSparkles,
  HiKey,
];

// 7 unique solid icons — one per verification level
const verificationIcons = [
  HiFingerPrint,
  HiIdentification,
  HiDocumentText,
  HiBriefcase,
  HiOfficeBuilding,
  HiCash,
  HiBadgeCheck,
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">

      {/* ── HERO ── */}
      <ScrollReveal>
      <section className="relative min-h-[500px] overflow-hidden lg:h-[650px]">
        {/* Background image extending to edges */}
        <img
          src="/images/dorian-labbe-y2vAEkdaAdA-unsplash.jpg"
          alt="AUREON9 Platform"
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent" />

        {/* Content overlay */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 py-12 lg:px-8 lg:py-8">
          {/* Left content */}
          <div className="flex max-w-xl flex-col justify-center">
            <Badge className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white backdrop-blur-sm">
              Enterprise Membership Platform
            </Badge>
            <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              AUREON9 — Membership, Identity &amp; Rewards Infrastructure
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90">
              A governed platform for participant classification, identity verification, tier progression, AUREX rewards, and controlled opportunity access — powered by ODIEBOARD.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild className="whitespace-nowrap rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 sm:px-8">
                <NavLink className="inline-flex items-center gap-2" to="/register">
                  Become a Member <HiArrowRight className="h-5 w-5" />
                </NavLink>
              </Button>
              <Button asChild className="whitespace-nowrap rounded-full border-2 border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:px-8">
                <NavLink to="/membership">Explore Membership</NavLink>
              </Button>
            </div>
          </div>

          {/* Right info cards */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4">
            {/* Top row - 2 cards */}
            <div className="flex gap-4">
              <Card className="w-64 rounded-2xl border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <HiUsers className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Participant Classes</p>
                      <p className="text-lg font-bold text-white">17 mandatory classes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-64 rounded-2xl border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <HiBadgeCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Verification Levels</p>
                      <p className="text-lg font-bold text-white">7 trust states</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Middle row - 2 cards */}
            <div className="flex gap-4">
              <Card className="w-64 rounded-2xl border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <HiCash className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Reward Engine</p>
                      <p className="text-lg font-bold text-white">ARX plus commissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-64 rounded-2xl border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <HiOfficeBuilding className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Connected Layers</p>
                      <p className="text-lg font-bold text-white">Governance to wallet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom section - System Positioning */}
            <Card className="rounded-2xl border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
              <CardContent className="p-5">
                <p className="mb-3 text-xs uppercase tracking-wider text-white/60">System Positioning</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Membership Layer</div>
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Identity Layer</div>
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Verification Layer</div>
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Access Control Layer</div>
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Rewards and Incentive Layer</div>
                  <div className="rounded-xl bg-white/5 px-3 py-2 text-center text-sm text-white">Participation Authorization Layer</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── MEMBERSHIP TIERS — unique icon per card ── */}
      <ScrollReveal>
      <section className="mx-auto max-w-7xl space-y-6 px-3 sm:px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">Membership Tiers</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Seven tiers from Entry through Sovereign — each with defined benefits, requirements, and upgrade paths.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {homeTierCards.map((tierName, i) => {
            const Icon = tierIcons[i % tierIcons.length];
            return (
              <ShowcaseCard key={tierName} title={tierName} icon={Icon}>
                <p className="text-sm leading-6 text-slate-600">Benefits, requirements, and the apply path are exposed here before login.</p>
                <NavLink className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--aureon-ink)]" to="/tiers">
                  Apply <HiChevronRight className="h-4 w-4" />
                </NavLink>
              </ShowcaseCard>
            );
          })}
        </div>
      </section>
      </ScrollReveal>

      {/* ── ECOSYSTEM INTEGRATION — each item has its own unique icon from data ── */}
      <ScrollReveal>
      <section className="mx-auto max-w-7xl space-y-6 px-3 sm:px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">Ecosystem Integration</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            AUREON9 connects governance, sales, marketplace, wallet, and technology layers into one unified infrastructure.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {ecosystemLinks.map((item) => (
            <ShowcaseCard key={item.name} title={item.name} icon={item.icon} compact>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </ShowcaseCard>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── TRUST & VERIFICATION — unique icon per level ── */}
      <ScrollReveal>
      <section className="mx-auto max-w-7xl space-y-6 px-3 sm:px-4 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">Trust and Verification</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Verification controls trust, permissions, and how participants move into higher-value ecosystem activities.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ShowcaseCard title="Verified Participants Only" icon={HiLockClosed}>
            <p className="text-sm leading-7 text-slate-600">
              Verification is not decorative. It controls trust, permissions, and how participants move into higher-value ecosystem activities.
            </p>
          </ShowcaseCard>
          <Card className="rounded-[2rem] border-white/60 bg-white/85 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgba(10,37,64,0.10)]">
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
              {verificationLevels.map((level, i) => {
                const Icon = verificationIcons[i % verificationIcons.length];
                return (
                  <div key={level} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-4 w-4 text-slate-900" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{level}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
      </ScrollReveal>

    </div>
  );
}
