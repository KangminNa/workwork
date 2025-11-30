// Utility Functions
export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ko-KR');
};

export const getWeekDays = (): string[] => {
  return ['일', '월', '화', '수', '목', '금', '토'];
};
