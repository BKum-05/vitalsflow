/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveTab = 'dashboard' | 'trends' | 'insights' | 'settings';

export type CuffPlacement = 'Left Arm' | 'Right Arm';

export interface VitalsReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  heartRate: number; // typically matches pulse or is closely linked
  oxygenSat: number;
  cuffPlacement: CuffPlacement;
  tags: string[];
  observations: string;
  timestamp: string; // ISO String
}

export interface TrendPoint {
  id: string;
  label: string; // e.g. "Mon", "Tue" or date representations
  systolic: number;
  diastolic: number;
  pulse: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  colorType: 'primary' | 'secondary' | 'tertiary';
}

export interface AIInsightCard {
  id: string;
  title: string;
  category: 'CIRCADIAN RHYTHM' | 'ACTIVITY CORRELATION' | 'SLEEP HIGHLIGHT' | 'GENERAL';
  description: string;
  borderClass: string;
  textClass: string;
}

export interface HealthPattern {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'sleep' | 'heart' | 'fitness';
  colorClass: string;
}
