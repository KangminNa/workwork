export type TableName = 'users' | 'labels' | 'time_blocks' | 'notifications';

export type QueryInput = {
  table: TableName;
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export function buildQuery({ table, where, data }: QueryInput) {
  return { table, where, data };
}

export function runQuery(query: ReturnType<typeof buildQuery>) {
  // placeholder for ORM adapter
  return query;
}
