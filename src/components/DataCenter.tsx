import { X, Database, HeartPulse, CalendarDays, Mail, Wallet, Plane, Briefcase, Dumbbell, ShieldCheck, RefreshCw, LockKeyhole } from 'lucide-react';

interface DataCenterProps {
  onClose: () => void;
}

const sources = [
  { name: 'Apple Health', area: 'Sundhed og aktivitet', detail: 'Kræver en iPhone-app med HealthKit-adgang. En webside kan ikke selv læse Apple Health-data.', icon: HeartPulse, status: 'Kræver iOS-integration' },
  { name: 'iCloud Kalender', area: 'Aftaler og kalender', detail: 'Kræver sikker kontoforbindelse eller en godkendt kalenderintegration.', icon: CalendarDays, status: 'Kræver opsætning' },
  { name: 'Gmail', area: 'Mail og rejsebekræftelser', detail: 'Kræver Google OAuth-godkendelse og en sikker backend til tokens.', icon: Mail, status: 'Kræver opsætning' },
  { name: 'Danske Bank', area: 'Konti og betalinger', detail: 'Kræver en PSD2/Open Banking-udbyder og din udtrykkelige bankgodkendelse.', icon: Wallet, status: 'Kræver bankintegration' },
  { name: 'MyFitnessPal', area: 'Kost og ernæring', detail: 'Afhænger af tilgængelig API-adgang og godkendelse fra tjenesten.', icon: Dumbbell, status: 'Kræver API-adgang' },
  { name: 'Rejser', area: 'Bookinger og billetter', detail: 'Kan samles fra godkendte mail- og kalenderkilder, når de er forbundet.', icon: Plane, status: 'Afventer mail og kalender' },
  { name: 'Arbejde', area: 'Møder og opgaver', detail: 'Kan samles fra kalender og mail med særskilt adgang og tydelige tilladelser.', icon: Briefcase, status: 'Afventer mail og kalender' },
];

export function DataCenter({ onClose }: DataCenterProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="data-center-title">
      <div className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-navy-900 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-accent-cyan">
              <Database size={18} />
              <span className="text-xs font-semibold uppercase tracking-wider">LIFE 2.0 · Datacenter</span>
            </div>
            <h2 id="data-center-title" className="mt-2 text-xl font-bold text-white">Dine datakilder</h2>
            <p className="mt-1 text-sm text-slate-400">Automatisk synkronisering bliver aktiveret kilde for kilde – først efter sikker godkendelse.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Luk datacenter" className="rounded-xl p-2 text-slate-400 hover:bg-white/5"><X size={20} /></button>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
          <div className="flex items-center gap-2 text-amber-300">
            <LockKeyhole size={16} />
            <span className="text-sm font-semibold">Ingen kilder er forbundet endnu</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">Appen bruger i øjeblikket lokal lagring. Den viser ikke eksterne data som synkroniserede, før en rigtig forbindelse er etableret og testet.</p>
        </div>

        <div className="mt-4 space-y-2">
          {sources.map(source => {
            const Icon = source.icon;
            return (
              <div key={source.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300"><Icon size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{source.name}</p>
                    <p className="text-[11px] text-slate-500">{source.area}</p>
                  </div>
                  <span className="max-w-[118px] rounded-lg bg-white/5 px-2 py-1 text-right text-[10px] leading-tight text-slate-400">{source.status}</span>
                </div>
                <p className="mt-2 pl-12 text-xs leading-relaxed text-slate-400">{source.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
          <p>Adgangskoder skal aldrig gemmes i appen. Forbindelser skal bruge officielle godkendelsesflows, krypteret tokenlagring og mulighed for at afbryde adgangen.</p>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500"><RefreshCw size={11} /> Synkronisering er endnu ikke aktiv</p>
      </div>
    </div>
  );
}
