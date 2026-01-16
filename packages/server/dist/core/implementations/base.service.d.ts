import { ICrudService, ITransactionalService } from '@core/contracts/service';
import { ICrudRepository } from '@core/contracts/repository';
import { QueryFilter } from '@core/contracts/base';
export declare abstract class BaseCrudService<TEntity = any, TCreateDto = any, TUpdateDto = any> implements ICrudService<TEntity, TCreateDto, TUpdateDto>, ITransactionalService {
    protected readonly repository: ICrudRepository<TEntity>;
    constructor(repository: ICrudRepository<TEntity>);
    get(id: string, options?: any): Promise<TEntity | null>;
    list(filter?: QueryFilter): Promise<TEntity[]>;
    create(dto: TCreateDto): Promise<TEntity>;
    update(id: string, dto: TUpdateDto): Promise<TEntity>;
    remove(id: string): Promise<void>;
    count(filter?: QueryFilter): Promise<number>;
    transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
