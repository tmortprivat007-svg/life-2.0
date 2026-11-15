
import { useState } from 'react';
import {
  Dumbbell,
  Plus,
  CheckCircle2,
  Circle,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  ProgressRing,
  ProgressBar,
  SectionHeader,
  BarChart,
  Modal,
  Badge,
} from '@/components/ui';
import {
  useLocalStorage,
  uid,
  formatDate,
  isoDate,
} from '@/hooks/useLocalStorage';
import {
  initialTrainingPlans,
  initialTrainingHistory,
} from '@/data/demoData';
import type {
  TrainingPlan,
  TrainingExercise,
  TrainingHistory,
} from '@/types';

export function Traening() {
  const [plans, setPlans] = useLocalStorage<TrainingPlan[]>(
    'life2_plans',
    initialTrainingPlans
  );

  const [history, setHistory] = useLocalStorage<TrainingHistory[]>(
    'life2_trainingHistory',
    initialTrainingHistory
  );

  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [exerciseModal, setExerciseModal] = useState(false);

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    muscle: '',
  });

  const completedPlans = plans.filter(p => p.completed).length;
  const totalExercises = plans.reduce(
    (s, p) => s + p.exercises.length,
    0
  );

  const last6History = history.slice(0, 6).reverse();

  const historyChartData = last6History.map(h => ({
    label: formatDate(h.date),
    value: h.volume,
    color: '#f97316',
  }));

  const totalVolume = history.reduce(
    (s, h) => s + h.volume,
    0
  );

  const totalDuration = history.reduce(
    (s, h) => s + h.duration,
    0
  );

  const avgDuration = history.length > 0
    ? Math.round(totalDuration / history.length)
    : 0;

  const toggleExercise = (planId: string, exerciseId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const exercises = plan.exercises.map(e =>
      e.id === exerciseId
        ? { ...e, done: !e.done }
        : e
    );

    const allDone = exercises.every(e => e.done);

    const updatedPlan = {
      ...plan,
      exercises,
      completed: allDone,
    };

    setPlans(prev =>
      prev.map(p =>
        p.id === planId ? updatedPlan : p
      )
    );

    setSelectedPlan(current =>
      current?.id === planId ? updatedPlan : current
    );

    if (allDone && !plan.completed) {
      const today = isoDate(new Date());

      const alreadyLogged = history.some(
        h => h.date === today && h.plan === plan.name
      );

      if (!alreadyLogged) {
        setHistory(prev => [{
          id: uid(),
          date: today,
          plan: plan.name,
          duration: exercises.length * 15,
          volume: exercises.reduce(
            (s, e) => s + e.sets * e.reps * e.weight,
            0
          ),
          exercises: exercises.length,
        }, ...prev]);
      }
    }
  };

  const markPlanComplete = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const completed = !plan.completed;

    const updatedPlan = {
      ...plan,
      completed,
    };

    setPlans(prev =>
      prev.map(p =>
        p.id === planId ? updatedPlan : p
      )
    );

    setSelectedPlan(current =>
      current?.id === planId ? updatedPlan : current
    );

    if (completed) {
      const today = isoDate(new Date());

      const alreadyLogged = history.some(
        h => h.date === today && h.plan === plan.name
      );

      if (!alreadyLogged) {
        setHistory(prev => [{
          id: uid(),
          date: today,
          plan: plan.name,
          duration: plan.exercises.length * 15,
          volume: plan.exercises.reduce(
            (s, e) => s + e.sets * e.reps * e.weight,
            0
          ),
          exercises: plan.exercises.length,
        }, ...prev]);
      }
    }
  };

  const addExercise = () => {
    if (!newExercise.name.trim() || !selectedPlan) return;

    const ex: TrainingExercise = {
      id: uid(),
      name: newExercise.name.trim(),
      sets: parseInt(newExercise.sets) || 3,
      reps: parseInt(newExercise.reps) || 10,
      weight: parseInt(newExercise.weight) || 0,
      muscle: newExercise.muscle.trim() || 'Generelt',
    };

    setPlans(prev =>
      prev.map(p =>
        p.id === selectedPlan.id
          ? { ...p, exercises: [...p.exercises, ex] }
          : p
      )
    );

    setSelectedPlan({
      ...selectedPlan,
      exercises: [...selectedPlan.exercises, ex],
    });

    setNewExercise({
      name: '',
      sets: '',
      reps: '',
      weight: '',
      muscle: '',
    });

    setExerciseModal(false);
  };

  const muscleColor: Record<string, string> = {
    Bryst: '#ef4444',
    Ryg: '#3b82f6',
    Skuldre: '#f59e0b',
    Biceps: '#ec4899',
    Triceps: '#f97316',
    Ben: '#22c55e',
    Calv: '#14b8a6',
    Generelt: '#06b6d4',
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Træning</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Styrke, cardio og fremgang
          </p>
        </div>
        <Dumbbell size={24} className="text-accent-orange" />
      </div>

      {/* Overview stats */}
      <div
        className="grid grid-cols-3 gap-3 animate-slide-up"
        style={{ animationDelay: '50ms' }}
      >
        <Card className="text-center !p-3">
          <ProgressRing
            progress={plans.length > 0
              ? (completedPlans / plans.length) * 100
              : 0}
            size={56}
            strokeWidth={5}
            color="#f97316"
            label={`${completedPlans}`}
            sublabel=""
          />
          <p className="text-[10px] text-slate-500 mt-1">Planer</p>
        </Card>

        <Card className="text-center !p-3">
          <p className="text-2xl font-bold text-white mt-1">
            {totalExercises}
          </p>
          <p className="text-[10px] text-slate-500">Øvelser</p>
        </Card>

        <Card className="text-center !p-3">
          <p className="text-2xl font-bold text-white mt-1">
            {history.length}
          </p>
          <p className="text-[10px] text-slate-500">Sessioner</p>
        </Card>
      </div>

      {/* Volume chart */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <SectionHeader
          title="Træningsvolumen"
          subtitle="Total volumen pr. session"
        />

        <Card>
          <BarChart data={historyChartData} height={120} />

          <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {totalVolume.toLocaleString('da-DK')}
              </p>
              <p className="text-[10px] text-slate-500">Total kg løftet</p>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {avgDuration}
              </p>
              <p className="text-[10px] text-slate-500">Gns. minutter</p>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {history.length}
              </p>
              <p className="text-[10px] text-slate-500">Historik</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Training plans */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        <SectionHeader
          title="Træningsplaner"
          subtitle={`${plans.length} ugeplaner`}
        />

        <div className="space-y-3">
          {plans.map(plan => {
            const doneCount = plan.exercises.filter(e => e.done).length;

            const progress = plan.exercises.length > 0
              ? (doneCount / plan.exercises.length) * 100
              : 0;

            return (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.completed && (
                        <CheckCircle2
                          size={14}
                          className="text-accent-green"
                        />
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {plan.day} · {plan.exercises.length} øvelser
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {doneCount}/{plan.exercises.length}
                    </span>
                    <ChevronRight size={16} className="text-slate-600" />
                  </div>
                </div>

                <ProgressBar progress={progress} color="#f97316" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Training history */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <SectionHeader
          title="Træningshistorik"
          subtitle="Seneste sessioner"
        />

        <Card>
          <div className="space-y-3">
            {history.slice(0, 6).map(h => (
              <div
                key={h.id}
                className="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center">
                    <Dumbbell
                      size={16}
                      className="text-accent-orange"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-white">{h.plan}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatDate(h.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-200">
                      {h.volume.toLocaleString('da-DK')} kg
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {h.duration} min · {h.exercises} øvelser
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-4">
                Ingen træninger registreret endnu
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Plan detail modal */}
      <Modal
        open={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan?.name || ''}
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge text={selectedPlan.day} color="#f97316" />
                <span className="text-xs text-slate-400">
                  {selectedPlan.exercises.length} øvelser
                </span>
              </div>

              <button
                onClick={() => markPlanComplete(selectedPlan.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  selectedPlan.completed
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                {selectedPlan.completed
                  ? 'Gennemført'
                  : 'Markér færdig'}
              </button>
            </div>

            <div className="space-y-2">
              {selectedPlan.exercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => toggleExercise(selectedPlan.id, ex.id)}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer active:scale-98 transition-transform"
                >
                  {ex.done ? (
                    <CheckCircle2
                      size={20}
                      className="text-accent-green shrink-0"
                    />
                  ) : (
                    <Circle
                      size={20}
                      className="text-slate-600 shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        ex.done
                          ? 'line-through text-slate-500'
                          : 'text-white'
                      }`}
                    >
                      {ex.name}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      {ex.sets} sæt · {ex.reps} reps ·{' '}
                      {ex.weight > 0
                        ? `${ex.weight} kg`
                        : 'Kropsvægt'}
                    </p>
                  </div>

                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: muscleColor[ex.muscle] || '#06b6d4',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => setExerciseModal(true)}
              className="w-full bg-white/5 text-slate-300 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Plus size={18} /> Tilføj øvelse
            </button>
          </div>
        )}
      </Modal>

      {/* Add exercise modal */}
      <Modal
        open={exerciseModal}
        onClose={() => setExerciseModal(false)}
        title="Ny øvelse"
      >
        <div className="space-y-3">
          <input
            type="text"
            value={newExercise.name}
            onChange={e =>
              setNewExercise({
                ...newExercise,
                name: e.target.value,
              })
            }
            placeholder="Øvelse navn"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />

          <input
            type="text"
            value={newExercise.muscle}
            onChange={e =>
              setNewExercise({
                ...newExercise,
                muscle: e.target.value,
              })
            }
            placeholder="Muskelgruppe (f.eks. Bryst)"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={newExercise.sets}
              onChange={e =>
                setNewExercise({
                  ...newExercise,
                  sets: e.target.value,
                })
              }
              placeholder="Sæt"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />

            <input
              type="number"
              value={newExercise.reps}
              onChange={e =>
                setNewExercise({
                  ...newExercise,
                  reps: e.target.value,
                })
              }
              placeholder="Reps"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />

            <input
              type="number"
              value={newExercise.weight}
              onChange={e =>
                setNewExercise({
                  ...newExercise,
                  weight: e.target.value,
                })
              }
              placeholder="Kg"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>

          <button
            onClick={addExercise}
            className="w-full bg-accent-orange text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
          >
            Tilføj øvelse
          </button>
        </div>
      </Modal>
    </div>
  );
}
