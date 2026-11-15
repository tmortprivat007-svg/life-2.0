import { useMemo, useState } from 'react';
import {
  CheckCircle2, Circle, Flame, TrendingUp, Target, ArrowRight, Plus,
  Trash2, CalendarDays, Sparkles, Clock3, Dumbbell, HeartPulse,
  Wallet, Plane, Briefcase, Mail, ChevronRight, Star, Focus
} from 'lucide-react';
import { Card, ProgressRing, ProgressBar, SectionHeader } from '@/components/ui';
import { useLocalStorage, uid, formatDateLong, dayName } from '@/hooks/useLocalStorage';
import {
  initialTasks, initialEvents, initialWeights, initialWorkouts, sectionColors,
} from '@/data/demoData';
import type { Task, SectionId, CalendarEvent } from '@/types';
import type { ReactNode } from 'react';

interface OverblikProps { onNavigate: (section: SectionId) => void; }

function localISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function greeting(hour: number): string {
  if (hour < 5) return 'God nat';
  if (hour < 10) return 'Godmorgen';
  if (hour < 18) return 'God dag';
  return 'God aften';
}

const priorityMeta = {
  high: { label: 'Høj', color: '#fb7185' },
  medium: { label: 'Mellem', color: '#fbbf24' },
  low: { label: 'Lav', color: '#34d399' },
} as const;

const moduleMeta: Array<{ id: SectionId; label: string; icon: typeof HeartPulse }> = [
  { id: 'sundhed', label: 'Sundhed', icon: HeartPulse },
  { id: 'traening', label: 'Træning', icon: Dumbbell },
  { id: 'kalender', label: 'Kalender', icon: CalendarDays },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'okonomi', label: 'Økonomi', icon: Wallet },
  { id: 'rejser', label: 'Rejser', icon: Plane },
  { id: 'arbejde', label: 'Arbejde', icon: Briefcase },
];

