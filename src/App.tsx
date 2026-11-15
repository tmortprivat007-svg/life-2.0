import { useState, useEffect, useRef } from 'react';
import type { SectionId } from '@/types';
import { BottomNav } from '@/components/BottomNav';
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
      {/* Top safe area */}
      <div className="safe-top" />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="h-screen overflow-y-auto no-scrollbar pb-28 safe-top"
      >
        {/* App header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between sticky top-0 z-30 bg-navy-950/80 backdrop-blur-xl safe-top">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
              <span className="text-xs font-black text-white">L</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">LIFE <span className="gradient-text">2.0</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="text-[10px] text-slate-400">Manuelle data</span>
          </div>
        </div>

        {/* Active section */}
        <div key={active} className="px-4 pt-3 animate-fade-in">
          {renderSection()}
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}

export default App;
