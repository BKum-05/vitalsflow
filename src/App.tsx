/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveTab, Medication, VitalsReading } from './types';
import Navigation from './components/Navigation';
import MainDashboard from './components/MainDashboard';
import InsightsView from './components/InsightsView';
import TrendsDetailedView from './components/TrendsDetailedView';
import SettingsView from './components/SettingsView';
import QuickLogModal from './components/QuickLogModal';
import AuthScreen from './components/AuthScreen';
import {
  clearAccountData,
  clearSessionEmail,
  createDefaultAccountData,
  hashPassword,
  loadAccountData,
  loadAccounts,
  loadSessionEmail,
  normalizeEmail,
  saveAccountData,
  saveAccounts,
  saveSessionEmail,
  StoredAccount,
} from './lib/accountStorage';
import { initialInsights, initialPatterns } from './data';

interface CurrentUser {
  email: string;
  displayName: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [readings, setReadings] = useState<VitalsReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>(createDefaultAccountData().medications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  useEffect(() => {
    const sessionEmail = loadSessionEmail();

    if (sessionEmail) {
      const accounts = loadAccounts();
      const storedAccount = accounts[normalizeEmail(sessionEmail)];

      if (storedAccount) {
        setCurrentUser({
          email: storedAccount.email,
          displayName: storedAccount.displayName,
        });

        const accountData = loadAccountData(storedAccount.email);
        setReadings(accountData.readings);
        setMedications(accountData.medications);
      } else {
        clearSessionEmail();
      }
    }

    setIsAppReady(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      saveAccountData(currentUser.email, { readings, medications });
    }
  }, [currentUser, readings, medications]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleAuthenticate = async ({
    mode,
    displayName,
    email,
    password,
  }: {
    mode: 'login' | 'register';
    displayName: string;
    email: string;
    password: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const normalizedEmail = normalizeEmail(email);
      const accounts = loadAccounts();
      const passwordHash = await hashPassword(password);

      if (mode === 'register') {
        if (accounts[normalizedEmail]) {
          throw new Error('An account with this email already exists.');
        }

        const createdAccount: StoredAccount = {
          email: normalizedEmail,
          displayName: displayName.trim() || normalizedEmail.split('@')[0],
          passwordHash,
          createdAt: new Date().toISOString(),
        };

        accounts[normalizedEmail] = createdAccount;
        saveAccounts(accounts);
        saveSessionEmail(normalizedEmail);

        const initialData = createDefaultAccountData();
        saveAccountData(normalizedEmail, initialData);

        setCurrentUser({
          email: createdAccount.email,
          displayName: createdAccount.displayName,
        });
        setReadings(initialData.readings);
        setMedications(initialData.medications);
        setToastMessage(`Account created for ${createdAccount.displayName}.`);
        return;
      }

      const account = accounts[normalizedEmail];
      if (!account || account.passwordHash !== passwordHash) {
        throw new Error('Invalid email or password.');
      }

      saveSessionEmail(normalizedEmail);

      const accountData = loadAccountData(account.email);
      setCurrentUser({
        email: account.email,
        displayName: account.displayName,
      });
      setReadings(accountData.readings);
      setMedications(accountData.medications);
      setToastMessage(`Welcome back, ${account.displayName}.`);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to access the account.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveReading = (newReadingData: Omit<VitalsReading, 'id' | 'timestamp'>) => {
    const freshReading: VitalsReading = {
      ...newReadingData,
      id: `reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setReadings((previous) => [...previous, freshReading]);
    setIsQuickLogOpen(false);
    setToastMessage(`New vitals logged successfully: ${freshReading.systolic}/${freshReading.diastolic} mmHg • Pulse: ${freshReading.pulse} BPM.`);
  };

  const handleDeleteReading = (id: string) => {
    setReadings((previous) => previous.filter((reading) => reading.id !== id));
    setToastMessage('Vitals record removed from ledger.');
  };

  const handleToggleMedication = (id: string) => {
    setMedications((previous) =>
      previous.map((medication) => {
        if (medication.id === id) {
          const updatedTaken = !medication.taken;
          if (updatedTaken) {
            setToastMessage(`Medication marked as TAKEN: ${medication.name} ${medication.dosage}.`);
          }

          return { ...medication, taken: updatedTaken };
        }

        return medication;
      })
    );
  };

  const handleResetData = () => {
    if (!currentUser) {
      return;
    }

    clearAccountData(currentUser.email);
    const freshData = createDefaultAccountData();
    setReadings(freshData.readings);
    setMedications(freshData.medications);
    setToastMessage('This account has been reset to a fresh start.');
  };

  const handleSignOut = () => {
    if (currentUser) {
      saveAccountData(currentUser.email, { readings, medications });
    }

    clearSessionEmail();
    setCurrentUser(null);
    setReadings([]);
    setMedications(createDefaultAccountData().medications);
    setIsQuickLogOpen(false);
    setActiveTab('dashboard');
    setToastMessage('Signed out.');
  };

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-red-500 to-rose-600 animate-pulse" />
          <p className="text-xs uppercase tracking-[0.3em] text-[#a1a1aa]">Loading session</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onSubmit={handleAuthenticate}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-[#F9FAFB] font-sans pb-24 md:pb-6 relative selection:bg-red-500/20 overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[500px] h-[500px] bg-red-600/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full p-4 rounded-xl bg-[#0a0a0a]/90 border-l-4 border-primary text-xs shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 border border-white/10 backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">info</span>
            <span className="font-sans font-medium text-slate-100">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'instant' as any });
        }}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
      />

      <header className="sticky top-0 w-full z-30 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-4 md:pl-28 md:pr-12 py-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-red-500 to-rose-600 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.45)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl font-bold animate-pulse">favorite</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              VitalsFlow
            </h1>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#ef4444] font-semibold">
              Clinical Immersive Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-xs font-semibold text-white">Welcome, {currentUser.displayName}</span>
            <span className="text-[10px] text-on-surface-variant mt-0.5">{currentUser.email}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
          >
            Sign Out
          </button>

          <div className="hidden md:flex items-center gap-2.5 ml-2">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-xl">notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-xl">calendar_today</span>
          </div>
        </div>
      </header>

      <main className="md:pl-28 md:pr-12 px-4 pt-6 max-w-[1440px] mx-auto min-h-[80vh] relative z-10">
        {activeTab === 'dashboard' && (
          <MainDashboard
            readings={readings}
            medications={medications}
            insights={initialInsights}
            onToggleMedication={handleToggleMedication}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onSaveReading={handleSaveReading}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsDetailedView
            readings={readings}
            onDeleteReading={handleDeleteReading}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            patterns={initialPatterns}
            readings={readings}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            userEmail={currentUser.email}
            onResetData={handleResetData}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {isQuickLogOpen && (
        <QuickLogModal
          onClose={() => setIsQuickLogOpen(false)}
          onSaveReading={handleSaveReading}
        />
      )}
    </div>
  );
}