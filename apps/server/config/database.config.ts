/**
 * Database Configuration
 * PostgreSQL 연결 설정
 */

export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'workwork',
  password: process.env.DB_PASSWORD || 'workwork123',
  database: process.env.DB_NAME || 'workwork',
  
  // Connection URL (Prisma용)
  url: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USERNAME || 'workwork'}:${process.env.DB_PASSWORD || 'workwork123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'workwork'}?schema=public`,
  
  // Connection Pool
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
};

