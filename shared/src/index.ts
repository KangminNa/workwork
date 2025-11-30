export const VERSION = '0.1.0';

export type LabelColor = {
  name: string;
  hex: string;
};

export interface TimeBlockDTO {
  id: string;
  date: string; // ISO date
  hour: number;
  memo: string;
  labelId?: string;
}
