import { useState } from 'react';
import {
  Plane,
  MapPin,
  Calendar as CalendarIcon,
  Hotel,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  Luggage,
  ArrowRight,
} from 'lucide-react';
import { Card, ProgressRing, ProgressBar, SectionHeader, Modal, Badge } from '@/components/ui';
import { useLocalStorage, uid, formatDate, formatDateLong, isoDate, addDays, formatCurrency } from '@/hooks/useLocalStorage';
import { initialTrips } from '@/data/demoData';
import type { Trip } from '@/types';

const statusLabels: Record<Trip['status'], string> = {
  upcoming: 'Kommende',
  planning: 'Planlægges',
  completed: 'Gennemført',
};

const statusColors: Record<Trip['status'], string> = {
  upcoming: '#22c55e',
  planning: '#f59e0b',
  completed: '#64748b',
};

export function Rejser() {
  const [trips, setTrips] = useLocalStorage<Trip[]>('life2_trips', initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripModal, setTripModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '', country: '', startDate: '', endDate: '',
    hotel: '', hotelAddress: '', flightOut: '', flightBack: '',
    budget: '', notes: '',
  });

  const upcoming = trips.filter(t => t.status === 'upcoming' || t.status === 'planning');
  const nextTrip = upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  const daysUntilNext = nextTrip
    ? Math.ceil((new Date(nextTrip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);

  const addTrip = () => {
    if (!newTrip.destination.trim()) return;
    setTrips(prev => [...prev, {
      id: uid(),
      destination: newTrip.destination.trim(),
      country: newTrip.country.trim(),
      startDate: newTrip.startDate || todayISOStr(),
      endDate: newTrip.endDate || newTrip.startDate || todayISOStr(),
      hotel: newTrip.hotel.trim(),
      hotelAddress: newTrip.hotelAddress.trim(),
      flightOut: newTrip.flightOut.trim(),
      flightBack: newTrip.flightBack.trim(),
      status: 'planning',
      budget: parseInt(newTrip.budget) || 0,
      notes: newTrip.notes.trim(),
      image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800',
    }]);
    setNewTrip({ destination: '', country: '', startDate: '', endDate: '', hotel: '', hotelAddress: '', flightOut: '', flightBack: '', budget: '', notes: '' });
    setTripModal(false);
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (selectedTrip?.id === id) setSelectedTrip(null);
  };

  function todayISOStr() {
    return new Date().toISOString().slice(0, 10);
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Rejser</h1>
          <p className="text-xs text-slate-400 mt-0.5">{upcoming.length} kommende rejser</p>
        </div>
        <button
          onClick={() => setTripModal(true)}
          className="w-9 h-9 rounded-xl bg-accent-pink/15 text-accent-pink flex items-center justify-center active:scale-90"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Next trip hero */}
      {nextTrip && (
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <Card className="!p-0 overflow-hidden">
            <div className="relative h-40">
              <img src={nextTrip.image} alt={nextTrip.destination} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge text={statusLabels[nextTrip.status]} color={statusColors[nextTrip.status]} />
                  <span className="text-[10px] text-white/70">{nextTrip.country}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{nextTrip.destination}</h2>
                <p className="text-xs text-white/70">{formatDate(nextTrip.startDate)} — {formatDate(nextTrip.endDate)}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent-pink" />
                  <span className="text-sm text-slate-300">
                    {daysUntilNext > 0 ? `${daysUntilNext} dage til` : 'I dag!'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTrip(nextTrip)}
                  className="text-xs text-accent-pink flex items-center gap-1 font-medium"
                >
                  Detaljer <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trip cards */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader title="Alle rejser" subtitle={`${trips.length} rejser · ${formatCurrency(totalBudget)} total budget`} />
        <div className="space-y-3">
          {trips.map(trip => {
            const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <Card key={trip.id} onClick={() => setSelectedTrip(trip)} className="!p-0 overflow-hidden cursor-pointer">
                <div className="flex">
                  <div className="w-24 h-24 shrink-0">
                    <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white truncate">{trip.destination}</h3>
                      <Badge text={statusLabels[trip.status]} color={statusColors[trip.status]} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{trip.country}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
                    {daysUntil > 0 && (
                      <p className="text-[10px] text-accent-pink mt-1">{daysUntil} dage til afrejse</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trip detail modal */}
      <Modal open={!!selectedTrip} onClose={() => setSelectedTrip(null)} title={selectedTrip?.destination || ''}>
        {selectedTrip && (
          <div className="space-y-4">
            <img src={selectedTrip.image} alt={selectedTrip.destination} className="w-full h-32 rounded-xl object-cover" />
            <div className="flex items-center gap-2">
              <Badge text={statusLabels[selectedTrip.status]} color={statusColors[selectedTrip.status]} />
              <span className="text-xs text-slate-400">{selectedTrip.country}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox icon={<CalendarIcon size={14} />} label="Afrejse" value={formatDate(selectedTrip.startDate)} />
              <InfoBox icon={<CalendarIcon size={14} />} label="Hjemrejse" value={formatDate(selectedTrip.endDate)} />
            </div>

            {selectedTrip.flightOut && (
              <InfoRow icon={<Plane size={14} className="text-accent-pink" />} label="Udflugt" value={selectedTrip.flightOut} />
            )}
            {selectedTrip.flightBack && (
              <InfoRow icon={<Plane size={14} className="text-accent-blue" />} label="Hjemflugt" value={selectedTrip.flightBack} />
            )}
            {selectedTrip.hotel && (
              <InfoRow icon={<Hotel size={14} className="text-accent-amber" />} label="Hotel" value={selectedTrip.hotel} />
            )}
            {selectedTrip.hotelAddress && (
              <InfoRow icon={<MapPin size={14} className="text-accent-red" />} label="Adresse" value={selectedTrip.hotelAddress} />
            )}

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-accent-amber" />
                <span className="text-sm text-slate-300">Budget</span>
              </div>
              <span className="text-lg font-bold text-white">{formatCurrency(selectedTrip.budget)}</span>
            </div>

            {selectedTrip.notes && (
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Noter</p>
                <p className="text-sm text-slate-200 whitespace-pre-line">{selectedTrip.notes}</p>
              </div>
            )}

            <button
              onClick={() => deleteTrip(selectedTrip.id)}
              className="w-full bg-white/5 text-accent-red font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Trash2 size={16} /> Slet rejse
            </button>
          </div>
        )}
      </Modal>

      {/* Add trip modal */}
      <Modal open={tripModal} onClose={() => setTripModal(false)} title="Ny rejse">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newTrip.destination}
              onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })}
              placeholder="Destination"
              autoFocus
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="text"
              value={newTrip.country}
              onChange={e => setNewTrip({ ...newTrip, country: e.target.value })}
              placeholder="Land"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newTrip.startDate}
              onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
            <input
              type="date"
              value={newTrip.endDate}
              onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })}
              className="bg-white/5 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10"
            />
          </div>
          <input
            type="text"
            value={newTrip.hotel}
            onChange={e => setNewTrip({ ...newTrip, hotel: e.target.value })}
            placeholder="Hotel"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <input
            type="text"
            value={newTrip.hotelAddress}
            onChange={e => setNewTrip({ ...newTrip, hotelAddress: e.target.value })}
            placeholder="Hotel adresse"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newTrip.flightOut}
              onChange={e => setNewTrip({ ...newTrip, flightOut: e.target.value })}
              placeholder="Udflugt"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
            <input
              type="text"
              value={newTrip.flightBack}
              onChange={e => setNewTrip({ ...newTrip, flightBack: e.target.value })}
              placeholder="Hjemflugt"
              className="bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
            />
          </div>
          <input
            type="number"
            value={newTrip.budget}
            onChange={e => setNewTrip({ ...newTrip, budget: e.target.value })}
            placeholder="Budget (kr)"
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10"
          />
          <textarea
            value={newTrip.notes}
            onChange={e => setNewTrip({ ...newTrip, notes: e.target.value })}
            placeholder="Noter..."
            rows={3}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:bg-white/10 resize-none"
          />
          <button onClick={addTrip} className="w-full bg-accent-pink text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Opret rejse
          </button>
        </div>
      </Modal>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl">
      <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">{icon} {label}</p>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
      <div className="shrink-0 pt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
