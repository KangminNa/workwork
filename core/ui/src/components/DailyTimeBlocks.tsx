import type { ComponentType } from 'react';
import { TimeBlock } from './TimeBlock';

export const DailyTimeBlocks: ComponentType<{
  date: string;
  timeBlocks: Array<{
    hour: number;
    memo?: string;
    label?: {
      id: string;
      name: string;
      color: string;
    };
    notificationEnabled?: boolean;
  }>;
  onTimeBlockClick: (hour: number) => void;
  onTimeBlockEdit: (hour: number, memo: string) => void;
}> = ({ date, timeBlocks, onTimeBlockClick, onTimeBlockEdit }) => {
  const blocks = Array.from({ length: 24 }, (_, hour) => {
    const block = timeBlocks.find(b => b.hour === hour);
    return (
      <TimeBlock
        key={hour}
        hour={hour}
        memo={block?.memo}
        label={block?.label}
        notificationEnabled={block?.notificationEnabled}
        onClick={() => onTimeBlockClick(hour)}
        onEdit={(memo) => onTimeBlockEdit(hour, memo)}
      />
    );
  });

  return (
    <div className="daily-time-blocks">
      <div className="daily-header">
        <h3>{new Date(date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}</h3>
      </div>
      <div className="time-blocks-container">
        {blocks}
      </div>
    </div>
  );
};
