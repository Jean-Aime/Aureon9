import express from 'express';
import { PrismaClient } from '@prisma/client';
import { allocatePools, createRevenueEvent, distributeFoundersPool, recomputeEligibility } from '../services/distributionService';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/aureon/member', async (req, res) => {
  try {
    const member = await prisma.aureonMember.create({ data: req.body });
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/aureon/member/:id', async (req, res) => {
  const member = await prisma.aureonMember.findUnique({
    where: { id: req.params.id },
    include: { tier: true, assignedRole: true, walletEntries: true, distributions: true },
  });
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

router.patch('/aureon/member/:id/status', async (req, res) => {
  try {
    const member = await prisma.aureonMember.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    res.json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/aureon/tiers', async (_req, res) => {
  res.json(await prisma.aureonTier.findMany({ orderBy: { id: 'asc' } }));
});

router.post('/aureon/upgrade-request', async (req, res) => {
  try {
    const request = await prisma.upgradeRequest.create({ data: req.body });
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/aureon/upgrade-request/:id', async (req, res) => {
  try {
    const payload = req.body;
    if (payload.division4Review === 'APPROVED' && payload.division1Review === 'APPROVED' && payload.division7Review === 'APPROVED') {
      payload.finalStatus = 'APPROVED';
    }
    const request = await prisma.upgradeRequest.update({ where: { id: req.params.id }, data: payload });
    if (request.finalStatus === 'APPROVED') {
      await prisma.aureonMember.update({ where: { id: request.memberId }, data: { tierId: request.requestedTierId } });
    }
    res.json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/aureon/certification', async (req, res) => {
  try {
    const cert = await prisma.certificationRecord.create({ data: req.body });
    if (cert.division4Review === 'APPROVED') {
      await prisma.aureonMember.update({ where: { id: cert.memberId }, data: { certificationLevel: cert.certificationLevel } });
    }
    res.status(201).json(cert);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/revenue-event', async (req, res) => {
  try {
    const event = await createRevenueEvent(req.body);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/revenue-event/:id/verify', async (req, res) => {
  try {
    const event = await prisma.revenueEvent.update({ where: { id: req.params.id }, data: { verifiedByTreasury: true } });
    res.json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/pool-allocation', async (req, res) => {
  try {
    const pool = await allocatePools(req.body.revenueEventId, req.body.policyVersion);
    res.status(201).json(pool);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/pool-allocation/:id/approve', async (req, res) => {
  try {
    const pool = await prisma.poolAllocation.update({ where: { id: req.params.id }, data: { approvedByDivision2: true } });
    res.json(pool);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/distribute-pool', async (req, res) => {
  try {
    const result = await distributeFoundersPool(req.body.poolAllocationId, req.body.period);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/eligibility/recompute', async (req, res) => {
  try {
    res.json(await recomputeEligibility(req.body.memberId));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/wallet/:memberId', async (req, res) => {
  const entries = await prisma.aurexWalletLedger.findMany({ where: { memberId: req.params.memberId }, orderBy: { createdAt: 'desc' } });
  res.json(entries);
});

export default router;
