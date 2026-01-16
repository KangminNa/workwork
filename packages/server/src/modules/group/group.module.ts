/**
 * Group Module - NestJS Module
 */

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupRepository } from './group.repository';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupRepository,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [GroupService],
})
export class GroupModule {}

