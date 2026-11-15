import { useState } from 'react';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  FileText,
  Trash2,
  Calendar as CalendarIcon,
  ChevronRight,
  StickyNote,
} from 'lucide-react';
import { Card, ProgressRing, ProgressBar, SectionHeader, Modal, Badge } from '@/components/ui';
import { useLocalStorage, uid, todayISO, isoDate, addDays, formatDate, formatDateLong } from '@/hooks/useLocalStorage';
import { initialMeetings, initialWorkTasks, initialWorkNotes } from '@/data/demoData';
import type { Meeting, WorkTask, WorkNote } from '@/types';

const meetingTypeLabels: Record<Meeting['type'], string> = {
  meeting: 'Møde',
  call: 'Opkald',
  review: 'Gennemgang',
  deadline: 'Deadline',
};

const meetingTypeColors: Record<Meeting['type'], string> = {
  meeting: '#3b82f6',
  call: '#06b6d4',
  review: '#f59e0b',
  deadline: '#ef4444',
};

const priorityColors: Record<WorkTask['priority'], string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export function Arbejde() {
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('life2_meetings', initialMeetings);
  const [tasks, setTasks] = useLocalStorage<WorkTask[]>('life2_workTasks', initialWorkTasks);
  const [notes, setNotes] = useLocalStorage<WorkNote[]>('life2_workNotes', initialWorkNotes);

  const [taskModal, setTaskModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [meetingModal, setMeetingModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<WorkNote | null>(null);

  const [newTask, setNewTask] = useState({ title: '', project: '', priority: 'medium' as WorkTask['priority'], due: todayISO() });
  const [newNote, setNewNote] = useState({ title: '', content: '', project: '' });
  const [newMeeting, setNewMeeting] = useState({ title: '', date: todayISO(), time: '10:00', duration: '60', attendees: '', type: 'meeting' as Meeting['type'] });

  const todayStr = todayISO();
  const todayMeetings = meetings.filter(m => m.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date(todayStr)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const doneTasks = tasks.filter(t => t.done);
  const pendingTasks = tasks.filter(t => !t.done);
  const taskProgress = tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0;
  const highPriority = pendingTasks.filter(t => t.priority === 'high');

  const projects = [...new Set(tasks.map(t => t.project))];

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, {
      id: uid(),
      title: newTask.title.trim(),
      project: newTask.project.trim() || 'Generelt',
      done: false,
      priority: newTask.priority,
      due: newTask.due,
    }]);
    setNewTask({ title: '', project: '', priority: 'medium', due: todayISO() });
    setTaskModal(false);
  };

  const addNote = () => {
    if (!newNote.title.trim()) return;
    setNotes(prev => [{
      id: uid(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      date: todayISO(),
      project: newNote.project.trim() || 'Generelt',
    }, ...prev]);
    setNewNote({ title: '', content: '', project: '' });
    setNoteModal(false);
  };

  const addMeeting = () => {
    if (!newMeeting.title.trim()) return;
    setMeetings(prev => [...prev, {
      id: uid(),
      title: newMeeting.title.trim(),
      date: newMeeting.date,
      time: newMeeting.time,
      duration: parseInt(newMeeting.duration) || 60,
      attendees: newMeeting.attendees.split(',').map(a => a.trim()).filter(Boolean),
      type: newMeeting.type,
    }]);
    setNewMeeting({ title: '', date: todayISO(), time: '10:00', duration: '60', attendees: '', type: 'meeting' });
    setMeetingModal(false);
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };
  const deleteMeeting = (id: string) => setMeetings(prev => prev.filter(m => m.id !== id));

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Arbejde</h1>
          <p className="text-xs text-slate-400 mt-0.5">{todayMeetings.length} møder i dag · {pendingTasks.length} opgaver</p>
        </div>
        <Briefcase size={24} className="text-accent-teal" />
      </div>

      {/* Today overview */}
      <Card delay={50}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={taskProgress} size={72} color="#14b8a6" label={`${Math.round(taskProgress)}%`} sublabel="færdig" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Dagens arbejde</p>
            <p className="text-xs text-slate-400 mt-0.5">{pendingTasks.length} åbne opgaver</p>
            {highPriority.length > 0 && (
              <p className="text-xs text-accent-red mt-1">{highPriority.length} høj prioritet</p>
            )}
            <div className="mt-2">
              <ProgressBar progress={taskProgress} color="#14b8a6" />
            </div>
          </div>
        </div>
      </Card>

      {/* Today's meetings */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          title="Dagens møder"
          subtitle={`${todayMeetings.length} planlagt`}
          action={
            <button onClick={() => setMeetingModal(true)} className="w-8 h-8 rounded-xl bg-accent-teal/15 text-accent-teal flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          {todayMeetings.length > 0 ? (
            <div className="space-y-3">
              {todayMeetings.map(m => (
                <div key={m.id} className="flex items-center gap-3 group">
                  <div className="text-right shrink-0 w-12">
                    <p className="text-xs font-semibold text-white">{m.time}</p>
                    {m.duration > 0 && <p className="text-[10px] text-slate-500">{m.duration}min</p>}
                  </div>
                  <div className="w-0.5 self-stretch rounded-full min-h-[2.5rem]" style={{ background: meetingTypeColors[m.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge text={meetingTypeLabels[m.type]} color={meetingTypeColors[m.type]} />
                      {m.attendees.length > 0 && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Users size={9} /> {m.attendees.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteMeeting(m.id)} className="text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Ingen møder i dag</p>
          )}
        </Card>
      </div>

      {/* Work tasks */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <SectionHeader
          title="Opgaver"
          subtitle={`${pendingTasks.length} åbne · ${projects.length} projekter`}
          action={
            <button onClick={() => setTaskModal(true)} className="w-8 h-8 rounded-xl bg-accent-teal/15 text-accent-teal flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <Card>
          <div className="space-y-1.5 max-h-80 overflow-y-auto no-scrollbar">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2 px-1 group cursor-pointer"
                onClick={() => toggleTask(task.id)}
              >
                {task.done ? (
                  <CheckCircle2 size={18} className="text-accent-green shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{task.project}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500">{formatDate(task.due)}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: priorityColors[task.priority] }} />
                <button
                  onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                  className="text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notes */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader
          title="Noter"
          subtitle={`${notes.length} noter`}
          action={
            <button onClick={() => setNoteModal(true)} className="w-8 h-8 rounded-xl bg-accent-teal/15 text-accent-teal flex items-center justify-center active:scale-90">
              <Plus size={16} />
            </button>
          }
        />
        <div className="space-y-3">
          {notes.map(note => (
            <Card key={note.id} onClick={() => setSelectedNote(note)} className="cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent-teal/15 flex items-center justify-center shrink-0">
                  <StickyNote size={14} className="text-accent-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{note.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge text={note.project} color="#14b8a6" />
                    <span className="text-[10px] text-slate-500">{formatDate(note.date)}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming meetings */}
      <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
        <SectionHeader title="Kommende møder" />
        <Card>
          <div className="space-y-3">
            {upcomingMeetings.map(m => (
              <div key={m.id} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: `${meetingTypeColors[m.type]}15` }}>
                  <span className="text-xs font-bold" style={{ color: meetingTypeColors[m.type] }}>
                    {new Date(m.date).getDate()}
                  </span>
                  <span className="text-[8px] text-slate-500">{formatDate(m.date).split(' ').pop()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{m.title}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={9} /> {m.time} · {meetingTypeLabels[m.type]}
                  </p>
                </div>
                <button onClick={() => deleteMeeting(m.id)} className="text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Ny opgave">
        <div className="space-y-3">
          <input
            type="text"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Opgave"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <input
            type="text"
            value={newTask.project}
            onChange={e => setNewTask({ ...newTask, project: e.target.value })}
            placeholder="Projekt"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value as WorkTask['priority'] })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            >
              <option value="high" className="bg-navy-850">Høj prioritet</option>
              <option value="medium" className="bg-navy-850">Mellem prioritet</option>
              <option value="low" className="bg-navy-850">Lav prioritet</option>
            </select>
            <input
              type="date"
              value={newTask.due}
              onChange={e => setNewTask({ ...newTask, due: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
          </div>
          <button onClick={addTask} className="w-full bg-accent-teal text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Tilføj opgave
          </button>
        </div>
      </Modal>

      <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Ny note">
        <div className="space-y-3">
          <input
            type="text"
            value={newNote.title}
            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Titel"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <input
            type="text"
            value={newNote.project}
            onChange={e => setNewNote({ ...newNote, project: e.target.value })}
            placeholder="Projekt"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <textarea
            value={newNote.content}
            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Dine noter..."
            rows={5}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10 resize-none"
          />
          <button onClick={addNote} className="w-full bg-accent-teal text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Gem note
          </button>
        </div>
      </Modal>

      <Modal open={meetingModal} onClose={() => setMeetingModal(false)} title="Nyt møde">
        <div className="space-y-3">
          <input
            type="text"
            value={newMeeting.title}
            onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
            placeholder="Titel"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newMeeting.date}
              onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
            <input
              type="time"
              value={newMeeting.time}
              onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newMeeting.duration}
              onChange={e => setNewMeeting({ ...newMeeting, duration: e.target.value })}
              placeholder="Minutter"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <select
              value={newMeeting.type}
              onChange={e => setNewMeeting({ ...newMeeting, type: e.target.value as Meeting['type'] })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            >
              <option value="meeting" className="bg-navy-850">Møde</option>
              <option value="call" className="bg-navy-850">Opkald</option>
              <option value="review" className="bg-navy-850">Gennemgang</option>
              <option value="deadline" className="bg-navy-850">Deadline</option>
            </select>
          </div>
          <input
            type="text"
            value={newMeeting.attendees}
            onChange={e => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
            placeholder="Deltagere (kommasepareret)"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <button onClick={addMeeting} className="w-full bg-accent-teal text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Opret møde
          </button>
        </div>
      </Modal>

      {/* Note detail */}
      <Modal open={!!selectedNote} onClose={() => setSelectedNote(null)} title={selectedNote?.title || ''}>
        {selectedNote && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge text={selectedNote.project} color="#14b8a6" />
              <span className="text-[10px] text-slate-500">{formatDate(selectedNote.date)}</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-slate-200 whitespace-pre-line">{selectedNote.content}</p>
            </div>
            <button
              onClick={() => deleteNote(selectedNote.id)}
              className="w-full bg-white/5 text-accent-red font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Trash2 size={16} /> Slet note
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
