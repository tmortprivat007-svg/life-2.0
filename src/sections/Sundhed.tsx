import { useState } from 'react';
import {
  Scale,
  Flame,
  Dumbbell,
  Footprints,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Pencil,
} from 'lucide-react';
import { Card, ProgressRing, ProgressBar, SectionHeader, LineChart, Modal, DonutChart, Badge } from '@/components/ui';
import { useLocalStorage, uid, todayISO, isoDate, addDays, formatDate } from '@/hooks/useLocalStorage';
import { initialWeights, initialNutrition, initialWorkouts, initialRuns } from '@/data/demoData';
import type { WeightEntry, NutritionEntry, WorkoutEntry, RunEntry } from '@/types';

export function Sundhed() {
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>('life2_weights', initialWeights);
  const [nutrition, setNutrition] = useLocalStorage<NutritionEntry[]>('life2_nutrition', initialNutrition);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutEntry[]>('life2_workouts', initialWorkouts);
  const [runs, setRuns] = useLocalStorage<RunEntry[]>('life2_runs', initialRuns);

  const [weightModal, setWeightModal] = useState(false);
  const [foodModal, setFoodModal] = useState(false);
  const [runModal, setRunModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [editWeightModal, setEditWeightModal] = useState(false);
  const [editWeightValue, setEditWeightValue] = useState('');
  const [newFood, setNewFood] = useState({ meal: '', calories: '', protein: '', carbs: '', fat: '' });
  const [newRun, setNewRun] = useState({ distance: '', duration: '' });

  const todayStr = todayISO();
  const todayNutrition = nutrition.filter(n => n.date === todayStr);
  const totalCalories = todayNutrition.reduce((s, n) => s + n.calories, 0);
  const totalProtein = todayNutrition.reduce((s, n) => s + n.protein, 0);
  const totalCarbs = todayNutrition.reduce((s, n) => s + n.carbs, 0);
  const totalFat = todayNutrition.reduce((s, n) => s + n.fat, 0);

  const calorieGoal = 2200;
  const calorieProgress = (totalCalories / calorieGoal) * 100;

  const currentWeight = weights[weights.length - 1]?.weight ?? 0;
  const weightChange = weights.length > 1 ? currentWeight - weights[0].weight : 0;
  const weightTrend = weightChange < 0 ? 'down' : weightChange > 0 ? 'up' : 'same';

  const last14Weights = weights.slice(-14).map(w => w.weight);

  const weeklyWorkouts = workouts.filter(w => {
    const diff = (new Date().getTime() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const totalCaloriesBurned = weeklyWorkouts.reduce((s, w) => s + w.calories, 0);

  const totalDistance = runs.reduce((s, r) => s + r.distance, 0);
  const totalRunDuration = runs.reduce((s, r) => s + r.duration, 0);
  const avgPace = totalRunDuration > 0 ? (totalRunDuration / totalDistance).toFixed(1) : '0';

  const addWeight = () => {
    const w = parseFloat(newWeight);
    if (!w) return;
    setWeights(prev => [...prev, { id: uid(), date: todayStr, weight: Math.round(w * 10) / 10 }]);
    setNewWeight('');
    setWeightModal(false);
  };

  const openEditWeight = () => {
    setEditWeightValue(String(currentWeight));
    setEditWeightModal(true);
  };

  const saveEditWeight = () => {
    const w = parseFloat(editWeightValue);
    if (!w) return;
    setWeights(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], weight: Math.round(w * 10) / 10 };
      return updated;
    });
    setEditWeightValue('');
    setEditWeightModal(false);
  };

  const addFood = () => {
    if (!newFood.meal.trim() || !newFood.calories) return;
    setNutrition(prev => [...prev, {
      id: uid(),
      date: todayStr,
      meal: newFood.meal.trim(),
      calories: parseInt(newFood.calories) || 0,
      protein: parseInt(newFood.protein) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
    }]);
    setNewFood({ meal: '', calories: '', protein: '', carbs: '', fat: '' });
    setFoodModal(false);
  };

  const addRun = () => {
    const d = parseFloat(newRun.distance);
    const dur = parseInt(newRun.duration);
    if (!d || !dur) return;
    const paceMin = Math.floor(dur / d);
    const paceSec = Math.round(((dur / d) - paceMin) * 60);
    setRuns(prev => [...prev, {
      id: uid(),
      date: todayStr,
      distance: d,
      duration: dur,
      pace: `${paceMin}:${paceSec.toString().padStart(2, '0')}`,
    }]);
    setNewRun({ distance: '', duration: '' });
    setRunModal(false);
  };

  const removeFood = (id: string) => setNutrition(prev => prev.filter(n => n.id !== id));
  const removeWeight = (id: string) => setWeights(prev => prev.filter(w => w.id !== id));

  const macroData = [
    { label: 'Protein', value: totalProtein, color: '#22c55e' },
    { label: 'Kulhydrat', value: totalCarbs, color: '#3b82f6' },
    { label: 'Fedt', value: totalFat, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Sundhed</h1>
          <p className="text-xs text-slate-400 mt-0.5">Din fysiske udvikling</p>
        </div>
        <Activity size={24} className="text-accent-green" />
      </div>

      {/* Weight tracking */}
      <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
        <SectionHeader
          title="Vægt"
          subtitle={`${currentWeight} kg — ${weightTrend === 'down' ? '' : '+'}${weightChange.toFixed(1)} kg på 30 dage`}
          action={
            <button onClick={() => setWeightModal(true)} className="w-8 h-8 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-accent-green" />
              <span className="text-2xl font-bold text-white">{currentWeight}</span>
              <span className="text-sm text-slate-400">kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              {weightTrend === 'down' ? (
                <TrendingDown size={16} className="text-accent-green" />
              ) : (
                <TrendingUp size={16} className="text-accent-amber" />
              )}
              <span className={`text-sm font-semibold ${weightTrend === 'down' ? 'text-accent-green' : 'text-accent-amber'}`}>
                {weightChange.toFixed(1)} kg
              </span>
              <button
                onClick={openEditWeight}
                className="ml-1 w-7 h-7 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>
          <LineChart data={last14Weights} height={100} color="#22c55e" />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-500">14 dage siden</span>
            <span className="text-[9px] text-slate-500">I dag</span>
          </div>
        </Card>
      </div>

      {/* Calorie intake */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          title="Ernæring i dag"
          subtitle={`${totalCalories} / ${calorieGoal} kcal`}
          action={
            <button onClick={() => setFoodModal(true)} className="w-8 h-8 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing
              progress={calorieProgress}
              size={80}
              color="#06b6d4"
              label={`${totalCalories}`}
              sublabel="kcal"
            />
            <div className="flex-1 space-y-2">
              {macroData.map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-slate-300">{m.label}</span>
                    <span className="text-slate-400">{m.value}g</span>
                  </div>
                  <ProgressBar progress={(m.value / 150) * 100} color={m.color} height={4} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {todayNutrition.map(n => (
              <div key={n.id} className="flex items-center justify-between py-2 border-t border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{n.meal}</p>
                  <p className="text-[10px] text-slate-500">{n.protein}p · {n.carbs}k · {n.fat}f</p>
                </div>
                <span className="text-sm font-semibold text-slate-300">{n.calories} kcal</span>
                <button onClick={() => removeFood(n.id)} className="ml-2 text-slate-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {todayNutrition.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-2">Ingenting registreret i dag</p>
            )}
          </div>
        </Card>
      </div>

      {/* Workout summary */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <SectionHeader title="Træning denne uge" subtitle={`${weeklyWorkouts.length} sessioner`} />
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={<Dumbbell size={16} className="text-accent-orange" />} value={`${weeklyWorkouts.length}`} label="Træninger" />
            <MiniStat icon={<Flame size={16} className="text-accent-red" />} value={`${totalCaloriesBurned}`} label="Kalorier" />
            <MiniStat icon={<Heart size={16} className="text-accent-rose" />} value={`${weeklyWorkouts.reduce((s, w) => s + w.duration, 0)}`} label="Minutter" />
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-slate-400 mb-2">Seneste træninger</p>
            <div className="space-y-2">
              {workouts.slice(0, 4).map(w => (
                <div key={w.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                    <span className="text-sm text-slate-200">{w.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDate(w.date)}</span>
                    <span className="text-xs text-slate-400">{w.duration}min</span>
                    <Badge text={`${w.calories} kcal`} color="#f97316" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Running */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader
          title="Løb"
          subtitle={`${totalDistance.toFixed(1)} km total`}
          action={
            <button onClick={() => setRunModal(true)} className="w-8 h-8 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniStat icon={<Footprints size={16} className="text-accent-blue" />} value={`${totalDistance.toFixed(1)}`} label="km total" />
            <MiniStat icon={<Activity size={16} className="text-accent-cyan" />} value={avgPace} label="min/km" />
            <MiniStat icon={<Flame size={16} className="text-accent-red" />} value={`${totalRunDuration}`} label="minutter" />
          </div>
          <div className="space-y-2">
            {runs.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Footprints size={14} className="text-accent-blue" />
                  <span className="text-sm text-slate-200">{r.distance} km</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{formatDate(r.date)}</span>
                  <span className="text-xs text-slate-400">{r.duration}min</span>
                  <Badge text={`${r.pace} /km`} color="#3b82f6" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="Registrer vægt">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Vægt i kg</label>
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWeight()}
              placeholder="f.eks. 82.5"
              autoFocus
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <button onClick={addWeight} className="w-full bg-accent-green text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Gem vægt
          </button>
        </div>
      </Modal>

      <Modal open={editWeightModal} onClose={() => setEditWeightModal(false)} title="Ret aktuelle vægt">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Nuværende vægt i kg</label>
            <input
              type="number"
              step="0.1"
              value={editWeightValue}
              onChange={e => setEditWeightValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEditWeight()}
              placeholder="f.eks. 87.0"
              autoFocus
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <button onClick={saveEditWeight} className="w-full bg-accent-green text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Gem ændring
          </button>
        </div>
      </Modal>

      <Modal open={foodModal} onClose={() => setFoodModal(false)} title="Tilføj måltid">
        <div className="space-y-3">
          <input
            type="text"
            value={newFood.meal}
            onChange={e => setNewFood({ ...newFood, meal: e.target.value })}
            placeholder="Måltid"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newFood.calories}
              onChange={e => setNewFood({ ...newFood, calories: e.target.value })}
              placeholder="Kalorier"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="number"
              value={newFood.protein}
              onChange={e => setNewFood({ ...newFood, protein: e.target.value })}
              placeholder="Protein (g)"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="number"
              value={newFood.carbs}
              onChange={e => setNewFood({ ...newFood, carbs: e.target.value })}
              placeholder="Kulhydrat (g)"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="number"
              value={newFood.fat}
              onChange={e => setNewFood({ ...newFood, fat: e.target.value })}
              placeholder="Fedt (g)"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <button onClick={addFood} className="w-full bg-accent-cyan text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Tilføj måltid
          </button>
        </div>
      </Modal>

      <Modal open={runModal} onClose={() => setRunModal(false)} title="Registrer løbetur">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={newRun.distance}
              onChange={e => setNewRun({ ...newRun, distance: e.target.value })}
              placeholder="f.eks. 5.2"
              autoFocus
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Tid (minutter)</label>
            <input
              type="number"
              value={newRun.duration}
              onChange={e => setNewRun({ ...newRun, duration: e.target.value })}
              placeholder="f.eks. 28"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <button onClick={addRun} className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Gem løbetur
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
