import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const configPath = path.resolve(dataDir, 'admin-panel-config.json');

const defaultConfig = {
  channels: [
    { channel: 'EMAIL', enabled: true, provider: 'Primary SMTP', retryWindowMinutes: 30, mode: 'PRIMARY' },
    { channel: 'IN_APP', enabled: true, provider: 'Native Feed', retryWindowMinutes: 0, mode: 'PRIMARY' },
    { channel: 'WHATSAPP', enabled: false, provider: 'Reserved', retryWindowMinutes: 30, mode: 'DISABLED' },
    { channel: 'SMS', enabled: false, provider: 'Reserved', retryWindowMinutes: 30, mode: 'DISABLED' },
  ],
  templates: [
    { code: 'DOCUMENT_UPLOAD_RECEIVED', channel: 'EMAIL', active: true, owner: 'LEGAL_COMPLIANCE' },
    { code: 'DOCUMENT_REQUESTED_MORE', channel: 'EMAIL', active: true, owner: 'LEGAL_COMPLIANCE' },
    { code: 'REVIEW_APPROVED', channel: 'IN_APP', active: true, owner: 'CUSTOMER_SUCCESS' },
    { code: 'REVIEW_ESCALATED', channel: 'EMAIL', active: true, owner: 'EXECUTIVE' },
    { code: 'REVIEWER_REMINDER_DUE', channel: 'IN_APP', active: true, owner: 'QUALIFICATIONS' },
  ],
  timers: {
    reviewerReminderHours: 24,
    memberFollowUpHours: 48,
    escalationAgingHours: 48,
    failedRetryWindowMinutes: 30,
  },
  retryPolicy: {
    maxRetries: 3,
    strategy: 'EXPONENTIAL_BACKOFF',
  },
  rewardRules: {
    purchaseRewardPercent: 5,
    sellerCommissionPercent: 2,
    referrerCommissionPercent: 1,
    referralSignupBonus: 10,
    tierMultipliers: {
      MEMBER: 1,
      ASSOCIATE: 1.1,
      CERTIFIED: 1.2,
      EXECUTIVE: 1.3,
      STRATEGIC: 1.5,
      FOUNDING: 2,
      SOVEREIGN: 2.5,
    },
  },
  deliveryRules: {
    approvalAfterCommit: true,
    escalationCopiesExecutive: true,
    preserveRejectionNotes: true,
  },
  escalationRules: {
    autoEscalateCapitalParticipants: true,
    autoEscalateStrategicPartners: true,
    autoEscalateInstitutionalParticipants: true,
    autoEscalateMissingDocuments: true,
    autoEscalateOver72Hours: false,
    escalationThresholdHours: 72,
  },
};

function normalizeMode(value) {
  const mode = String(value || '').toUpperCase();
  return ['PRIMARY', 'FALLBACK', 'DISABLED'].includes(mode) ? mode : 'DISABLED';
}

function normalizeChannel(value) {
  const channel = String(value || '').toUpperCase();
  return ['EMAIL', 'IN_APP', 'WHATSAPP', 'SMS'].includes(channel) ? channel : null;
}

function normalizeOwner(value) {
  const owner = String(value || '').toUpperCase();
  return owner || 'SUPER_ADMIN';
}

export async function ensurePanelConfig() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(configPath);
  } catch {
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
  }
}

export async function loadPanelConfig() {
  await ensurePanelConfig();
  const raw = await fs.readFile(configPath, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    channels: Array.isArray(parsed.channels) ? parsed.channels : defaultConfig.channels,
    templates: Array.isArray(parsed.templates) ? parsed.templates : defaultConfig.templates,
    timers: parsed.timers || defaultConfig.timers,
    retryPolicy: parsed.retryPolicy || defaultConfig.retryPolicy,
    rewardRules: parsed.rewardRules || defaultConfig.rewardRules,
    deliveryRules: parsed.deliveryRules || defaultConfig.deliveryRules,
    escalationRules: parsed.escalationRules || defaultConfig.escalationRules,
  };
}

export async function savePanelConfig(config) {
  await ensurePanelConfig();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

export async function updatePanelChannels(channels) {
  const config = await loadPanelConfig();
  config.channels = (Array.isArray(channels) ? channels : []).map((item) => ({
    channel: normalizeChannel(item.channel),
    enabled: Boolean(item.enabled),
    provider: String(item.provider || 'Reserved').trim() || 'Reserved',
    retryWindowMinutes: Number.isFinite(Number(item.retryWindowMinutes))
      ? Number(item.retryWindowMinutes)
      : 30,
    mode: normalizeMode(item.mode),
  })).filter((item) => item.channel);
  await savePanelConfig(config);
  return config;
}

export async function updatePanelTemplates(templates) {
  const config = await loadPanelConfig();
  config.templates = (Array.isArray(templates) ? templates : []).map((item) => {
    const channel = normalizeChannel(item.channel);
    const code = String(item.code || '').trim().toUpperCase();
    if (!channel || !code) {
      return null;
    }
    return {
      code,
      channel,
      active: Boolean(item.active),
      owner: normalizeOwner(item.owner),
    };
  }).filter(Boolean);
  await savePanelConfig(config);
  return config;
}

export async function updatePanelTimers(timers, retryPolicy) {
  const config = await loadPanelConfig();
  config.timers = {
    reviewerReminderHours: Number(timers?.reviewerReminderHours) || 24,
    memberFollowUpHours: Number(timers?.memberFollowUpHours) || 48,
    escalationAgingHours: Number(timers?.escalationAgingHours) || 48,
    failedRetryWindowMinutes: Number(timers?.failedRetryWindowMinutes) || 30,
  };
  config.retryPolicy = {
    maxRetries: Number(retryPolicy?.maxRetries) || 3,
    strategy: String(retryPolicy?.strategy || 'EXPONENTIAL_BACKOFF').toUpperCase(),
  };
  await savePanelConfig(config);
  return config;
}

export async function updateRewardRules(rewardRules) {
  const config = await loadPanelConfig();
  config.rewardRules = {
    ...defaultConfig.rewardRules,
    ...(rewardRules || {}),
    tierMultipliers: {
      ...defaultConfig.rewardRules.tierMultipliers,
      ...(rewardRules?.tierMultipliers || {}),
    },
  };
  await savePanelConfig(config);
  return config;
}

export async function updateDeliveryAndEscalationRules(deliveryRules, escalationRules) {
  const config = await loadPanelConfig();
  config.deliveryRules = {
    ...defaultConfig.deliveryRules,
    ...(deliveryRules || {}),
  };
  config.escalationRules = {
    ...defaultConfig.escalationRules,
    ...(escalationRules || {}),
  };
  await savePanelConfig(config);
  return config;
}
