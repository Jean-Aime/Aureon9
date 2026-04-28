/**
 * Reward Calculation Engine
 * Implements tier-based reward multipliers for purchases, referrals, settlements, and API usage
 */

const tierMultipliers = {
  MEMBER: 1.0,
  ASSOCIATE: 1.1,
  CERTIFIED: 1.2,
  EXECUTIVE: 1.3,
  STRATEGIC: 1.5,
  FOUNDING: 2.0,
  SOVEREIGN: 2.5,
};

const referralBonuses = {
  MEMBER: 5,
  ASSOCIATE: 10,
  CERTIFIED: 15,
  EXECUTIVE: 25,
  STRATEGIC: 40,
  FOUNDING: 75,
  SOVEREIGN: 100,
};

const operatorFeePercentages = {
  MEMBER: 1.0,
  ASSOCIATE: 1.5,
  CERTIFIED: 2.0,
  EXECUTIVE: 2.5,
  STRATEGIC: 3.0,
  FOUNDING: 4.0,
  SOVEREIGN: 5.0,
};

/**
 * Calculate purchase rewards (buyer, seller, referrer)
 * @param {number} purchaseAmount - Total purchase amount
 * @param {string} buyerTier - Buyer's membership tier
 * @param {string} sellerTier - Seller's membership tier
 * @param {boolean} hasReferrer - Whether buyer was referred
 * @returns {object} { buyerReward, sellerReward, referrerReward }
 */
export function calculatePurchaseRewards(purchaseAmount, buyerTier, sellerTier, hasReferrer = false) {
  // Base buyer reward: 5% of purchase amount
  let buyerReward = purchaseAmount * 0.05;
  
  // Apply tier multiplier for buyer
  const buyerMult = tierMultipliers[buyerTier] || 1.0;
  buyerReward = buyerReward * buyerMult;
  
  // Seller commission: 2% if seller is partner-tier or higher
  let sellerReward = 0;
  const partnerTiers = ['STRATEGIC', 'FOUNDING', 'SOVEREIGN'];
  if (partnerTiers.includes(sellerTier)) {
    sellerReward = purchaseAmount * 0.02;
  }
  
  // Referrer commission: 1% if buyer was referred
  let referrerReward = 0;
  if (hasReferrer) {
    referrerReward = purchaseAmount * 0.01;
  }
  
  return {
    buyerReward: Number(buyerReward.toFixed(4)),
    sellerReward: Number(sellerReward.toFixed(4)),
    referrerReward: Number(referrerReward.toFixed(4)),
  };
}

/**
 * Calculate referral bonus based on referrer's tier
 * @param {string} referrerTier - Referrer's membership tier
 * @returns {number} Bonus amount in ARX
 */
export function calculateReferralBonus(referrerTier) {
  return referralBonuses[referrerTier] || 5;
}

/**
 * Calculate operator settlement fee
 * @param {number} tradeAmount - Total trade amount
 * @param {string} operatorTier - Operator's membership tier
 * @returns {number} Fee amount in ARX
 */
export function calculateOperatorFee(tradeAmount, operatorTier) {
  const feePercentage = operatorFeePercentages[operatorTier] || 1.0;
  return Number((tradeAmount * (feePercentage / 100)).toFixed(4));
}

/**
 * Calculate developer reward based on API usage
 * Formula: 0.01 ARX per 1000 API calls
 * @param {number} callCount - Total API calls made
 * @returns {number} Reward amount in ARX
 */
export function calculateDeveloperReward(callCount) {
  const rewardPerThousand = 0.01;
  return Number((callCount * (rewardPerThousand / 1000)).toFixed(4));
}

/**
 * Get permission multiplier based on member status
 * Used for special access rules
 * @param {string} tierCode - Member's tier
 * @param {string} verificationLevel - Member's verification level
 * @returns {object} Permission flags
 */
export function getMemberCapabilities(tierCode, verificationLevel) {
  const verificationHierarchy = [
    'UNVERIFIED',
    'BASIC_VERIFIED',
    'IDENTITY_VERIFIED',
    'COMMERCIAL_VERIFIED',
    'INSTITUTIONAL_VERIFIED',
    'CAPITAL_VERIFIED',
    'GOVERNANCE_APPROVED',
  ];
  
  const tierHierarchy = ['MEMBER', 'ASSOCIATE', 'CERTIFIED', 'EXECUTIVE', 'STRATEGIC', 'FOUNDING', 'SOVEREIGN'];
  
  const verificationIndex = verificationHierarchy.indexOf(verificationLevel);
  const tierIndex = tierHierarchy.indexOf(tierCode);
  
  return {
    canPurchase: tierIndex >= tierHierarchy.indexOf('MEMBER') && verificationIndex >= 0,
    canSell: tierIndex >= tierHierarchy.indexOf('CERTIFIED') && verificationIndex >= verificationHierarchy.indexOf('IDENTITY_VERIFIED'),
    canInvest: tierIndex >= tierHierarchy.indexOf('EXECUTIVE') && verificationIndex >= verificationHierarchy.indexOf('CAPITAL_VERIFIED'),
    canTrade: tierIndex >= tierHierarchy.indexOf('STRATEGIC') && verificationIndex >= verificationHierarchy.indexOf('COMMERCIAL_VERIFIED'),
    canRefer: tierIndex >= tierHierarchy.indexOf('MEMBER') && verificationIndex >= 0,
    canAccessAPI: tierIndex >= tierHierarchy.indexOf('MEMBER') && verificationIndex >= verificationHierarchy.indexOf('IDENTITY_VERIFIED'),
  };
}
