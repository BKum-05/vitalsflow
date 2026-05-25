/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VitalsReading } from '../types';

interface TrendsDetailedViewProps {
  readings: VitalsReading[];
  onDeleteReading: (id: string) => void;
}

export default function TrendsDetailedView({ readings, onDeleteReading }: TrendsDetailedViewProps) {
  const [filterTag, setFilterTag] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'sys-desc'>('date-desc');

  // Multi-filters & sorts matching state
  const filteredReadings = readings
    .filter((r) => filterTag === 'All' || r.tags.includes(filterTag))
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'date-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return b.systolic - a.systolic;
    });

  // Calculate standard diagnostic stats
  const sysList = readings.map((r) => r.systolic);
  const diaList = readings.map((r) => r.diastolic);
  const pulseList = readings.map((r) => r.pulse);

  const highestSys = sysList.length > 0 ? Math.max(...sysList) : 120;
  const lowestSys = sysList.length > 0 ? Math.min(...sysList) : 110;
  const avgPulse = pulseList.length > 0 ? Math.round(pulseList.reduce((a, b) => a + b, 0) / pulseList.length) : 68;

  // Custom Line Plot SVG for all historical logs
  const drawLineTrendPlot = () => {
    if (readings.length === 0) return null;

    const sortedByDateAsc = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 25;

    const minBpPrice = 40;
    const maxBpPrice = 180;
    const range = maxBpPrice - minBpPrice;

    const getX = (index: number) => {
      if (sortedByDateAsc.length <= 1) return width / 2;
      return paddingX + (index / (sortedByDateAsc.length - 1)) * (width - paddingX * 2);
    };

    const getY = (val: number) => {
      const pct = (val - minBpPrice) / range;
      return height - (pct * (height - paddingY * 2) + paddingY);
    };

    // Construct Systolic points path
    let sysPathD = '';
    let diaPathD = '';
    sortedByDateAsc.forEach((reading, idx) => {
      const cx = getX(idx);
      const cySys = getY(reading.systolic);
      const cyDia = getY(reading.diastolic);

      if (idx === 0) {
        sysPathD = `M ${cx} ${cySys}`;
        diaPathD = `M ${cx} ${cyDia}`;
      } else {
        sysPathD += ` L ${cx} ${cySys}`;
        diaPathD += ` L ${cx} ${cyDia}`;
      }
    });

    return (
      <svg className="w-full h-44 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal auxiliary gridlines */}
        {[60, 90, 120, 150].map((gridY) => {
          const y = getY(gridY);
          return (
            <g key={gridY} className="opacity-20 animate-fade-in">
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={paddingX - 10} y={y + 3} fill="#a1a1aa" className="text-[9px] font-mono text-right" textAnchor="end">
                {gridY}
              </text>
            </g>
          );
        })}

        {/* Diagonal systolic path */}
        {sortedByDateAsc.length > 1 && (
          <>
            <path d={sysPathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <path d={diaPathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </>
        )}

        {/* Points indicator dots overlay */}
        {sortedByDateAsc.map((reading, idx) => {
          const cx = getX(idx);
          const cySys = getY(reading.systolic);
          const cyDia = getY(reading.diastolic);
          const dateLabel = new Date(reading.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

          return (
            <g key={reading.id} className="group cursor-default">
              {/* Connecting line representing range pulse interval */}
              <line x1={cx} y1={cySys} x2={cx} y2={cyDia} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

              {/* Systolic dot */}
              <circle cx={cx} cy={cySys} r="5" fill="#ef4444" className="hover:scale-150 transition-transform cursor-pointer" />
              {/* Diastolic dot */}
              <circle cx={cx} cy={cyDia} r="5" fill="#3b82f6" className="hover:scale-150 transition-transform cursor-pointer" />

              {/* Timestamp tag below */}
              {idx % Math.ceil(sortedByDateAsc.length / 5) === 0 && (
                <text x={cx} y={height - 4} fill="#a1a1aa" className="text-[8px] font-mono text-center shadow-sm" textAnchor="middle">
                  {dateLabel}
                </text>
              )}

              {/* Tooltip on hover */}
              <title>{`Entry ${idx + 1}: ${reading.systolic}/${reading.diastolic} mmHg • Tags: ${reading.tags.join(', ') || 'None'}`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top statistics overview bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-[24px] p-5 border border-white/5 shadow-md">
          <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Historical High</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{highestSys}</span>
            <span className="text-xs text-[#a1a1aa] uppercase font-mono">mmHg</span>
          </div>
        </div>
        
        <div className="glass-card rounded-[24px] p-5 border border-white/5 shadow-md">
          <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Historical Low</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{lowestSys}</span>
            <span className="text-xs text-[#a1a1aa] uppercase font-mono">mmHg</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-5 border border-white/5 shadow-md">
          <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Avg Pulse Rate</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tracking-tight text-red-400 font-mono">{avgPulse}</span>
            <span className="text-xs text-[#a1a1aa] uppercase font-mono font-sans">BPM</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-5 border border-white/5 shadow-md bg-gradient-to-tr from-red-500/5 to-rose-600/5">
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Total Readings Logged</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{readings.length}</span>
            <span className="text-xs text-red-400/80 uppercase font-mono">Entries</span>
          </div>
        </div>
      </section>

      {/* Advanced Line plot SVG Card */}
      <section className="glass-panel p-6 md:p-8 rounded-[32px] border border-white/5 shadow-2xl">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Historical Cardiology Curve</h3>
          <p className="text-xs text-[#a1a1aa]">Hover over any point node to review detailed coordinates.</p>
        </div>
        <div className="w-full mt-4">
          {drawLineTrendPlot()}
        </div>
      </section>

      {/* Database log table */}
      <section className="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
        
        {/* Table Filters Action Header */}
        <div className="p-5 bg-[#0a0a0c] border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h3 className="text-sm font-semibold text-white">Vitals Ledger</h3>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Filter */}
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value as 'All' | 'Morning' | 'Evening')}
              className="bg-[#121214] border border-white/5 rounded-xl text-xs text-on-surface p-2.5 px-3 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer font-sans"
            >
              <option value="All">All Tags</option>
              <option value="Morning">Morning Only</option>
              <option value="Evening">Evening Only</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121214] border border-white/5 rounded-xl text-xs text-on-surface p-2.5 px-3 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer font-sans"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="sys-desc">Highest Systolic</option>
            </select>
          </div>
        </div>

        {/* Ledger listings table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] font-mono text-[#a1a1aa] uppercase tracking-wider text-[10px]">
                <th className="p-4 font-normal">Date &amp; Time</th>
                <th className="p-4 font-normal">Pressure (mmHg)</th>
                <th className="p-4 font-normal">Pulse / Rhythms</th>
                <th className="p-4 font-normal">Device Specs / Notes</th>
                <th className="p-4 font-normal text-right">Ledger Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReadings.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant/60 italic font-sans text-xs">
                    No logs found matching your selected tag filter.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((reading) => {
                  const dObj = new Date(reading.timestamp);
                  const displayDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const displayTime = dObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  
                  const isHigh = reading.systolic >= 130;

                  return (
                    <tr key={reading.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="p-4 font-sans font-medium text-white">
                        <div>{displayDate}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">{displayTime}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-black telemetry-font ${isHigh ? 'text-red-400' : 'text-blue-400'}`}>
                            {reading.systolic} / {reading.diastolic}
                          </span>
                          <span className="text-[10px] text-on-surface-variant uppercase font-mono">mmHg</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-red-500 text-base animate-pulse">favorite</span>
                          <span className="font-semibold text-white">{reading.pulse} BPM</span>
                        </div>
                        <div className="text-[10px] text-[#10b981] mt-1 flex items-center gap-1 font-mono uppercase">
                          <span className="w-1 h-1 rounded-full bg-[#10b981]" />
                          O2: {reading.oxygenSat}%
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate font-sans">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {reading.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="bg-[#121214] px-2 py-0.5 rounded text-[9px] text-[#3b82f6] border border-white/5 font-mono">
                              {tag}
                            </span>
                          ))}
                          <span className="bg-[#121214] px-2 py-0.5 rounded text-[9px] text-[#ef4444] border border-white/5 font-mono">
                            {reading.cuffPlacement}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a1a1aa] hidden sm:block italic">
                          {reading.observations || 'No additional comment noted.'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteReading(reading.id)}
                          className="p-1 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/10 hover:border-red-500/25 cursor-pointer text-[10px] font-mono uppercase"
                          title="Purge Vitals record"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
