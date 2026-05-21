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

  const cases = [
    { requestedLevel: 'IDENTITY_VERIFIED', status: 'PENDING', priority: 'HIGH' },
    { requestedLevel: 'COMMERCIAL_VERIFIED', status: 'UNDER_REVIEW', priority: 'MEDIUM' },
    { requestedLevel: 'INSTITUTIONAL_VERIFIED', status: 'PENDING', priority: 'LOW' },
  ];

  for (const caseData of cases) {
    await prisma.verificationRecord.create({
      data: {
        memberProfileId: profileId,
        requestedLevel: caseData.requestedLevel,
        status: caseData.status,
        queueStatus: caseData.status,
        priority: caseData.priority,
        risk: caseData.priority,
        submittedAt: new Date(),
        reviewerId: reviewerUserId,
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  await seedTiers();
  console.log('✅ Tiers seeded');

  await seedClasses();
  console.log('✅ Participant classes seeded');

  const passwordHash = await hash(DEMO_PASSWORD, 10);
  const adminPasswordHash = await hash(ADMIN_PASSWORD, 10);

  const adminUser = await upsertProfileUser(
    {
      email: ADMIN_EMAIL,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      participantClassCode: 'FOUNDING_MEMBER',
      tierCode: 'SOVEREIGN',
      verificationLevel: 'GOVERNANCE_APPROVED',
      referralCode: 'ADMIN-0000',
    },
    adminPasswordHash
  );
  console.log('✅ Super Admin created');

  for (const demoUser of demoUsers) {
    const result = await upsertProfileUser(demoUser, passwordHash);
    await ensureWalletTransactions(result.wallet.id);
    await ensureDocuments(result.profile.id);
    await ensureVerificationCases(result.profile.id, adminUser.user.id);
    console.log(`✅ ${demoUser.name} created with wallet, docs, and cases`);
  }

  console.log('\n🎉 Database seeding complete!');
  console.log('\n📧 Login credentials:');
  console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`   Demo users: <email> / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
