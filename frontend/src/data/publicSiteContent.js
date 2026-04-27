import {
  HiUserGroup,
  HiShieldCheck,
  HiCurrencyDollar,
  HiGlobe,
  HiBriefcase,
  HiChip,
  HiLightningBolt,
  HiAcademicCap,
  HiOfficeBuilding,
  HiCollection,
  HiBadgeCheck,
  HiLockClosed,
  HiSparkles,
  HiCash,
  HiPaperAirplane,
  HiViewGrid,
  HiChevronRight,
  HiDocumentText,
  HiLibrary,
} from 'react-icons/hi';

export const publicNav = [
  { label: 'Membership', route: '/membership' },
  { label: 'Tiers', route: '/tiers' },
  { label: 'Founding', route: '/founding' },
  { label: 'Opportunities', route: '/opportunities' },
  { label: 'Partners', route: '/partners' },
  { label: 'Rewards', route: '/rewards' },
  { label: 'Verification', route: '/verification' },
];

export const pageCopy = {
  '/': {
    title: 'AUREON9 - Membership, Identity and Rewards Infrastructure',
    intro: 'Public website and pre-login experience defined by the master plan and wireframe system.',
  },
  '/membership': {
    title: 'Membership Overview',
    intro: 'AUREON9 is positioned as the membership, identity, verification, rewards, and participation control layer across the ecosystem.',
  },
  '/tiers': {
    title: 'Membership Tiers',
    intro: 'The baseline tier system runs from Entry through Sovereign and evaluates participants across qualification, activity, and governance logic.',
  },
  '/founding': {
    title: 'Founding Member Program',
    intro: 'The founding program is part of the public website structure and aligns membership standing, rewards, upgrade paths, and governance obligations.',
  },
  '/opportunities': {
    title: 'Opportunities',
    intro: 'Public opportunity pages introduce controlled tracks before users move into gated dashboard access.',
  },
  '/partners': {
    title: 'Partner Programs',
    intro: 'Partner programs sit inside the public website and connect acquisition, qualification, referrals, and operator participation.',
  },
  '/rewards': {
    title: 'Rewards System',
    intro: 'The rewards page explains what participants can earn, how AUREX connects, and how controls prevent abuse.',
  },
  '/verification': {
    title: 'Verification and Trust Layer',
    intro: 'Verification is central to trust, access, and participant authorization inside AUREON9.',
  },
  '/request-access': {
    title: 'Request Access',
    intro: 'The website CTA leads here before registration, verification, and dashboard access.',
  },
  '/login': {
    title: 'Dashboard Access',
    intro: 'Authentication is a separate page set in the wireframe system.',
  },
  '/register': {
    title: 'Register',
    intro: 'Registration begins the documented member lifecycle.',
  },
  '/forgot-password': {
    title: 'Forgot Password',
    intro: 'Password recovery belongs to the pre-login authentication surface.',
  },
  '/verification-pending': {
    title: 'Verification Pending',
    intro: 'This state communicates that access is waiting on verification progress.',
  },
};

export const authContent = {
  '/login': { title: 'Dashboard Access', primaryLabel: 'Login' },
  '/register': { title: 'Register', primaryLabel: 'Create Account' },
  '/forgot-password': { title: 'Forgot Password', primaryLabel: 'Send Reset Link' },
  '/verification-pending': { title: 'Verification Pending', primaryLabel: 'Back to Login' },
};

export const systemPillars = [
  'Membership Layer',
  'Identity Layer',
  'Verification Layer',
  'Access Control Layer',
  'Rewards and Incentive Layer',
  'Participation Authorization Layer',
];

export const coreObjectives = [
  'Identify every participant',
  'Classify them into structured roles',
  'Verify legitimacy and capability',
  'Control access and permissions',
  'Enable participation in ecosystem activities',
  'Reward behavior and performance',
  'Track all activity as data',
  'Integrate with ODIECLOUD ecosystem profit centers',
];

export const participantClasses = [
  'Founding Members', 'General Members', 'Customers / Buyers / Users', 'Channel Partners (AAL)', 'Affiliates / Promoters',
  'Developers', 'Interns', 'Equity Affiliates', 'Equity Partners', 'Strategic Partners', 'OEM / White-label Partners',
  'Trade Operators', 'Capital Participants', 'Verification and Compliance Actors', 'Settlement Participants (AUREX)',
  'Institutional Participants', 'Third-Party Operators',
];

export const participantClassOptions = [
  { value: 'FOUNDING_MEMBER', label: 'Founding Member' },
  { value: 'GENERAL_MEMBER', label: 'General Member' },
  { value: 'CUSTOMER', label: 'Customer / Buyer / User' },
  { value: 'CHANNEL_PARTNER', label: 'Channel Partner (AAL)' },
  { value: 'AFFILIATE', label: 'Affiliate / Promoter' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'EQUITY_AFFILIATE', label: 'Equity Affiliate' },
  { value: 'EQUITY_PARTNER', label: 'Equity Partner' },
  { value: 'STRATEGIC_PARTNER', label: 'Strategic Partner' },
  { value: 'OEM_PARTNER', label: 'OEM / White-label Partner' },
  { value: 'TRADE_OPERATOR', label: 'Trade Operator' },
  { value: 'CAPITAL_PARTICIPANT', label: 'Capital Participant' },
  { value: 'VERIFICATION_ACTOR', label: 'Verification and Compliance Actor' },
  { value: 'SETTLEMENT_PARTICIPANT', label: 'Settlement Participant (AUREX)' },
  { value: 'INSTITUTIONAL_PARTICIPANT', label: 'Institutional Participant' },
  { value: 'THIRD_PARTY_OPERATOR', label: 'Third-Party Operator' },
];

