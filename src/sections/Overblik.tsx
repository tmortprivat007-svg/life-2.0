
import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  Target,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Card,
  ProgressRing,
  ProgressBar,
  SectionHeader,
} from '@/components/ui';
import {
  useLocalStorage,
  uid,
  todayISO,
  formatDateLong,
  dayName,
  addDays,
  isoDate,
} from '@/hooks/useLocalStorage';
import {
  initialTasks,
  initialEvents,
  initialWeights,
  initialWorkouts,
  sectionColors,
} from '@/data/demoData';
import type { Task, SectionId } from '@/types';
import type { ReactNode } from 'react';

interface OverblikProps {
  onNavigate: (section: SectionId) => void;
}

export function Overblik({ onNavigate }: OverblikProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>(
    'life2_tasks',
    initialTasks
  );
  const [events] = useLocalStorage('life2_events', initialEvents);
  const [weights] = useLocalStorage('life2_weights', initialWeights);
  const [workouts] = useLocalStorage('life2_workouts', initialWorkouts);
  const [newTask, setNewTask] = useState('');

  const today = new Date();
  const todayStr = isoDate(today);

  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);

  const taskProgress =
    tasks.length > 0
      ? (doneTasks.length / tasks.length) * 100
      : 0;

  // Activity over the last seven days
  const last7Workouts = Array.from({ length: 7 }, (_, i) => {
    const date = isoDate(addDays(today, -6 + i));

    return workouts
      .filter(w => w.date === date)
      .reduce((sum, workout) => sum + workout.calories, 0);
  });

  const workoutsLast7Days = workouts.filter(w => {
    const date = new Date(`${w.date}T12:00:00`);
    const diff = Math.floor(
      (new Date(todayStr + 'T12:00:00').getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    return diff >= 0 && diff < 7;
  }).length;

  const currentWeight = weights.length
    ? weights[weights.length - 1].weight
    : 0;

  const firstWeight = weights.length
    ? weights[0].weight
    : 0;

  const weightChange = currentWeight - firstWeight;

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks(prev => [
      ...prev,
      {
        id: uid(),
        title: newTask.trim(),
        done: false,
        priority: 'medium',
      },
    ]);

    setNewTask('');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const priorityColor: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  };

  return (
    <div className="space-y-5 pb-4">

      {/* Welcome */}
      <div className="animate-slide-up">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          {formatDateLong(todayStr)}
        </p>
        <h1 className="text-2xl font-bold text-white">
          God dag
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Dit personlige LIFE-dashboard
        </p>
      </div>

      {/* Quick stats */}
      <div
        className="grid grid-cols-3 gap-3 animate-slide-up"
        style={{ animationDelay: '50ms' }}
      >
        <StatMini
          icon={<Flame size={16} className="text-accent-orange" />}
          label="Træning 7 dage"
          value={`${workoutsLast7Days}`}
        />

        <StatMini
          icon={<TrendingUp size={16} className="text-accent-green" />}
          label="Vægt"
          value={currentWeight ? `${currentWeight} kg` : '–'}
          hint={
            weights.length > 1
              ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg samlet`
              : undefined
          }
        />

        <StatMini
          icon={<Target size={16} className="text-accent-cyan" />}
          label="Opgaver"
          value={`${doneTasks.length}/${tasks.length}`}
        />
      </div>

      {/* Daily progress */}
      <Card delay={100}>
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={taskProgress}
            size={72}
            color="#06b6d4"
            label={`${Math.round(taskProgress)}%`}
            sublabel="færdig"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Dagens fremgang
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {pendingTasks.length} opgaver tilbage
            </p>
            <div className="mt-2">
              <ProgressBar
                progress={taskProgress}
                color="#06b6d4"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        <SectionHeader
          title="Prioriteringer & opgaver"
          subtitle={`${pendingTasks.length} åbne opgaver`}
        />

        <Card>
          <form
            onSubmit={e => {
              e.preventDefault();
              addTask();
            }}
            className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5"
          >
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Tilføj opgave..."
              aria-label="Ny opgave"
              className="flex-1 min-w-0 bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />

            <button
              type="submit"
              aria-label="Tilføj opgave"
              className="w-9 h-9 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center active:scale-90"
            >
              <Plus size={18} />
            </button>
          </form>

          <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2 px-1"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-label={
                    task.done
                      ? 'Markér som ikke færdig'
                      : 'Markér som færdig'
                  }
                  className="shrink-0"
                >
                  {task.done ? (
                    <CheckCircle2
                      size={20}
                      className="text-accent-green"
                    />
                  ) : (
                    <Circle
                      size={20}
                      className="text-slate-600"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p
                    className={`text-sm ${
                      task.done
                        ? 'line-through text-slate-500'
                        : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>
                </button>

                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: priorityColor[task.priority] || '#64748b',
                  }}
                />

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Slet opgave"
                  className="text-slate-500 p-2 active:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">
                Ingen opgaver. Tilføj en ovenfor.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Today's events */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <SectionHeader
          title="Dagens program"
          subtitle={`${todayEvents.length} begivenheder`}
          action={
            <button
              onClick={() => onNavigate('kalender')}
              className="text-xs text-accent-cyan flex items-center gap-1"
            >
              Kalender <ArrowRight size={12} />
            </button>
          }
        />

        <Card>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3"
                >
                  <div className="text-right shrink-0 w-12">
                    <p className="text-xs font-semibold text-white">
                      {event.time}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {event.duration} min
                    </p>
                  </div>

                  <div
                    className="w-0.5 h-8 rounded-full"
                    style={{
                      background:
                        sectionColors[event.category as SectionId] ||
                        '#3b82f6',
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {event.title}
                    </p>
                    {event.location && (
                      <p className="text-xs text-slate-400 truncate">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              Ingen begivenheder i dag
            </p>
          )}
        </Card>
      </div>

      {/* Weekly activity */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '250ms' }}
      >
        <SectionHeader
          title="Ugens aktivitet"
          subtitle="Kalorieforbrug pr. dag"
        />

        <Card>
          <div className="flex items-end justify-between gap-2 h-28">
            {last7Workouts.map((calories, i) => {
              const maxCalories = Math.max(
                ...last7Workouts,
                1
              );

              const height =
                calories > 0
                  ? Math.max(6, (calories / maxCalories) * 100)
                  : 3;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-2 h-full"
                >
                  <div className="text-[9px] text-slate-400">
                    {calories > 0 ? calories : ''}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-accent-orange/80"
                    style={{
                      height: `${height}%`,
                      minHeight: '3px',
                    }}
                  />
                  <span className="text-[9px] text-slate-500">
                    {dayName(addDays(today, -6 + i))}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* All modules */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '300ms' }}
      >
        <SectionHeader title="Dine LIFE-moduler" />

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(sectionColors) as SectionId[])
            .filter(s => s !== 'overblik')
            .map(section => (
              <QuickLink
                key={section}
                section={section}
                onClick={() => onNavigate(section)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function StatMini({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="glass-card p-3 text-center min-w-0">
      <div className="flex items-center justify-center mb-1">
        {icon}
      </div>
      <p className="text-sm font-bold text-white truncate">
        {value}
      </p>
      <p className="text-[10px] text-slate-500">
        {label}
      </p>
      {hint && (
        <p className="text-[9px] text-slate-400 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

function QuickLink({
  section,
  onClick,
}: {
  section: SectionId;
  onClick: () => void;
}) {
  const labels: Record<string, string> = {
    sundhed: 'Sundhed',
    traening: 'Træning',
    kalender: 'Kalender',
    mail: 'Mail',
    okonomi: 'Økonomi',
    rejser: 'Rejser',
    arbejde: 'Arbejde',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card glass-card-hover p-3 flex items-center justify-between active:scale-95 transition-transform"
    >
      <span className="text-sm font-medium text-white">
        {labels[section]}
      </span>

      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{
          background: `${sectionColors[section]}20`,
        }}
      >
        <ArrowRight
          size={14}
          style={{ color: sectionColors[section] }}
        />
      </div>
    </button>
  );
}
