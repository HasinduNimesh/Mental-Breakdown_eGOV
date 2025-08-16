import React from 'react';

export type ResourceCategoryItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Props = {
  items: ResourceCategoryItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  disabledIds?: string[];
};

export const ResourceCategoryRow: React.FC<Props> = ({ items, selectedId, onSelect, className, disabledIds }) => {
  return (
    <div className={`rc-row ${className ?? ''}`.trim()}>
      {items.map((item) => {
        const SelectedIcon = item.icon;
        const selected = item.id === selectedId;
        const disabled = !!disabledIds?.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`rc-card ${selected ? 'rc-card--selected' : ''}`}
            aria-pressed={selected}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={() => { if (!disabled) onSelect?.(item.id); }}
          >
            <SelectedIcon className="rc-icon" aria-hidden />
            <span className="rc-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ResourceCategoryRow;
