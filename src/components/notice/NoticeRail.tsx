import React from 'react';
import { NoticeCard, NoticeTone } from './NoticeCard';
import { Badge } from '@/components/ui/Badge';

export interface NoticeItem {
  id: string | number;
  title: string;
  description: string;
  tone?: NoticeTone;
  href?: string;
}

interface NoticeRailProps extends React.HTMLAttributes<HTMLDivElement> {
  pills?: Array<{ label: string; tone?: 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'neutral' }>; // top tags
  items: NoticeItem[];
}

export const NoticeRail: React.FC<NoticeRailProps> = ({ pills = [], items, className = '', ...rest }) => {
  return (
    <div className={`rounded-xl bg-white border border-border shadow-xl p-3 sm:p-4 md:p-6 ${className}`} {...rest}>
      {/* Top pills */}
      {pills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {pills.map((p, i) => (
            <Badge key={i} tone={p.tone ?? 'neutral'}>{p.label}</Badge>
          ))}
        </div>
      )}

      <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {items.map((n) => (
          <NoticeCard key={n.id} title={n.title} description={n.description} tone={n.tone} href={n.href} />
        ))}
      </div>
    </div>
  );
};

export default NoticeRail;
