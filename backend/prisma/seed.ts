import { PrismaClient, MembershipTierCode, ParticipantClassCode } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Membership Tiers ──────────────────────────────────────────────────────
  const tiers = [
    { code: MembershipTierCode.MEMBER,    name: "Member",    rank: 1, description: "Entry-level access for customers and users." },
    { code: MembershipTierCode.ASSOCIATE, name: "Associate", rank: 2, description: "Upgraded participation with structured access and rewards." },
    { code: MembershipTierCode.CERTIFIED, name: "Certified", rank: 3, description: "Qualification-backed operational participation." },
    { code: MembershipTierCode.EXECUTIVE, name: "Executive", rank: 4, description: "High-trust contributor status with broader privileges." },
    { code: MembershipTierCode.STRATEGIC, name: "Strategic", rank: 5, description: "Institutional-grade access, partner pathways, premium rights." },
    { code: MembershipTierCode.FOUNDING,  name: "Founding",  rank: 6, description: "Founding member status with historical privileges." },
    { code: MembershipTierCode.SOVEREIGN, name: "Sovereign", rank: 7, description: "Reserved governance-grade status under source authority." },
  ];

  for (const tier of tiers) {
    await prisma.membershipTier.upsert({
      where:  { code: tier.code },
      update: { name: tier.name, rank: tier.rank, description: tier.description },
      create: { code: tier.code, name: tier.name, rank: tier.rank, description: tier.description },
    });
  }
  console.log("✅ Membership tiers seeded");

  // ── Participant Classes ───────────────────────────────────────────────────
  const classes = [
    { code: ParticipantClassCode.FOUNDING_MEMBER,          name: "Founding Member",          description: "Founding members of AUREON9" },
    { code: ParticipantClassCode.GENERAL_MEMBER,           name: "General Member",           description: "General membership category" },
    { code: ParticipantClassCode.CUSTOMER,                 name: "Customer",                 description: "Customer participant class" },
    { code: ParticipantClassCode.CHANNEL_PARTNER,          name: "Channel Partner",          description: "Channel distribution partners" },
    { code: ParticipantClassCode.AFFILIATE,                name: "Affiliate",                description: "Affiliate program participants" },
    { code: ParticipantClassCode.INTERN,                   name: "Intern",                   description: "Intern program participants" },
    { code: ParticipantClassCode.DEVELOPER,                name: "Developer",                description: "Developer ecosystem participants" },
    { code: ParticipantClassCode.EQUITY_AFFILIATE,         name: "Equity Affiliate",         description: "Equity-participating affiliates" },
    { code: ParticipantClassCode.EQUITY_PARTNER,           name: "Equity Partner",           description: "Equity-holding partners" },
    { code: ParticipantClassCode.STRATEGIC_PARTNER,        name: "Strategic Partner",        description: "Strategic partnership tier" },
    { code: ParticipantClassCode.OEM_PARTNER,              name: "OEM Partner",              description: "Original Equipment Manufacturer partners" },
    { code: ParticipantClassCode.TRADE_OPERATOR,           name: "Trade Operator",           description: "Trade operation participants" },
    { code: ParticipantClassCode.CAPITAL_PARTICIPANT,      name: "Capital Participant",      description: "Capital participation program" },
    { code: ParticipantClassCode.VERIFICATION_ACTOR,       name: "Verification Actor",       description: "Verification process participants" },
    { code: ParticipantClassCode.SETTLEMENT_PARTICIPANT,   name: "Settlement Participant",   description: "Settlement system participants" },
    { code: ParticipantClassCode.INSTITUTIONAL_PARTICIPANT,name: "Institutional Participant", description: "Institutional-grade participants" },
    { code: ParticipantClassCode.THIRD_PARTY_OPERATOR,     name: "Third-Party Operator",     description: "Third-party operations" },
  ];

  for (const item of classes) {
    await prisma.participantClass.upsert({
      where:  { code: item.code },
      update: { name: item.name, description: item.description },
      create: { code: item.code, name: item.name, description: item.description },
    });
  }
  console.log("✅ Participant classes seeded");

  // ── AUREON9 Tiers ─────────────────────────────────────────────────────────
  const aureonTiers = [
    { id: 1, name: "Tier 1", arc: "ARC-1", multiplier: 1.0, upgradeType: "FOUNDATION" },
    { id: 2, name: "Tier 2", arc: "ARC-2", multiplier: 1.2, upgradeType: "PROGRESSIVE" },
    { id: 3, name: "Tier 3", arc: "ARC-3", multiplier: 1.5, upgradeType: "PROGRESSIVE" },
    { id: 4, name: "Tier 4 - Standard Member", arc: "ARC-4", multiplier: 2.0, upgradeType: "PROGRESSIVE" },
    { id: 5, name: "Tier 5", arc: "ARC-5", multiplier: 2.5, upgradeType: "ACHIEVEMENT" },
    { id: 6, name: "Tier 6", arc: "ARC-6", multiplier: 3.0, upgradeType: "ACHIEVEMENT" },
    { id: 7, name: "Tier 7", arc: "ARC-7", multiplier: 3.5, upgradeType: "LEADERSHIP" },
    { id: 8, name: "Tier 8", arc: "ARC-8", multiplier: 4.0, upgradeType: "LEADERSHIP" },
    { id: 9, name: "Tier 9 - Founder Elite", arc: "ARC-9", multiplier: 4.5, upgradeType: "FOUNDER" },
  ];

  for (const tier of aureonTiers) {
    await prisma.aureonTier.upsert({
      where: { id: tier.id },
      update: { name: tier.name, arc: tier.arc, multiplier: tier.multiplier, upgradeType: tier.upgradeType },
      create: { id: tier.id, name: tier.name, arc: tier.arc, multiplier: tier.multiplier, upgradeType: tier.upgradeType, marketplaceAccess: "FULL", governanceAccess: tier.id >= 4 ? "VOTE" : "VIEW", capitalAccess: tier.id >= 7 ? "PARTICIPATE" : "OBSERVE" },
    });
  }
  console.log("✅ AUREON9 tiers seeded");
  const ADMIN_EMAIL    = "admin@aureon9.com";
  const ADMIN_PASSWORD = "Admin@Aureon9!";

  const sovereignTier    = await prisma.membershipTier.findUnique({ where: { code: MembershipTierCode.SOVEREIGN } });
  const foundingClass    = await prisma.participantClass.findUnique({ where: { code: ParticipantClassCode.FOUNDING_MEMBER } });
  const passwordHash     = await hash(ADMIN_PASSWORD, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existingAdmin) {
    // Update password hash so it is always correct after re-seed
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data:  { passwordHash, isActive: true, role: "SUPER_ADMIN" },
    });
    console.log("✅ Admin password refreshed");
  } else {
    const admin = await prisma.user.create({
      data: {
        email:        ADMIN_EMAIL,
        name:         "AUREON9 Super Admin",
        passwordHash,
        role:         "SUPER_ADMIN",
        isActive:     true,
        memberProfile: {
          create: {
            displayName:       "Super Admin",
            participantClassId: foundingClass!.id,
            tierId:             sovereignTier!.id,
            verificationLevel:  "GOVERNANCE_APPROVED",
            referralCode:       "ADMIN-AUREON9",
            status:             "ACTIVE",
          },
        },
      },
      include: { memberProfile: true },
    });

    // Create wallet for admin profile
    await prisma.aurexWallet.create({
      data: {
        memberProfileId: admin.memberProfile!.id,
        balance:         0,
        currencyCode:    "ARX",
      },
    });

    console.log("✅ Admin user created");
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ADMIN LOGIN CREDENTIALS");
  console.log("  Email    : admin@aureon9.com");
  console.log("  Password : Admin@Aureon9!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("🎉 Database seed completed successfully!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
