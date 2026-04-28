import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@aureon9.com';
const ADMIN_PASSWORD = 'Admin@Aureon9!';
const DEMO_PASSWORD = 'Aureon9@2026!';

const tierSeed = [
  { code: 'MEMBER', name: 'Member', rank: 1, description: 'Entry-level access for customers and users.' },
  { code: 'ASSOCIATE', name: 'Associate', rank: 2, description: 'Upgraded participation with structured access and rewards.' },
  { code: 'CERTIFIED', name: 'Certified', rank: 3, description: 'Qualification-backed operational participation.' },
  { code: 'EXECUTIVE', name: 'Executive', rank: 4, description: 'High-trust contributor status with broader privileges.' },
  { code: 'STRATEGIC', name: 'Strategic', rank: 5, description: 'Institutional-grade access, partner pathways, premium rights.' },
  { code: 'FOUNDING', name: 'Founding', rank: 6, description: 'Founding member status with historical privileges.' },
  { code: 'SOVEREIGN', name: 'Sovereign', rank: 7, description: 'Reserved governance-grade status under source authority.' },
];

const classSeed = [
  ['FOUNDING_MEMBER', 'Founding Member'],
  ['GENERAL_MEMBER', 'General Member'],
  ['CUSTOMER', 'Customer/Buyer'],
  ['CHANNEL_PARTNER', 'Channel Partner'],
  ['AFFILIATE', 'Affiliate'],
  ['INTERN', 'Intern'],
  ['DEVELOPER', 'Developer'],
  ['EQUITY_AFFILIATE', 'Equity Affiliate'],
  ['EQUITY_PARTNER', 'Equity Partner'],
  ['STRATEGIC_PARTNER', 'Strategic Partner'],
  ['OEM_PARTNER', 'OEM Partner'],
  ['TRADE_OPERATOR', 'Trade Operator'],
  ['CAPITAL_PARTICIPANT', 'Capital Participant'],
  ['VERIFICATION_ACTOR', 'Verification Actor'],
  ['SETTLEMENT_PARTICIPANT', 'Settlement Participant'],
  ['INSTITUTIONAL_PARTICIPANT', 'Institutional Participant'],
  ['THIRD_PARTY_OPERATOR', 'Third-Party Operator'],
];

