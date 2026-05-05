import React from 'react';
import { BadgeCheck, ChevronRight, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '../../components/ScrollReveal';
import { PageHero, SectionBlock, InfoRow } from '../../components/public/PublicPrimitives';
import { verificationDocuments, verificationFlags, verificationLevels, verificationWorkflow } from '../../data/publicSiteContent';
import { FileCheck2 } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="space-y-10">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Verification and Trust Layer" intro="Verification is central to trust, access, and participant authorization inside AUREON9." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionBlock eyebrow="Verification Levels" title="The seven trust states" description="The verification center, wireframe, and master plan all revolve around document-backed progression.">
          <div className="grid gap-3">{verificationLevels.map((item) => <InfoRow key={item} icon={BadgeCheck} text={item} />)}</div>
        </SectionBlock>
        <SectionBlock eyebrow="Document Validation" title="Required evidence before access expands" description="The master prompt names these document categories per verification level.">
          <div className="grid gap-3 sm:grid-cols-2">{verificationDocuments.map((item) => <InfoRow key={item} icon={FileCheck2} text={item} />)}</div>
        </SectionBlock>
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock eyebrow="Workflow" title="How review moves forward" description="Verification requires both automation and manual governance review.">
          <div className="grid gap-3">{verificationWorkflow.map((item) => <InfoRow key={item} icon={ChevronRight} text={item} />)}</div>
        </SectionBlock>
        <SectionBlock eyebrow="Risk Flags" title="Why a case can stop or escalate" description="The verification framework explicitly requires risk handling and suspended states.">
          <div className="grid gap-3">{verificationFlags.map((item) => <InfoRow key={item} icon={ShieldCheck} text={item} />)}</div>
        </SectionBlock>
      </div>
      </ScrollReveal>
    </div>
  );
}
