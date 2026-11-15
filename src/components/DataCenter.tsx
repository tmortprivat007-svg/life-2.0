import { useState } from 'react';
import { X, Database, HeartPulse, CalendarDays, Mail, Wallet, Plane, Briefcase, Dumbbell, ShieldCheck, RefreshCw, LockKeyhole, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkSupabaseConnection, isSupabaseConfigured } from '@/lib/supabase';

interface DataCenterProps {
  onClose: () => void;
}

const sources = [
  { name: 'Google Kalender', area: 'Google-aftaler', detail: 'Kræver Google OAuth Client ID, Calendar API og sikker tokenhåndtering på backend. Kun læseadgang i første version.', icon: CalendarDays, status: 'Afventer OAuth-opsætning' },
  { name: 'iCloud Kalender', area: 'Apple-aftaler', detail: 'Kræver en sikker serverforbindelse til iCloud CalDAV. ChatGPTs eksisterende iCloud-forbindelse kan ikke genbruges direkte af LIFE 2.0.', icon: CalendarDays, status: 'Afventer backend-opsætning' },
  { name: 'Gmail', area: 'Mail og rejsebekræftelser', detail: 'Kræver separat Google OAuth-godkendelse og Gmail API-adgang. Kalenderadgang giver ikke automatisk adgang til mail.', icon: Mail, status: 'Afventer OAuth-opsætning' },
  { name: 'Apple Health', area: 'Sundhed og aktivitet', detail: 'Kræver en iPhone-app med HealthKit-adgang. En webside kan ikke selv læse Apple Health-data.', icon: HeartPulse, status: 'Kræver iOS-integration' },
  { name: 'Danske Bank', area: 'Konti og betalinger', detail: 'Kræver en PSD2/Open Banking-udbyder og din udtrykkelige bankgodkendelse.', icon: Wallet, status: 'Kræver bankintegration' },
  { name: 'MyFitnessPal', area: 'Kost og ernæring', detail: 'Afhænger af tilgængelig API-adgang og godkendelse fra tjenesten.', icon: Dumbbell, status: 'Kræver API-adgang' },
  { name: 'Rejser', area: 'Bookinger og billetter', detail: 'Kan samles fra godkendte mail- og kalenderkilder, når de er forbundet.', icon: Plane, status: 'Afventer kalender og mail' },
  { name: 'Arbejde', area: 'Møder og opgaver', detail: 'Kan samles fra godkendte kalender- og mailkilder med særskilte tilladelser.', icon: Briefcase, status: 'Afventer kalender og mail' },
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
            <p className="mt-1 text-sm text-slate-400">Målet er ét samlet overblik med automatisk synkronisering fra godkendte kilder.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Luk datacenter" className="rounded-xl p-2 text-slate-400 hover:bg-white/5"><X size={20} /></button>
        </div>

        <div className={`mt-4 rounded-2xl border p-3 ${isSupabaseConfigured ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-amber-400/20 bg-amber-400/5'}`}>
          <div className={`flex items-center gap-2 ${isSupabaseConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isSupabaseConfigured ? <CheckCircle2 size={16} /> : <LockKeyhole size={16} />}
            <span className="text-sm font-semibold">Supabase · {isSupabaseConfigured ? 'Nøgler konfigureret' : 'Afventer projektoplysninger'}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {isSupabaseConfigured
              ? 'Projektoplysningerne er indlæst i appen. Test forbindelsen herunder; databasen skal også have LIFE 2.0-tabellen og RLS-politikkerne installeret.'
              : 'Supabase-koden er klargjort. Tilføj VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY som GitHub Actions secrets for at aktivere forbindelsen.'}
          </p>
          <button type="button" onClick={testSupabase} disabled={!isSupabaseConfigured || checking} className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {checking ? 'Tester forbindelse…' : 'Test Supabase-forbindelse'}
          </button>
          {connectionMessage && <p className="mt-2 flex items-start gap-2 text-xs text-slate-300"><AlertCircle size={14} className="mt-0.5 shrink-0" />{connectionMessage}</p>}
        </div>
        <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
          <div className="flex items-center gap-2 text-amber-300">
            <LockKeyhole size={16} />
            <span className="text-sm font-semibold">Kalenderintegration klargøres</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">iCloud og Google skal forbindes direkte til LIFE 2.0 via en sikker backend. Ingen kalenderdata vises som synkroniserede, før forbindelsen er godkendt og testet.</p>
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
                  <span className="max-w-[130px] rounded-lg bg-white/5 px-2 py-1 text-right text-[10px] leading-tight text-slate-400">{source.status}</span>
                </div>
                <p className="mt-2 pl-12 text-xs leading-relaxed text-slate-400">{source.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
          <p>Adgangskoder og private nøgler skal aldrig ligge i webappen eller GitHub. OAuth-tokens og iCloud-adgang skal opbevares krypteret på backend. Første version får kun læseadgang til kalendere.</p>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500"><RefreshCw size={11} /> Synkronisering er endnu ikke aktiv</p>
      </div>
    </div>
  );
}
