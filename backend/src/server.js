import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { compare, hash } from 'bcryptjs';
import prisma from './lib/db.js';
import { createSignedUpload, UPLOAD_ROOT, writeUploadedBinary } from './lib/storage.js';
import { optionalAuth, requireAuth, signToken } from './lib/auth.js';
import { writeAuditLog } from './lib/audit.js';
import {
  canAssignReviewer,
  canApproveVerification,
  canAccessOpportunity,
  canEscalate,
  canReject,
  canReview,
  hasBackofficeAccess,
} from './lib/permissions.js';
import {
  validateAccessRule,
  validateDocumentReviewStatus,
  validateEmail,
  validateOpportunityType,
  validateParticipantClass,
  validatePassword,
  validateReviewQueueStatus,
  validateVerificationLevel,
  validateVerificationStatus,
} from './lib/validation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);

function buildAuthPayload(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    memberProfileId: user.memberProfile?.id ?? null,
  };
}

function requireBackoffice(req, res, next) {
  if (!req.auth || !hasBackofficeAccess(req.auth.role)) {
    return res.status(403).json({ error: 'Backoffice access required' });
  }

  return next();
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getReviewQueueInclude() {
  return {
    memberProfile: {
      include: {
        user: true,
        tier: true,
        participantClass: true,
        documents: true,
      },
    },
    actions: { orderBy: { createdAt: 'desc' }, take: 20 },
  };
}

function isHighRiskCase(record) {
  const highRiskLevels = ['CAPITAL_VERIFIED', 'GOVERNANCE_APPROVED'];
  const highRiskClasses = ['CAPITAL_PARTICIPANT', 'STRATEGIC_PARTNER', 'INSTITUTIONAL_PARTICIPANT'];
  const requestedLevel = record.requestedLevel;
  const participantClassCode = record.memberProfile?.participantClass?.code;
  const documentCount = record.memberProfile?.documents?.length ?? 0;

  return (
    highRiskLevels.includes(requestedLevel) ||
    highRiskClasses.includes(participantClassCode) ||
    documentCount === 0
  );
}

function getReviewRisk(record) {
  if (isHighRiskCase(record)) {
    return 'HIGH';
  }

  if (record.requestedLevel === 'COMMERCIAL_VERIFIED' || (record.memberProfile?.documents?.length ?? 0) < 2) {
    return 'MEDIUM';
  }

  return 'LOW';
}

async function createReviewAction(tx, verificationRecordId, actionType, actorUserId, notes, payloadJson) {
  return tx.reviewAction.create({
    data: {
      verificationRecordId,
      actionType,
      actorUserId: actorUserId ?? null,
      notes: notes || null,
      payloadJson: payloadJson ?? null,
    },
  });
}

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(optionalAuth);
app.use('/uploads', express.static(UPLOAD_ROOT));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'AUREON9 API is running',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, participantClassCode, password, country, phone, businessName, referralCode } = req.body;

    if (
      !validateEmail(email) ||
      !name ||
      !validateParticipantClass(participantClassCode) ||
      !validatePassword(password) ||
      !country
    ) {
      return res.status(400).json({ error: 'Invalid registration payload' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const [defaultTier, participantClass, passwordHash, referrer] = await Promise.all([
      prisma.membershipTier.findUnique({ where: { code: 'MEMBER' } }),
      prisma.participantClass.findUnique({ where: { code: participantClassCode } }),
      hash(password, 10),
      referralCode
        ? prisma.memberProfile.findUnique({ where: { referralCode: String(referralCode).trim() } })
        : Promise.resolve(null),
    ]);

    if (!defaultTier || !participantClass) {
      return res.status(400).json({ error: 'Invalid participant class or tier' });
    }

    if (referralCode && !referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'MEMBER',
          isActive: true,
          memberProfile: {
            create: {
              displayName: name,
              participantClassId: participantClass.id,
              tierId: defaultTier.id,
              country: String(country).trim(),
              phone: phone ? String(phone).trim() : null,
              businessName: businessName ? String(businessName).trim() : null,
              referredByProfileId: referrer?.id ?? null,
              referralCode: randomUUID().slice(0, 8).toUpperCase(),
            },
          },
        },
        include: { memberProfile: true },
      });

      await tx.aurexWallet.create({
        data: {
          memberProfileId: createdUser.memberProfile.id,
          balance: 0,
          currencyCode: 'ARX',
        },
      });

      if (referrer) {
        await tx.referral.create({
          data: {
            senderProfileId: referrer.id,
            receiverProfileId: createdUser.memberProfile.id,
            receiverEmail: email,
            status: 'PENDING',
          },
        });
      }

      return createdUser;
    });

    const authPayload = buildAuthPayload(user);
    const token = signToken(authPayload);

    await writeAuditLog({
      actorUserId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'REGISTER',
      payloadJson: { participantClassCode },
    });

    return res.status(201).json({ token, user: authPayload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid login payload' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberProfile: true },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const authPayload = buildAuthPayload(user);
    const token = signToken(authPayload);

    await writeAuditLog({
      actorUserId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'LOGIN',
    });

    return res.json({ token, user: authPayload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/members', requireAuth, requireBackoffice, async (_req, res) => {
  try {
    const members = await prisma.memberProfile.findMany({
      include: { user: true, participantClass: true, tier: true, wallet: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(members);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/:id', requireAuth, async (req, res) => {
  try {
    const member = await prisma.memberProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        participantClass: true,
        tier: true,
        wallet: { include: { transactions: true } },
        verificationRecords: true,
        documents: true,
        referralsSent: true,
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== member.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(member);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/members/:id', requireAuth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== targetId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { displayName, country, phone, businessName } = req.body;
    const member = await prisma.memberProfile.update({
      where: { id: targetId },
      data: { displayName, country, phone, businessName },
      include: { user: true, participantClass: true, tier: true, wallet: true },
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'MemberProfile',
      entityId: targetId,
      action: 'UPDATE_MEMBER',
      payloadJson: { displayName, country, phone, businessName },
    });

    return res.json(member);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/verification-records', requireAuth, async (req, res) => {
  try {
    const where = hasBackofficeAccess(req.auth.role) ? {} : { memberProfileId: req.auth.memberProfileId };
    const records = await prisma.verificationRecord.findMany({
      where,
      include: { memberProfile: { include: { user: true, tier: true, participantClass: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/verification-records', requireAuth, async (req, res) => {
  try {
    const { memberProfileId, requestedLevel, notes } = req.body;
    if (!memberProfileId || !validateVerificationLevel(requestedLevel)) {
      return res.status(400).json({ error: 'Invalid verification payload' });
    }

    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.verificationRecord.create({
        data: {
          memberProfileId,
          requestedLevel,
          notes,
          status: 'PENDING',
          queueStatus: 'PENDING',
        },
        include: { memberProfile: { include: { user: true, documents: true, participantClass: true, tier: true } }, actions: true },
      });

      await createReviewAction(tx, created.id, 'CREATE_CASE', req.auth.id, notes, { requestedLevel });
      return created;
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'VerificationRecord',
      entityId: record.id,
      action: 'CREATE_VERIFICATION_REQUEST',
      payloadJson: { requestedLevel },
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/verification-records/:id', requireAuth, async (req, res) => {
  try {
    const record = await prisma.verificationRecord.findUnique({
      where: { id: req.params.id },
      include: { memberProfile: { include: { user: true, tier: true, participantClass: true } } },
    });

    if (!record) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== record.memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/verification-records/:id', requireAuth, requireBackoffice, async (req, res) => {
  try {
    const { status, notes, reviewedByUserId, queueStatus } = req.body;
    if ((status && !validateVerificationStatus(status)) || (queueStatus && !validateReviewQueueStatus(queueStatus))) {
      return res.status(400).json({ error: 'Invalid verification update payload' });
    }

    const nextQueueStatus =
      queueStatus ||
      (status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : undefined);

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRecord.update({
        where: { id: req.params.id },
        data: {
          status,
          notes,
          queueStatus: nextQueueStatus,
          reviewedByUserId: reviewedByUserId || req.auth.id,
          reviewedAt: status ? new Date() : undefined,
        },
        include: getReviewQueueInclude(),
      });

      await createReviewAction(tx, updated.id, 'ADD_NOTE', req.auth.id, notes, { status, queueStatus: nextQueueStatus });
      return updated;
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'VerificationRecord',
      entityId: record.id,
      action: 'PATCH_VERIFICATION',
      payloadJson: { status, notes },
    });

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/verification-records/:id/approve', requireAuth, async (req, res) => {
  try {
    if (!canApproveVerification(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const record = await prisma.verificationRecord.findUnique({ where: { id: req.params.id } });
    if (!record) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const approvedRecord = await tx.verificationRecord.update({
        where: { id: req.params.id },
        data: {
          status: 'APPROVED',
          queueStatus: 'APPROVED',
          reviewedByUserId: req.auth.id,
          reviewedAt: new Date(),
          notes: req.body.notes || record.notes,
        },
      });

      await tx.memberProfile.update({
        where: { id: record.memberProfileId },
        data: { verificationLevel: record.requestedLevel },
      });

      await createReviewAction(tx, approvedRecord.id, 'APPROVE', req.auth.id, req.body.notes, {
        requestedLevel: record.requestedLevel,
      });

      return tx.verificationRecord.findUnique({
        where: { id: approvedRecord.id },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'VerificationRecord',
      entityId: updated.id,
      action: 'APPROVE_VERIFICATION',
      payloadJson: { requestedLevel: updated.requestedLevel },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/review-queue', requireAuth, async (req, res) => {
  try {
    if (!canReview(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, requestedLevel, participantClass } = req.query;
    if (status && !validateReviewQueueStatus(String(status))) {
      return res.status(400).json({ error: 'Invalid review queue status filter' });
    }
    if (requestedLevel && !validateVerificationLevel(String(requestedLevel))) {
      return res.status(400).json({ error: 'Invalid verification level filter' });
    }
    if (participantClass && !validateParticipantClass(String(participantClass))) {
      return res.status(400).json({ error: 'Invalid participant class filter' });
    }

    const queue = await prisma.verificationRecord.findMany({
      where: {
        ...(status ? { queueStatus: String(status) } : {}),
        ...(requestedLevel ? { requestedLevel: String(requestedLevel) } : {}),
      },
      include: getReviewQueueInclude(),
      orderBy: { submittedAt: 'desc' },
    });

    const filteredQueue = participantClass
      ? queue.filter((item) => item.memberProfile?.participantClass?.code === String(participantClass))
      : queue;

    const enrichedQueue = filteredQueue.map((item) => ({
      ...item,
      risk: getReviewRisk(item),
      isHighRisk: isHighRiskCase(item),
    }));

    return res.json(enrichedQueue);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-queue/approve', requireAuth, async (req, res) => {
  try {
    if (!canApproveVerification(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verificationRecordId, notes } = req.body;
    const record = await prisma.verificationRecord.findUnique({ where: { id: verificationRecordId } });
    if (!record) {
      return res.status(404).json({ error: 'Verification record not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const approvedRecord = await tx.verificationRecord.update({
        where: { id: verificationRecordId },
        data: {
          status: 'APPROVED',
          queueStatus: 'APPROVED',
          reviewedByUserId: req.auth.id,
          reviewedAt: new Date(),
          notes: notes || record.notes,
        },
      });

      await tx.memberProfile.update({
        where: { id: record.memberProfileId },
        data: { verificationLevel: record.requestedLevel },
      });

      await createReviewAction(tx, verificationRecordId, 'APPROVE', req.auth.id, notes, {
        requestedLevel: record.requestedLevel,
      });

      return tx.verificationRecord.findUnique({
        where: { id: verificationRecordId },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'VerificationRecord',
      entityId: verificationRecordId,
      action: 'REVIEW_QUEUE_APPROVE',
      payloadJson: { notes },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-queue/reject', requireAuth, async (req, res) => {
  try {
    if (!canReject(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verificationRecordId, notes } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const rejected = await tx.verificationRecord.update({
        where: { id: verificationRecordId },
        data: {
          status: 'REJECTED',
          queueStatus: 'REJECTED',
          notes,
          reviewedByUserId: req.auth.id,
          reviewedAt: new Date(),
        },
      });

      await createReviewAction(tx, verificationRecordId, 'REJECT', req.auth.id, notes, null);
      return tx.verificationRecord.findUnique({
        where: { id: rejected.id },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'VerificationRecord', entityId: verificationRecordId, action: 'REJECT_VERIFICATION', payloadJson: { notes } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-queue/escalate', requireAuth, async (req, res) => {
  try {
    if (!canEscalate(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verificationRecordId, notes } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const escalated = await tx.verificationRecord.update({
        where: { id: verificationRecordId },
        data: {
          status: 'UNDER_REVIEW',
          queueStatus: 'ESCALATED',
          notes: notes ? `ESCALATED: ${notes}` : 'ESCALATED',
        },
      });

      await createReviewAction(tx, verificationRecordId, 'ESCALATE', req.auth.id, notes, null);
      return tx.verificationRecord.findUnique({
        where: { id: escalated.id },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'VerificationRecord', entityId: verificationRecordId, action: 'ESCALATE_VERIFICATION', payloadJson: { notes } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-queue/assign-reviewer', requireAuth, async (req, res) => {
  try {
    if (!canAssignReviewer(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verificationRecordId, reviewerUserId, notes } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const assigned = await tx.verificationRecord.update({
        where: { id: verificationRecordId },
        data: {
          assignedReviewerId: reviewerUserId,
          queueStatus: 'UNDER_REVIEW',
          notes: [notes, `Assigned reviewer: ${reviewerUserId}`].filter(Boolean).join(' | '),
        },
      });

      await createReviewAction(tx, verificationRecordId, 'ASSIGN_REVIEWER', req.auth.id, notes, {
        reviewerUserId,
      });

      return tx.verificationRecord.findUnique({
        where: { id: assigned.id },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'VerificationRecord', entityId: verificationRecordId, action: 'ASSIGN_REVIEWER', payloadJson: { reviewerUserId, notes } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-queue/request-more-docs', requireAuth, async (req, res) => {
  try {
    if (!canReview(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { verificationRecordId, notes, requiredDocuments } = req.body;
    const updated = await prisma.$transaction(async (tx) => {
      const requested = await tx.verificationRecord.update({
        where: { id: verificationRecordId },
        data: {
          status: 'UNDER_REVIEW',
          queueStatus: 'REQUESTED_MORE_DOCUMENTS',
          notes: [notes, requiredDocuments?.length ? `Required: ${requiredDocuments.join(', ')}` : null].filter(Boolean).join(' | '),
        },
      });

      await createReviewAction(tx, verificationRecordId, 'REQUEST_MORE_DOCUMENTS', req.auth.id, notes, {
        requiredDocuments,
      });

      return tx.verificationRecord.findUnique({
        where: { id: requested.id },
        include: getReviewQueueInclude(),
      });
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'VerificationRecord', entityId: verificationRecordId, action: 'REQUEST_MORE_DOCUMENTS', payloadJson: { notes, requiredDocuments } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/participant-classes', async (_req, res) => {
  try {
    const classes = await prisma.participantClass.findMany({ where: { isActive: true } });
    return res.json(classes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/tiers', async (_req, res) => {
  try {
    const tiers = await prisma.membershipTier.findMany({ where: { isActive: true }, orderBy: { rank: 'asc' } });
    return res.json(tiers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents', requireAuth, async (req, res) => {
  try {
    const where = hasBackofficeAccess(req.auth.role) ? {} : { memberProfileId: req.auth.memberProfileId };
    const documents = await prisma.memberDocument.findMany({
      where,
      include: { memberProfile: { include: { user: true } } },
      orderBy: { uploadedAt: 'desc' },
    });
    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents/upload-url', requireAuth, async (req, res) => {
  try {
    const { memberProfileId, fileName, contentType } = req.body;
    if (!memberProfileId || !fileName || !contentType) {
      return res.status(400).json({ error: 'Invalid upload request' });
    }
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const signed = await createSignedUpload({
      folder: `aureon9/member-documents/${memberProfileId}`,
      fileName,
      contentType,
    });

    return res.json(signed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents/upload-binary', express.raw({ type: '*/*', limit: '20mb' }), async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: 'Upload token is required' });
    }

    const result = await writeUploadedBinary(String(token), req.body);
    return res.json({ uploaded: true, storageKey: result.storageKey });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/documents/finalize-upload', requireAuth, async (req, res) => {
  try {
    const { memberProfileId, documentType, verificationPurpose, fileUrl, storageKey, fileName, mimeType, sizeBytes } = req.body;
    if (!memberProfileId || !documentType || !fileUrl || !storageKey || !fileName) {
      return res.status(400).json({ error: 'Invalid finalize payload' });
    }
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const document = await prisma.memberDocument.create({
      data: {
        memberProfileId,
        documentType,
        verificationPurpose,
        fileUrl,
        storageKey,
        fileName,
        mimeType,
        sizeBytes: sizeBytes ? Number(sizeBytes) : null,
      },
      include: { memberProfile: { include: { user: true } } },
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'MemberDocument',
      entityId: document.id,
      action: 'FINALIZE_DOCUMENT_UPLOAD',
      payloadJson: { verificationPurpose, storageKey, mimeType, sizeBytes },
    });

    return res.status(201).json(document);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', requireAuth, async (req, res) => {
  try {
    const { memberProfileId, documentType, verificationPurpose, fileUrl, storageKey, fileName, mimeType, sizeBytes } = req.body;
    if (!memberProfileId || !documentType || !fileUrl || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const document = await prisma.memberDocument.create({
      data: {
        memberProfileId,
        documentType,
        verificationPurpose,
        fileUrl,
        storageKey,
        fileName,
        mimeType,
        sizeBytes: sizeBytes ? Number(sizeBytes) : null,
      },
      include: { memberProfile: { include: { user: true } } },
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'MemberDocument', entityId: document.id, action: 'CREATE_DOCUMENT', payloadJson: { documentType } });
    return res.status(201).json(document);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/documents/:id/review-status', requireAuth, async (req, res) => {
  try {
    if (!canReview(req.auth.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { reviewStatus, notes } = req.body;
    if (!validateDocumentReviewStatus(reviewStatus)) {
      return res.status(400).json({ error: 'Invalid document review status' });
    }

    const updated = await prisma.memberDocument.update({
      where: { id: req.params.id },
      data: { reviewStatus },
      include: { memberProfile: { include: { user: true } } },
    });

    await writeAuditLog({
      actorUserId: req.auth.id,
      entityType: 'MemberDocument',
      entityId: updated.id,
      action: 'UPDATE_DOCUMENT_REVIEW_STATUS',
      payloadJson: { reviewStatus, notes },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const existing = await prisma.memberDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== existing.memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.memberDocument.delete({ where: { id: req.params.id } });
    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'MemberDocument', entityId: req.params.id, action: 'DELETE_DOCUMENT' });
    return res.json({ message: 'Document deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/wallets/:memberProfileId', requireAuth, async (req, res) => {
  try {
    const memberProfileId = req.params.memberProfileId;
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== memberProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const wallet = await prisma.aurexWallet.findUnique({
      where: { memberProfileId },
      include: { transactions: { take: 50, orderBy: { createdAt: 'desc' } } },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    return res.json(wallet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/wallet-transactions', requireAuth, requireBackoffice, async (req, res) => {
  try {
    const { walletId, type, amount, reference, notes } = req.body;
    const numericAmount = normalizeNumber(amount);
    if (!walletId || !type || numericAmount === null) {
      return res.status(400).json({ error: 'Invalid wallet transaction payload' });
    }

    const wallet = await prisma.aurexWallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.walletTransaction.create({
        data: { walletId, type, amount: numericAmount, reference, notes },
      });

      await tx.aurexWallet.update({
        where: { id: walletId },
        data: { balance: Number(wallet.balance) + numericAmount },
      });

      return created;
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'WalletTransaction', entityId: transaction.id, action: 'CREATE_WALLET_TRANSACTION', payloadJson: { type, amount: numericAmount } });
    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/referrals', requireAuth, async (req, res) => {
  try {
    const where = hasBackofficeAccess(req.auth.role)
      ? {}
      : {
          OR: [
            { senderProfileId: req.auth.memberProfileId },
            { receiverProfileId: req.auth.memberProfileId },
          ],
        };

    const referrals = await prisma.referral.findMany({
      where,
      include: { sender: { include: { user: true } }, receiver: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(referrals);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/referrals', requireAuth, async (req, res) => {
  try {
    const { senderProfileId, receiverEmail, campaignCode } = req.body;
    if (!senderProfileId || !validateEmail(receiverEmail)) {
      return res.status(400).json({ error: 'Invalid referral payload' });
    }
    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== senderProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const referral = await prisma.referral.create({
      data: { senderProfileId, receiverEmail, campaignCode, status: 'PENDING' },
      include: { sender: { include: { user: true } } },
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'Referral', entityId: referral.id, action: 'CREATE_REFERRAL', payloadJson: { receiverEmail, campaignCode } });
    return res.status(201).json(referral);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/referrals/:id', requireAuth, async (req, res) => {
  try {
    const referral = await prisma.referral.findUnique({
      where: { id: req.params.id },
      include: { sender: { include: { user: true } }, receiver: { include: { user: true } } },
    });

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    if (!hasBackofficeAccess(req.auth.role) && req.auth.memberProfileId !== referral.senderProfileId && req.auth.memberProfileId !== referral.receiverProfileId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(referral);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } });
    if (!req.auth?.memberProfileId) {
      return res.json(opportunities.filter((item) => item.accessRule === 'PUBLIC'));
    }

    const profile = await prisma.memberProfile.findUnique({
      where: { id: req.auth.memberProfileId },
      include: { tier: true },
    });

    const visible = opportunities.filter((item) =>
      canAccessOpportunity({ rule: item.accessRule, verificationLevel: profile?.verificationLevel, tierCode: profile?.tier?.code })
    );

    return res.json(visible);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/opportunities', requireAuth, requireBackoffice, async (req, res) => {
  try {
    const { title, description, type, accessRule, country } = req.body;
    if (!title || !validateOpportunityType(type) || !validateAccessRule(accessRule)) {
      return res.status(400).json({ error: 'Invalid opportunity payload' });
    }

    const opportunity = await prisma.opportunity.create({
      data: { title, description, type, accessRule, country, isPublished: false },
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'Opportunity', entityId: opportunity.id, action: 'CREATE_OPPORTUNITY' });
    return res.status(201).json(opportunity);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/opportunities/:id', requireAuth, requireBackoffice, async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;
    const opportunity = await prisma.opportunity.update({
      where: { id: req.params.id },
      data: { title, description, isPublished },
    });

    await writeAuditLog({ actorUserId: req.auth.id, entityType: 'Opportunity', entityId: opportunity.id, action: 'UPDATE_OPPORTUNITY', payloadJson: { isPublished } });
    return res.json(opportunity);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/audit-logs', requireAuth, requireBackoffice, async (_req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/audit-logs', requireAuth, requireBackoffice, async (req, res) => {
  try {
    const { actorUserId, entityType, entityId, action, payloadJson } = req.body;
    if (!entityType || !entityId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const log = await writeAuditLog({ actorUserId: actorUserId || req.auth.id, entityType, entityId, action, payloadJson });
    return res.status(201).json(log);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AUREON9 API server running on port ${PORT}`);
  console.log(`Uploads served from ${path.resolve(__dirname, 'uploads')}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
