import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, SectionHeader, Modal, Badge } from '@/components/ui';
import { useLocalStorage, uid, todayISO, isoDate, addDays, dayName, formatDateLong } from '@/hooks/useLocalStorage';
import { initialEvents } from '@/data/demoData';
import type { CalendarEvent } from '@/types';

const categoryColors: Record<CalendarEvent['category'], string> = {
  work: '#3b82f6',
  personal: '#06b6d4',
  health: '#22c55e',
  social: '#ec4899',
  travel: '#f59e0b',
};

const categoryLabels: Record<CalendarEvent['category'], string> = {
  work: 'Arbejde',
  personal: 'Personligt',
  health: 'Sundhed',
  social: 'Socialt',
  travel: 'Rejse',
};

export function Kalender() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('life2_events', initialEvents);
  const [view, setView] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [eventModal, setEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: todayISO(), time: '12:00', duration: '60', category: 'work' as CalendarEvent['category'], location: '' });

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(addDays(today, -today.getDay() + 1), i));

  const selectedEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const weekEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return weekDays.some(d => isoDate(d) === e.date);
  });

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents(prev => [...prev, {
      id: uid(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time,
      duration: parseInt(newEvent.duration) || 60,
      category: newEvent.category,
      location: newEvent.location.trim() || undefined,
    }]);
    setNewEvent({ title: '', date: selectedDate, time: '12:00', duration: '60', category: 'work', location: '' });
    setEventModal(false);
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(todayISO()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 6);

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Kalender</h1>
          <p className="text-xs text-slate-400 mt-0.5">{formatDateLong(todayISO())}</p>
        </div>
        <button
          onClick={() => {
            setNewEvent({ ...newEvent, date: selectedDate });
            setEventModal(true);
          }}
          className="w-9 h-9 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center active:scale-90"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 animate-slide-up" style={{ animationDelay: '50ms' }}>
        {(['week', 'day'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              view === v ? 'bg-accent-blue text-white' : 'text-slate-400'
            }`}
          >
            {v === 'week' ? 'Uge' : 'Dag'}
          </button>
        ))}
      </div>

      {view === 'week' ? (
        <>
          {/* Week view */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {weekDays.map(d => {
                const dateStr = isoDate(d);
                const isToday = dateStr === todayISO();
                const isSelected = dateStr === selectedDate;
                const hasEvents = events.some(e => e.date === dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center py-2.5 rounded-xl transition-all active:scale-95 ${
                      isSelected ? 'bg-accent-blue/20 border border-accent-blue/30' : 'bg-white/5'
                    }`}
                  >
                    <span className={`text-[10px] uppercase ${isToday ? 'text-accent-cyan font-bold' : 'text-slate-400'}`}>
                      {dayName(d)}
                    </span>
                    <span className={`text-sm font-bold mt-1 ${isToday ? 'text-accent-cyan' : isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {d.getDate()}
                    </span>
                    {hasEvents && <div className={`w-1 h-1 rounded-full mt-1 ${isToday ? 'bg-accent-cyan' : 'bg-slate-500'}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day events */}
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <SectionHeader
              title={formatDateLong(selectedDate)}
              subtitle={`${selectedEvents.length} begivenheder`}
            />
            <Card>
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 group">
                      <div className="text-right shrink-0 w-12 pt-1">
                        <p className="text-xs font-semibold text-white">{event.time}</p>
                        {event.duration > 0 && <p className="text-[10px] text-slate-500">{event.duration}min</p>}
                      </div>
                      <div className="w-1 self-stretch rounded-full min-h-[2.5rem]" style={{ background: categoryColors[event.category] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{event.title}</p>
                        {event.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {event.location}
                          </p>
                        )}
                        <Badge text={categoryLabels[event.category]} color={categoryColors[event.category]} />
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-slate-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">Ingen begivenheder denne dag</p>
              )}
            </Card>
          </div>
        </>
      ) : (
        /* Day timeline view */
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Card>
            <div className="space-y-1">
              {Array.from({ length: 24 }, (_, h) => {
                const hourEvents = selectedEvents.filter(e => parseInt(e.time.split(':')[0]) === h);
                return (
                  <div key={h} className="flex gap-3 min-h-[3rem]">
                    <div className="w-12 shrink-0 text-right pt-1">
                      <span className="text-[10px] text-slate-500">{h.toString().padStart(2, '0')}:00</span>
                    </div>
                    <div className="flex-1 border-t border-white/5 pt-1">
                      {hourEvents.map(e => (
                        <div
                          key={e.id}
                          className="mb-1 p-2 rounded-lg"
                          style={{ background: `${categoryColors[e.category]}15`, borderLeft: `2px solid ${categoryColors[e.category]}` }}
                        >
                          <p className="text-sm font-medium text-white">{e.title}</p>
                          <p className="text-[10px] text-slate-400">{e.time} · {e.duration}min {e.location && `· ${e.location}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Upcoming events */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionHeader title="Kommende begivenheder" />
        <Card>
          <div className="space-y-3">
            {upcomingEvents.map(e => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: `${categoryColors[e.category]}15` }}>
                  <span className="text-xs font-bold" style={{ color: categoryColors[e.category] }}>
                    {new Date(e.date).getDate()}
                  </span>
                  <span className="text-[8px] text-slate-500">
                    {dayName(new Date(e.date))}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{e.title}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {e.time}
                    {e.location && <><MapPin size={10} /> {e.location}</>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={eventModal} onClose={() => setEventModal(false)} title="Ny begivenhed">
        <div className="space-y-3">
          <input
            type="text"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Titel"
            autoFocus
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newEvent.date}
              onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newEvent.duration}
              onChange={e => setNewEvent({ ...newEvent, duration: e.target.value })}
              placeholder="Minutter"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="text"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Sted"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(categoryLabels) as CalendarEvent['category'][]).map(cat => (
              <button
                key={cat}
                onClick={() => setNewEvent({ ...newEvent, category: cat })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  newEvent.category === cat ? 'text-white' : 'text-slate-400 bg-white/5'
                }`}
                style={newEvent.category === cat ? { background: `${categoryColors[cat]}30`, color: categoryColors[cat] } : {}}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
          <button onClick={addEvent} className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Opret begivenhed
          </button>
        </div>
      </Modal>
    </div>
  );
}
