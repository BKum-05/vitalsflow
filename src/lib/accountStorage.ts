/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initialMedications } from '../data';
import { Medication, VitalsReading } from '../types';
import {
  createUserWithEmailAndPassword,
  doc,
  firebaseAuth,
  firebaseEnabled,
  firestoreDb,
  getDoc,
  onAuthStateChanged,
  serverTimestamp,
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from './firebase';

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

export interface AccountUser {
  uid: string;
  email: string;
  displayName: string;
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

const readLocalAccountData = (email: string): AccountData => {
  try {
    const raw = localStorage.getItem(getAccountDataKey(email));
    if (!raw) {
      return createDefaultAccountData();
    }

    const parsed = JSON.parse(raw) as Partial<AccountData>;
    return {
      readings: Array.isArray(parsed.readings) ? parsed.readings : [],
      medications:
        Array.isArray(parsed.medications) && parsed.medications.length > 0
          ? parsed.medications
          : createDefaultAccountData().medications,
    };
  } catch {
    return createDefaultAccountData();
  }
};

const saveLocalAccountData = (email: string, data: AccountData) => {
  localStorage.setItem(getAccountDataKey(email), JSON.stringify(data));
};

export const clearAccountData = (email: string) => {
  localStorage.removeItem(getAccountDataKey(email));
};

const getUserDocRef = (uid: string) => {
  if (!firestoreDb) {
    throw new Error('Firestore is not available.');
  }

  return doc(firestoreDb, 'users', uid);
};

const getAccountDocRef = (uid: string) => {
  if (!firestoreDb) {
    throw new Error('Firestore is not available.');
  }

  return doc(firestoreDb, 'users', uid, 'appData', 'current');
};

const mapFirebaseUser = async (firebaseUser: User): Promise<AccountUser> => {
  const profileSnapshot = firestoreDb ? await getDoc(getUserDocRef(firebaseUser.uid)) : null;
  const profileData = profileSnapshot?.exists() ? profileSnapshot.data() : null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? (profileData?.email as string) ?? '',
    displayName:
      firebaseUser.displayName ??
      (profileData?.displayName as string) ??
      (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
  };
};

export const watchAuth = (callback: (user: AccountUser | null) => void) => {
  if (!firebaseEnabled || !firebaseAuth) {
    queueMicrotask(() => {
      const sessionEmail = loadSessionEmail();
      if (!sessionEmail) {
        callback(null);
        return;
      }

      const accounts = loadAccounts();
      const storedAccount = accounts[normalizeEmail(sessionEmail)];
      if (!storedAccount) {
        clearSessionEmail();
        callback(null);
        return;
      }

      callback({
        uid: storedAccount.email,
        email: storedAccount.email,
        displayName: storedAccount.displayName,
      });
    });

    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    void mapFirebaseUser(firebaseUser)
      .then((user) => callback(user))
      .catch(() => {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
        });
      });
  });
};

export const registerAccount = async (email: string, password: string, displayName: string): Promise<AccountUser> => {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = displayName.trim() || normalizedEmail.split('@')[0];

  if (firebaseEnabled && firebaseAuth && firestoreDb) {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    await updateProfile(credential.user, { displayName: trimmedName });

    const initialData = createDefaultAccountData();
    await setDoc(
      getUserDocRef(credential.user.uid),
      {
        uid: credential.user.uid,
        email: normalizedEmail,
        displayName: trimmedName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      getAccountDocRef(credential.user.uid),
      {
        email: normalizedEmail,
        displayName: trimmedName,
        readings: initialData.readings,
        medications: initialData.medications,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      uid: credential.user.uid,
      email: normalizedEmail,
      displayName: trimmedName,
    };
  }

  const accounts = loadAccounts();
  if (accounts[normalizedEmail]) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  accounts[normalizedEmail] = {
    email: normalizedEmail,
    displayName: trimmedName,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  saveAccounts(accounts);
  saveSessionEmail(normalizedEmail);

  const initialData = createDefaultAccountData();
  saveLocalAccountData(normalizedEmail, initialData);

  return {
    uid: normalizedEmail,
    email: normalizedEmail,
    displayName: trimmedName,
  };
};

export const loginAccount = async (email: string, password: string): Promise<AccountUser> => {
  const normalizedEmail = normalizeEmail(email);

  if (firebaseEnabled && firebaseAuth) {
    const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    return {
      uid: credential.user.uid,
      email: credential.user.email ?? normalizedEmail,
      displayName: credential.user.displayName ?? normalizedEmail.split('@')[0],
    };
  }

  const accounts = loadAccounts();
  const account = accounts[normalizedEmail];
  if (!account) {
    throw new Error('Invalid email or password.');
  }

  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }

  saveSessionEmail(normalizedEmail);

  return {
    uid: account.email,
    email: account.email,
    displayName: account.displayName,
  };
};

export const logoutAccount = async () => {
  if (firebaseEnabled && firebaseAuth) {
    await signOut(firebaseAuth);
    return;
  }

  clearSessionEmail();
};

export const loadAccountData = async (uid: string): Promise<AccountData> => {
  if (firebaseEnabled && firestoreDb) {
    const snapshot = await getDoc(getAccountDocRef(uid));
    if (!snapshot.exists()) {
      return createDefaultAccountData();
    }

    const data = snapshot.data() as Partial<AccountData>;
    return {
      readings: Array.isArray(data.readings) ? data.readings : [],
      medications:
        Array.isArray(data.medications) && data.medications.length > 0
          ? data.medications
          : createDefaultAccountData().medications,
    };
  }

  return readLocalAccountData(uid);
};

export const saveAccountData = async (uid: string, data: AccountData) => {
  if (firebaseEnabled && firestoreDb) {
    await setDoc(
      getAccountDocRef(uid),
      {
        readings: data.readings,
        medications: data.medications,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return;
  }

  saveLocalAccountData(uid, data);
};

export const resetAccountData = async (uid: string) => {
  const freshData = createDefaultAccountData();

  if (firebaseEnabled && firestoreDb) {
    await setDoc(
      getAccountDocRef(uid),
      {
        readings: freshData.readings,
        medications: freshData.medications,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return freshData;
  }

  saveLocalAccountData(uid, freshData);
  return freshData;
};