const demoUsers = [
  {
    email: 'executive@aureon9.com',
    name: 'Executive Governance',
    role: 'EXECUTIVE',
    participantClassCode: 'STRATEGIC_PARTNER',
    tierCode: 'FOUNDING',
    verificationLevel: 'GOVERNANCE_APPROVED',
    referralCode: 'EXEC-9001',
  },
  {
    email: 'legal@aureon9.com',
    name: 'Legal Compliance',
    role: 'LEGAL_COMPLIANCE',
    participantClassCode: 'VERIFICATION_ACTOR',
    tierCode: 'EXECUTIVE',
    verificationLevel: 'GOVERNANCE_APPROVED',
    referralCode: 'LEGAL-9002',
  },
  {
    email: 'qualifications@aureon9.com',
    name: 'Qualifications Desk',
    role: 'QUALIFICATIONS',
    participantClassCode: 'VERIFICATION_ACTOR',
    tierCode: 'EXECUTIVE',
    verificationLevel: 'CAPITAL_VERIFIED',
    referralCode: 'QUAL-9003',
  },
  {
    email: 'success@aureon9.com',
    name: 'Customer Success Desk',
    role: 'CUSTOMER_SUCCESS',
    participantClassCode: 'GENERAL_MEMBER',
    tierCode: 'ASSOCIATE',
    verificationLevel: 'COMMERCIAL_VERIFIED',
    referralCode: 'CS-9004',
  },
  {
    email: 'treasury@aureon9.com',
    name: 'Finance Treasury',
    role: 'FINANCE_TREASURY',
    participantClassCode: 'SETTLEMENT_PARTICIPANT',
    tierCode: 'STRATEGIC',
    verificationLevel: 'GOVERNANCE_APPROVED',
    referralCode: 'FIN-9005',
  },
  {
    email: 'founding.member@aureon9.com',
    name: 'Founding Member One',
    role: 'MEMBER',
    participantClassCode: 'FOUNDING_MEMBER',
    tierCode: 'FOUNDING',
    verificationLevel: 'GOVERNANCE_APPROVED',
    referralCode: 'FND-1001',
  },
  {
    email: 'general.member@aureon9.com',
    name: 'General Member One',
    role: 'MEMBER',
    participantClassCode: 'GENERAL_MEMBER',
    tierCode: 'ASSOCIATE',
    verificationLevel: 'IDENTITY_VERIFIED',
    referralCode: 'GEN-1002',
  },
  {
    email: 'channel.partner@aureon9.com',
    name: 'Channel Partner One',
    role: 'PARTNER',
    participantClassCode: 'CHANNEL_PARTNER',
    tierCode: 'CERTIFIED',
    verificationLevel: 'COMMERCIAL_VERIFIED',
    referralCode: 'CHN-1003',
  },
  {
    email: 'developer@aureon9.com',
    name: 'Developer Operator',
    role: 'OPERATOR',
    participantClassCode: 'DEVELOPER',
    tierCode: 'CERTIFIED',
    verificationLevel: 'IDENTITY_VERIFIED',
    referralCode: 'DEV-1004',
  },
  {
    email: 'trade.operator@aureon9.com',
    name: 'Trade Operator One',
    role: 'OPERATOR',
    participantClassCode: 'TRADE_OPERATOR',
    tierCode: 'EXECUTIVE',
    verificationLevel: 'COMMERCIAL_VERIFIED',
    referralCode: 'TRD-1005',
  },
  {
    email: 'capital.participant@aureon9.com',
    name: 'Capital Participant One',
    role: 'MEMBER',
    participantClassCode: 'CAPITAL_PARTICIPANT',
    tierCode: 'STRATEGIC',
    verificationLevel: 'INSTITUTIONAL_VERIFIED',
    referralCode: 'CAP-1006',
  },
];

async function seedTiers() {
  for (const tier of tierSeed) {
    await prisma.membershipTier.upsert({
      where: { code: tier.code },
      update: { name: tier.name, rank: tier.rank, description: tier.description },
      create: tier,
    });
  }
}

async function seedClasses() {
  for (const [code, name] of classSeed) {
    await prisma.participantClass.upsert({
      where: { code },
      update: { name, description: name },
      create: { code, name, description: name },
    });
  }
}

async function upsertProfileUser({ email, name, role, participantClassCode, tierCode, verificationLevel, referralCode }, passwordHash) {
  const participantClass = await prisma.participantClass.findUnique({ where: { code: participantClassCode } });
  const tier = await prisma.membershipTier.findUnique({ where: { code: tierCode } });
  if (!participantClass || !tier) {
    throw new Error(`Missing tier/class for ${email}`);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      name,
      role,
      isActive: true,
      passwordHash,
    },
  });

  const profile = await prisma.memberProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: name,
      participantClassId: participantClass.id,
      tierId: tier.id,
      verificationLevel,
      country: 'South Africa',
      phone: '+27 10 555 0101',
      businessName: `${name} Holdings`,
      referralCode,
      status: 'ACTIVE',
    },
    create: {
      userId: user.id,
      displayName: name,
      participantClassId: participantClass.id,
      tierId: tier.id,
      verificationLevel,
      country: 'South Africa',
      phone: '+27 10 555 0101',
      businessName: `${name} Holdings`,
      referralCode,
      status: 'ACTIVE',
    },
  });

  const wallet = await prisma.aurexWallet.upsert({
    where: { memberProfileId: profile.id },
    update: { currencyCode: 'ARX' },
    create: {
      memberProfileId: profile.id,
      balance: 0,
      currencyCode: 'ARX',
    },
  });

  return { user, profile, wallet };
}

