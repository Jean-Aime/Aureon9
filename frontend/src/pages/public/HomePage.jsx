import React from 'react';
import { NavLink } from 'react-router-dom';
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
      <section className="grid gap-8 lg:grid-cols-2 lg:items-stretch">

        {/* Left */}
        <div className="flex flex-col justify-center pt-0 lg:pt-4">
          <Badge className="w-fit rounded-full border border-[rgba(10,37,64,0.12)] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[var(--aureon-ink)]">
            Enterprise Membership Platform
          </Badge>
          <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)] sm:text-4xl lg:text-5xl">
            AUREON9 — Membership, Identity &amp; Rewards Infrastructure
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            A governed platform for participant classification, identity verification, tier progression, AUREX rewards, and controlled opportunity access — powered by ODIEBOARD.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[var(--aureon-ink)] px-10 py-4 text-lg hover:bg-[#14385f]">
              <NavLink className="inline-flex items-center gap-2" to="/register">
                Become a Member <HiArrowRight className="h-5 w-5" />
              </NavLink>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 px-10 py-4 text-lg">
              <NavLink to="/membership">Explore Membership</NavLink>
            </Button>
          </div>
        </div>

        {/* Right — image only, no overlay cards */}
        <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-[rgba(10,37,64,0.14)]">
          <img
            src="/images/dorian-labbe-y2vAEkdaAdA-unsplash.jpg"
            alt="AUREON9 Platform"
            className="h-full w-full object-cover min-h-[520px]"
          />
        </div>
      </section>

      {/* ── MEMBERSHIP TIERS — unique icon per card ── */}
      <section className="space-y-6">
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

      {/* ── ECOSYSTEM INTEGRATION — each item has its own unique icon from data ── */}
      <section className="space-y-6">
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

      {/* ── TRUST & VERIFICATION — unique icon per level ── */}
      <section className="space-y-6">
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

    </div>
  );
}
