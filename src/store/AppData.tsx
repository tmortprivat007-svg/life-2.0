import { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  initialTasks,
  initialEvents,
  initialWeights,
  initialNutrition,
  initialWorkouts,
  initialRuns,
  initialEmails,
  initialTransactions,
  initialInvestments,
  initialSavingsGoals,
  initialTrips,
  initialMeetings,
  initialWorkTasks,
  initialWorkNotes,
  initialTrainingPlans,
  initialTrainingHistory,
} from '@/data/demoData';
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
  IntegrationId,
  IntegrationStatus,
  DataSource,
} from '@/types';

export const defaultIntegrations: IntegrationStatus[] = [
  {
    id: 'icloud_calendar',
    name: 'iCloud Kalender',
    description: 'Synkroniser kalenderbegivenheder fra din iCloud-konto',
    status: 'disconnected',
    lastSynced: null,
    message: 'Ikke forbundet. Tilslut for at hente kalenderbegivenheder automatisk.',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Hent mails og follow-ups fra din Gmail-konto',
    status: 'disconnected',
    lastSynced: null,
    message: 'Ikke forbundet. Tilslut for at se din indbakke direkte i LIFE 2.0.',
  },
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal',
    description: 'Importer ernæringsdata og kalorier fra MyFitnessPal',
    status: 'disconnected',
    lastSynced: null,
    message: 'Ikke forbundet. Tilslut for at synkronisere måltider og ernæring.',
  },
];

interface AppDataContextType {
  tasks: Task[];
  setTasks: (value: Task[] | ((prev: Task[]) => Task[])) => void;
  events: CalendarEvent[];
  setEvents: (value: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  weights: WeightEntry[];
  setWeights: (value: WeightEntry[] | ((prev: WeightEntry[]) => WeightEntry[])) => void;
  nutrition: NutritionEntry[];
  setNutrition: (value: NutritionEntry[] | ((prev: NutritionEntry[]) => NutritionEntry[])) => void;
  workouts: WorkoutEntry[];
  setWorkouts: (value: WorkoutEntry[] | ((prev: WorkoutEntry[]) => WorkoutEntry[])) => void;
  runs: RunEntry[];
  setRuns: (value: RunEntry[] | ((prev: RunEntry[]) => RunEntry[])) => void;
  emails: Email[];
  setEmails: (value: Email[] | ((prev: Email[]) => Email[])) => void;
  transactions: Transaction[];
  setTransactions: (value: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  investments: Investment[];
  setInvestments: (value: Investment[] | ((prev: Investment[]) => Investment[])) => void;
  goals: SavingsGoal[];
  setGoals: (value: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void;
  trips: Trip[];
  setTrips: (value: Trip[] | ((prev: Trip[]) => Trip[])) => void;
  meetings: Meeting[];
  setMeetings: (value: Meeting[] | ((prev: Meeting[]) => Meeting[])) => void;
  workTasks: WorkTask[];
  setWorkTasks: (value: WorkTask[] | ((prev: WorkTask[]) => WorkTask[])) => void;
  workNotes: WorkNote[];
  setWorkNotes: (value: WorkNote[] | ((prev: WorkNote[]) => WorkNote[])) => void;
  plans: TrainingPlan[];
  setPlans: (value: TrainingPlan[] | ((prev: TrainingPlan[]) => TrainingPlan[])) => void;
  trainingHistory: TrainingHistory[];
  setTrainingHistory: (value: TrainingHistory[] | ((prev: TrainingHistory[]) => TrainingHistory[])) => void;
  integrations: IntegrationStatus[];
  setIntegrations: (value: IntegrationStatus[] | ((prev: IntegrationStatus[]) => IntegrationStatus[])) => void;
  getDataSource: (integrationId: IntegrationId) => DataSource;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('life2_tasks', initialTasks);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('life2_events', initialEvents);
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>('life2_weights', initialWeights);
  const [nutrition, setNutrition] = useLocalStorage<NutritionEntry[]>('life2_nutrition', initialNutrition);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutEntry[]>('life2_workouts', initialWorkouts);
  const [runs, setRuns] = useLocalStorage<RunEntry[]>('life2_runs', initialRuns);
  const [emails, setEmails] = useLocalStorage<Email[]>('life2_emails', initialEmails);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('life2_transactions', initialTransactions);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('life2_investments', initialInvestments);
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('life2_savingsGoals', initialSavingsGoals);
  const [trips, setTrips] = useLocalStorage<Trip[]>('life2_trips', initialTrips);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('life2_meetings', initialMeetings);
  const [workTasks, setWorkTasks] = useLocalStorage<WorkTask[]>('life2_workTasks', initialWorkTasks);
  const [workNotes, setWorkNotes] = useLocalStorage<WorkNote[]>('life2_workNotes', initialWorkNotes);
  const [plans, setPlans] = useLocalStorage<TrainingPlan[]>('life2_plans', initialTrainingPlans);
  const [trainingHistory, setTrainingHistory] = useLocalStorage<TrainingHistory[]>('life2_trainingHistory', initialTrainingHistory);
  const [integrations, setIntegrations] = useLocalStorage<IntegrationStatus[]>('life2_integrations', defaultIntegrations);

  const getDataSource = (integrationId: IntegrationId): DataSource => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration || integration.status === 'disconnected' || integration.status === 'error') {
      return 'unavailable';
    }
    if (integration.status === 'syncing' || integration.status === 'available') {
      return 'synced';
    }
    return 'unavailable';
  };

  return (
    <AppDataContext.Provider value={{
      tasks, setTasks,
      events, setEvents,
      weights, setWeights,
      nutrition, setNutrition,
      workouts, setWorkouts,
      runs, setRuns,
      emails, setEmails,
      transactions, setTransactions,
      investments, setInvestments,
      goals, setGoals,
      trips, setTrips,
      meetings, setMeetings,
      workTasks, setWorkTasks,
      workNotes, setWorkNotes,
      plans, setPlans,
      trainingHistory, setTrainingHistory,
      integrations, setIntegrations,
      getDataSource,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return ctx;
}

export function getDataSourceLabel(source: DataSource): string {
  switch (source) {
    case 'manual':
      return 'Manuelt';
    case 'synced':
      return 'Synkroniseret';
    case 'unavailable':
      return 'Ikke tilgængeligt';
  }
}

export function getDataSourceColor(source: DataSource): string {
  switch (source) {
    case 'manual':
      return '#06b6d4';
    case 'synced':
      return '#22c55e';
    case 'unavailable':
      return '#64748b';
  }
}
