import { BaseCrudService } from '@core/implementations';
import { ICrudService } from '@core/contracts/service';
import { GroupRepository } from './group.repository';
import { Group, CreateGroupDto, UpdateGroupDto, AddMemberDto } from './group.types';
export declare class GroupService extends BaseCrudService<Group, CreateGroupDto, UpdateGroupDto> implements ICrudService<Group, CreateGroupDto, UpdateGroupDto> {
    private readonly groupRepository;
    constructor(groupRepository: GroupRepository);
    create(dto: CreateGroupDto): Promise<Group>;
    addMember(groupId: string, dto: AddMemberDto): Promise<Group>;
    removeMember(groupId: string, userId: string): Promise<Group>;
    findByOwner(ownerId: string): Promise<Group[]>;
    findByUserId(userId: string): Promise<Group[]>;
}