async function ensureWalletTransactions(walletId) {
  const existing = await prisma.walletTransaction.count({ where: { walletId } });
  if (existing > 0) {
    return;
  }

  const seedTransactions = [
    { type: 'REWARD_CREDIT', amount: 500, reference: 'REWARD-INIT', notes: 'Founding reward allocation' },
    { type: 'COMMISSION_CREDIT', amount: 220, reference: 'COMM-APR', notes: 'Channel sales commission' },
    { type: 'REFERRAL_BONUS', amount: 150, reference: 'REF-BONUS', notes: 'Referral conversion bonus' },
    { type: 'SETTLEMENT', amount: 300, reference: 'SETTLE-01', notes: 'Settlement payout' },
    { type: 'ADJUSTMENT', amount: -40, reference: 'ADJ-FEE', notes: 'Treasury fee adjustment' },
  ];

  let balance = 0;
  for (const tx of seedTransactions) {
    await prisma.walletTransaction.create({
      data: {
        walletId,
        type: tx.type,
        amount: tx.amount,
        reference: tx.reference,
        notes: tx.notes,
      },
    });
    balance += Number(tx.amount);
  }
  await prisma.aurexWallet.update({
    where: { id: walletId },
    data: { balance },
  });
}

async function ensureDocuments(profileId) {
  const existing = await prisma.memberDocument.count({ where: { memberProfileId: profileId } });
  if (existing > 0) {
    return;
  }

  const docs = [
    ['Government ID', 'Identity Verification', 'ACCEPTED'],
    ['Business Registration', 'Commercial Verification', 'UNDER_REVIEW'],
    ['Financial Statements', 'Institutional Verification', 'RECEIVED'],
  ];

  for (const [documentType, verificationPurpose, reviewStatus] of docs) {
    await prisma.memberDocument.create({
      data: {
        memberProfileId: profileId,
        documentType,
        verificationPurpose,
        fileUrl: `/uploads/demo/${profileId}/${documentType.replaceAll(' ', '_').toLowerCase()}.pdf`,
        storageKey: `demo/${profileId}/${documentType.replaceAll(' ', '_').toLowerCase()}.pdf`,
        fileName: `${documentType}.pdf`,
        mimeType: 'application/pdf',
        sizeBytes: 102400,
        reviewStatus,
      },
    });
  }
}

async function ensureVerificationCases(profileId, reviewerUserId) {
  const existing = await prisma.verificationRecord.count({ where: { memberProfileId: profileId } });
  if (existing > 0) {
    return;
  }

  const pending = await prisma.verificationRecord.create({
    data: {
      memberProfileId: profileId,
      requestedLevel: 'COMMERCIAL_VERIFIED',
      status: 'PENDING',
      queueStatus: 'PENDING',
      notes: 'Initial commercial verification request',
    },
  });
  await prisma.reviewAction.createMany({
    data: [
      { verificationRecordId: pending.id, actionType: 'CREATE_CASE', actorUserId: reviewerUserId, notes: 'Case created by member' },
      { verificationRecordId: pending.id, actionType: 'ADD_NOTE', actorUserId: reviewerUserId, notes: 'Queued for compliance review' },
    ],
  });

  const escalated = await prisma.verificationRecord.create({
    data: {
      memberProfileId: profileId,
      requestedLevel: 'CAPITAL_VERIFIED',
      status: 'UNDER_REVIEW',
      queueStatus: 'ESCALATED',
      notes: 'Capital verification requiring executive review',
      assignedReviewerId: reviewerUserId,
    },
  });
  await prisma.reviewAction.createMany({
    data: [
      { verificationRecordId: escalated.id, actionType: 'CREATE_CASE', actorUserId: reviewerUserId, notes: 'Capital case submitted' },
      { verificationRecordId: escalated.id, actionType: 'ASSIGN_REVIEWER', actorUserId: reviewerUserId, notes: 'Assigned to legal compliance' },
      { verificationRecordId: escalated.id, actionType: 'ESCALATE', actorUserId: reviewerUserId, notes: 'Escalated due to capital classification' },
    ],
  });
}

