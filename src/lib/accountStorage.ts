/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initialMedications } from '../data';
import { Medication, VitalsReading } from '../types';

export interface StoredAccount {
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

export interface AccountData {
  readings: VitalsReading[];
  medications: Medication[];
}

const ACCOUNTS_KEY = 'vitalsflow.accounts';
const SESSION_KEY = 'vitalsflow.session';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getAccountDataKey = (email: string) => `vitalsflow.account.${normalizeEmail(email)}.data`;

export const createDefaultAccountData = (): AccountData => ({
  readings: [],
  medications: initialMedications.map((medication) => ({ ...medication })),
});

export const hashPassword = async (password: string) => {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const loadAccounts = (): Record<string, StoredAccount> => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAccount>) : {};
  } catch {
    return {};
  }
};

export const saveAccounts = (accounts: Record<string, StoredAccount>) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const loadSessionEmail = () => {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

export const saveSessionEmail = (email: string) => {
  localStorage.setItem(SESSION_KEY, email);
};

export const clearSessionEmail = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const loadAccountData = (email: string): AccountData => {
  try {
    const raw = localStorage.getItem(getAccountDataKey(email));
    if (!raw) {
      return createDefaultAccountData();
    }

    const parsed = JSON.parse(raw) as Partial<AccountData>;
    return {
      readings: Array.isArray(parsed.readings) ? parsed.readings : [],
      medications: Array.isArray(parsed.medications) && parsed.medications.length > 0
        ? parsed.medications
        : createDefaultAccountData().medications,
    };
  } catch {
    return createDefaultAccountData();
  }
};

export const saveAccountData = (email: string, data: AccountData) => {
  localStorage.setItem(getAccountDataKey(email), JSON.stringify(data));
};

export const clearAccountData = (email: string) => {
  localStorage.removeItem(getAccountDataKey(email));
};