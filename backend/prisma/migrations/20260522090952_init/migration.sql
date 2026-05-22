/*
  Warnings:

  - The values [FOUNDING_MEMBER,AFFILIATE,INTERN,EQUITY_AFFILIATE,EQUITY_PARTNER,VERIFICATION_ACTOR,THIRD_PARTY_OPERATOR] on the enum `ParticipantClassCode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParticipantClassCode_new" AS ENUM ('GENERAL_MEMBER', 'CUSTOMER', 'CHANNEL_PARTNER', 'DEVELOPER', 'STRATEGIC_PARTNER', 'OEM_PARTNER', 'TRADE_OPERATOR', 'CAPITAL_PARTICIPANT', 'SETTLEMENT_PARTICIPANT', 'INSTITUTIONAL_PARTICIPANT');
ALTER TABLE "participant_classes" ALTER COLUMN "code" TYPE "ParticipantClassCode_new" USING ("code"::text::"ParticipantClassCode_new");
ALTER TYPE "ParticipantClassCode" RENAME TO "ParticipantClassCode_old";
ALTER TYPE "ParticipantClassCode_new" RENAME TO "ParticipantClassCode";
DROP TYPE "ParticipantClassCode_old";
COMMIT;
