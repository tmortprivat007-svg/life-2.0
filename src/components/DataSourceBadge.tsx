import { getDataSourceLabel, getDataSourceColor } from '@/store/AppData';
import type { DataSource } from '@/types';

interface DataSourceBadgeProps {
  source: DataSource;
}

export function DataSourceBadge({ source }: DataSourceBadgeProps) {
  const color = getDataSourceColor(source);
  const label = getDataSourceLabel(source);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `${color}15`, color }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
