import { Injectable, NotFoundException } from '@nestjs/common';
import { IWorkspace } from '../../../common/types';

type WorkspaceEntity = IWorkspace;

interface CreateWorkspaceInput {
  name: string;
  ownerId: number;
  inviteCode: string;
}

interface UpdateWorkspaceInput {
  ownerId?: number;
  name?: string;
}

/**
 * 인메모리 워크스페이스 저장소
 * - 초대 코드 중복 여부와 기본 CRUD만 제공
 */
@Injectable()
export class WorkspaceRepository {
  private workspaces: WorkspaceEntity[] = [];
  private idSeq = 1;

  async findByInviteCode(code: string): Promise<WorkspaceEntity | null> {
    return this.workspaces.find((workspace) => workspace.inviteCode === code) || null;
  }

  async existsByInviteCode(code: string): Promise<boolean> {
    return this.workspaces.some((workspace) => workspace.inviteCode === code);
  }

  async save(input: CreateWorkspaceInput): Promise<WorkspaceEntity> {
    const now = new Date();
    const workspace: WorkspaceEntity = {
      id: this.idSeq++,
      name: input.name,
      ownerId: input.ownerId,
      inviteCode: input.inviteCode,
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.push(workspace);
    return workspace;
  }

  async update(id: number, updates: UpdateWorkspaceInput): Promise<WorkspaceEntity> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }

    Object.assign(workspace, updates, { updatedAt: new Date() });
    return workspace;
  }

  async findById(id: number): Promise<WorkspaceEntity | null> {
    return this.workspaces.find((workspace) => workspace.id === id) || null;
  }

  /**
   * 테스트 편의를 위한 리셋 훅
   */
  reset(): void {
    this.workspaces = [];
    this.idSeq = 1;
  }
}
