/**
 * Core Implementations - Base Controller
 * ICrudController 계약의 기본 구현
 */

import { Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ICrudController } from '@core/contracts/controller';
import { ICrudService } from '@core/contracts/service';
import { QueryFilter } from '@core/contracts/base';

/**
 * CRUD Controller 기본 구현
 * - GET    /resource        -> list()
 * - GET    /resource/:id    -> get()
 * - POST   /resource        -> create()
 * - PUT    /resource/:id    -> update()
 * - DELETE /resource/:id    -> remove()
 */
export abstract class BaseCrudController<
  TCreateDto = any,
  TUpdateDto = any,
  TEntity = any
> implements ICrudController<TCreateDto, TUpdateDto, TEntity> {
  
  constructor(
    protected readonly service: ICrudService<TEntity, TCreateDto, TUpdateDto>
  ) {}

  @Get()
  async list(@Query() query?: QueryFilter): Promise<TEntity[]> {
    return this.service.list(query);
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<TEntity> {
    const entity = await this.service.get(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }

  @Post()
  async create(@Body() dto: TCreateDto): Promise<TEntity> {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: TUpdateDto
  ): Promise<TEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

