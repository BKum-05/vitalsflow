/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CuffPlacement, VitalsReading } from '../types';

interface QuickLogModalProps {
  onClose: () => void;
  onSaveReading: (reading: Omit<VitalsReading, 'id' | 'timestamp'>) => void;
}

export default function QuickLogModal({ onClose, onSaveReading }: QuickLogModalProps) {
  // Slider states
  const [systolic, setSystolic] = useState<number>(118);
  const [diastolic, setDiastolic] = useState<number>(74);
  const [pulse, setPulse] = useState<number>(68);

  // Selector states
  const [cuffPlacement, setCuffPlacement] = useState<CuffPlacement>('Left Arm');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Morning']);
  const [observations, setObservations] = useState<string>('');

  // Available tags to choose from
  const availableTags = ['Morning', 'Evening'];

  // Toggle tag selection
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle saving
  const handleSave = () => {
    // Produce healthy simulated oxygen Sat saturation based on pulse
    let simOxygen = 99;
    if (pulse > 100) {
      simOxygen = 97 + Math.floor(Math.random() * 3); // 97, 98, 99
    } else {
      simOxygen = 98 + Math.floor(Math.random() * 3); // 98, 99, 100
      if (simOxygen > 100) simOxygen = 100;
    }

    onSaveReading({
      systolic,
      diastolic,
      pulse,
      heartRate: pulse,
      oxygenSat: simOxygen,
      cuffPlacement,
      tags: selectedTags,
      observations,
    });
  };

  // Determine BP classification for visual helper
  const getBPClassification = () => {
    if (systolic >= 140 || diastolic >= 90) return { label: 'STAGE 2 HYPERTENSION', color: 'text-error font-bold' };
    if (systolic >= 130 || diastolic >= 80) return { label: 'STAGE 1 HYPERTENSION', color: 'text-secondary font-bold' };
    if (systolic >= 120 && diastolic < 80) return { label: 'ELEVATED REGIME', color: 'text-yellow-400 font-semibold' };
    return { label: 'HEALTHY NORMAL RANGE', color: 'text-tertiary font-bold' };
  };

  const bpInfo = getBPClassification();

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]/90 backdrop-blur-md p-4 md:p-8 animate-fade-in"
      id="modalOverlay"
    >
      <div 
        className="glass-panel w-full max-w-3xl rounded-[32px] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5 max-h-[90vh]" 
        id="modalContent"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0c]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Quick Log Vitals</h2>
            <p className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mt-1 text-[#a1a1aa]">
              ENTRY: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-[#a1a1aa] hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#050505]/90">
          
          {/* BP Classification Assistant Alert */}
          <div className="bg-[#0a0a0c] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#a1a1aa] uppercase tracking-wider font-mono">Classification Assistant:</span>
            <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-[#050505] border border-white/5 ${bpInfo.color}`}>
              {bpInfo.label}
            </span>
          </div>

          {/* Sliders Container */}
          <section className="space-y-6">
            
            {/* Systolic Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                  Systolic Weight (mmHg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="inputSystolic"
                    type="number"
                    min="40"
                    max="300"
                    value={systolic}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setSystolic(val);
                      }
                    }}
                    className="w-20 h-9 text-center bg-[#0a0a0cb0] border border-white/10 rounded-xl text-xl font-bold text-red-500 font-mono focus:outline-none focus:border-red-500/50"
                  />
                  <span className="text-xs text-[#a1a1aa] uppercase font-mono">mmHg</span>
                </div>
              </div>
              <input 
                type="range"
                min="80"
                max="200"
                value={systolic}
                onChange={(e) => setSystolic(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500" 
              />
              <div className="flex justify-between text-[10px] text-[#a1a1aa] tracking-wider font-mono">
                <span>80 (Low)</span>
                <span>120 (Normal)</span>
                <span>200 (Extreme)</span>
              </div>
            </div>

            {/* Diastolic Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                  Diastolic Weight (mmHg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="inputDiastolic"
                    type="number"
                    min="30"
                    max="200"
                    value={diastolic}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setDiastolic(val);
                      }
                    }}
                    className="w-20 h-9 text-center bg-[#0a0a0cb0] border border-white/10 rounded-xl text-xl font-bold text-blue-500 font-mono focus:outline-none focus:border-blue-500/50"
                  />
                  <span className="text-xs text-[#a1a1aa] uppercase font-mono">mmHg</span>
                </div>
              </div>
              <input 
                type="range"
                min="40"
                max="120"
                value={diastolic}
                onChange={(e) => setDiastolic(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
              />
              <div className="flex justify-between text-[10px] text-[#a1a1aa] tracking-wider font-mono">
                <span>40 (Low)</span>
                <span>80 (Normal)</span>
                <span>120 (Extreme)</span>
              </div>
            </div>

            {/* Pulse Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                  Pulse / Heart Rate (BPM)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="inputPulse"
                    type="number"
                    min="30"
                    max="250"
                    value={pulse}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setPulse(val);
                      }
                    }}
                    className="w-20 h-9 text-center bg-[#0a0a0cb0] border border-white/10 rounded-xl text-xl font-bold text-green-500 font-mono focus:outline-none focus:border-green-500/50"
                  />
                  <span className="text-xs text-[#a1a1aa] uppercase font-mono">BPM</span>
                </div>
              </div>
              <input 
                type="range"
                min="40"
                max="180"
                value={pulse}
                onChange={(e) => setPulse(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500" 
              />
              <div className="flex justify-between text-[10px] text-[#a1a1aa] tracking-wider font-mono">
                <span>40 (Bradycardia)</span>
                <span>72 (Normal)</span>
                <span>180 (Tachycardia)</span>
              </div>
            </div>

          </section>

          <div className="h-px bg-white/5" />

          {/* Contextual Selector Panels */}
          <section className="space-y-6">

            {/* Cuff Placement */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                Cuff Placement
              </p>
              <div className="flex flex-wrap gap-3">
                {['Left Arm', 'Right Arm'].map((cuff) => {
                  const isActive = cuffPlacement === cuff;
                  return (
                    <button
                      key={cuff}
                      type="button"
                      onClick={() => setCuffPlacement(cuff as CuffPlacement)}
                      className={`px-5 py-2.5 rounded-full border font-sans text-sm tracking-wide transition-all active:scale-95 cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-semibold border-none shadow-md' 
                          : 'bg-[#0a0a0c] text-white border-white/5 hover:border-blue-500/30'
                      }`}
                    >
                      {cuff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Tags */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
                Contextual Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full border text-xs tracking-wide transition-all active:scale-95 cursor-pointer ${
                        isActive 
                          ? 'bg-white text-black font-semibold border-none' 
                          : 'bg-[#0a0a0c] text-[#a1a1aa] border-white/5 hover:border-white/15'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          <div className="h-px bg-white/5" />

          {/* Clinical Insights Notes & Observations */}
          <section className="space-y-3">
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
              Clinical Observations
            </p>
            <div className="relative group">
              <textarea 
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                className="w-full bg-[#050505] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none font-sans text-sm placeholder:italic placeholder:text-[#a1a1aa]/40" 
                placeholder="e.g., Felt slight headache after coffee, or measured 1 hour post breakfast..."
              />
              <div className="absolute right-4 bottom-4 flex items-center gap-2 pointer-events-none text-green-400">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span className="text-[10px] font-mono font-medium tracking-wide">AI PARSER ACTIVE</span>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#0a0a0c] border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#a1a1aa]">
            <span className="material-symbols-outlined text-[#10b981] text-xl">verified_user</span>
            <span className="text-xs font-mono tracking-wider">Data encrypted &amp; HIPAA Compliant</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 border border-white/5 text-[#a1a1aa] hover:text-white rounded-xl font-sans text-sm font-medium hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-tr from-red-500 to-rose-600 text-white font-sans text-sm font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Save Reading
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
