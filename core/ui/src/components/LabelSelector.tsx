import type { ComponentType } from 'react';
import { clsx } from 'clsx';
import type { LabelSelectorProps } from '../types';

export const LabelSelector: ComponentType<LabelSelectorProps> = ({
  labels,
  selectedLabelId,
  onSelect,
}) => {
  return (
    <div className="label-selector">
      <button
        className={clsx('label-selector__option', {
          'label-selector__option--selected': !selectedLabelId,
        })}
        onClick={() => onSelect(undefined)}
      >
        <span className="label-selector__color" style={{ backgroundColor: '#e5e7eb' }} />
        <span className="label-selector__name">라벨 없음</span>
      </button>
      {labels.map((label) => (
        <button
          key={label.id}
          className={clsx('label-selector__option', {
            'label-selector__option--selected': selectedLabelId === label.id,
          })}
          onClick={() => onSelect(label.id)}
        >
          <span
            className="label-selector__color"
            style={{ backgroundColor: label.color }}
          />
          {label.icon && <span className="label-selector__icon">{label.icon}</span>}
          <span className="label-selector__name">{label.name}</span>
        </button>
      ))}
    </div>
  );
};
