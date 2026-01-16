/**
 * Group Module - Types
 */

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: Date;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  ownerId: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  userId: string;
}

