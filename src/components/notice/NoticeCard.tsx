import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export type NoticeTone = 'info' | 'success' | 'warning' | 'urgent';

const toneStyles: Record<NoticeTone, { ring: string; pill: string; heading: string; text: string }> = {
  info: {
    ring: 'ring-blue-200',
    pill: 'bg-blue-100 text-blue-700',
    heading: 'text-blue-900',
    text: 'text-blue-700',
  },
  success: {
    ring: 'ring-green-200',
    pill: 'bg-green-100 text-green-700',
    heading: 'text-green-900',
    text: 'text-green-700',
  },
  warning: {
    ring: 'ring-yellow-200',
    pill: 'bg-yellow-100 text-yellow-800',
    heading: 'text-yellow-900',
    text: 'text-yellow-800',
  },
  urgent: {
    ring: 'ring-red-200',
    pill: 'bg-red-100 text-red-700',
    heading: 'text-red-900',
    text: 'text-red-700',
  },
};

export interface NoticeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  tone?: NoticeTone;
  href?: string;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ title, description, tone = 'info', href, className = '', ...rest }) => {
  const styles = toneStyles[tone];

  const content = (
    <Card
      className={`relative overflow-hidden ${className}`}
      border
      shadow
      padding="md"
      {...rest}
    >
      {/* Gradient capsule accent */}
      <div className="absolute -left-6 top-4">
        <div className={`h-14 w-14 rounded-full blur-md opacity-60 ${
          tone === 'info' ? 'bg-blue-400' : tone === 'success' ? 'bg-green-400' : tone === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
      </div>

      {/* Ringed body */}
      <div className={`rounded-xl bg-white ${styles.ring} ring-1 px-4 py-4`}> 
        <div className="flex items-start gap-3">
          <Badge className={`${styles.pill} mt-0.5`} rounded="full">{tone === 'info' ? 'Info' : tone === 'success' ? 'Update' : tone === 'warning' ? 'Notice' : 'Urgent'}</Badge>
          <div className="min-w-0">
            <div className={`font-semibold ${styles.heading}`}>{title}</div>
            <p className={`text-sm ${styles.text} mt-1 line-clamp-3`}>{description}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block hover:translate-y-[-1px] transition-transform">
        {content}
      </a>
    );
  }

  return content;
};

export default NoticeCard;
