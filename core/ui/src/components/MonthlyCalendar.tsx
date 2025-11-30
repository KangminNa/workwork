import type { ComponentType } from 'react';
import { CalendarCell } from './CalendarCell';

export const MonthlyCalendar: ComponentType<{
  year: number;
  month: number;
  selectedDate?: string;
  scheduleCounts: Record<string, number>;
  onDateSelect: (date: string) => void;
}> = ({ year, month, selectedDate, scheduleCounts, onDateSelect }) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const weeks = [];
  let currentWeek = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isCurrentMonth = currentDate.getMonth() === month;
    const hasSchedules = scheduleCounts[dateStr] > 0;

    currentWeek.push(
      <CalendarCell
        key={dateStr}
        date={dateStr}
        active={selectedDate === dateStr}
        hasSchedules={hasSchedules}
        scheduleCount={scheduleCounts[dateStr]}
        onClick={() => onDateSelect(dateStr)}
      >
        {currentDate.getDate()}
      </CalendarCell>
    );

    if (currentWeek.length === 7) {
      weeks.push(
        <div key={weeks.length} className="calendar-week">
          {currentWeek}
        </div>
      );
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return (
    <div className="monthly-calendar">
      <div className="calendar-header">
        <h2>{year}년 {month + 1}월</h2>
      </div>
      <div className="calendar-weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-body">
        {weeks}
      </div>
    </div>
  );
};
