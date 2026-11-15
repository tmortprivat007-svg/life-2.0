import { useState, useEffect, useRef } from 'react';
import type { SectionId } from '@/types';
import { BottomNav } from '@/components/BottomNav';
import { DataCenter } from '@/components/DataCenter';
import { Overblik } from '@/sections/Overblik';
import { Sundhed } from '@/sections/Sundhed';
import { Traening } from '@/sections/Traening';
import { Kalender } from '@/sections/Kalender';
import { MailSection } from '@/sections/Mail';
import { Okonomi } from '@/sections/Okonomi';
import { Rejser } from '@/sections/Rejser';
import { Arbejde } from '@/sections/Arbejde';

function App() {
  const [active, setActive] = useState<SectionId>('overblik');
  const [dataCenterOpen, setDataCenterOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [active]);

  const renderSection = () => {
    switch (active) {
      case 'overblik':
        return <Overblik onNavigate={setActive} />;
      case 'sundhed':
        return <Sundhed />;
      case 'traening':
        return <Traening />;
      case 'kalender':
        return <Kalender />;
      case 'mail':
        return <MailSection />;
      case 'okonomi':
        return <Okonomi />;
      case 'rejser':
        return <Rejser />;
      case 'arbejde':
        return <Arbejde />;
      default:
        return <Overblik onNavigate={setActive} />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 max-w-md mx-auto relative">
      <div className="safe-top" />
      <div ref={scrollRef} className="h-screen overflow-y-auto no-scrollbar pb-28 safe-top">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between sticky top-0 z-30 bg-navy-950/80 backdrop-blur-xl safe-top">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
              <span className="text-xs font-black text-white">L</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">LIFE <span className="gradient-text">2.0</span></span>
          </div>
          <button type="button" onClick={() => setDataCenterOpen(true)} className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/5" aria-label="Åbn datacenter">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-300">Datakilder</span>
          </button>
        </div>
        <div key={active} className="px-4 pt-3 animate-fade-in">{renderSection()}</div>
      </div>
      <BottomNav active={active} onChange={setActive} />
      {dataCenterOpen && <DataCenter onClose={() => setDataCenterOpen(false)} />}
    </div>
  );
}

export default App;
