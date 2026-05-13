-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "SourceSystem" AS ENUM ('AAL', 'ODIEXA', 'ODIEBOARD', 'OPI_INTELLIGENCE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PoolType" AS ENUM ('FOUNDERS', 'PERFORMANCE', 'OPERATIONS_RESERVE', 'TREASURY_GROWTH', 'STRATEGIC');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('EARNED_ARX', 'FOUNDING_CREDIT', 'BONUS', 'LOCKED');

-- CreateEnum
CREATE TYPE "VestingStatus" AS ENUM ('IMMEDIATE', 'LOCKED', 'RELEASED');

-- CreateTable
CREATE TABLE "AureonTier" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "arc" TEXT NOT NULL,
    "multiplier" DECIMAL(10,4) NOT NULL,
    "upgradeType" TEXT NOT NULL,
    "marketplaceAccess" TEXT,
    "governanceAccess" TEXT,
    "capitalAccess" TEXT,
    "publicRecognition" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AureonTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AureonRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "authority" TEXT,
    "compensationRights" TEXT,
    "certificationRequired" INTEGER NOT NULL,
    "activeRole" BOOLEAN NOT NULL DEFAULT true,
    "minimumTierId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AureonRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aureon_members" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "tierId" INTEGER NOT NULL,
    "assignedRoleId" TEXT,
    "certificationLevel" INTEGER NOT NULL DEFAULT 1,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'BASIC_VERIFIED',
    "baseUnits" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "sponsorId" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityDate" TIMESTAMP(3),
    "complianceStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aureon_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_records" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "certificationLevel" INTEGER NOT NULL,
    "courseCompleted" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" DECIMAL(5,2),
    "practicalTestPassed" BOOLEAN NOT NULL DEFAULT false,
    "division4Review" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "issueDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_ledgers" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "sourceSystem" "SourceSystem" NOT NULL,
    "valueScore" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "revenueValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "evidenceLink" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_events" (
    "id" TEXT NOT NULL,
    "source" "SourceSystem" NOT NULL,
    "grossValue" DECIMAL(18,2) NOT NULL,
    "costs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ndv" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "responsibleMemberId" TEXT,
    "verifiedByTreasury" BOOLEAN NOT NULL DEFAULT false,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pool_allocations" (
    "id" TEXT NOT NULL,
    "revenueEventId" TEXT NOT NULL,
    "foundersPool" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "performancePool" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "operationsReserve" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "treasuryGrowth" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "strategicPool" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "policyVersion" TEXT NOT NULL,
    "approvedByDivision2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pool_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL,
    "poolAllocationId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "poolType" "PoolType" NOT NULL,
    "effectiveUnits" DECIMAL(18,4) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "arxAmount" DECIMAL(18,4),
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aurex_wallet_ledgers" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "creditType" "CreditType" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "sourcePool" "PoolType",
    "vestingStatus" "VestingStatus" NOT NULL DEFAULT 'IMMEDIATE',
    "complianceStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aurex_wallet_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upgrade_requests" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "currentTierId" INTEGER NOT NULL,
    "requestedTierId" INTEGER NOT NULL,
    "upgradeVector" TEXT NOT NULL,
    "evidence" TEXT,
    "division4Review" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "division1Review" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "division7Review" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "finalStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upgrade_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AureonTier_name_key" ON "AureonTier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AureonRole_name_key" ON "AureonRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "aureon_members_email_key" ON "aureon_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pool_allocations_revenueEventId_key" ON "pool_allocations"("revenueEventId");

-- AddForeignKey
ALTER TABLE "AureonRole" ADD CONSTRAINT "AureonRole_minimumTierId_fkey" FOREIGN KEY ("minimumTierId") REFERENCES "AureonTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aureon_members" ADD CONSTRAINT "aureon_members_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "AureonTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aureon_members" ADD CONSTRAINT "aureon_members_assignedRoleId_fkey" FOREIGN KEY ("assignedRoleId") REFERENCES "AureonRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aureon_members" ADD CONSTRAINT "aureon_members_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "aureon_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_records" ADD CONSTRAINT "certification_records_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "aureon_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_ledgers" ADD CONSTRAINT "activity_ledgers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "aureon_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_events" ADD CONSTRAINT "revenue_events_responsibleMemberId_fkey" FOREIGN KEY ("responsibleMemberId") REFERENCES "aureon_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pool_allocations" ADD CONSTRAINT "pool_allocations_revenueEventId_fkey" FOREIGN KEY ("revenueEventId") REFERENCES "revenue_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_poolAllocationId_fkey" FOREIGN KEY ("poolAllocationId") REFERENCES "pool_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "aureon_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aurex_wallet_ledgers" ADD CONSTRAINT "aurex_wallet_ledgers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "aureon_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "aureon_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
