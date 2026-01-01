import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigLoader } from './config.loader';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const config = ConfigLoader.get();

  return {
    type: config.database.type as 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: config.database.synchronize,
    logging: config.database.logging,
  };
};

