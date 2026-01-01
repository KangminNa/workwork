import { Module } from '@nestjs/common';
import { WorkspaceRepository } from './repositories/workspace.repository';

@Module({
  providers: [WorkspaceRepository],
  exports: [WorkspaceRepository],
})
export class WorkspacesModule {}
