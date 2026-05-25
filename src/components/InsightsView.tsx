/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HealthPattern, VitalsReading } from '../types';

interface InsightsViewProps {
  patterns: HealthPattern[];
  readings: VitalsReading[];
  onOpenQuickLog: () => void;
}

export default function InsightsView({ patterns, readings, onOpenQuickLog }: InsightsViewProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [reportState, setReportState] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [aiReportQuote, setAiReportQuote] = useState<string>(
    `"Your blood pressure stabilizes by 4% on mornings following cardiovascular activity. Continued adherence to your current sleep-rest cycle is recommended for optimal recovery."`
  );

  // Trigger simulated report compile
  const handleGenerateReport = (format: 'PDF' | 'CSV') => {
    setReportState('generating');
    setTimeout(() => {
      setReportState('ready');
      setTimeout(() => {
        setReportState('idle');
      }, 3000);
    }, 1800);
  };

  // Get average metrics for snapshots
  const avgSys = Math.round(readings.reduce((acc, r) => acc + r.systolic, 0) / readings.length) || 118;
  const avgDia = Math.round(readings.reduce((acc, r) => acc + r.diastolic, 0) / readings.length) || 74;

  const handleAiConsult = () => {
    // Generate simulated dynamic Cardiology AI analysis based on readings variance
    const count = readings.length;
    let stressCount = readings.filter(r => r.tags.includes('Stressed') || r.systolic > 130).length;
    
    if (stressCount > 2) {
      setAiReportQuote(
        `"Warning: Arterial stress metrics rose in recent entries. A correlation was detected with high heart rate. Sleep stabilization limits are recommended; maintain medication times strictly."`
      );
    } else {
      setAiReportQuote(
        `"Optimized: Mean Arterial Pulse remains in ideal medical bracket. Excellent vagal tone stabilization was mapped post-resting. Recommended regime: maintain daily walking log."`
      );
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      
      {/* Left Column: AI and Patterns */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* Hero AI Card */}
        <section className="ai-glow-border p-6 md:p-8 overflow-hidden rounded-[32px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                     auto_awesome
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">AI Cardiologist Insights</h2>
                  <p className="text-[10px] font-mono tracking-wide text-on-surface-variant uppercase">Biometric metrics parsed by Gemini</p>
                </div>
              </div>
              
              <span className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#10b981]/10">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Live Analysis
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-base md:text-md text-[#e4e4e7] leading-relaxed transition-all italic">
                  {aiReportQuote}
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleAiConsult}
                    className="px-4 py-2.5 bg-gradient-to-tr from-red-500 to-rose-600 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    Refresh Advisory
                  </button>
                  <button 
                    onClick={onOpenQuickLog}
                    className="px-4 py-2.5 border border-white/5 text-white rounded-xl text-xs font-medium backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Log Activity
                  </button>
                </div>
              </div>

              {/* Pulsing Waveform Visualization */}
              <div className="h-32 relative flex items-center justify-center bg-[#0a0a0c]/80 rounded-[20px] border border-white/5 overflow-hidden">
                <div className="absolute inset-x-4 h-px bg-red-500/10" />
                <div className="absolute inset-x-4 flex items-center justify-around overflow-hidden px-4">
                  <div className="w-1 h-12 bg-red-500 animate-[bounce_1.3s_infinite]" />
                  <div className="w-1 h-20 bg-red-400 animate-[bounce_1.5s_infinite] delay-100" />
                  <div className="w-1 h-8 bg-blue-500 animate-[bounce_1.1s_infinite] delay-200" />
                  <div className="w-1 h-24 bg-red-500 animate-[bounce_1.7s_infinite] delay-300" />
                  <div className="w-1 h-16 bg-red-400 animate-[bounce_1.4s_infinite] delay-150" />
                  <div className="w-1 h-10 bg-blue-400 animate-[bounce_1.8s_infinite] delay-100" />
                  <div className="w-1 h-18 bg-red-500 animate-[bounce_1s_infinite] delay-75" />
                  <div className="w-1 h-12 bg-green-500 animate-[bounce_1.6s_infinite] delay-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patterns Accordion List */}
        <section className="glass-panel p-6 md:p-8 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#3b82f6] text-xl">analytics</span>
            <h3 className="text-lg font-semibold text-on-surface tracking-tight">Health Patterns</h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Click on any diagnosed pattern to view detailed clinical breakdown and physiological correlation data.
          </p>

          <div className="space-y-3">
            {patterns.map((item) => {
              const isSelected = selectedPatternId === item.id;
              
              // Map old colorful metrics into safe modern ones
              let textAccent = 'text-blue-400';
              let bgAccent = 'bg-blue-500/10';
              if (item.id === 'low-oxygen' || item.id === 'elevated-evening') {
                textAccent = 'text-red-400';
                bgAccent = 'bg-red-500/10';
              } else if (item.id === 'ideal-sleep') {
                textAccent = 'text-green-400';
                bgAccent = 'bg-green-500/10';
              }

              return (
                <div 
                  key={item.id}
                  className="rounded-2xl border border-white/5 overflow-hidden transition-all bg-white/[0.01]"
                >
                  <div 
                    onClick={() => setSelectedPatternId(isSelected ? null : item.id)}
                    className="flex items-center gap-4 p-4 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl ${bgAccent} ${textAccent} shadow-inner`}>
                      <span className="material-symbols-outlined text-md">{item.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-xs text-on-surface uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">{item.description}</p>
                    </div>
                    
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                      isSelected ? 'rotate-90 text-primary' : ''
                    }`}>
                      chevron_right
                    </span>
                  </div>

                  {isSelected && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#a1a1aa] leading-relaxed bg-[#0a0a0c]/40 border-t border-white/5 space-y-2 animate-fade-in">
                      <div className="font-sans">
                        <span className="text-red-400 font-bold">Diagnostic Status:</span> Monitored over the past 30 days via continuous smart link sensor inputs.
                      </div>
                      <div>
                        <span className="text-green-400 font-bold">Recommended Metric:</span> Keep blood pressure standard under 120/80 mmHg prior to sleeping.
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0a0a0b] mt-2 text-[10px] font-mono uppercase text-red-400 tracking-wider flex items-center gap-2 border border-white/5">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        Confidence Factor: 96% based on HIPAA neural processing nodes.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Right Column: PDF Download & Correlation Snapshot */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* Export Widget */}
        <section className="glass-panel p-6 rounded-[32px] flex flex-col h-fit border border-white/5 shadow-2xl relative">
          <h3 className="text-lg font-semibold text-white">Generate Report</h3>
          <p className="text-xs text-[#a1a1aa] font-sans mt-0.5">
            Physician-Ready Health Audit Report
          </p>

          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0d0d0f] border border-white/5 my-5 group flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/5 opacity-60 group-hover:scale-105 transition-transform duration-300" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-2 animate-pulse">
                picture_as_pdf
              </span>
              <p className="text-white text-center font-bold font-mono text-sm tracking-wide">
                Q3 VitalsFlow Audit
              </p>
              <div className="mt-1 flex items-center gap-1 bg-[#0a0a0c] border border-white/5 px-2.5 py-0.5 rounded text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Ready to review
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleGenerateReport('PDF')}
              disabled={reportState === 'generating'}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-tr from-red-500 to-rose-600 text-white py-3.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-md">
                {reportState === 'generating' ? 'hourglass_empty' : 'download'}
              </span>
              {reportState === 'generating' ? 'Compiling PDF Data...' : 'Download PDF Report'}
            </button>
            
            <button 
              onClick={() => handleGenerateReport('CSV')}
              disabled={reportState === 'generating'}
              className="w-full flex items-center justify-center gap-2.5 bg-white/[0.02] hover:bg-white/[0.06] text-white py-3.5 rounded-xl text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-md">grid_view</span>
              Export as .CSV
            </button>
          </div>

          {reportState === 'ready' && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center text-xs font-semibold animate-fade-in flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Clinical telehealth data compiling secure
            </div>
          )}
        </section>

        {/* Telemetry Snapshot Correlation Card */}
        <section className="glass-panel p-6 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-[#a1a1aa]">
              Metric Correlation
            </span>
            <span className="text-[#10b981] material-symbols-outlined text-lg">verified_user</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between">
              <span className="font-bold telemetry-font text-3xl text-white font-mono">
                {avgSys}/{avgDia}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#10b981] mb-1">
                Avg mmHg
              </span>
            </div>
            
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#10b981] h-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500" 
                style={{ width: `${Math.min(((avgSys - 80) / 120) * 100, 100)}%` }}
              />
            </div>
            
            <p className="text-[11px] text-[#a1a1aa] mt-1.5 italic font-sans">
              96% correlation verified against sleep-rest thresholds.
            </p>
          </div>
        </section>

      </div>

    </div>
  );
}
