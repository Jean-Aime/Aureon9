/**
 * AUREON9 External API Endpoints
 * These endpoints are called by other websites (ODIEXA, AAL, AUREX, Ont, ODIEBOARD)
 * to integrate with the AUREON9 membership hub
 */

import { randomUUID } from 'crypto';
import { hash } from 'bcryptjs';
import prisma from './db.js';
import { writeAuditLog } from './audit.js';
import {
  calculatePurchaseRewards,
  calculateReferralBonus,
  calculateOperatorFee,
  calculateDeveloperReward,
  getMemberCapabilities,
} from './reward-calculator.js';
import {
  checkIdempotency,
  recordIdempotentEvent,
} from './idempotency.js';

/**
 * Endpoint 1: POST /api/external/register
 * Called when someone registers on any ecosystem website
 */
export async function handleExternalRegister(req, res) {
  const {
    email,
    name,
    password,
    participantClass = 'GENERAL_MEMBER',
    sourceWebsite,
    returnUrl,
    referralCode,
  } = req.body;

  const externalId = req.body.externalId || `reg_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      throw new Error('INVALID_EMAIL');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    // Get participant class
    const participantClassRecord = await prisma.participantClass.findUnique({
      where: { code: participantClass },
    });
    if (!participantClassRecord) {
      throw new Error('INVALID_PARTICIPANT_CLASS');
    }

    // Get default tier (MEMBER)
    const defaultTier = await prisma.membershipTier.findUnique({
      where: { code: 'MEMBER' },
    });
    if (!defaultTier) {
      throw new Error('DEFAULT_TIER_NOT_FOUND');
    }

    // Generate unique referral code
    const uniqueReferralCode = `${name?.substring(0, 3).toUpperCase() || 'MEM'}${randomUUID().substring(0, 8).toUpperCase()}`;

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await hash(password, 10);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'MEMBER',
        isActive: true,
      },
    });

    // Create member profile
    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: user.id,
        participantClassId: participantClassRecord.id,
        tierId: defaultTier.id,
        verificationLevel: 'UNVERIFIED',
        displayName: name,
        referralCode: uniqueReferralCode,
        referredByProfileId: null,
        status: 'ACTIVE',
      },
      include: {
        participantClass: true,
        tier: true,
      },
    });

    // Create wallet with 0 balance
    const wallet = await prisma.aurexWallet.create({
      data: {
        memberProfileId: memberProfile.id,
        balance: 0,
        currencyCode: 'ARX',
      },
    });

    let referrerBonus = 0;

    // Handle referral code if provided
    if (referralCode) {
      const referrer = await prisma.memberProfile.findUnique({
        where: { referralCode },
        include: { tier: true },
      });

      if (referrer) {
        // Link referrer
        await prisma.memberProfile.update({
          where: { id: memberProfile.id },
          data: { referredByProfileId: referrer.id },
        });

        // Calculate and credit referral bonus
        referrerBonus = calculateReferralBonus(referrer.tier.code);
        await prisma.aurexWallet.update({
          where: { id: referrer.wallet.id },
          data: { balance: { increment: referrerBonus } },
        });

        // Create transaction for referrer
        await prisma.walletTransaction.create({
          data: {
            walletId: referrer.wallet.id,
            type: 'REFERRAL_BONUS',
            amount: referrerBonus,
            reference: externalId,
            notes: `Referral signup: ${email}`,
          },
        });

        // Create referral record
        await prisma.referral.create({
          data: {
            senderProfileId: referrer.id,
            receiverProfileId: memberProfile.id,
            receiverEmail: email,
            status: 'COMPLETED',
            bonusAmount: referrerBonus,
            bonusCreditedAt: new Date(),
          },
        });
      }
    }

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'User',
      entityId: user.id,
      action: 'CREATE_MEMBER',
      payloadJson: {
        email,
        name,
        participantClass,
        tier: defaultTier.code,
      },
    });

    const response = {
      success: true,
      data: {
        memberId: memberProfile.id,
        userId: user.id,
        walletId: wallet.id,
        referralCode: uniqueReferralCode,
        tier: defaultTier.code,
        verificationLevel: 'UNVERIFIED',
        email,
        name,
      },
      timestamp: new Date().toISOString(),
    };

    // Record idempotent event
    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'User',
      entityId: user.id,
      action: 'CREATE_MEMBER',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('External register error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'REGISTRATION_FAILED',
        message: error.message || 'Failed to register member',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 2: POST /api/external/purchase
 * Called when someone buys something on ODIEXA
 */
export async function handleExternalPurchase(req, res) {
  const {
    memberId,
    amount,
    currency,
    productId,
    sellerId,
    purchaseId,
    sourceWebsite,
  } = req.body;

  const externalId = purchaseId || `pur_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Verify buyer exists
    const buyer = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { wallet: true, tier: true },
    });
    if (!buyer || !buyer.wallet) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    // Verify seller exists (optional)
    let seller = null;
    if (sellerId) {
      seller = await prisma.memberProfile.findUnique({
        where: { id: sellerId },
        include: { wallet: true, tier: true },
      });
    }

    // Calculate rewards
    const { buyerReward, sellerReward, referrerReward } = calculatePurchaseRewards(
      amount,
      buyer.tier.code,
      seller?.tier?.code || 'MEMBER',
      !!buyer.referredByProfileId
    );

    // Credit buyer
    await prisma.aurexWallet.update({
      where: { id: buyer.wallet.id },
      data: { balance: { increment: buyerReward } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: buyer.wallet.id,
        type: 'PURCHASE_REWARD',
        amount: buyerReward,
        reference: externalId,
        notes: `Purchase reward: ${productId}`,
      },
    });

    // Credit seller (if exists)
    if (seller && seller.wallet && sellerReward > 0) {
      await prisma.aurexWallet.update({
        where: { id: seller.wallet.id },
        data: { balance: { increment: sellerReward } },
      });

      await prisma.walletTransaction.create({
        data: {
          walletId: seller.wallet.id,
          type: 'COMMISSION_CREDIT',
          amount: sellerReward,
          reference: externalId,
          notes: `Seller commission: ${productId}`,
        },
      });
    }

    // Credit referrer (if exists)
    if (buyer.referredByProfileId && referrerReward > 0) {
      const referrer = await prisma.memberProfile.findUnique({
        where: { id: buyer.referredByProfileId },
        include: { wallet: true },
      });

      if (referrer && referrer.wallet) {
        await prisma.aurexWallet.update({
          where: { id: referrer.wallet.id },
          data: { balance: { increment: referrerReward } },
        });

        await prisma.walletTransaction.create({
          data: {
            walletId: referrer.wallet.id,
            type: 'COMMISSION_CREDIT',
            amount: referrerReward,
            reference: externalId,
            notes: `Referral commission: ${memberId}`,
          },
        });
      }
    }

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: buyer.wallet.id,
      action: 'PURCHASE_REWARDS_CREDITED',
      payloadJson: {
        memberId,
        amount,
        productId,
        buyerReward,
        sellerReward,
        referrerReward,
      },
    });

    const response = {
      success: true,
      data: {
        buyerReward,
        sellerReward,
        referrerReward,
        buyerNewBalance: Number((buyer.wallet.balance + buyerReward).toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: buyer.wallet.id,
      action: 'PURCHASE_REWARDS_CREDITED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External purchase error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'PURCHASE_FAILED',
        message: error.message || 'Failed to process purchase rewards',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 3: POST /api/external/referral-signup
 * Called when someone signs up using a referral link
 */
export async function handleExternalReferralSignup(req, res) {
  const {
    referralCode,
    newMemberId,
    newMemberEmail,
    sourceWebsite,
  } = req.body;

  const externalId = req.body.externalId || `ref_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Look up referrer by code
    const referrer = await prisma.memberProfile.findUnique({
      where: { referralCode },
      include: { wallet: true, tier: true },
    });
    if (!referrer) {
      throw new Error('REFERRAL_CODE_NOT_FOUND');
    }

    // Get new member
    const newMember = await prisma.memberProfile.findUnique({
      where: { id: newMemberId },
    });
    if (!newMember) {
      throw new Error('NEW_MEMBER_NOT_FOUND');
    }

    // Link referral
    const bonusAmount = calculateReferralBonus(referrer.tier.code);

    await prisma.memberProfile.update({
      where: { id: newMemberId },
      data: { referredByProfileId: referrer.id },
    });

    // Credit referrer bonus
    await prisma.aurexWallet.update({
      where: { id: referrer.wallet.id },
      data: { balance: { increment: bonusAmount } },
    });

    // Create transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: referrer.wallet.id,
        type: 'REFERRAL_BONUS',
        amount: bonusAmount,
        reference: externalId,
        notes: `Referral signup: ${newMemberEmail}`,
      },
    });

    // Create or update referral record
    await prisma.referral.create({
      data: {
        senderProfileId: referrer.id,
        receiverProfileId: newMemberId,
        receiverEmail: newMemberEmail,
        status: 'COMPLETED',
        bonusAmount,
        bonusCreditedAt: new Date(),
      },
    });

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'Referral',
      entityId: referrer.id,
      action: 'REFERRAL_SIGNUP_COMPLETED',
      payloadJson: {
        referralCode,
        newMemberId,
        bonusAmount,
      },
    });

    const response = {
      success: true,
      data: {
        referrerId: referrer.id,
        bonusAmount,
        referrerNewBalance: Number((referrer.wallet.balance + bonusAmount).toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'Referral',
      entityId: referrer.id,
      action: 'REFERRAL_SIGNUP_COMPLETED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External referral signup error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'REFERRAL_SIGNUP_FAILED',
        message: error.message || 'Failed to process referral signup',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 4: POST /api/external/withdrawal
 * Called when someone withdraws from AUREX wallet
 */
export async function handleExternalWithdrawal(req, res) {
  const {
    memberId,
    amount,
    withdrawalId,
    destinationAddress,
    status,
    sourceWebsite,
  } = req.body;

  const externalId = withdrawalId || `wd_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Get member wallet
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { wallet: true },
    });
    if (!memberProfile || !memberProfile.wallet) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    // Only process completed withdrawals
    if (status === 'COMPLETED') {
      // Deduct from balance
      const newBalance = Number((memberProfile.wallet.balance - amount).toFixed(4));
      if (newBalance < 0) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await prisma.aurexWallet.update({
        where: { id: memberProfile.wallet.id },
        data: { balance: newBalance },
      });

      // Create withdrawal transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: memberProfile.wallet.id,
          type: 'WITHDRAWAL',
          amount: -amount,
          reference: externalId,
          notes: `Withdrawal to ${destinationAddress}`,
        },
      });
    }

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: memberProfile.wallet.id,
      action: 'WITHDRAWAL_PROCESSED',
      payloadJson: {
        memberId,
        amount,
        status,
        destinationAddress,
      },
    });

    const response = {
      success: true,
      data: {
        memberId,
        amount,
        status,
        newBalance: Number((memberProfile.wallet.balance - (status === 'COMPLETED' ? amount : 0)).toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: memberProfile.wallet.id,
      action: 'WITHDRAWAL_PROCESSED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External withdrawal error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'WITHDRAWAL_FAILED',
        message: error.message || 'Failed to process withdrawal',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 5: POST /api/external/deposit
 * Called when someone deposits into AUREX wallet
 */
export async function handleExternalDeposit(req, res) {
  const {
    memberId,
    amount,
    depositId,
    source,
    sourceWebsite,
  } = req.body;

  const externalId = depositId || `dep_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Get member wallet
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { wallet: true },
    });
    if (!memberProfile || !memberProfile.wallet) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    // Add to balance
    await prisma.aurexWallet.update({
      where: { id: memberProfile.wallet.id },
      data: { balance: { increment: amount } },
    });

    // Create deposit transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: memberProfile.wallet.id,
        type: 'DEPOSIT',
        amount,
        reference: externalId,
        notes: `Deposit from ${source}`,
      },
    });

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: memberProfile.wallet.id,
      action: 'DEPOSIT_PROCESSED',
      payloadJson: {
        memberId,
        amount,
        source,
      },
    });

    const newBalance = Number((memberProfile.wallet.balance + amount).toFixed(4));
    const response = {
      success: true,
      data: {
        memberId,
        amount,
        newBalance,
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: memberProfile.wallet.id,
      action: 'DEPOSIT_PROCESSED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External deposit error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'DEPOSIT_FAILED',
        message: error.message || 'Failed to process deposit',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 6: POST /api/external/settlement
 * Called when a trade operator completes a settlement
 */
export async function handleExternalSettlement(req, res) {
  const {
    operatorId,
    tradeAmount,
    operatorFee,
    settlementId,
    participants,
    sourceWebsite,
  } = req.body;

  const externalId = settlementId || `stl_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Get operator profile
    const operator = await prisma.memberProfile.findUnique({
      where: { id: operatorId },
      include: { wallet: true, tier: true },
    });
    if (!operator || !operator.wallet) {
      throw new Error('OPERATOR_NOT_FOUND');
    }

    // Calculate operator fee
    const calculatedFee = calculateOperatorFee(tradeAmount, operator.tier.code);
    const feeAmount = operatorFee || calculatedFee;

    // Credit operator
    await prisma.aurexWallet.update({
      where: { id: operator.wallet.id },
      data: { balance: { increment: feeAmount } },
    });

    // Create settlement transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: operator.wallet.id,
        type: 'SETTLEMENT',
        amount: feeAmount,
        reference: externalId,
        notes: `Settlement fee for ${participants?.length || 0} participants`,
      },
    });

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: operator.wallet.id,
      action: 'SETTLEMENT_FEE_CREDITED',
      payloadJson: {
        operatorId,
        tradeAmount,
        feeAmount,
        participants,
      },
    });

    const response = {
      success: true,
      data: {
        operatorId,
        operatorCredited: feeAmount,
        operatorNewBalance: Number((operator.wallet.balance + feeAmount).toFixed(4)),
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: operator.wallet.id,
      action: 'SETTLEMENT_FEE_CREDITED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External settlement error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'SETTLEMENT_FAILED',
        message: error.message || 'Failed to process settlement',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 7: POST /api/external/api-usage
 * Called when developers use Ont platform APIs
 */
export async function handleExternalAPIUsage(req, res) {
  const {
    developerId,
    endpoint,
    callCount,
    sourceWebsite,
  } = req.body;

  const externalId = req.body.externalId || `api_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Get developer profile
    const developer = await prisma.memberProfile.findUnique({
      where: { id: developerId },
      include: { wallet: true },
    });
    if (!developer || !developer.wallet) {
      throw new Error('DEVELOPER_NOT_FOUND');
    }

    // Calculate reward
    const rewardAmount = calculateDeveloperReward(callCount);

    // Credit developer only if reward > 0
    if (rewardAmount > 0) {
      await prisma.aurexWallet.update({
        where: { id: developer.wallet.id },
        data: { balance: { increment: rewardAmount } },
      });

      // Create transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: developer.wallet.id,
          type: 'DEVELOPER_REWARD',
          amount: rewardAmount,
          reference: externalId,
          notes: `API usage reward: ${callCount} calls to ${endpoint}`,
        },
      });
    }

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: developer.wallet.id,
      action: 'API_USAGE_REWARD_CREDITED',
      payloadJson: {
        developerId,
        endpoint,
        callCount,
        rewardAmount,
      },
    });

    const response = {
      success: true,
      data: {
        developerId,
        callCount,
        rewardAmount,
        rewardCredited: rewardAmount > 0,
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'WalletTransaction',
      entityId: developer.wallet.id,
      action: 'API_USAGE_REWARD_CREDITED',
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External API usage error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'API_USAGE_FAILED',
        message: error.message || 'Failed to process API usage',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 8: POST /api/external/approval
 * Called when ODIEBOARD admin approves verification/tier/etc
 */
export async function handleExternalApproval(req, res) {
  const {
    memberId,
    approvalType,
    newVerificationLevel,
    newTier,
    approvedBy,
    sourceWebsite,
  } = req.body;

  const externalId = req.body.externalId || `app_${randomUUID()}`;

  // Check idempotency
  const cached = await checkIdempotency(sourceWebsite, externalId);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    // Get member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { tier: true, user: true },
    });
    if (!memberProfile) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    const updateData = {};
    const changedFields = {};

    // Handle verification approval
    if (approvalType === 'VERIFICATION' && newVerificationLevel) {
      updateData.verificationLevel = newVerificationLevel;
      changedFields.verificationLevel = newVerificationLevel;
    }

    // Handle tier upgrade
    if (approvalType === 'TIER_UPGRADE' && newTier) {
      const tierRecord = await prisma.membershipTier.findUnique({
        where: { code: newTier },
      });
      if (!tierRecord) {
        throw new Error('INVALID_TIER_CODE');
      }
      updateData.tierId = tierRecord.id;
      changedFields.tier = newTier;
    }

    // Update member profile
    if (Object.keys(updateData).length > 0) {
      await prisma.memberProfile.update({
        where: { id: memberId },
        data: updateData,
      });
    }

    // Audit log
    await writeAuditLog({
      sourceWebsite,
      externalId,
      entityType: 'MemberProfile',
      entityId: memberId,
      action: `${approvalType}_APPROVED`,
      payloadJson: {
        memberId,
        approvalType,
        newVerificationLevel,
        newTier,
        approvedBy,
        changedFields,
      },
    });

    const response = {
      success: true,
      data: {
        memberId,
        approvalType,
        updatedFields: changedFields,
      },
      timestamp: new Date().toISOString(),
    };

    await recordIdempotentEvent({
      sourceWebsite,
      externalId,
      entityType: 'MemberProfile',
      entityId: memberId,
      action: `${approvalType}_APPROVED`,
      requestPayload: req.body,
      responsePayload: response,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('External approval error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'APPROVAL_FAILED',
        message: error.message || 'Failed to process approval',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 9: GET /api/external/permissions
 * Check what actions a member can perform
 */
export async function handleExternalPermissions(req, res) {
  const { memberId } = req.query;

  try {
    if (!memberId) {
      throw new Error('MEMBER_ID_REQUIRED');
    }

    // Get member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: { tier: true, user: true },
    });
    if (!memberProfile) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    // Get capabilities
    const capabilities = getMemberCapabilities(memberProfile.tier.code, memberProfile.verificationLevel);

    const response = {
      success: true,
      data: {
        memberId,
        canPurchase: capabilities.canPurchase,
        canSell: capabilities.canSell,
        canInvest: capabilities.canInvest,
        canTrade: capabilities.canTrade,
        canRefer: capabilities.canRefer,
        canAccessAPI: capabilities.canAccessAPI,
        verificationLevel: memberProfile.verificationLevel,
        tier: memberProfile.tier.code,
        reason: 'OK',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('External permissions error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'PERMISSIONS_CHECK_FAILED',
        message: error.message || 'Failed to check permissions',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Endpoint 10: POST /api/external/verify-member
 * Look up member information
 */
export async function handleExternalVerifyMember(req, res) {
  const { memberId, fields = ['email', 'tier', 'verificationLevel'] } = req.body;

  try {
    if (!memberId) {
      throw new Error('MEMBER_ID_REQUIRED');
    }

    // Get member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        tier: true,
        participantClass: true,
      },
    });

    if (!memberProfile) {
      return res.status(200).json({
        success: true,
        data: {
          exists: false,
          isActive: false,
          data: null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Build response with requested fields only
    const data = {};
    if (fields.includes('email')) data.email = memberProfile.user.email;
    if (fields.includes('tier')) data.tier = memberProfile.tier.code;
    if (fields.includes('verificationLevel')) data.verificationLevel = memberProfile.verificationLevel;
    if (fields.includes('participantClass')) data.participantClass = memberProfile.participantClass.code;
    if (fields.includes('name')) data.name = memberProfile.user.name;
    if (fields.includes('displayName')) data.displayName = memberProfile.displayName;
    if (fields.includes('country')) data.country = memberProfile.country;
    if (fields.includes('businessName')) data.businessName = memberProfile.businessName;

    const response = {
      success: true,
      data: {
        exists: true,
        isActive: memberProfile.status === 'ACTIVE',
        data,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('External verify member error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: error.message || 'MEMBER_VERIFICATION_FAILED',
        message: error.message || 'Failed to verify member',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
