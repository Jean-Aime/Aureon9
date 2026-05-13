import { PrismaClient, PoolType, ReviewStatus, VerificationLevel, MemberStatus, CreditType, VestingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function createRevenueEvent(input: {
  source: any;
  grossValue: number;
  costs?: number;
  currency?: string;
  responsibleMemberId?: string;
}) {
  const costs = input.costs ?? 0;
  const ndv = input.grossValue - costs;
  if (ndv < 0) throw new Error('NDV cannot be negative');

  return prisma.revenueEvent.create({
    data: {
      source: input.source,
      grossValue: input.grossValue,
      costs,
      ndv,
      currency: input.currency ?? 'USD',
      responsibleMemberId: input.responsibleMemberId,
    },
  });
}

export async function allocatePools(revenueEventId: string, policyVersion = 'TREASURY_POLICY_v1.0') {
  const event = await prisma.revenueEvent.findUnique({ where: { id: revenueEventId } });
  if (!event) throw new Error('Revenue event not found');
  if (!event.verifiedByTreasury) throw new Error('Treasury verification required before pool allocation');

  const ndv = Number(event.ndv);
  return prisma.poolAllocation.create({
    data: {
      revenueEventId,
      policyVersion,
      foundersPool: ndv * 0.15,
      performancePool: ndv * 0.15,
      operationsReserve: ndv * 0.30,
      treasuryGrowth: ndv * 0.30,
      strategicPool: ndv * 0.10,
    },
  });
}

export async function distributeFoundersPool(poolAllocationId: string, period: string) {
  const pool = await prisma.poolAllocation.findUnique({ where: { id: poolAllocationId } });
  if (!pool) throw new Error('Pool allocation not found');
  if (!pool.approvedByDivision2) throw new Error('Division 2 approval required');

  const eligibleMembers = await prisma.aureonMember.findMany({
    where: {
      status: MemberStatus.ACTIVE,
      verificationLevel: { in: [VerificationLevel.COMMERCIAL_VERIFIED, VerificationLevel.KYC_AML_VERIFIED] },
      complianceStatus: ReviewStatus.APPROVED,
      baseUnits: { gt: 0 },
    },
    include: { tier: true },
  });

  const totalEffectiveUnits = eligibleMembers.reduce((sum, m) => {
    return sum + Number(m.baseUnits) * Number(m.tier.multiplier);
  }, 0);

  if (totalEffectiveUnits <= 0) throw new Error('No active effective units available');

  const foundersPoolAmount = Number(pool.foundersPool);
  const distributions = [];

  for (const member of eligibleMembers) {
    const effectiveUnits = Number(member.baseUnits) * Number(member.tier.multiplier);
    const amount = (effectiveUnits / totalEffectiveUnits) * foundersPoolAmount;

    const distribution = await prisma.distribution.create({
      data: {
        poolAllocationId,
        memberId: member.id,
        poolType: PoolType.FOUNDERS,
        effectiveUnits,
        amount,
        arxAmount: amount,
        period,
        status: ReviewStatus.APPROVED,
      },
    });

    await prisma.aurexWalletLedger.create({
      data: {
        memberId: member.id,
        creditType: CreditType.EARNED_ARX,
        sourcePool: PoolType.FOUNDERS,
        amount,
        vestingStatus: VestingStatus.LOCKED,
        complianceStatus: ReviewStatus.APPROVED,
      },
    });

    distributions.push(distribution);
  }

  return { totalEffectiveUnits, foundersPoolAmount, distributions };
}

export async function recomputeEligibility(memberId: string) {
  const member = await prisma.aureonMember.findUnique({
    where: { id: memberId },
    include: { certifications: true, activityLedger: true },
  });
  if (!member) throw new Error('Member not found');

  const hasVerifiedActivity = member.activityLedger.some(a => a.verified);
  const hasCertification = member.certificationLevel >= 2;
  const commercialVerified = ['COMMERCIAL_VERIFIED', 'KYC_AML_VERIFIED'].includes(member.verificationLevel);

  const eligible = member.status === MemberStatus.ACTIVE && commercialVerified && hasCertification && hasVerifiedActivity;

  return prisma.aureonMember.update({
    where: { id: memberId },
    data: { complianceStatus: eligible ? ReviewStatus.APPROVED : ReviewStatus.PENDING },
  });
}
