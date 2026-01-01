import { DataSource } from 'typeorm';
import { ConfigLoader } from '../../src/config/config.loader';

/**
 * 테스트 데이터베이스 헬퍼
 */
export class TestDatabaseHelper {
  private static dataSource: DataSource;

  /**
   * 테스트 데이터베이스 연결
   */
  static async connect(): Promise<DataSource> {
    if (this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const config = ConfigLoader.get();

    this.dataSource = new DataSource({
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
      synchronize: true, // 테스트에서는 자동 동기화
      dropSchema: false, // 매 테스트마다 스키마 초기화는 cleanDatabase()로
      logging: false,
    });

    await this.dataSource.initialize();
    return this.dataSource;
  }

  /**
   * 데이터베이스 연결 해제
   */
  static async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  /**
   * 모든 테이블 데이터 삭제 (테스트 간 격리)
   */
  static async cleanDatabase(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      console.warn('⚠️  DataSource가 초기화되지 않았습니다');
      return;
    }

    const entities = this.dataSource.entityMetadatas;

    try {
      // 외래키 제약 조건 임시 비활성화
      await this.dataSource.query('SET session_replication_role = replica;');

      // 모든 테이블 데이터 삭제
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
      }

      // 외래키 제약 조건 재활성화
      await this.dataSource.query('SET session_replication_role = DEFAULT;');
      
      console.log('✅ DB 정리 완료');
    } catch (error) {
      console.error('❌ DB 정리 실패:', error.message);
    }
  }

  /**
   * 시퀀스 리셋 (ID 초기화)
   */
  static async resetSequences(): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      return;
    }

    const entities = this.dataSource.entityMetadatas;

    for (const entity of entities) {
      // ID 컬럼이 있는 경우 시퀀스 리셋
      const idColumn = entity.columns.find((col) => col.isPrimary);
      if (idColumn && idColumn.isGenerated) {
        const sequenceName = `${entity.tableName}_${idColumn.databaseName}_seq`;
        try {
          await this.dataSource.query(
            `ALTER SEQUENCE IF EXISTS "${sequenceName}" RESTART WITH 1;`,
          );
        } catch (error) {
          // 시퀀스가 없을 수 있으므로 에러 무시
          console.warn(`Warning: Could not reset sequence ${sequenceName}`);
        }
      }
    }
  }

  /**
   * 완전 초기화 (데이터 삭제 + 시퀀스 리셋)
   */
  static async fullReset(): Promise<void> {
    await this.cleanDatabase();
    await this.resetSequences();
  }
}

