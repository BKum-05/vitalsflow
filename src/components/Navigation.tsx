/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickLog: () => void;
}

export default function Navigation({ activeTab, onTabChange, onOpenQuickLog }: NavigationProps) {
  // Nav items list
  const navItems = [
    { id: 'dashboard' as ActiveTab, icon: 'dashboard', label: 'Dashboard' },
    { id: 'trends' as ActiveTab, icon: 'show_chart', label: 'Trends' },
    { id: 'insights' as ActiveTab, icon: 'insights', label: 'Insights' },
    { id: 'settings' as ActiveTab, icon: 'settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Side Navigation Rail */}
      <aside className="hidden md:flex flex-col z-40 fixed left-0 top-0 h-full w-20 items-center py-8 border-r border-white/5 bg-[#0a0a0a] backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="mb-10 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <span 
            className="material-symbols-outlined text-primary text-4xl hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}
          >
            clinical_notes
          </span>
        </div>
        
        <nav className="flex flex-col gap-8 items-center flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative p-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'text-primary drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] scale-110' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
                }`}
                title={item.label}
              >
                <span 
                  className="material-symbols-outlined text-[26px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                
                {/* Popover/tooltip on hover */}
                <span className="absolute left-20 ml-2 py-1 px-2.5 rounded-md bg-[#18181b] text-on-surface text-xs font-medium tracking-wide border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-50 shadow-md">
                  {item.label}
                </span>
                
                {isActive && (
                  <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r-md bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto">
          <div className="relative group cursor-pointer" onClick={() => onTabChange('settings')}>
            <img 
              alt="Doctor Profile Avatar" 
              className="w-10 h-10 rounded-full border border-primary/30 group-hover:border-primary/80 transition-colors" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuHq7Eh3fsL1l9SLuTxgiMnUmtphPJSBElNr21ZgraCraX0dK-we8Tsky0UbtgU6Lr6LylYSmpVZGeIyp33O9LYMAN2d9smrBRw1Qn1Dur7zNZKl7KFSz_CQZlbWs1N_vjVb1-NBAEzEAQ4xQQliry7X6gPENXUFCnCa9e2HKLjkC_BgyFGzjwMEbo24fIc1IU5-12mPWz9QrCLdXV3hcHlyO38Ain5lUyatcbZODLVPyFVIi5CbmeMasb0YKLmAG9XKVfHt9Ogw"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary border border-2 border-[#050505] rounded-full animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive ? 'text-primary scale-105' : 'text-on-surface-variant active:bg-[#18181b]'
              }`}
            >
              <span 
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wide mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Floating Action Button for Mobile Logging */}
      <button 
        id="mobile-quick-log-btn"
        onClick={onOpenQuickLog}
        className="fixed bottom-20 right-6 md:hidden w-14 h-14 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform z-40 bg-gradient-to-tr from-red-500 to-rose-600 shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
        title="Quick Log Vitals"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>
    </>
  );
}
