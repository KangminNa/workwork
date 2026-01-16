import { ICrudController } from '@core/contracts/controller';
import { ICrudService } from '@core/contracts/service';
import { QueryFilter } from '@core/contracts/base';
export declare abstract class BaseCrudController<TCreateDto = any, TUpdateDto = any, TEntity = any> implements ICrudController<TCreateDto, TUpdateDto, TEntity> {
    protected readonly service: ICrudService<TEntity, TCreateDto, TUpdateDto>;
    constructor(service: ICrudService<TEntity, TCreateDto, TUpdateDto>);
    list(query?: QueryFilter): Promise<TEntity[]>;
    get(id: string): Promise<TEntity>;
    create(dto: TCreateDto): Promise<TEntity>;
    update(id: string, dto: TUpdateDto): Promise<TEntity>;
    remove(id: string): Promise<void>;
}
