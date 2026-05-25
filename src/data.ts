/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VitalsReading, Medication, AIInsightCard, HealthPattern, TrendPoint } from './types';

export const initialReadings: VitalsReading[] = [];

export const initialTrendData30D: TrendPoint[] = [
  { id: 't1', label: 'Week 1', systolic: 122, diastolic: 80, pulse: 70 },
  { id: 't2', label: 'Week 2', systolic: 118, diastolic: 76, pulse: 72 },
  { id: 't3', label: 'Week 3', systolic: 115, diastolic: 75, pulse: 68 },
  { id: 't4', label: 'Week 4', systolic: 117, diastolic: 74, pulse: 69 },
];

export const initialTrendData6M: TrendPoint[] = [
  { id: 'm1', label: 'Dec', systolic: 124, diastolic: 82, pulse: 72 },
  { id: 'm2', label: 'Jan', systolic: 121, diastolic: 79, pulse: 70 },
  { id: 'm3', label: 'Feb', systolic: 120, diastolic: 78, pulse: 72 },
  { id: 'm4', label: 'Mar', systolic: 118, diastolic: 76, pulse: 68 },
  { id: 'm5', label: 'Apr', systolic: 116, diastolic: 75, pulse: 67 },
  { id: 'm6', label: 'May', systolic: 118, diastolic: 74, pulse: 68 },
];

export const initialMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10mg',
    time: '08:00 AM',
    taken: true,
    colorType: 'primary',
  },
  {
    id: 'med-2',
    name: 'Aspirin',
    dosage: '81mg',
    time: '08:00 AM',
    taken: true,
    colorType: 'secondary',
  },
];

export const initialInsights: AIInsightCard[] = [
  {
    id: 'insight-1',
    category: 'CIRCADIAN RHYTHM',
    title: 'Circadian Rhythm Dip',
    description: 'Your BP typically dips by 12% at night, which indicates a healthy, restorative cardiovascular profile.',
    borderClass: 'border-l-4 border-tertiary',
    textClass: 'text-tertiary',
  },
  {
    id: 'insight-2',
    category: 'ACTIVITY CORRELATION',
    title: 'Post-Activity Recovery',
    description: 'Pulse pressure stabilizes 15 minutes faster after your morning walk, showing optimized arterial compliance.',
    borderClass: 'border-l-4 border-primary',
    textClass: 'text-primary',
  },
];

export const initialPatterns: HealthPattern[] = [
  {
    id: 'pattern-1',
    title: 'Circadian Rhythm Shift',
    description: 'Deep sleep duration increased by 22m over the last 7 days.',
    icon: 'nightlight',
    category: 'sleep',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    id: 'pattern-2',
    title: 'HRV Recovering',
    description: 'Stress markers decreased significantly during afternoon hours.',
    icon: 'heart_broken',
    category: 'heart',
    colorClass: 'bg-tertiary/10 text-tertiary',
  },
  {
    id: 'pattern-3',
    title: 'Intensity Milestone',
    description: 'Maintained peak cardio zone for 45 minutes on Wednesday.',
    icon: 'fitness_center',
    category: 'fitness',
    colorClass: 'bg-secondary/10 text-[#ffb2b7]',
  },
];