export function Overblik({ onNavigate }: OverblikProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('life2_tasks', initialTasks);
  const [events] = useLocalStorage<CalendarEvent[]>('life2_events', initialEvents);
  const [weights] = useLocalStorage('life2_weights', initialWeights);
  const [workouts] = useLocalStorage('life2_workouts', initialWorkouts);
  const [dailyFocus, setDailyFocus] = useLocalStorage<string>('life2_dailyFocus', '');
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const now = new Date();
  const todayStr = localISO(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const todayEvents = useMemo(() => events
    .filter(e => e.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time)), [events, todayStr]);
  const upcomingEvents = useMemo(() => events
    .filter(e => e.date > todayStr && e.date <= localISO(nextWeek))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4), [events, todayStr]);
  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);
  const taskProgress = tasks.length ? doneTasks.length / tasks.length * 100 : 0;
  const hasTasks = tasks.length > 0;
  const workoutsLast7Days = workouts.filter(w => {
    const d = new Date(`${w.date}T12:00:00`);
    const start = new Date(todayStr + 'T00:00:00');
    const diff = Math.floor((start.getTime() - d.getTime()) / 86400000);
    return diff >= 0 && diff < 7;
  }).length;
  const currentWeight = weights.length ? weights[weights.length - 1].weight : null;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - 6 + i);
    const date = localISO(d);
    return { date, label: dayName(d), count: workouts.filter(w => w.date === date).length };
  });
  const maxActivity = Math.max(1, ...weekDays.map(d => d.count));

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: uid(), title: newTask.trim(), done: false, priority: newPriority }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const nextEvent = [...todayEvents, ...upcomingEvents].find(e => e.date > todayStr || (e.date === todayStr && e.time >= now.toTimeString().slice(0, 5)));

  return (
    <div className="space-y-5 pb-5">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-navy-850 to-blue-500/10 p-5">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{formatDateLong(todayStr)}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{greeting(now.getHours())}</h1>
          <p className="mt-1 text-sm text-slate-300">Her er dit overblik – og plads til at vælge dagens vigtigste fokus.</p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/15 px-3 py-2.5">
            <Focus size={17} className="shrink-0 text-cyan-300" />
            <input value={dailyFocus} onChange={e => setDailyFocus(e.target.value)} placeholder="Hvad er vigtigst for dig i dag?" aria-label="Dagens fokus" className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 outline-none" />
            {dailyFocus && <button onClick={() => setDailyFocus('')} aria-label="Ryd dagens fokus" className="text-xs text-slate-400">Ryd</button>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2.5">
        <StatMini icon={<Flame size={17} className="text-orange-400" />} label="Træning · 7 dage" value={String(workoutsLast7Days)} />
        <StatMini icon={<TrendingUp size={17} className="text-emerald-400" />} label="Seneste vægt" value={currentWeight !== null ? `${currentWeight} kg` : '–'} />
        <StatMini icon={<Target size={17} className="text-cyan-300" />} label="Opgaver klaret" value={`${doneTasks.length}/${tasks.length}`} />
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing progress={taskProgress} size={76} color="#06b6d4" label={hasTasks ? `${Math.round(taskProgress)}%` : "—"} sublabel={hasTasks ? "klaret" : "ingen opgaver"} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Dagens fremdrift</p>
            <p className="mt-1 text-xs text-slate-400">{hasTasks ? `${pendingTasks.length} åbne · ${doneTasks.length} afsluttet` : "Tilføj dagens første opgave for at følge fremgangen."}</p>
            <div className="mt-3"><ProgressBar progress={taskProgress} color="#06b6d4" /></div>
          </div>
        </div>
      </Card>

      <section>
        <SectionHeader title="Dagens vigtigste" subtitle="Opret, prioritér og kryds af" />
        <Card>
          <form onSubmit={e => { e.preventDefault(); addTask(); }} className="mb-3 flex gap-2 border-b border-white/5 pb-3">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Skriv en opgave…" aria-label="Ny opgave" className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:bg-white/10" />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as Task['priority'])} aria-label="Prioritet" className="w-[88px] rounded-xl bg-navy-800 px-2 text-xs text-slate-200 outline-none">
              <option value="high">Høj</option><option value="medium">Mellem</option><option value="low">Lav</option>
            </select>
            <button type="submit" aria-label="Tilføj opgave" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300"><Plus size={19} /></button>
          </form>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {[...pendingTasks, ...doneTasks].map(task => (
              <div key={task.id} className="flex items-center gap-2.5 rounded-xl px-1 py-2">
                <button type="button" onClick={() => toggleTask(task.id)} aria-label={task.done ? 'Markér som åben' : 'Markér som færdig'} className="shrink-0">
                  {task.done ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-slate-500" />}
                </button>
                <span className={`min-w-0 flex-1 text-sm ${task.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</span>
                <span className="rounded-full px-2 py-1 text-[10px]" style={{ color: priorityMeta[task.priority].color, background: `${priorityMeta[task.priority].color}18` }}>{priorityMeta[task.priority].label}</span>
                <button type="button" onClick={() => deleteTask(task.id)} aria-label="Slet opgave" className="p-1.5 text-slate-600 hover:text-rose-400"><Trash2 size={15} /></button>
              </div>
            ))}
            {tasks.length === 0 && <div className="py-5 text-center"><Target size={22} className="mx-auto mb-2 text-slate-600" /><p className="text-sm text-slate-400">Ingen opgaver endnu</p><p className="mt-1 text-xs text-slate-500">Tilføj den første opgave ovenfor – så følger LIFE din fremgang.</p></div>}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeader title="I dag" subtitle={`${todayEvents.length} kalenderbegivenheder`} action={<button onClick={() => onNavigate('kalender')} className="flex items-center gap-1 text-xs text-cyan-300">Åbn kalender <ArrowRight size={13} /></button>} />
        <Card>
          {todayEvents.length ? <div className="space-y-3">{todayEvents.map(event => <EventRow key={event.id} event={event} />)}</div> : <EmptyLine icon={<CalendarDays size={20} />} title="Kalenderen er fri i dag" detail="Dine aftaler vises her, når kalenderen er udfyldt." />}
        </Card>
      </section>

      <section>
        <SectionHeader title="Kommende" subtitle="Næste 7 dage" action={<button onClick={() => onNavigate('kalender')} className="text-xs text-cyan-300">Se alle</button>} />
        <Card>
          {upcomingEvents.length ? <div className="space-y-3">{upcomingEvents.map(event => <EventRow key={event.id} event={event} showDate />)}</div> : <EmptyLine icon={<Clock3 size={20} />} title="Ingen kommende aftaler" detail="Nye begivenheder fra kalenderen dukker op her." />}
        </Card>
      </section>

      <section>
        <SectionHeader title="Aktivitet" subtitle="Registrerede træningspas · seneste 7 dage" action={<button onClick={() => onNavigate('traening')} className="text-xs text-cyan-300">Træning <ArrowRight size={13} /></button>} />
        <Card>
          <div className="flex h-24 items-end justify-between gap-2">
            {weekDays.map(day => <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-16 w-full items-end rounded-lg bg-white/[0.03] p-1"><div className="w-full rounded-md bg-gradient-to-t from-orange-500/70 to-amber-300" style={{ height: day.count ? `${Math.max(12, day.count / maxActivity * 100)}%` : '3px', opacity: day.count ? 1 : 0.25 }} /></div>
              <span className="text-[10px] text-slate-500">{day.label}</span>
            </div>)}
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">{workoutsLast7Days === 0 ? 'Registrér din træning for at følge udviklingen.' : `${workoutsLast7Days} træningspas registreret denne uge.`}</p>
        </Card>
      </section>

      <section>
        <SectionHeader title="Dine moduler" subtitle="Gå direkte til det, du vil arbejde med" />
        <div className="grid grid-cols-2 gap-2.5">
          {moduleMeta.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} className="glass-card glass-card-hover flex items-center gap-3 p-3 text-left active:scale-[0.98]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${sectionColors[id]}20`, color: sectionColors[id] }}><Icon size={18} /></span>
            <span className="min-w-0 flex-1 text-sm font-medium text-white">{label}</span>
            <ChevronRight size={15} className="text-slate-500" />
          </button>)}
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-1 text-[10px] text-slate-600"><Sparkles size={12} /> LIFE 2.0 · Dit personlige overblik</div>
    </div>
  );
}

function StatMini({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="glass-card min-w-0 p-3 text-center"><div className="mb-1 flex justify-center">{icon}</div><p className="truncate text-sm font-bold text-white">{value}</p><p className="mt-0.5 text-[10px] leading-tight text-slate-500">{label}</p></div>;
}

function EventRow({ event, showDate = false }: { event: CalendarEvent; showDate?: boolean }) {
  const date = new Date(`${event.date}T12:00:00`);
  return <div className="flex items-center gap-3">
    <div className="w-12 shrink-0 text-right"><p className="text-xs font-semibold text-white">{showDate ? date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' }) : event.time}</p><p className="text-[10px] text-slate-500">{showDate ? event.time : `${event.duration} min`}</p></div>
    <div className="h-9 w-1 shrink-0 rounded-full bg-cyan-400" />
    <div className="min-w-0 flex-1"><p className="truncate text-sm text-white">{event.title}</p>{event.location && <p className="truncate text-xs text-slate-400">{event.location}</p>}</div>
    <ChevronRight size={15} className="text-slate-600" />
  </div>;
}

function EmptyLine({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="py-5 text-center"><div className="mb-2 flex justify-center text-slate-600">{icon}</div><p className="text-sm text-slate-300">{title}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
