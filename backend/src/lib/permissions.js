// Permission checks for role-based access control

export function hasBackofficeAccess(role) {
  const backofficeRoles = [
    'SUPER_ADMIN',
    'EXECUTIVE',
    'LEGAL_COMPLIANCE',
    'QUALIFICATIONS',
    'CUSTOMER_SUCCESS',
    'FINANCE_TREASURY',
  ];
  return backofficeRoles.includes(role);
}

export function canApproveVerification(role) {
  const approvalRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'];
  return approvalRoles.includes(role);
}

export function canReview(role) {
  const reviewRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS'];
  return reviewRoles.includes(role);
}

export function canAssignReviewer(role) {
  const assignmentRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'];
  return assignmentRoles.includes(role);
}

export function canEscalate(role) {
  const escalationRoles = ['SUPER_ADMIN', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS'];
  return escalationRoles.includes(role);
}

export function canReject(role) {
  const rejectionRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'];
  return rejectionRoles.includes(role);
}

export function canAccessOpportunity(params) {
  const { rule, verificationLevel, tierCode } = params;

  if (rule === 'PUBLIC') return true;
  if (rule === 'VERIFIED_ONLY') return verificationLevel !== 'UNVERIFIED';
  if (rule === 'CERTIFIED_PLUS') {
    const certifiedPlusTiers = ['CERTIFIED', 'EXECUTIVE', 'STRATEGIC', 'FOUNDING', 'SOVEREIGN'];
    return certifiedPlusTiers.includes(tierCode);
  }
  if (rule === 'EXECUTIVE_PLUS') {
    const executivePlusTiers = ['EXECUTIVE', 'STRATEGIC', 'FOUNDING', 'SOVEREIGN'];
    return executivePlusTiers.includes(tierCode);
  }
  if (rule === 'STRATEGIC_PLUS') {
    const strategicPlusTiers = ['STRATEGIC', 'FOUNDING', 'SOVEREIGN'];
    return strategicPlusTiers.includes(tierCode);
  }

  return false;
}

export function getTierRank(tierCode) {
  const tierRanks = {
    MEMBER: 1,
    ASSOCIATE: 2,
    CERTIFIED: 3,
    EXECUTIVE: 4,
    STRATEGIC: 5,
    FOUNDING: 6,
    SOVEREIGN: 7,
  };
  return tierRanks[tierCode] || 0;
}

export function getVerificationRank(verificationLevel) {
  const verificationRanks = {
    UNVERIFIED: 1,
    BASIC_VERIFIED: 2,
    IDENTITY_VERIFIED: 3,
    COMMERCIAL_VERIFIED: 4,
    INSTITUTIONAL_VERIFIED: 5,
    CAPITAL_VERIFIED: 6,
    GOVERNANCE_APPROVED: 7,
  };
  return verificationRanks[verificationLevel] || 0;
}

function getMemberType(participantClassCode) {
  const partnerClasses = ['CHANNEL_PARTNER', 'AFFILIATE', 'EQUITY_AFFILIATE', 'EQUITY_PARTNER', 'STRATEGIC_PARTNER', 'OEM_PARTNER'];
  const investorClasses = ['CAPITAL_PARTICIPANT', 'INSTITUTIONAL_PARTICIPANT'];
  const operatorClasses = ['TRADE_OPERATOR', 'SETTLEMENT_PARTICIPANT', 'THIRD_PARTY_OPERATOR'];
  const developerClasses = ['DEVELOPER'];
  if (partnerClasses.includes(participantClassCode)) return 'PARTNER';
  if (investorClasses.includes(participantClassCode)) return 'INVESTOR';
  if (operatorClasses.includes(participantClassCode)) return 'OPERATOR';
  if (developerClasses.includes(participantClassCode)) return 'DEVELOPER';
  return 'CUSTOMER';
}

function getDashboardMetrics(memberType) {
  const map = {
    CUSTOMER:  ['AUREX Balance', 'Current Tier', 'Purchases This Month', 'Rewards Earned'],
    PARTNER:   ['AUREX Balance', 'Current Tier', 'Active Referrals', 'Commissions This Month'],
    INVESTOR:  ['AUREX Balance', 'Current Tier', 'Active Investments', 'Returns This Quarter'],
    OPERATOR:  ['AUREX Balance', 'Current Tier', 'Trades This Week', 'Settlement Volume'],
    DEVELOPER: ['AUREX Balance', 'Current Tier', 'API Calls', 'Build Rewards'],
  };
  return map[memberType] || map.CUSTOMER;
}

function getVerificationRequirements(memberType) {
  const base = { IDENTITY_VERIFIED: ['Government ID'] };
  const map = {
    CUSTOMER:  { ...base },
    DEVELOPER: { ...base },
    PARTNER:   { ...base, COMMERCIAL_VERIFIED: ['Business Registration'] },
    OPERATOR:  { ...base, COMMERCIAL_VERIFIED: ['Business Registration', 'License/Certification'] },
    INVESTOR:  { ...base, COMMERCIAL_VERIFIED: ['Business Registration', 'Financial Statements'], CAPITAL_VERIFIED: ['Capital Source Letter'] },
  };
  return map[memberType] || map.CUSTOMER;
}

function getOpportunityFilter(memberType) {
  const map = {
    CUSTOMER:  ['MARKETPLACE', 'LOYALTY'],
    PARTNER:   ['PARTNERSHIP', 'TRAINING', 'MARKETPLACE'],
    INVESTOR:  ['INVESTMENT', 'SYNDICATION', 'CAPITAL'],
    OPERATOR:  ['TRADE', 'OPERATOR_PARTNERSHIP'],
    DEVELOPER: ['TECH_GRANT', 'API_PROGRAM', 'BOUNTY'],
  };
  return map[memberType] || map.CUSTOMER;
}

function getEarningsSources(memberType) {
  const map = {
    CUSTOMER:  ['REWARD_CREDIT', 'REFERRAL_BONUS'],
    PARTNER:   ['COMMISSION_CREDIT', 'REFERRAL_BONUS', 'ADJUSTMENT'],
    INVESTOR:  ['SETTLEMENT', 'REWARD_CREDIT'],
    OPERATOR:  ['SETTLEMENT', 'COMMISSION_CREDIT'],
    DEVELOPER: ['REWARD_CREDIT', 'ADJUSTMENT'],
  };
  return map[memberType] || map.CUSTOMER;
}

export function getMemberPanelCapabilities(params) {
  const { participantClassCode, tierCode, verificationLevel } = params;
  const tierRank = getTierRank(tierCode);
  const verificationRank = getVerificationRank(verificationLevel);
  const memberType = getMemberType(participantClassCode);

  const isPartner = memberType === 'PARTNER';
  const isDeveloper = memberType === 'DEVELOPER';

  const screens = {
    dashboard: true,
    profile: true,
    verification: true,
    membership: true,
    wallet: true,
    earnings: true,
    marketplace: verificationRank >= 2,
    referrals: isPartner,
    opportunities: true,
    documents: true,
    notifications: true,
    metrics: true,
    upgrade: true,
    settings: true,
  };

  const actions = {
    canEditIdentity: true,
    canChangePassword: true,
    canRequestUpgrade: verificationRank >= 2,
    canWithdraw: verificationRank >= 3,
    canTransfer: verificationRank >= 2,
    canBuyInvest: verificationRank >= 2,
    canApplyOpportunity: verificationRank >= 2,
    canViewTeamTree: isPartner,
    canViewCommissionBreakdown: isPartner,
    canOperateTradeFlows: memberType === 'OPERATOR',
    canAccessCapitalFeeds: memberType === 'INVESTOR',
    canAccessDeveloperTools: isDeveloper,
    canAccessSettlementControls: participantClassCode === 'SETTLEMENT_PARTICIPANT',
    canSellMarketplace: tierRank >= 3 && verificationRank >= 3,
    canManageApiKeys: isDeveloper,
  };

  const marketplaceAccessLevel = (() => {
    if (verificationRank >= 7) return 'ALL';
    if (verificationRank >= 6) return 'CAPITAL';
    if (verificationRank >= 4) return 'COMMERCIAL';
    if (verificationRank >= 3) return 'IDENTITY';
    if (verificationRank >= 2) return 'BASIC';
    return 'NONE';
  })();

  return {
    profile: { participantClassCode, tierCode, verificationLevel },
    memberType,
    screens,
    actions,
    dashboardMetrics: getDashboardMetrics(memberType),
    verificationRequirements: getVerificationRequirements(memberType),
    opportunityFilter: getOpportunityFilter(memberType),
    earningsSources: getEarningsSources(memberType),
    marketplaceAccessLevel,
  };
}
