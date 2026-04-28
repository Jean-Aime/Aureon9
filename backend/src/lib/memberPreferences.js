import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const preferencesPath = path.resolve(dataDir, 'member-preferences.json');

const defaultPreference = {
  emailNotifications: true,
  twoFactorEnabled: false,
  linkedGoogle: false,
  linkedLinkedIn: false,
};

async function ensurePreferencesFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(preferencesPath);
  } catch {
    await fs.writeFile(preferencesPath, JSON.stringify({}, null, 2), 'utf8');
  }
}

async function readAllPreferences() {
  await ensurePreferencesFile();
  const raw = await fs.readFile(preferencesPath, 'utf8');
  const parsed = JSON.parse(raw || '{}');
  return parsed && typeof parsed === 'object' ? parsed : {};
}

async function writeAllPreferences(data) {
  await ensurePreferencesFile();
  await fs.writeFile(preferencesPath, JSON.stringify(data, null, 2), 'utf8');
}

function normalize(input) {
  return {
    emailNotifications: Boolean(input?.emailNotifications),
    twoFactorEnabled: Boolean(input?.twoFactorEnabled),
    linkedGoogle: Boolean(input?.linkedGoogle),
    linkedLinkedIn: Boolean(input?.linkedLinkedIn),
  };
}

export async function getMemberPreferences(memberProfileId) {
  const all = await readAllPreferences();
  return {
    ...defaultPreference,
    ...(all[memberProfileId] || {}),
  };
}

export async function saveMemberPreferences(memberProfileId, preferenceInput) {
  const all = await readAllPreferences();
  const normalized = normalize(preferenceInput);
  all[memberProfileId] = normalized;
  await writeAllPreferences(all);
  return normalized;
}
