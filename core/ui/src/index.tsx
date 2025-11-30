import type { ComponentType, PropsWithChildren } from 'react';

export type CalendarCellProps = {
  date: string;
  active?: boolean;
};

export const CalendarCell: ComponentType<PropsWithChildren<CalendarCellProps>> = ({
  date,
  active,
  children,
}) => {
  return (
    <div data-date={date} className={active ? 'cell cell--active' : 'cell'}>
      {children}
    </div>
  );
};
