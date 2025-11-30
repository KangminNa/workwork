import { sql } from 'kysely';
import { getDB } from './connection';

// Query Builder Base Class
export abstract class QueryBuilder {
  protected db = getDB();
}

// Immutable Query Builders
export class UserQueries extends QueryBuilder {
  async findByEmail(email: string) {
    return this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();
  }

  async findByIdWithLabels(userId: string) {
    return this.db
      .selectFrom('users')
      .where('users.id', '=', userId)
      .leftJoin('labels', 'users.id', 'labels.user_id')
      .select([
        'users.id',
        'users.email',
        'users.created_at',
        sql`json_agg(labels.*)`.as('labels')
      ])
      .groupBy('users.id')
      .executeTakeFirst();
  }
}

export class LabelQueries extends QueryBuilder {
  async findByUserId(userId: string) {
    return this.db
      .selectFrom('labels')
      .where('user_id', '=', userId)
      .selectAll()
      .execute();
  }

  async findDefaultLabels(userId: string) {
    return this.db
      .selectFrom('labels')
      .where('user_id', '=', userId)
      .where('default_notification_enabled', '=', true)
      .selectAll()
      .execute();
  }
}

export class TimeBlockQueries extends QueryBuilder {
  async findByUserAndDate(userId: string, date: string) {
    return this.db
      .selectFrom('time_blocks')
      .where('user_id', '=', userId)
      .where('date', '=', date)
      .leftJoin('labels', 'time_blocks.label_id', 'labels.id')
      .select([
        'time_blocks.id',
        'time_blocks.date',
        'time_blocks.hour',
        'time_blocks.memo',
        'time_blocks.label_id',
        'time_blocks.created_at',
        'labels.name as label_name',
        'labels.color as label_color'
      ])
      .orderBy('time_blocks.hour')
      .execute();
  }

  async findByDateRange(userId: string, startDate: string, endDate: string) {
    return this.db
      .selectFrom('time_blocks')
      .where('user_id', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .selectAll()
      .execute();
  }
}

export class NotificationQueries extends QueryBuilder {
  async findPendingNotifications(before: Date) {
    return this.db
      .selectFrom('notifications')
      .where('status', '=', 'pending')
      .where('scheduled_at', '<=', before)
      .selectAll()
      .execute();
  }

  async findByTimeBlockId(timeBlockId: string) {
    return this.db
      .selectFrom('notifications')
      .where('time_block_id', '=', timeBlockId)
      .selectAll()
      .execute();
  }
}
