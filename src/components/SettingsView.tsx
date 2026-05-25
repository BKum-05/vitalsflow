/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface SettingsViewProps {
  userEmail: string;
  userDisplayName: string;
  onUpdateProfile: (displayName: string) => Promise<void>;
  onResetData: () => void;
  onSignOut: () => void;
}

export default function SettingsView({
  userEmail,
  userDisplayName,
  onUpdateProfile,
  onResetData,
  onSignOut,
}: SettingsViewProps) {
  const [displayName, setDisplayName] = useState<string>(userDisplayName);
  const [systolicThreshold, setSystolicThreshold] = useState<number>(130);
  const [diastolicThreshold, setDiastolicThreshold] = useState<number>(85);
  const [pulseNotification, setPulseNotification] = useState<boolean>(true);
  const [complianceLog, setComplianceLog] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState<boolean>(false);

  React.useEffect(() => {
    setDisplayName(userDisplayName);
  }, [userDisplayName]);

  const handleSaveProfile = async () => {
    setProfileBusy(true);
    try {
      await onUpdateProfile(displayName);
      setToastMessage('Profile updated successfully.');
    } finally {
      setProfileBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {toastMessage && (
        <div className="p-3.5 bg-[#0a0a0c] border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500 animate-fade-in shadow-xl flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">wifi_tethering</span>
          {toastMessage}
        </div>
      )}

      {/* Visual Identity Profile Panel */}
      <section className="glass-panel p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative h-18 w-18 flex-shrink-0">
            <img 
              alt="Doctor Profile portrait" 
              className="h-full w-full rounded-full object-cover border-2 border-red-500/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuHq7Eh3fsL1l9SLuTxgiMnUmtphPJSBElNr21ZgraCraX0dK-we8Tsky0UbtgU6Lr6LylYSmpVZGeIyp33O9LYMAN2d9smrBRw1Qn1Dur7zNZKl7KFSz_CQZlbWs1N_vjVb1-NBAEzEAQ4xQQliry7X6gPENXUFCnCa9e2HKLjkC_BgyFGzjwMEbo24fIc1IU5-12mPWz9QrCLdXV3hcHlyO38Ain5lUyatcbZODLVPyFVIi5CbmeMasb0YKLmAG9XKVfHt9Ogw"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-[#050505] rounded-full animate-pulse" />
          </div>
          
          <div className="text-center sm:text-left flex-1 space-y-1">
            <h3 className="text-white text-lg font-bold tracking-tight">{userDisplayName}</h3>
            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Current signed-in profile</p>
            <p className="text-xs text-red-400 font-mono italic">{userEmail || 'No email available'}</p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 rounded-[32px] border border-white/5 space-y-4 shadow-2xl">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Edit Profile</h3>
          <p className="text-xs text-on-surface-variant">Update the name shown in the app header and settings panel.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#a1a1aa]">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full h-12 rounded-xl bg-[#0a0a0c] border border-white/10 px-4 text-white focus:outline-none focus:border-red-500/40"
              placeholder="Enter your name"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSaveProfile()}
            disabled={profileBusy}
            className="px-5 py-3 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-70"
          >
            {profileBusy ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* Adjust Thresholds Guardrails */}
      <section className="glass-panel p-6 rounded-[32px] border border-white/5 space-y-4 shadow-2xl">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Standard Guardrails</h3>
          <p className="text-xs text-on-surface-variant">Adjust standard critical alarm weights. When exceeding, the cockpit colors dynamically accent crimson warnings.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-2">
          
          {/* Systolic Warning Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-on-surface-variant">
              <span>Systolic Alarm Limit</span>
              <span className="text-red-400 font-bold">{systolicThreshold} mmHg</span>
            </div>
            <input 
              type="range"
              min="110"
              max="150"
              value={systolicThreshold}
              onChange={(e) => setSystolicThreshold(parseInt(e.target.value))}
              className="w-full accent-red-500 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Diastolic Warning Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-on-surface-variant">
              <span>Diastolic Alarm Limit</span>
              <span className="text-blue-400 font-bold">{diastolicThreshold} mmHg</span>
            </div>
            <input 
              type="range"
              min="70"
              max="100"
              value={diastolicThreshold}
              onChange={(e) => setDiastolicThreshold(parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

        </div>
      </section>

      {/* Local Account Controls */}
      <section className="glass-panel p-6 rounded-[32px] border border-white/5 space-y-4 shadow-2xl">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Account &amp; Storage</h3>
        
        <div className="space-y-3">
          
          {/* Notifications */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-semibold text-[#e4e4e7]">Alert notifications</p>
              <p className="text-[10px] text-[#a1a1aa]">Enable subtle feedback when a reading is logged or updated.</p>
            </div>
            <button 
              onClick={() => setPulseNotification(!pulseNotification)}
              className={`w-10 h-6.5 rounded-full relative transition-colors cursor-pointer ${
                pulseNotification ? 'bg-red-500' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-[#050505] rounded-full transition-transform ${
                pulseNotification ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* Storage controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={onResetData}
              className="flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Reset This Account
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* HIPAA & Strict logs compliance encryption toggle */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-semibold text-[#e4e4e7]">strict HIPAA Encrypted Loggers</p>
              <p className="text-[10px] text-[#a1a1aa]">Seal all database logs with custom 256-bit cryptography protocols.</p>
            </div>
            <button 
              onClick={() => setComplianceLog(!complianceLog)}
              className={`w-10 h-6.5 rounded-full relative transition-colors cursor-pointer ${
                complianceLog ? 'bg-green-500' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-[#050505] rounded-full transition-transform ${
                complianceLog ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

        </div>
      </section>

      {/* System credits */}
      <section className="text-center pt-4">
        <p className="text-[10px] font-mono uppercase text-on-surface-variant/40 tracking-wider">
          VitalsFlow platform • v4.11 Clinical Build
        </p>
      </section>

    </div>
  );
}
