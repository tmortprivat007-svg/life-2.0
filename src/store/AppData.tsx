import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
  userEmail: string | null;
  authLoading: boolean;
  syncStatus: 'offline' | 'signed_out' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
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

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'offline' | 'signed_out' | 'syncing' | 'synced' | 'error'>(supabase ? 'signed_out' : 'offline');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncReady, setSyncReady] = useState(false);

  const localCollections = {
    tasks, events, weights, nutrition, workouts, runs, emails, transactions,
    investments, goals, trips, meetings, workTasks, workNotes, plans, trainingHistory,
  };

  const applyCloudValue = (key: string, payload: unknown) => {
    switch (key) {
      case 'tasks': setTasks(payload as Task[]); break;
      case 'events': setEvents(payload as CalendarEvent[]); break;
      case 'weights': setWeights(payload as WeightEntry[]); break;
      case 'nutrition': setNutrition(payload as NutritionEntry[]); break;
      case 'workouts': setWorkouts(payload as WorkoutEntry[]); break;
      case 'runs': setRuns(payload as RunEntry[]); break;
      case 'emails': setEmails(payload as Email[]); break;
      case 'transactions': setTransactions(payload as Transaction[]); break;
      case 'investments': setInvestments(payload as Investment[]); break;
      case 'goals': setGoals(payload as SavingsGoal[]); break;
      case 'trips': setTrips(payload as Trip[]); break;
      case 'meetings': setMeetings(payload as Meeting[]); break;
      case 'workTasks': setWorkTasks(payload as WorkTask[]); break;
      case 'workNotes': setWorkNotes(payload as WorkNote[]); break;
      case 'plans': setPlans(payload as TrainingPlan[]); break;
      case 'trainingHistory': setTrainingHistory(payload as TrainingHistory[]); break;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setSyncStatus('offline');
      return;
    }

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setUserEmail(session?.user.email ?? null);
      if (!session) {
        setSyncReady(false);
        setSyncStatus('signed_out');
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setSyncError(error.message);
      setUserId(data.session?.user.id ?? null);
      setUserEmail(data.session?.user.email ?? null);
      setAuthLoading(false);
      if (!data.session) setSyncStatus('signed_out');
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !userId) {
      setSyncReady(false);
      return;
    }

    let active = true;
    const hydrate = async () => {
      setSyncReady(false);
      setSyncStatus('syncing');
      setSyncError(null);
      const { data, error } = await supabase
        .from('life_records')
        .select('data_key, payload')
        .eq('user_id', userId);

      if (error) {
        if (active) {
          setSyncError(error.message);
          setSyncStatus('error');
        }
        return;
      }

      const remote = new Map<string, unknown>(
        (data ?? []).map((row: { data_key: string; payload: unknown }) => [row.data_key, row.payload])
      );

      for (const [key, localValue] of Object.entries(localCollections)) {
        if (!active) return;
        if (remote.has(key)) {
          applyCloudValue(key, remote.get(key));
        } else {
          const { error: saveError } = await supabase
            .from('life_records')
            .upsert(
              { user_id: userId, data_key: key, payload: localValue },
              { onConflict: 'user_id,data_key' }
            );
          if (saveError) {
            if (active) {
              setSyncError(saveError.message);
              setSyncStatus('error');
            }
            return;
          }
        }
      }

      if (active) {
        setSyncReady(true);
        setSyncStatus('synced');
      }
    };

    void hydrate();
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!supabase || !userId || !syncReady) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setSyncStatus('syncing');
      const records = Object.entries(localCollections).map(([data_key, payload]) => ({
        user_id: userId,
        data_key,
        payload,
      }));
      const { error } = await supabase
        .from('life_records')
        .upsert(records, { onConflict: 'user_id,data_key' });
      if (!active) return;
      if (error) {
        setSyncError(error.message);
        setSyncStatus('error');
      } else {
        setSyncError(null);
        setSyncStatus('synced');
      }
    }, 700);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    userId, syncReady, tasks, events, weights, nutrition, workouts, runs, emails,
    transactions, investments, goals, trips, meetings, workTasks, workNotes, plans, trainingHistory,
  ]);

  const signInWithEmail = useCallback(async (email: string): Promise<string | null> => {
    if (!supabase) return 'Supabase er ikke konfigureret i appen.';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSyncError(error.message);
      setSyncStatus('error');
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!supabase || !userId) return;
    setSyncStatus('syncing');
    const records = Object.entries(localCollections).map(([data_key, payload]) => ({
      user_id: userId,
      data_key,
      payload,
    }));
    const { error } = await supabase
      .from('life_records')
      .upsert(records, { onConflict: 'user_id,data_key' });
    if (error) {
      setSyncError(error.message);
      setSyncStatus('error');
    } else {
      setSyncError(null);
      setSyncStatus('synced');
    }
  }, [
    userId, tasks, events, weights, nutrition, workouts, runs, emails, transactions,
    investments, goals, trips, meetings, workTasks, workNotes, plans, trainingHistory,
  ]);

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
      userEmail, authLoading, syncStatus, syncError, signInWithEmail, signOut, syncNow,
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
