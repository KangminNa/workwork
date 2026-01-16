import { PrismaClient } from '@prisma/client';
import { BaseCrudRepository } from '@core/implementations';
import { ICrudRepository } from '@core/contracts/repository';
import { Group } from './group.types';
export declare class GroupRepository extends BaseCrudRepository<Group> implements ICrudRepository<Group> {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findByOwner(ownerId: string): Promise<Group[]>;
    findByUserId(userId: string): Promise<Group[]>;
    addMember(groupId: string, userId: string): Promise<Group>;
    removeMember(groupId: string, userId: string): Promise<Group>;
}
