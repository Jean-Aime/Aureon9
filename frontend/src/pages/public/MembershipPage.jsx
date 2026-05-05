import React from 'react';
import { ScrollReveal } from '../../components/ScrollReveal';
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineChip,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineFingerPrint,
  HiOutlineGlobe,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineLibrary,
  HiOutlineLockClosed,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { PageHero, SectionBlock, ShowcaseCard } from '../../components/public/PublicPrimitives';
import { coreObjectives, participantClasses, systemPillars } from '../../data/publicSiteContent';

const coreObjectiveIcons = [
  HiOutlineIdentification,
  HiOutlineUserGroup,
  HiOutlineFingerPrint,
  HiOutlineLockClosed,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineGlobe,
];

const systemPillarIcons = [
  HiOutlineBadgeCheck,
  HiOutlineLibrary,
  HiOutlineSparkles,
  HiOutlineChip,
  HiOutlineKey,
  HiOutlineBriefcase,
];

export default function MembershipPage() {
  return (
    <div className="space-y-10">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Membership Overview" intro="AUREON9 is positioned as the membership, identity, verification, rewards, and participation control layer across the ecosystem." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Core Objective" title="What AUREON9 is expected to do" description="The master prompt defines eight non-negotiable objectives for participant control across the ecosystem.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coreObjectives.map((item, index) => (
            <ShowcaseCard key={item} title={`0${index + 1}`} icon={coreObjectiveIcons[index]} compact>
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </ShowcaseCard>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Positioning" title="System layers carried by membership" description="AUREON9 is positioned as more than a user account system. It is the control layer spanning identity, verification, access, rewards, and authorization.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systemPillars.map((pillar, index) => (
            <ShowcaseCard key={pillar} title={pillar} icon={systemPillarIcons[index]} compact>
              <p className="text-sm leading-6 text-slate-600">This layer is part of the public positioning and later connects to dashboard controls.</p>
            </ShowcaseCard>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Participant Architecture" title="Mandatory participant classes" description="Each class is expected to define role definition, permissions, entry requirements, verification requirements, economic rights, upgrade pathways, restrictions, and governance obligations.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {participantClasses.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white/85 px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">{item}</div>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
    </div>
  );
}
