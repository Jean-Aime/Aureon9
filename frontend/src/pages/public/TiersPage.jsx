import React from 'react';
import { BadgeCheck, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { PageHero, SectionBlock, InfoRow } from '../../components/public/PublicPrimitives';
import { tierLogic, tierOutputs, tiers } from '../../data/publicSiteContent';

export default function TiersPage() {
  return (
    <div className="space-y-10">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Membership Tiers" intro="The baseline tier system runs from Entry through Sovereign and evaluates participants across qualification, activity, and governance logic." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Baseline Tier Model" title="Entry through Sovereign" description="The public site exposes the tier ladder, while the dashboards later track progress, compliance, and upgrade readiness.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className="rounded-[2rem] border-white/60 bg-white/85 shadow-lg shadow-[rgba(10,37,64,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-heading text-2xl font-semibold text-[var(--aureon-ink)]">{tier.name}</p>
                  <Badge className="rounded-full bg-[rgba(212,175,55,0.18)] text-[var(--aureon-ink)]">Tier</Badge>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{tier.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock eyebrow="Tier Logic" title="How progression is evaluated" description="These logic inputs are named directly in the master prompt.">
          <div className="grid gap-3 sm:grid-cols-2">{tierLogic.map((item) => <InfoRow key={item} icon={BadgeCheck} text={item} />)}</div>
        </SectionBlock>
        <SectionBlock eyebrow="Tier Output" title="What the tier system produces" description="Each tier maps to visible rights, entitlements, and ranking effects across the platform.">
          <div className="grid gap-3 sm:grid-cols-2">{tierOutputs.map((item) => <InfoRow key={item} icon={ChevronRight} text={item} />)}</div>
        </SectionBlock>
      </div>
      </ScrollReveal>
    </div>
  );
}
