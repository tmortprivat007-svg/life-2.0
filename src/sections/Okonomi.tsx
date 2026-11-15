import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
  PieChart,
  Trash2,
} from 'lucide-react';
import { Card, ProgressRing, ProgressBar, SectionHeader, Modal, Badge, DonutChart, BarChart } from '@/components/ui';
import { useLocalStorage, uid, todayISO, isoDate, addDays, formatDate, formatCurrency } from '@/hooks/useLocalStorage';
import { initialTransactions, initialInvestments, initialSavingsGoals } from '@/data/demoData';
import type { Transaction, SavingsGoal } from '@/types';

export function Okonomi() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('life2_transactions', initialTransactions);
  const [investments] = useLocalStorage('life2_investments', initialInvestments);
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('life2_savingsGoals', initialSavingsGoals);

  const [txModal, setTxModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [goalDeposit, setGoalDeposit] = useState<string | null>(null);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'expense' as 'income' | 'expense', category: 'Mad' });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '' });
  const [depositAmount, setDepositAmount] = useState('');

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const investmentTotal = investments.reduce((s, i) => s + i.value, 0);
  const investmentChange = investments.reduce((s, i) => s + i.value * (i.change / 100), 0);

  const savingsTotal = goals.reduce((s, g) => s + g.current, 0);
  const savingsTarget = goals.reduce((s, g) => s + g.target, 0);

  const categoryTotals: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  const donutData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label,
      value,
      color: ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#06b6d4'][i],
    }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = isoDate(addDays(new Date(), -6 + i));
    const dayExpense = transactions.filter(t => t.date === date && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { label: formatDate(date), value: dayExpense, color: '#f97316' };
  });

  const addTransaction = () => {
    if (!newTx.description.trim() || !newTx.amount) return;
    setTransactions(prev => [...prev, {
      id: uid(),
      date: todayISO(),
      description: newTx.description.trim(),
      amount: parseInt(newTx.amount) || 0,
      type: newTx.type,
      category: newTx.category,
    }]);
    setNewTx({ description: '', amount: '', type: 'expense', category: 'Mad' });
    setTxModal(false);
  };

  const addGoal = () => {
    if (!newGoal.name.trim() || !newGoal.target) return;
    setGoals(prev => [...prev, {
      id: uid(),
      name: newGoal.name.trim(),
      target: parseInt(newGoal.target) || 0,
      current: parseInt(newGoal.current) || 0,
      deadline: newGoal.deadline || todayISO(),
    }]);
    setNewGoal({ name: '', target: '', current: '', deadline: '' });
    setGoalModal(false);
  };

  const makeDeposit = (goalId: string) => {
    const amount = parseInt(depositAmount) || 0;
    if (!amount) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + amount } : g));
    setDepositAmount('');
    setGoalDeposit(null);
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const categories = ['Mad', 'Transport', 'Bolig', 'Sundhed', 'Underholdning', 'Abonnement', 'Tøj', 'Café', 'Gaver', 'Sidejob', 'Løn', 'Andet'];

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Økonomi</h1>
          <p className="text-xs text-slate-400 mt-0.5">Din økonomiske oversigt</p>
        </div>
        <Wallet size={24} className="text-accent-amber" />
      </div>

      {/* Balance card */}
      <Card delay={50}>
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Saldo denne måned</p>
          <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-green/15 flex items-center justify-center">
              <ArrowDownRight size={16} className="text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Indtægt</p>
              <p className="text-sm font-bold text-white">{formatCurrency(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-red/15 flex items-center justify-center">
              <ArrowUpRight size={16} className="text-accent-red" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Udgifter</p>
              <p className="text-sm font-bold text-white">{formatCurrency(expenses)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly spending chart */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader title="Udgifter sidste 7 dage" />
        <Card>
          <BarChart data={last7Days} height={100} />
        </Card>
      </div>

      {/* Category breakdown */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <SectionHeader title="Kategorier" subtitle="Hvor går pengene?" />
        <Card>
          <div className="flex items-center justify-center mb-4">
            <DonutChart data={donutData} size={140} strokeWidth={18} />
          </div>
          <div className="space-y-2">
            {donutData.map(d => (
              <div key={d.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm text-slate-300">{d.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Investments */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader title="Investeringer" subtitle={`${formatCurrency(investmentTotal)} total`} />
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(investmentTotal)}</p>
              <p className={`text-sm flex items-center gap-1 ${investmentChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {investmentChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {investmentChange >= 0 ? '+' : ''}{formatCurrency(Math.round(investmentChange))} ({(investmentChange / investmentTotal * 100).toFixed(1)}%)
              </p>
            </div>
            <PieChart size={28} className="text-accent-amber" />
          </div>
          <div className="space-y-2">
            {investments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-t border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{inv.name}</p>
                  <p className="text-[10px] text-slate-500">{inv.symbol} · {inv.shares} andele</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(inv.value)}</p>
                  <p className={`text-[10px] flex items-center justify-end gap-0.5 ${inv.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {inv.change >= 0 ? '+' : ''}{inv.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Savings goals */}
      <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
        <SectionHeader
          title="Opsparingsmål"
          subtitle={`${formatCurrency(savingsTotal)} / ${formatCurrency(savingsTarget)}`}
          action={
            <button onClick={() => setGoalModal(true)} className="w-8 h-8 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <div className="space-y-3">
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <Card key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={16} className="text-accent-amber" />
                    <span className="text-sm font-medium text-white">{goal.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} color="#f59e0b" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                  <button
                    onClick={() => setGoalDeposit(goal.id)}
                    className="text-xs text-accent-amber font-medium"
                  >
                    + Indsæt
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <SectionHeader
          title="Transaktioner"
          subtitle={`${transactions.length} posteringer`}
          action={
            <button onClick={() => setTxModal(true)} className="w-8 h-8 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
            {transactions.slice().reverse().map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-t border-white/5 first:border-t-0 group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-accent-green/15' : 'bg-accent-red/15'}`}>
                  {t.type === 'income' ? (
                    <ArrowDownRight size={14} className="text-accent-green" />
                  ) : (
                    <ArrowUpRight size={14} className="text-accent-red" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{t.description}</p>
                  <p className="text-[10px] text-slate-500">{t.category} · {formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-accent-green' : 'text-slate-300'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <button onClick={() => deleteTransaction(t.id)} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal open={txModal} onClose={() => setTxModal(false)} title="Ny transaktion">
        <div className="space-y-3">
          <input
            type="text"
            value={newTx.description}
            onChange={e => setNewTx({ ...newTx, description: e.target.value })}
            placeholder="Beskrivelse"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <input
            type="number"
            value={newTx.amount}
            onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
            placeholder="Beløb (kr)"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setNewTx({ ...newTx, type: 'expense' })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${newTx.type === 'expense' ? 'bg-accent-red/20 text-accent-red' : 'bg-white/5 text-slate-400'}`}
            >
              Udgift
            </button>
            <button
              onClick={() => setNewTx({ ...newTx, type: 'income' })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${newTx.type === 'income' ? 'bg-accent-green/20 text-accent-green' : 'bg-white/5 text-slate-400'}`}
            >
              Indtægt
            </button>
          </div>
          <select
            value={newTx.category}
            onChange={e => setNewTx({ ...newTx, category: e.target.value })}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
          >
            {categories.map(c => <option key={c} value={c} className="bg-navy-850">{c}</option>)}
          </select>
          <button onClick={addTransaction} className="w-full bg-accent-amber text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Tilføj transaktion
          </button>
        </div>
      </Modal>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Nyt opsparingsmål">
        <div className="space-y-3">
          <input
            type="text"
            value={newGoal.name}
            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
            placeholder="Navn (f.eks. Ferie)"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newGoal.target}
              onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
              placeholder="Mål (kr)"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="number"
              value={newGoal.current}
              onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
              placeholder="Nuværende (kr)"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <input
            type="date"
            value={newGoal.deadline}
            onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
          />
          <button onClick={addGoal} className="w-full bg-accent-amber text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Opret mål
          </button>
        </div>
      </Modal>

      <Modal open={!!goalDeposit} onClose={() => setGoalDeposit(null)} title="Indsæt på mål">
        <div className="space-y-3">
          <input
            type="number"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            placeholder="Beløb (kr)"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <button
            onClick={() => goalDeposit && makeDeposit(goalDeposit)}
            className="w-full bg-accent-amber text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
          >
            Indsæt
          </button>
        </div>
      </Modal>
    </div>
  );
}
