
import {
  LayoutGrid,
  HeartPulse,
  Dumbbell,
  Calendar,
  Mail,
  Wallet,
  Plane,
  Briefcase,
} from 'lucide-react';
import type { SectionId } from '@/types';

interface NavItem {
  id: SectionId;
  label: string;
  icon: typeof LayoutGrid;
}

const navItems: NavItem[] = [
  { id: 'overblik', label: 'Overblik', icon: LayoutGrid },
  { id: 'sundhed', label: 'Sundhed', icon: HeartPulse },
  { id: 'traening', label: 'Træning', icon: Dumbbell },
  { id: 'kalender', label: 'Kalender', icon: Calendar },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'okonomi', label: 'Økonomi', icon: Wallet },
  { id: 'rejser', label: 'Rejser', icon: Plane },
  { id: 'arbejde', label: 'Arbejde', icon: Briefcase },
];

interface BottomNavProps {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Hovednavigation"
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
    >
      <div className="bg-navy-900/95 backdrop-blur-2xl border-t border-white/5">
        <div className="max-w-md mx-auto px-3 py-2">
          <div className="grid grid-cols-4 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-accent-cyan/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? 'text-accent-cyan'
                        : 'text-slate-400'
                    }
                  />
                  <span
                    className={`text-[10px] font-medium leading-tight ${
                      isActive
                        ? 'text-accent-cyan'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
