import React from 'react';
import { ScrollReveal } from '../../components/ScrollReveal';
import { PageHero, SectionBlock, InfoRow, ShowcaseCard } from '../../components/public/PublicPrimitives';
import { opportunityRules, opportunities } from '../../data/publicSiteContent';
import { Lock } from 'lucide-react';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-10">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Opportunities" intro="Public opportunity pages introduce controlled tracks before users move into gated dashboard access." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Opportunity Tracks" title="Trade, capital, travel, and tech" description="The public website structure names these tracks directly before access becomes gated inside the member experience.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {opportunities.map((item) => (
            <ShowcaseCard key={item.title} title={item.title} icon={item.icon}><p className="text-sm leading-6 text-slate-600">{item.text}</p></ShowcaseCard>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Access Rules" title="Public visibility, controlled execution" description="The backend foundation defines opportunity access rules that sit underneath the public pages.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{opportunityRules.map((rule) => <InfoRow key={rule} icon={Lock} text={rule} />)}</div>
      </SectionBlock>
      </ScrollReveal>
    </div>
  );
}