export const tiers = [
  { name: 'Entry', text: 'Starting point for identity, onboarding, and baseline access.' },
  { name: 'Associate', text: 'Progression through qualification, activity, and compliance logic.' },
  { name: 'Certified', text: 'Certification-backed participation with stronger platform privileges.' },
  { name: 'Executive', text: 'Higher-trust access rights, entitlements, and visibility.' },
  { name: 'Strategic', text: 'Broader strategic participation across ecosystem activities.' },
  { name: 'Founding', text: 'Founding-aligned status with founding rewards and elevated standing.' },
  { name: 'Sovereign', text: 'Top baseline tier for governance-aligned authority and access.' },
];

export const homeTierCards = ['Entry', 'Certified', 'Executive', 'Strategic', 'Founding', 'Sovereign'];
export const tierLogic = ['Qualification criteria', 'Revenue thresholds where applicable', 'Activity thresholds', 'Certification requirements', 'Governance compliance score', 'Time-based progression rules'];
export const tierOutputs = ['Access rights', 'Platform privileges', 'Revenue entitlements', 'Reward multipliers', 'Visibility and status ranking'];

export const ecosystemLinks = [
  { name: 'ODIEBOARD', label: 'Governance',      icon: HiOfficeBuilding, text: 'Source governance, organizational control, and enforceable oversight.' },
  { name: 'AAL',       label: 'Sales Engine',    icon: HiUserGroup,      text: 'Participant acquisition, channel expansion, and referral-led growth.' },
  { name: 'ODIEXA',   label: 'Marketplace',     icon: HiBriefcase,      text: 'Marketplace participation, partner pathways, and controlled opportunities.' },
  { name: 'AUREX',    label: 'Settlement Layer', icon: HiCash,           text: 'Wallet creation, reward settlement, commission payouts, and treasury-linked flows.' },
  { name: 'Oπ',       label: 'Technology',      icon: HiChip,           text: 'Platform logic, developer access, and infrastructure participation.' },
];

export const verificationLevels = ['Unverified', 'Basic Verified', 'Identity Verified (KYC)', 'Commercial Verified', 'Institutional Verified', 'Capital Verified', 'Governance Approved'];
export const verificationDocuments = ['ID', 'Business registration', 'Financial statements', 'Contracts', 'Certifications'];
export const verificationWorkflow = ['Automated checks', 'Manual review by Division 7', 'Escalation protocols'];
export const verificationFlags = ['Fraud indicators', 'Incomplete compliance', 'Suspended status'];

export const partnerPrograms = [
  { title: 'AAL Growth Programs', flow: 'Join -> Certification -> Referral Links -> Earnings Tracking', items: ['Channel Partners', 'Affiliates / Promoters', 'Equity Affiliates'] },
  { title: 'Strategic and Equity Programs', flow: 'Apply -> Review -> Qualification -> Controlled ecosystem access', items: ['Equity Partners', 'Strategic Partners', 'Institutional Participants'] },
  { title: 'Operator Programs', flow: 'Operational onboarding -> Verification -> Scoped participation', items: ['OEM / White-label Partners', 'Trade Operators', 'Third-Party Operators'] },
];

export const rewardTypes = ['AUREX (ARX) rewards', 'Commission-based rewards', 'Referral bonuses', 'Performance bonuses', 'Tier-based multipliers', 'Loyalty rewards', 'Activity rewards', 'Founding rewards', 'Ecosystem contribution rewards'];
export const rewardControls = ['Reward triggers', 'Calculation formulas', 'Distribution logic', 'Expiry rules', 'Anti-abuse controls'];
export const aurexIntegration = ['Wallet creation', 'Reward settlement', 'Commission payouts', 'Capital participation flows', 'Fee deductions', 'Treasury oversight'];

export const opportunities = [
  { title: 'Trade',   icon: HiCollection,    text: 'Controlled marketplace and trade participation through ODIEXA pathways.' },
  { title: 'Capital', icon: HiCash,          text: 'Capital participant flows with due diligence, approval, and deal access.' },
  { title: 'Travel',  icon: HiPaperAirplane, text: 'Travel and tour pathways listed in the opportunity module scope.' },
  { title: 'Tech',    icon: HiChip,          text: 'Technology and infrastructure-linked participation inside the ecosystem.' },
];

export const opportunityRules = ['PUBLIC', 'VERIFIED_ONLY', 'CERTIFIED_PLUS', 'EXECUTIVE_PLUS', 'STRATEGIC_PLUS', 'INVITE_ONLY'];

export const publicIcons = {
  HiBadgeCheck,
  HiChevronRight,
  HiCash,
  HiDocumentText,
  HiViewGrid,
  HiLockClosed,
  HiShieldCheck,
  HiSparkles,
  HiUserGroup,
  HiLibrary,
  HiAcademicCap,
  HiLightningBolt,
  HiGlobe,
  HiCurrencyDollar,
};
