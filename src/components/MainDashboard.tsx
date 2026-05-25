/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VitalsReading, TrendPoint, AIInsightCard, Medication } from '../types';

interface MainDashboardProps {
  readings: VitalsReading[];
  medications: Medication[];
  insights: AIInsightCard[];
  onOpenQuickLog: () => void;
  onSaveReading: (newReadingData: Omit<VitalsReading, 'id' | 'timestamp'>) => void;
}

export default function MainDashboard({
  readings,
  insights,
  onOpenQuickLog,
  onSaveReading,
}: MainDashboardProps) {
  // Selector for trends interval
  const [trendInterval, setTrendInterval] = useState<'7D' | '30D' | '6M' | '1Y'>('7D');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // States for the direct sidebar entry form
  const [inputSys, setInputSys] = useState<number>(120);
  const [inputDia, setInputDia] = useState<number>(80);
  const [inputPulse, setInputPulse] = useState<number>(72);
  const [inputCuff, setInputCuff] = useState<'Left Arm' | 'Right Arm'>('Left Arm');
  const [inputTag, setInputTag] = useState<'Morning' | 'Evening'>('Morning');
  const [inputNotes, setInputNotes] = useState<string>('');

  // Get the absolute latest reading
  const latestReading = readings[readings.length - 1] || {
    systolic: 118,
    diastolic: 74,
    pulse: 68,
    heartRate: 68,
    oxygenSat: 99,
    timestamp: new Date().toISOString(),
  };

  // Calculate Mean Arterial Pressure (MAP)
  // MAP = Diastolic + 1/3 * (Systolic - Diastolic)
  const calculateMAP = (sys: number, dia: number) => {
    return parseFloat((dia + (sys - dia) / 3).toFixed(1));
  };

  // Calculate overall averages for telemetry
  const avgSystolic = Math.round(readings.reduce((acc, r) => acc + r.systolic, 0) / readings.length) || 118;
  const avgDiastolic = Math.round(readings.reduce((acc, r) => acc + r.diastolic, 0) / readings.length) || 74;
  const currentMAP = calculateMAP(latestReading.systolic, latestReading.diastolic);
  const currentPulsePressure = latestReading.systolic - latestReading.diastolic;

  // Render classification badge
  const getBPBadge = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) {
      return { label: 'HYPERTENSION', bg: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    if (sys >= 120 || dia >= 80) {
      return { label: 'ELEVATED BP', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    }
    return { label: 'NORMAL RANGE', bg: 'bg-green-500/10 text-green-400 border-green-500/20' };
  };

  const badgeInfo = getBPBadge(latestReading.systolic, latestReading.diastolic);

  // Time elapsed since last reading
  const getTimeAgo = (timestampIso: string) => {
    const diffMs = Date.now() - new Date(timestampIso).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(timestampIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare trend rendering data based on interval selection
  const getTrendData = (): TrendPoint[] => {
    if (trendInterval === '7D') {
      // Map the last 7 entries (or pad with initial empty days down to 7)
      const last7 = readings.slice(-7);
      return last7.map((r, idx) => {
        const d = new Date(r.timestamp);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
        return {
          id: r.id,
          label: dayLabel,
          systolic: r.systolic,
          diastolic: r.diastolic,
          pulse: r.pulse,
        };
      });
    }

    if (trendInterval === '30D') {
      return [
        { id: 'w1', label: 'Wk 1', systolic: avgSystolic + 3, diastolic: avgDiastolic + 4, pulse: 71 },
        { id: 'w2', label: 'Wk 2', systolic: avgSystolic - 2, diastolic: avgDiastolic - 1, pulse: 69 },
        { id: 'w3', label: 'Wk 3', systolic: avgSystolic - 5, diastolic: avgDiastolic - 4, pulse: 67 },
        { id: 'w4', label: 'Wk 4', systolic: latestReading.systolic, diastolic: latestReading.diastolic, pulse: latestReading.pulse },
      ];
    }

    if (trendInterval === '6M') {
      return [
        { id: 'm1', label: 'Dec', systolic: 122, diastolic: 81, pulse: 71 },
        { id: 'm2', label: 'Jan', systolic: 120, diastolic: 79, pulse: 70 },
        { id: 'm3', label: 'Feb', systolic: 121, diastolic: 78, pulse: 72 },
        { id: 'm4', label: 'Mar', systolic: 118, diastolic: 76, pulse: 68 },
        { id: 'm5', label: 'Apr', systolic: 115, diastolic: 73, pulse: 66 },
        { id: 'm6', label: 'May', systolic: avgSystolic, diastolic: avgDiastolic, pulse: 68 },
      ];
    }

    // 1Y
    return [
      { id: 'y1', label: 'Q1 25', systolic: 124, diastolic: 82, pulse: 73 },
      { id: 'y2', label: 'Q2 25', systolic: 121, diastolic: 79, pulse: 70 },
      { id: 'y3', label: 'Q3 25', systolic: 119, diastolic: 76, pulse: 69 },
      { id: 'y4', label: 'Q4 25', systolic: avgSystolic, diastolic: avgDiastolic, pulse: 68 },
    ];
  };

  const trendData = getTrendData();

  // Draw the SVG clinical chart
  const renderClinicalChart = () => {
    if (trendData.length === 0) {
      return (
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
          <span className="material-symbols-outlined text-red-500/40 text-4xl mb-2 animate-pulse">monitoring</span>
          <p className="text-xs text-[#a1a1aa] font-medium mb-1">No biometric trends available</p>
          <p className="text-[10px] text-[#71717a]">Start entering vitals input to populate trend graph metrics.</p>
        </div>
      );
    }

    const chartHeight = 180;
    const paddingLeft = 30;
    const paddingRight = 10;
    const chartWidth = 520;
    const dynamicGap = (chartWidth - paddingLeft - paddingRight) / trendData.length;

    // Highest systolic, lowest diastolic for ranges
    const minVal = 40;
    const maxVal = 200;
    const valRange = maxVal - minVal;

    const getYCoordinate = (val: number) => {
      const percentage = (val - minVal) / valRange;
      return chartHeight - PercentageToY(percentage);
    };

    const PercentageToY = (pct: number) => {
      return pct * (chartHeight - 30) + 15;
    };

    return (
      <svg className="w-full h-48 overflow-visible mt-2" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Horizontal gridlines */}
        {[80, 120, 160].map((gridVal) => {
          const y = getYCoordinate(gridVal);
          return (
            <g key={gridVal} className="opacity-30">
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={chartWidth - paddingRight} 
                y2={y} 
                stroke="#3f3f46" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 3} 
                fill="#a1a1aa" 
                className="text-[9px] font-mono text-right" 
                textAnchor="end"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* BP bars ranges for each interval entry */}
        {trendData.map((point, index) => {
          const x = paddingLeft + (index + 0.5) * dynamicGap;
          const yTop = getYCoordinate(point.systolic);
          const yBottom = getYCoordinate(point.diastolic);
          const barHeight = yBottom - yTop;
          const isHovered = hoveredBarIndex === index;

          return (
            <g 
              key={point.id} 
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredBarIndex(index)}
              onMouseLeave={() => setHoveredBarIndex(null)}
            >
              {/* Systolic marker label */}
              {isHovered && (
                <g className="animate-fade-in transition-all">
                  <rect 
                    x={x - 28} 
                    y={yTop - 24} 
                    width="56" 
                    height="18" 
                    rx="4" 
                    fill="#18181b" 
                    className="stroke-red-500/40 text-white" 
                    strokeWidth="1"
                  />
                  <text 
                    x={x} 
                    y={yTop - 12} 
                    fill="#EF4444" 
                    textAnchor="middle" 
                    className="text-[10px] font-mono font-bold"
                  >
                    {point.systolic}/{point.diastolic}
                  </text>
                </g>
              )}

              {/* Range bar background gradient */}
              <rect
                x={x - 8}
                y={yTop}
                width="16"
                height={Math.max(barHeight, 4)}
                rx="8"
                fill="url(#barGradient)"
                className="transition-all duration-300 group-hover:opacity-100 group-hover:stroke-red-500/20"
                strokeWidth={isHovered ? 1.5 : 0}
              />

              {/* Systolic top-cap */}
              <circle
                cx={x}
                cy={yTop + 2}
                r="5"
                fill="#EF4444"
                className="shadow-sm"
              />

              {/* Diastolic bottom-cap */}
              <circle
                cx={x}
                cy={yBottom - 2}
                r="5"
                fill="#3B82F6"
                className="shadow-sm"
              />

              {/* Label */}
              <text
                x={x}
                y={chartHeight - 4}
                fill={isHovered ? '#EF4444' : '#a1a1aa'}
                textAnchor="middle"
                className="text-[10px] font-mono transition-colors"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        {/* Define local SVG gradients */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.65" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left/Center Canvas: Telemetry & Analytics */}
      <section className="flex-1 space-y-6">
        
        {/* Core Quick log trigger helper */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0b]/80 rounded-[20px] border border-white/5">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-primary">Need to input metrics?</h3>
            <p className="text-xs text-on-surface-variant">Log systolic, diastolic &amp; pulse</p>
          </div>
          <button 
            onClick={onOpenQuickLog}
            className="px-4 py-2 bg-gradient-to-tr from-red-500 to-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Quick Log +
          </button>
        </div>

        {/* Hero Widget: Current Vitals Card */}
        <div className="glass-card rounded-[32px] p-6 md:p-8 relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  readings.length > 0 ? badgeInfo.bg : 'bg-white/5 text-white/40 border-white/5'
                }`}>
                  {readings.length > 0 ? badgeInfo.label : 'NO INPUTS'}
                </span>
                <span className="text-on-surface-variant text-xs font-mono">
                  {readings.length > 0 ? `Checked ${getTimeAgo(latestReading.timestamp)}` : 'Vitals ledger empty'}
                </span>
              </div>
              <h2 className="text-on-surface-variant font-mono text-xs uppercase tracking-widest mb-1.5">
                Current Blood Pressure
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="telemetry-font text-5.5xl md:text-7xl leading-none font-black text-white tracking-tighter">
                  {readings.length > 0 ? latestReading.systolic : '---'}
                </span>
                <span className="text-3xl font-light text-white/40">/ {readings.length > 0 ? latestReading.diastolic : '---'}</span>
                <span className="text-on-surface-variant font-semibold text-sm">mmHg</span>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-[#0a0a0c]/85 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-md">
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest">
                  Heart Rate
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="material-symbols-outlined text-primary animate-pulse text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span className="font-mono text-2xl font-bold text-white leading-none">
                    {readings.length > 0 ? latestReading.pulse : '---'}
                  </span>
                  <span className="text-on-surface-variant text-[10px] uppercase font-mono">BPM</span>
                </div>
              </div>
              
              <div className="w-[1px] h-9 bg-white/10" />
              
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-widest">
                  Oxygen Sat.
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-2xl font-bold text-[#10b981] leading-none">
                    {readings.length > 0 ? `${latestReading.oxygenSat}%` : '---%'}
                  </span>
                  <span className="material-symbols-outlined text-[#10b981] text-lg">
                    air
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Wave Animation Background */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path 
                className="pulse-wave" 
                d="M0,50 Q20,10 40,50 T80,50 T120,50 T160,85 T200,10 T240,50 T280,50 T320,50 T360,50" 
                fill="transparent" 
                stroke="#ef4444" 
                strokeWidth="2" 
              />
              <path 
                className="pulse-wave" 
                d="M360,50 Q380,10 400,50 T440,50 T480,50 T520,85 T560,10 T600,50 T640,50 T680,50 T720,50" 
                fill="transparent" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                style={{ animationDelay: '-1.5s' }}
              />
              <path 
                className="pulse-wave" 
                d="M720,50 Q740,10 760,50 T800,50 T840,50 T880,85 T920,10 T960,50 T1000,50" 
                fill="transparent" 
                stroke="#10b981" 
                strokeWidth="2" 
                style={{ animationDelay: '-0.7s' }}
              />
            </svg>
          </div>
        </div>

        {readings.length === 0 && (
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[28px] text-center text-xs text-[#a1a1aa] space-y-3 animate-fade-in shadow-xl">
            <p className="font-semibold text-white text-sm">Vital Inputs Ledger Is Empty</p>
            <p className="max-w-md mx-auto text-[11px] leading-relaxed">No medical biometrics have been logged yet. Use the quick log button below or the manual entry card to add your first blood pressure reading.</p>
            <button 
              onClick={onOpenQuickLog} 
              className="px-5 py-2.5 bg-gradient-to-tr from-red-500 to-rose-600 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all outline-none cursor-pointer shadow-md inline-flex items-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log First Reading
            </button>
          </div>
        )}

        {/* Analytics: Wide Responsive Line Chart */}
        <div className="glass-card rounded-[32px] p-6 md:p-8 border border-white/5 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-on-surface tracking-tight">Pressure Trends</h3>
              <p className="text-xs text-on-surface-variant font-sans">
                Range metrics (diastolic to systolic range) showing clinical threshold levels.
              </p>
            </div>
            <div className="flex bg-[#0a0a0c] rounded-xl p-1 border border-white/5">
              {(['7D', '30D', '6M', '1Y'] as const).map((interval) => (
                <button
                  key={interval}
                  onClick={() => setTrendInterval(interval)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    trendInterval === interval
                      ? 'bg-gradient-to-tr from-red-500 to-rose-600 text-white shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          {/* Render our highly reliable, custom, dynamic SVG Chart */}
          <div className="w-full relative py-2">
            {renderClinicalChart()}
          </div>
        </div>

        {/* Telemetry Snapshot Cards Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* MAP Card */}
          <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between border border-white/5 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-[#3b82f6] text-xl">analytics</span>
              <span className="text-[10px] bg-blue-500/10 text-[#3b82f6] px-2 py-0.5 rounded-full font-bold tracking-wider font-mono">
                OPTIMAL
              </span>
            </div>
            <h4 className="text-on-surface-variant text-xs font-mono uppercase tracking-wider mb-1">
              Mean Arterial Pressure
            </h4>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">{currentMAP}</span>
              <span className="text-xs text-on-surface-variant uppercase">mmHg</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-sans border-t border-white/5 pt-2 leading-relaxed">
              Standard tissue perfusion index calculated dynamically via cuff reading.
            </p>
          </div>

          {/* Pulse Pressure Card */}
          <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between border border-white/5 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-rose-500 text-xl">waves</span>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold tracking-wider font-mono">
                {currentPulsePressure > 40 ? 'HIGH SLIP' : 'STEADY'}
              </span>
            </div>
            <h4 className="text-on-surface-variant text-xs font-mono uppercase tracking-wider mb-1">
              Pulse Pressure
            </h4>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">{currentPulsePressure}</span>
              <span className="text-xs text-[#a1a1aa] uppercase">mmHg</span>
            </div>
            <p className="text-[11px] text-[#a1a1aa] font-sans border-t border-white/5 pt-2 leading-relaxed">
              Indicator of cardiovascular stress calculated as (sys - dia). Healthy standard is 40.
            </p>
          </div>

          {/* Adherence Score Card */}
          <div className="glass-card rounded-[24px] p-5 flex items-center gap-4 border border-white/5 shadow-md">
            <div className="relative h-16 w-16 flex-shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path 
                  className="stroke-white/5" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  strokeWidth="3.2" 
                />
                <path 
                  className="stroke-[#10b981] glow-tertiary" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  strokeDasharray="92, 100" 
                  strokeLinecap="round" 
                  strokeWidth="3.2" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[#10b981]">92%</span>
              </div>
            </div>
            <div>
              <h4 className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider mb-0.5">
                ADHERENCE
              </h4>
              <span className="font-semibold text-lg text-on-surface leading-none block">Excellent</span>
              <p className="text-[10px] text-on-surface-variant font-sans mt-0.5">
                Log consistency: 12d streak
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* Right Sidebar: Clinical Insights & Medications */}
      <aside className="w-full lg:w-96 space-y-6">
        
        {/* Direct Blood Pressure Entry Form */}
        <div className="glass-card rounded-[32px] p-6 border border-white/5 shadow-xl bg-[#0a0a0c]/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-red-500 text-xl font-bold">add_circle</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Logger: Enter BP Vitals</h3>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            onSaveReading({
              systolic: inputSys,
              diastolic: inputDia,
              pulse: inputPulse,
              heartRate: inputPulse,
              oxygenSat: 98,
              cuffPlacement: inputCuff,
              tags: [inputTag],
              observations: inputNotes,
            });
            setInputNotes('');
          }} className="space-y-4">
            
            {/* Live classification assistant badge */}
            <div className="bg-[#050505] p-3 rounded-2xl border border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-[#a1a1aa] font-mono uppercase tracking-wider">Classification:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border text-[9px] ${getBPBadge(inputSys, inputDia).bg}`}>
                {getBPBadge(inputSys, inputDia).label}
              </span>
            </div>

            {/* Systolic Card */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">Systolic (mmHg)</span>
                <input 
                  type="number" 
                  min="40" 
                  max="300"
                  value={inputSys}
                  onChange={(e) => setInputSys(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-8 text-center bg-[#050505] border border-white/10 rounded-lg text-sm font-bold text-red-500 font-mono focus:outline-none focus:border-red-500/50"
                />
              </div>
              <input 
                type="range" 
                min="40" 
                max="220" 
                value={inputSys}
                onChange={(e) => setInputSys(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Diastolic Card */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">Diastolic (mmHg)</span>
                <input 
                  type="number" 
                  min="30" 
                  max="200"
                  value={inputDia}
                  onChange={(e) => setInputDia(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-8 text-center bg-[#050505] border border-white/10 rounded-lg text-sm font-bold text-blue-500 font-mono focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <input 
                type="range" 
                min="30" 
                max="140" 
                value={inputDia}
                onChange={(e) => setInputDia(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Pulse Card */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">Pulse Rate (BPM)</span>
                <input 
                  type="number" 
                  min="30" 
                  max="250"
                  value={inputPulse}
                  onChange={(e) => setInputPulse(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-8 text-center bg-[#050505] border border-white/10 rounded-lg text-sm font-bold text-green-500 font-mono focus:outline-none focus:border-green-500/50"
                />
              </div>
              <input 
                type="range" 
                min="30" 
                max="180" 
                value={inputPulse}
                onChange={(e) => setInputPulse(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Quick selectors row */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {/* Tag */}
              <div className="space-y-1">
                <span className="text-[#a1a1aa] font-mono uppercase tracking-wider">Tag</span>
                <select 
                  value={inputTag} 
                  onChange={(e) => setInputTag(e.target.value as 'Morning' | 'Evening')}
                  className="w-full h-8 bg-[#050505] border border-white/5 rounded-lg px-2 text-white font-mono focus:outline-none focus:border-red-500/30 text-[10px]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              {/* Cuff */}
              <div className="space-y-1">
                <span className="text-[#a1a1aa] font-mono uppercase tracking-wider">Cuff</span>
                <select 
                  value={inputCuff} 
                  onChange={(e) => setInputCuff(e.target.value as any)}
                  className="w-full h-8 bg-[#050505] border border-white/5 rounded-lg px-2 text-white font-mono focus:outline-none focus:border-red-500/30 text-[10px]"
                >
                  <option value="Left Arm">Left Arm</option>
                  <option value="Right Arm">Right Arm</option>
                </select>
              </div>
            </div>

            {/* Observation notes */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">Notes</span>
              <textarea 
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                placeholder="Optional biometric notes..."
                rows={2}
                className="w-full bg-[#050505] border border-white/5 rounded-xl p-2.5 text-xs text-white placeholder:text-[#71717a] placeholder:italic focus:outline-none focus:border-red-500/30 resize-none font-sans"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-tr from-red-500 to-rose-600 text-white font-sans text-xs font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all outline-none cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/15"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              Log Live Reading
            </button>
          </form>
        </div>
        
        {/* AI Insights Card */}
        <div className="glass-card rounded-[32px] p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
            <h3 className="text-md font-semibold text-on-surface tracking-tight">AI Insights</h3>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all`}
              >
                <p className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                  insight.category === 'CIRCADIAN RHYTHM' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {insight.category}
                </p>
                <p className="text-xs text-on-surface font-semibold mb-1">
                  {insight.title}
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}

            {/* Local session note */}
            <div className="relative overflow-hidden rounded-2xl group border border-white/5 bg-[#0a0a0c]">
              <div className="absolute inset-x-0 bottom-0 top-0 bg-red-500/5 opacity-70 transition-all" />
              <div className="relative p-4 flex flex-col justify-end min-h-[90px]">
                <h4 className="text-xs font-semibold text-white mb-1">Local Session Storage</h4>
                <p className="text-[10px] text-[#a1a1aa] leading-normal mb-3">Readings persist on this device for the signed-in account.</p>
              </div>
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
}
