import type { ComponentType, PropsWithChildren } from 'react';
import { clsx } from 'clsx';
import type { CalendarCellProps } from '../types';

export const CalendarCell: ComponentType<PropsWithChildren<CalendarCellProps>> = ({
  date,
  active,
  hasSchedules,
  scheduleCount,
  children,
}) => {
  return (
    <div
      data-date={date}
      className={clsx('calendar-cell', {
        'calendar-cell--active': active,
        'calendar-cell--has-schedules': hasSchedules,
      })}
    >
      <div className="calendar-cell__date">{children}</div>
      {hasSchedules && scheduleCount && (
        <div className="calendar-cell__badge">{scheduleCount}</div>
      )}
    </div>
  );
};
