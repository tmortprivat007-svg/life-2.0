export type SectionId =
  | 'overblik'
  | 'sundhed'
  | 'traening'
  | 'kalender'
  | 'mail'
  | 'okonomi'
  | 'rejser'
  | 'arbejde';

export type DataSource = 'manual' | 'synced' | 'unavailable';

export type IntegrationId = 'icloud_calendar' | 'gmail' | 'myfitnesspal';

export interface IntegrationStatus {
  id: IntegrationId;
  name: string;
  description: string;
  status: 'disconnected' | 'available' | 'syncing' | 'error';
  lastSynced: string | null;
  message: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
  section?: SectionId;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  category: 'work' | 'personal' | 'health' | 'social' | 'travel';
  location?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface NutritionEntry {
  id: string;
  date: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  notes?: string;
}

export interface RunEntry {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: string;
}

export interface Email {
  id: string;
  from: string;
  fromInitial: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  followUp: boolean;
  category: 'inbox' | 'work' | 'personal' | 'newsletter';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  shares: number;
  price: number;
  change: number;
  value: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  hotel: string;
  hotelAddress: string;
  flightOut: string;
  flightBack: string;
  status: 'upcoming' | 'planning' | 'completed';
  budget: number;
  notes: string;
  image: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  attendees: string[];
  type: 'meeting' | 'call' | 'review' | 'deadline';
}

export interface WorkTask {
  id: string;
  title: string;
  project: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
  due: string;
}

export interface WorkNote {
  id: string;
  title: string;
  content: string;
  date: string;
  project: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  day: string;
  exercises: TrainingExercise[];
  completed: boolean;
}

export interface TrainingExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscle: string;
  done?: boolean;
}

export interface TrainingHistory {
  id: string;
  date: string;
  plan: string;
  duration: number;
  volume: number;
  exercises: number;
}
