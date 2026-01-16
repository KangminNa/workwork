import { ICrudRepository, ITransactionalRepository, IOrmAdapter } from '@core/contracts/repository';
import { QueryFilter } from '@core/contracts/base';
export declare abstract class BaseCrudRepository<TEntity = any> implements ICrudRepository<TEntity>, ITransactionalRepository, IOrmAdapter {
    readonly client: any;
    readonly modelName: string;
    constructor(client: any, modelName: string);
    get(id: string, options?: any): Promise<TEntity | null>;
    list(filter?: QueryFilter): Promise<TEntity[]>;
    findOne(filter: QueryFilter): Promise<TEntity | null>;
    create(data: any): Promise<TEntity>;
    update(id: string, data: any): Promise<TEntity>;
    remove(id: string): Promise<void>;
    count(filter?: QueryFilter): Promise<number>;
    exists(id: string): Promise<boolean>;
    transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
