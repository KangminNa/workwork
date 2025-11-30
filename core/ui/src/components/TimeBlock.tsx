import type { ComponentType } from 'react';
import { clsx } from 'clsx';
import type { TimeBlockProps } from '../types';

export const TimeBlock: ComponentType<TimeBlockProps> = ({
  hour,
  memo,
  label,
  notificationEnabled,
  onClick,
  onEdit,
}) => {
  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

  return (
    <div
      className={clsx('time-block', {
        'time-block--occupied': memo,
        'time-block--notification-enabled': notificationEnabled,
      })}
      onClick={onClick}
      style={{ backgroundColor: label?.color ? `${label.color}20` : undefined }}
    >
      <div className="time-block__time">{timeLabel}</div>
      {memo && (
        <div className="time-block__content">
          <div className="time-block__memo">{memo}</div>
          {label && (
            <div className="time-block__label" style={{ backgroundColor: label.color }}>
              {label.icon && <span className="time-block__label-icon">{label.icon}</span>}
              <span className="time-block__label-name">{label.name}</span>
            </div>
          )}
          {notificationEnabled && (
            <div className="time-block__notification-indicator">🔔</div>
          )}
        </div>
      )}
    </div>
  );
};
