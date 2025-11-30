import { Kysely } from 'kysely';

// Database Schema Types
export interface Database {
  users: UserTable;
  labels: LabelTable;
  time_blocks: TimeBlockTable;
  notifications: NotificationTable;
  user_sessions: UserSessionTable;
}

export interface UserTable {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface LabelTable {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  default_notification_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TimeBlockTable {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  memo: string;
  label_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationTable {
  id: string;
  user_id: string;
  time_block_id: string;
  type: 'reminder' | 'scheduled';
  scheduled_at: Date;
  sent_at?: Date;
  status: 'pending' | 'sent' | 'failed';
  created_at: Date;
}

export interface UserSessionTable {
  id: string;
  user_id: string;
  device_token?: string;
  expires_at: Date;
  created_at: Date;
}

// DB Connection Type
export type DB = Kysely<Database>;
