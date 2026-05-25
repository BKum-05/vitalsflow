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
  createDefaultAccountData,
  loginAccount,
  loadAccountData,
  logoutAccount,
  registerAccount,
  watchAuth,
  saveAccountData,
  AccountUser,
} from './lib/accountStorage';
import { initialInsights, initialPatterns } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [readings, setReadings] = useState<VitalsReading[]>([]);
  const [medications, setMedications] = useState<Medication[]>(createDefaultAccountData().medications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AccountUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = watchAuth(async (user) => {
      if (!isMounted) {
        return;
      }

      if (!user) {
        setCurrentUser(null);
        setReadings([]);
        setMedications(createDefaultAccountData().medications);
        setIsAppReady(true);
        return;
      }

      setCurrentUser(user);
      const accountData = await loadAccountData(user.uid);
      if (!isMounted) {
        return;
      }

      setReadings(accountData.readings);
      setMedications(accountData.medications);
      setIsAppReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      void saveAccountData(currentUser.uid, { readings, medications });
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
      const user =
        mode === 'register'
          ? await registerAccount(email, password, displayName)
          : await loginAccount(email, password);

      setCurrentUser(user);
      const accountData = await loadAccountData(user.uid);
      setReadings(accountData.readings);
      setMedications(accountData.medications);
      setToastMessage(
        mode === 'register'
          ? `Account created for ${user.displayName}.`
          : `Welcome back, ${user.displayName}.`
      );
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

    clearAccountData(currentUser.uid);
    const freshData = createDefaultAccountData();
    setReadings(freshData.readings);
    setMedications(freshData.medications);
    setToastMessage('This account has been reset to a fresh start.');
  };

  const handleSignOut = async () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    if (currentUser) {
      await saveAccountData(currentUser.uid, { readings, medications });
    }

    await logoutAccount();
    setShowSignOutConfirm(false);
    setCurrentUser(null);
    setReadings([]);
    setMedications(createDefaultAccountData().medications);
    setIsQuickLogOpen(false);
    setActiveTab('dashboard');
    setToastMessage('Signed out.');
  };

  const cancelSignOut = () => {
    setShowSignOutConfirm(false);
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

      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0a0a0c] shadow-[0_30px_80px_rgba(0,0,0,0.65)] p-6">
            <h2 className="text-xl font-bold text-white">Sign out?</h2>
            <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed">
              Your current session will close. Any recent changes will be saved before you leave.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelSignOut}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmSignOut()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white text-sm font-semibold hover:opacity-95 transition-opacity"
              >
                Sign out
              </button>
            </div>
          </div>
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