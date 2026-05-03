/**
 * Member Type Configuration
 * Defines what each member type can see and do
 */

export const memberTypeConfig = {
  FOUNDING_MEMBER: {
    name: 'Founding Member',
    dashboardMetrics: ['balance', 'tier', 'membershipDays', 'communityImpact'],
    opportunityTypes: ['PARTNERSHIP', 'INVESTMENT', 'CAREER'],
    earningsSources: ['REWARD_CREDIT', 'REFERRAL_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID'],
    canViewTeamTree: true,
    canViewCommissionBreakdown: true,
  },
  GENERAL_MEMBER: {
    name: 'General Member',
    dashboardMetrics: ['balance', 'tier', 'earnings', 'notifications'],
    opportunityTypes: ['MARKETPLACE', 'PARTNERSHIP'],
    earningsSources: ['REWARD_CREDIT', 'REFERRAL_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
  },
  CUSTOMER: {
    name: 'Customer',
    dashboardMetrics: ['purchases', 'rewards', 'pendingOrders', 'notifications'],
    opportunityTypes: ['MARKETPLACE', 'LOYALTY_DEALS'],
    earningsSources: ['REWARD_CREDIT', 'REFERRAL_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
  },
  CHANNEL_PARTNER: {
    name: 'Channel Partner',
    dashboardMetrics: ['activeReferrals', 'commissions', 'partnershipMetrics', 'teamSize'],
    opportunityTypes: ['PARTNERSHIP', 'TRAINING', 'CO_MARKETING'],
    earningsSources: ['COMMISSION_CREDIT', 'REFERRAL_BONUS', 'TEAM_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION'],
    canViewTeamTree: true,
    canViewCommissionBreakdown: true,
  },
  AFFILIATE: {
    name: 'Affiliate',
    dashboardMetrics: ['activeReferrals', 'commissions', 'conversions', 'traffic'],
    opportunityTypes: ['PARTNERSHIP', 'PROMOTION'],
    earningsSources: ['COMMISSION_CREDIT', 'REFERRAL_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID'],
    canViewTeamTree: true,
    canViewCommissionBreakdown: true,
  },
  INTERN: {
    name: 'Intern',
    dashboardMetrics: ['tasksCompleted', 'hoursLogged', 'learningProgress', 'feedback'],
    opportunityTypes: ['CAREER', 'TRAINING'],
    earningsSources: ['REWARD_CREDIT'],
    verificationRequirements: ['GOVERNMENT_ID'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
  },
  DEVELOPER: {
    name: 'Developer',
    dashboardMetrics: ['apiCalls', 'integrationsActive', 'support', 'earnings'],
    opportunityTypes: ['TECH_GRANTS', 'API_PROGRAMS', 'INNOVATION'],
    earningsSources: ['DEVELOPER_REWARDS', 'API_CREDITS', 'GRANT_DISBURSEMENT'],
    verificationRequirements: ['GOVERNMENT_ID', 'DEVELOPER_VERIFICATION'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
    hasApiKeysTab: true,
  },
  EQUITY_AFFILIATE: {
    name: 'Equity Affiliate',
    dashboardMetrics: ['equity', 'investments', 'returns', 'portfolio'],
    opportunityTypes: ['INVESTMENT', 'EQUITY_OPPORTUNITIES'],
    earningsSources: ['INVESTMENT_RETURNS', 'DIVIDEND_PAYMENTS'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'FINANCIAL_STATEMENTS'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
  },
  EQUITY_PARTNER: {
    name: 'Equity Partner',
    dashboardMetrics: ['equity', 'investments', 'boardAccess', 'strategicImpact'],
    opportunityTypes: ['INVESTMENT', 'BOARD_OPPORTUNITIES', 'STRATEGIC_PARTNERSHIP'],
    earningsSources: ['INVESTMENT_RETURNS', 'DIVIDEND_PAYMENTS', 'PROFIT_SHARE'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'FINANCIAL_STATEMENTS', 'CAPITAL_LETTER'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
  },
  STRATEGIC_PARTNER: {
    name: 'Strategic Partner',
    dashboardMetrics: ['partnerships', 'jointVentures', 'strategicMetrics', 'influence'],
    opportunityTypes: ['PARTNERSHIP', 'JOINT_VENTURE', 'STRATEGIC_ALLIANCE'],
    earningsSources: ['SETTLEMENT', 'PROFIT_SHARE', 'STRATEGIC_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'LEGAL_DOCUMENTATION'],
    canViewTeamTree: true,
    canViewCommissionBreakdown: true,
  },
  OEM_PARTNER: {
    name: 'OEM Partner',
    dashboardMetrics: ['orderVolume', 'inventory', 'shipments', 'support'],
    opportunityTypes: ['OEM_OPPORTUNITIES', 'WHOLESALE', 'DISTRIBUTION'],
    earningsSources: ['SETTLEMENT', 'VOLUME_BONUS'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'OEM_CERTIFICATION'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
  },
  TRADE_OPERATOR: {
    name: 'Trade Operator',
    dashboardMetrics: ['tradesThisWeek', 'profit', 'volumeMetrics', 'riskMetrics'],
    opportunityTypes: ['TRADE', 'TRADING_OPPORTUNITY'],
    earningsSources: ['SETTLEMENT', 'OPERATOR_FEES'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'OPERATOR_LICENSE'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
    hasOperateTradeFlows: true,
  },
  CAPITAL_PARTICIPANT: {
    name: 'Capital Participant',
    dashboardMetrics: ['capitalCommitted', 'activeDeals', 'returns', 'portfolio'],
    opportunityTypes: ['INVESTMENT', 'CAPITAL_OPPORTUNITIES', 'SYNDICATION'],
    earningsSources: ['INVESTMENT_RETURNS', 'PROFIT_SHARE', 'DIVIDEND_PAYMENTS'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'FINANCIAL_STATEMENTS', 'CAPITAL_LETTER'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
    hasCapitalFeeds: true,
  },
  VERIFICATION_ACTOR: {
    name: 'Verification Actor',
    dashboardMetrics: ['casesProcessed', 'avgTimePerCase', 'approvalRate', 'escalations'],
    opportunityTypes: [],
    earningsSources: ['REWARD_CREDIT'],
    verificationRequirements: ['GOVERNMENT_ID', 'LEGAL_CLEARANCE'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: false,
  },
  SETTLEMENT_PARTICIPANT: {
    name: 'Settlement Participant',
    dashboardMetrics: ['settledAmount', 'settlementsProcessed', 'pending', 'outstanding'],
    opportunityTypes: [],
    earningsSources: ['SETTLEMENT'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
    hasSettlementControls: true,
  },
  INSTITUTIONAL_PARTICIPANT: {
    name: 'Institutional Participant',
    dashboardMetrics: ['aum', 'investments', 'reporting', 'governance'],
    opportunityTypes: ['INVESTMENT', 'INSTITUTIONAL_OPPORTUNITIES'],
    earningsSources: ['INVESTMENT_RETURNS', 'MANAGEMENT_FEES', 'PROFIT_SHARE'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'REGULATORY_APPROVAL', 'FINANCIAL_STATEMENTS'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
  },
  THIRD_PARTY_OPERATOR: {
    name: 'Third Party Operator',
    dashboardMetrics: ['operationMetrics', 'sla', 'uptime', 'transactions'],
    opportunityTypes: ['OPERATIONAL_OPPORTUNITIES'],
    earningsSources: ['SETTLEMENT', 'OPERATOR_FEES'],
    verificationRequirements: ['GOVERNMENT_ID', 'BUSINESS_REGISTRATION', 'OPERATIONAL_LICENSE'],
    canViewTeamTree: false,
    canViewCommissionBreakdown: true,
    hasSettlementControls: true,
  },
};

/**
 * Get configuration for a specific member type
 */
export function getMemberTypeConfig(memberType) {
  return memberTypeConfig[memberType] || memberTypeConfig.GENERAL_MEMBER;
}

/**
 * Filter opportunities based on member type
 */
export function filterOpportunitiesByMemberType(opportunities, memberType) {
  const config = getMemberTypeConfig(memberType);
  return opportunities.filter((opp) => config.opportunityTypes.includes(opp.type));
}

/**
 * Filter earnings based on member type
 */
export function filterEarningsByMemberType(earnings, memberType) {
  const config = getMemberTypeConfig(memberType);
  return earnings.filter((e) => config.earningsSources.includes(e.type));
}

/**
 * Get dashboard metrics for member type
 */
export function getDashboardMetricsForMemberType(memberType, memberData) {
  const config = getMemberTypeConfig(memberType);
  const metrics = [];

  for (const metric of config.dashboardMetrics) {
    switch (metric) {
      case 'balance':
        metrics.push({ label: 'AUREX Balance', value: memberData?.wallet?.balance || 0, unit: 'ARX' });
        break;
      case 'tier':
        metrics.push({ label: 'Current Tier', value: memberData?.tier?.name || 'Member' });
        break;
      case 'earnings':
        metrics.push({ label: 'Total Earnings', value: memberData?.totalEarnings || 0, unit: 'ARX' });
        break;
      case 'notifications':
        metrics.push({ label: 'Notifications', value: memberData?.notificationCount || 0 });
        break;
      case 'purchases':
        metrics.push({ label: 'Purchases This Month', value: memberData?.monthlyPurchases || 0 });
        break;
      case 'activeReferrals':
        metrics.push({ label: 'Active Referrals', value: memberData?.activeReferrals || 0 });
        break;
      case 'commissions':
        metrics.push({ label: 'Commission Earned', value: memberData?.commissionBalance || 0, unit: 'ARX' });
        break;
      case 'apiCalls':
        metrics.push({ label: 'API Calls (30d)', value: memberData?.apiCallsThisMonth || 0 });
        break;
      case 'equity':
        metrics.push({ label: 'Equity Stake', value: memberData?.equityPercentage || 0, unit: '%' });
        break;
      case 'investments':
        metrics.push({ label: 'Active Investments', value: memberData?.activeInvestments || 0 });
        break;
      default:
        break;
    }
  }

  return metrics;
}

/**
 * Check if member has access to a capability
 */
export function hasMemberCapability(memberType, capability) {
  const config = getMemberTypeConfig(memberType);
  return config[capability] === true;
}
