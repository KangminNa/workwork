// Types
export type CalendarCellProps = {
  date: string;
  active?: boolean;
  hasSchedules?: boolean;
  scheduleCount?: number;
};

export type TimeBlockProps = {
  hour: number;
  memo?: string;
  label?: {
    id: string;
    name: string;
    color: string;
  };
  notificationEnabled?: boolean;
  onClick?: () => void;
  onEdit?: (memo: string) => void;
};

export type LabelSelectorProps = {
  labels: Array<{
    id: string;
    name: string;
    color: string;
    icon?: string;
  }>;
  selectedLabelId?: string;
  onSelect: (labelId: string | undefined) => void;
};
