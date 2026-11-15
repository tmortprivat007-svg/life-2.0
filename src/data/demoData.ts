import type { SectionId } from '@/types';
import type {
  Task,
  CalendarEvent,
  WeightEntry,
  NutritionEntry,
  WorkoutEntry,
  RunEntry,
  Email,
  Transaction,
  Investment,
  SavingsGoal,
  Trip,
  Meeting,
  WorkTask,
  WorkNote,
  TrainingPlan,
  TrainingHistory,
} from '@/types';

export const initialTasks: Task[] = [];
export const initialEvents: CalendarEvent[] = [];
export const initialWeights: WeightEntry[] = [];
export const initialNutrition: NutritionEntry[] = [];
export const initialWorkouts: WorkoutEntry[] = [];
export const initialRuns: RunEntry[] = [];
export const initialEmails: Email[] = [];
export const initialTransactions: Transaction[] = [];
export const initialInvestments: Investment[] = [];
export const initialSavingsGoals: SavingsGoal[] = [];
export const initialTrips: Trip[] = [];
export const initialMeetings: Meeting[] = [];
export const initialWorkTasks: WorkTask[] = [];
export const initialWorkNotes: WorkNote[] = [];
export const initialTrainingPlans: TrainingPlan[] = [];
export const initialTrainingHistory: TrainingHistory[] = [];

export const sectionLabels: Record<SectionId, string> = {
  overblik: 'Overblik',
  sundhed: 'Sundhed',
  traening: 'Træning',
  kalender: 'Kalender',
  mail: 'Mail',
  okonomi: 'Økonomi',
  rejser: 'Rejser',
  arbejde: 'Arbejde',
};

export const sectionColors: Record<SectionId, string> = {
  overblik: '#06b6d4',
  sundhed: '#22c55e',
  traening: '#f97316',
  kalender: '#3b82f6',
  mail: '#8b5cf6',
  okonomi: '#f59e0b',
  rejser: '#ec4899',
  arbejde: '#14b8a6',
};
