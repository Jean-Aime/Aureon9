import React from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { ScrollReveal } from '../../components/ScrollReveal';
import {
  HiOutlineAcademicCap,
  HiOutlineCash,
  HiOutlineChip,
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { PageHero, SectionBlock, InfoRow, ShowcaseCard } from '../../components/public/PublicPrimitives';
import { aurexIntegration, rewardControls, rewardTypes } from '../../data/publicSiteContent';

const rewardIcons = [
  HiOutlineCash, // ARX rewards
  HiOutlineCurrencyDollar, // commissions
  HiOutlineUserGroup, // referrals
  HiOutlineTrendingUp, // performance
  HiOutlineSparkles, // tier multipliers
  HiOutlineStar, // loyalty
  HiOutlineLightningBolt, // activity
  HiOutlineAcademicCap, // founding
  HiOutlineChip, // ecosystem contribution
];

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-3 sm:px-4 lg:px-8">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Rewards System" intro="The rewards page explains what participants can earn, how AUREX connects, and how controls prevent abuse." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <SectionBlock eyebrow="Reward Engine" title="What participants can earn" description="These reward types are named directly in the master prompt.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rewardTypes.map((reward, index) => (
            <ShowcaseCard key={reward} title={reward} icon={rewardIcons[index]} compact>
              <p className="text-sm leading-6 text-slate-600">Reward logic later depends on triggers, calculations, distribution, expiry, and anti-abuse control.</p>
            </ShowcaseCard>
          ))}
        </div>
      </SectionBlock>
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionBlock eyebrow="AUREX Integration" title="How the reward layer connects to settlement" description="The economic integration section ties AUREON9 to the AUREX wallet and treasury flow.">
          <div className="grid gap-3 sm:grid-cols-2">{aurexIntegration.map((item) => <InfoRow key={item} icon={Wallet} text={item} />)}</div>
        </SectionBlock>
        <SectionBlock eyebrow="Controls" title="How the reward layer stays governed" description="The master prompt requires controlled formulas and anti-abuse logic rather than open-ended payouts.">
          <div className="grid gap-3 sm:grid-cols-2">{rewardControls.map((item) => <InfoRow key={item} icon={ShieldCheck} text={item} />)}</div>
        </SectionBlock>
      </div>
      </ScrollReveal>
    </div>
  );
}