async function ensureOpportunities() {
  const opportunities = [
    ['South Africa Infrastructure Syndicate', 'Institutional infrastructure investment cycle', 'INVESTMENT', 'STRATEGIC_PLUS', 'South Africa'],
    ['Pan-African Trade Corridor Desk', 'Trade facilitation and settlement program', 'TRADE', 'EXECUTIVE_PLUS', 'Kenya'],
    ['AUREON9 Partner Expansion Program', 'Regional partner onboarding and activation', 'PARTNERSHIP', 'CERTIFIED_PLUS', 'Nigeria'],
    ['AUREON9 Marketplace Prime Listing', 'Featured marketplace listing for verified members', 'MARKETPLACE', 'VERIFIED_ONLY', 'Global'],
    ['Governance Fellowship 2026', 'Career pathway into verification and governance operations', 'CAREER', 'PUBLIC', 'Global'],
  ];

  for (const [title, description, type, accessRule, country] of opportunities) {
    const existing = await prisma.opportunity.findFirst({ where: { title } });
    if (existing) {
      await prisma.opportunity.update({
        where: { id: existing.id },
        data: { description, type, accessRule, country, isPublished: true },
      });
      continue;
    }

    await prisma.opportunity.create({
      data: { title, description, type, accessRule, country, isPublished: true },
    });
  }
}

async function ensureReferrals(profiles) {
  const sender = profiles['channel.partner@aureon9.com'];
  const receiver = profiles['general.member@aureon9.com'];
  if (!sender || !receiver) {
    return;
  }

  const existing = await prisma.referral.findFirst({
    where: {
      senderProfileId: sender.profile.id,
      receiverProfileId: receiver.profile.id,
    },
  });

  if (!existing) {
    await prisma.referral.create({
      data: {
        senderProfileId: sender.profile.id,
        receiverProfileId: receiver.profile.id,
        receiverEmail: receiver.user.email,
        campaignCode: 'AAL-Q2-2026',
        status: 'ACCEPTED',
      },
    });
  }
}

async function main() {
  console.log('');
  console.log('AUREON9 seed starting...');
  await seedTiers();
  await seedClasses();

  const adminHash = await hash(ADMIN_PASSWORD, 10);
  const demoHash = await hash(DEMO_PASSWORD, 10);

  const profiles = {};
  profiles[ADMIN_EMAIL] = await upsertProfileUser({
    email: ADMIN_EMAIL,
    name: 'AUREON9 Super Admin',
    role: 'SUPER_ADMIN',
    participantClassCode: 'FOUNDING_MEMBER',
    tierCode: 'SOVEREIGN',
    verificationLevel: 'GOVERNANCE_APPROVED',
    referralCode: 'ADMIN-AUREON9',
  }, adminHash);

  for (const userSeed of demoUsers) {
    profiles[userSeed.email] = await upsertProfileUser(userSeed, demoHash);
  }

  for (const entry of Object.values(profiles)) {
    await ensureWalletTransactions(entry.wallet.id);
    await ensureDocuments(entry.profile.id);
    await ensureVerificationCases(entry.profile.id, profiles['legal@aureon9.com']?.user.id || entry.user.id);
  }

  await ensureReferrals(profiles);
  await ensureOpportunities();

  console.log('');
  console.log('Seed complete. Login accounts:');
  console.log(`- admin@aureon9.com / ${ADMIN_PASSWORD}`);
  for (const item of demoUsers) {
    console.log(`- ${item.email} / ${DEMO_PASSWORD} (${item.role})`);
  }
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
