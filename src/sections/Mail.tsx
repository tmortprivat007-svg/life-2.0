import { useState } from 'react';
import { Mail, Star, Clock, AlertCircle, Search, Inbox, ArrowLeft, Trash2, Reply } from 'lucide-react';
import { Card, SectionHeader, Modal, Badge, EmptyState } from '@/components/ui';
import { useLocalStorage, uid } from '@/hooks/useLocalStorage';
import { initialEmails } from '@/data/demoData';
import type { Email } from '@/types';

const categoryLabels: Record<Email['category'], string> = {
  inbox: 'Alt',
  work: 'Arbejde',
  personal: 'Personligt',
  newsletter: 'Nyheder',
};

const categoryColors: Record<Email['category'], string> = {
  inbox: '#06b6d4',
  work: '#3b82f6',
  personal: '#ec4899',
  newsletter: '#f59e0b',
};

export function MailSection() {
  const [emails, setEmails] = useLocalStorage<Email[]>('life2_emails', initialEmails);
  const [filter, setFilter] = useState<Email['category'] | 'followup'>('inbox');
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });

  const filtered = emails.filter(e => {
    if (filter === 'followup') return e.followUp && !e.read;
    if (filter === 'inbox') return true;
    return e.category === filter;
  }).filter(e => {
    if (!search) return true;
    return e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase());
  });

  const unreadCount = emails.filter(e => !e.read).length;
  const importantCount = emails.filter(e => e.important).length;
  const followUpCount = emails.filter(e => e.followUp).length;

  const toggleRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: !e.read } : e));
  };

  const toggleStar = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const toggleFollowUp = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, followUp: !e.followUp } : e));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const sendEmail = () => {
    if (!compose.subject.trim()) return;
    const newEmail: Email = {
      id: uid(),
      from: 'Dig',
      fromInitial: 'D',
      subject: compose.subject.trim(),
      preview: compose.body.slice(0, 60),
      body: compose.body,
      time: 'Sendt',
      read: true,
      starred: false,
      important: false,
      followUp: false,
      category: 'inbox',
    };
    setEmails(prev => [newEmail, ...prev]);
    setCompose({ to: '', subject: '', body: '' });
    setComposeOpen(false);
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Mail</h1>
          <p className="text-xs text-slate-400 mt-0.5">{unreadCount} ulæste · {followUpCount} til opfølgning</p>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="w-9 h-9 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center active:scale-90"
        >
          <Mail size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-white">{unreadCount}</p>
          <p className="text-[10px] text-slate-500">Ulæste</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-accent-amber">{importantCount}</p>
          <p className="text-[10px] text-slate-500">Vigtige</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-accent-red">{followUpCount}</p>
          <p className="text-[10px] text-slate-500">Opfølgning</p>
        </Card>
      </div>

      {/* Search */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg i mails..."
            className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar animate-slide-up" style={{ animationDelay: '120ms' }}>
        {(['followup', 'inbox', 'work', 'personal', 'newsletter'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-slate-400'
            }`}
          >
            {f === 'followup' ? 'Opfølgning' : categoryLabels[f]}
          </button>
        ))}
      </div>

      {/* Email list */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <SectionHeader title={filter === 'followup' ? 'Til opfølgning' : categoryLabels[filter]} subtitle={`${filtered.length} mails`} />
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map(email => (
              <Card key={email.id} onClick={() => { setSelectedEmail(email); if (!email.read) toggleRead(email.id); }} className="!p-3 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: `${categoryColors[email.category]}30`, color: categoryColors[email.category] }}
                  >
                    {email.fromInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!email.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                        {email.from}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">{email.time}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${!email.read ? 'text-slate-200' : 'text-slate-400'}`}>
                      {email.subject}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{email.preview}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {!email.read && <div className="w-2 h-2 rounded-full bg-accent-cyan" />}
                      {email.important && <AlertCircle size={11} className="text-accent-amber" />}
                      {email.starred && <Star size={11} className="text-accent-amber fill-accent-amber" />}
                      {email.followUp && <Badge text="Opfølgning" color="#ef4444" />}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState icon={<Inbox size={24} />} title="Ingen mails her" subtitle="Prøv et andet filter" />
          </Card>
        )}
      </div>

      {/* Email detail modal */}
      <Modal open={!!selectedEmail} onClose={() => setSelectedEmail(null)} title={selectedEmail?.subject || ''}>
        {selectedEmail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: `${categoryColors[selectedEmail.category]}30`, color: categoryColors[selectedEmail.category] }}
              >
                {selectedEmail.fromInitial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{selectedEmail.from}</p>
                <p className="text-[10px] text-slate-500">{selectedEmail.time}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto no-scrollbar">
              <p className="text-sm text-slate-200 whitespace-pre-line">{selectedEmail.body}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleStar(selectedEmail.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  selectedEmail.starred ? 'bg-accent-amber/20 text-accent-amber' : 'bg-white/5 text-slate-400'
                }`}
              >
                <Star size={14} /> {selectedEmail.starred ? 'Stjernet' : 'Stjern'}
              </button>
              <button
                onClick={() => toggleFollowUp(selectedEmail.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  selectedEmail.followUp ? 'bg-accent-red/20 text-accent-red' : 'bg-white/5 text-slate-400'
                }`}
              >
                <Clock size={14} /> Opfølg
              </button>
              <button
                onClick={() => deleteEmail(selectedEmail.id)}
                className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center active:scale-95"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Compose modal */}
      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="Ny mail">
        <div className="space-y-3">
          <input
            type="text"
            value={compose.to}
            onChange={e => setCompose({ ...compose, to: e.target.value })}
            placeholder="Til"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <input
            type="text"
            value={compose.subject}
            onChange={e => setCompose({ ...compose, subject: e.target.value })}
            placeholder="Emne"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <textarea
            value={compose.body}
            onChange={e => setCompose({ ...compose, body: e.target.value })}
            placeholder="Din besked..."
            rows={5}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10 resize-none"
          />
          <button onClick={sendEmail} className="w-full bg-accent-cyan text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Reply size={16} /> Send mail
          </button>
        </div>
      </Modal>
    </div>
  );
}
