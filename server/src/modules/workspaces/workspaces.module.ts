import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceRepository } from './repositories/workspace.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [WorkspaceRepository],
  exports: [WorkspaceRepository],
})
export class WorkspacesModule {}

