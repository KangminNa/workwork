import { BaseCrudController } from '@core/implementations';
import { ICrudController } from '@core/contracts/controller';
import { GroupService } from './group.service';
import { Group, CreateGroupDto, UpdateGroupDto, AddMemberDto } from './group.types';
export declare class GroupController extends BaseCrudController<CreateGroupDto, UpdateGroupDto, Group> implements ICrudController<CreateGroupDto, UpdateGroupDto, Group> {
    private readonly groupService;
    constructor(groupService: GroupService);
    addMember(id: string, dto: AddMemberDto): Promise<Group>;
    removeMember(id: string, userId: string): Promise<Group>;
    findByOwner(ownerId: string): Promise<Group[]>;
    findByUserId(userId: string): Promise<Group[]>;
}
