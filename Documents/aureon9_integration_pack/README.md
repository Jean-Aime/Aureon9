# AUREON9 Integration Pack
Powered By ODIEBOARD

## Contents
- `prisma/schema.prisma` — PostgreSQL data model for AUREON9, AUREX wallet, pools, upgrades, roles, and certifications.
- `src/routes/aureonRoutes.ts` — Express API routes.
- `src/services/distributionService.ts` — Revenue event, pool allocation, eligibility, and distribution logic.
- `n8n/*.json` — Importable n8n workflow templates.
- `test-data/sample-payloads.json` — API test payloads.

## Setup
```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Governance Controls
- Treasury verification is required before pool allocation.
- Division 2 approval is required before distribution.
- Eligible members must be ACTIVE, commercially verified or KYC verified, compliance approved, and hold base units.
- Upgrade requests require Division 4, Division 1, and Division 7 approvals.

## Distribution Formula
```text
Effective Units = Base Units × Tier Multiplier
Payout = Effective Units / Total Active Effective Units × Pool Amount
```

## Required Seed Data
Create the nine AUREON9 tiers before onboarding members.
