/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export type AuthMode = 'login' | 'register';

interface AuthSubmitPayload {
  mode: AuthMode;
  displayName: string;
  email: string;
  password: string;
}

interface AuthScreenProps {
  onSubmit: (payload: AuthSubmitPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthScreen({ onSubmit, loading, error }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%)]" />
      <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[360px] h-[360px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg glass-panel rounded-[32px] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.35)]">
            <span className="material-symbols-outlined text-white">favorite</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">VitalsFlow</h1>
            <p className="text-xs uppercase tracking-[0.28em] text-[#a1a1aa]">Local account access</p>
          </div>
        </div>

        <div className="flex rounded-2xl bg-[#0a0a0c] border border-white/5 p-1 mb-6">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                mode === item ? 'bg-gradient-to-tr from-red-500 to-rose-600 text-white' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {item === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit({
              mode,
              displayName,
              email,
              password,
            });
          }}
        >
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#a1a1aa]">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full h-12 rounded-xl bg-[#0a0a0c] border border-white/10 px-4 text-white focus:outline-none focus:border-red-500/40"
                placeholder="Dr. Aris"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#a1a1aa]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full h-12 rounded-xl bg-[#0a0a0c] border border-white/10 px-4 text-white focus:outline-none focus:border-red-500/40"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#a1a1aa]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full h-12 rounded-xl bg-[#0a0a0c] border border-white/10 px-4 text-white focus:outline-none focus:border-red-500/40"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? 'Working...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-[#a1a1aa] leading-relaxed">
          Accounts are stored locally on this device. If you want shared access across devices later, Firebase is the better next step.
        </p>
      </div>
    </div>
  );
}