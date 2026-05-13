import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { PageHero, SectionBlock, ShowcaseCard } from '../../components/public/PublicPrimitives';

export default function FoundingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-3 sm:px-4 lg:px-8">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Founding Member Program" intro="The founding program is part of the public website structure and aligns membership standing, rewards, upgrade paths, and governance obligations." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Public Program" title="Founding is both a tier signal and a website destination" description="The master prompt names the Founding Member Program as a dedicated public page, and the rewards engine explicitly includes founding rewards.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ShowcaseCard title="Standing" icon={Sparkles} compact><p className="text-sm leading-6 text-slate-600">Founding sits inside the baseline tier model and carries elevated status ranking in the public story.</p></ShowcaseCard>
          <ShowcaseCard title="Upgrade Pathways" icon={ArrowRight} compact><p className="text-sm leading-6 text-slate-600">Participant architecture requires upgrade pathways and governance obligations for each class and tier.</p></ShowcaseCard>
          <ShowcaseCard title="Founding Rewards" icon={Coins} compact><p className="text-sm leading-6 text-slate-600">Founding rewards are explicitly listed beside ARX, loyalty, and contribution rewards.</p></ShowcaseCard>
          <ShowcaseCard title="Governance" icon={ShieldCheck} compact><p className="text-sm leading-6 text-slate-600">Membership tiers are tied to compliance score, restrictions, and governance obligations.</p></ShowcaseCard>
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <Card className="rounded-[2rem] border-white/60 bg-[linear-gradient(135deg,rgba(10,37,64,0.98),rgba(0,168,168,0.86))] text-white shadow-2xl shadow-[rgba(10,37,64,0.12)]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_280px] lg:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Program Path</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Landing, verification, tier assignment, then controlled dashboard access.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">The master prompt defines the new member flow as landing to sign up to verification to tier assignment to dashboard access.</p>
          </div>
          <Button asChild className="rounded-full bg-white px-5 py-3 text-[var(--aureon-ink)] hover:bg-slate-100"><NavLink to="/request-access">Request Founding Access</NavLink></Button>
        </CardContent>
      </Card>
      </ScrollReveal>
    </div>
  );
}
