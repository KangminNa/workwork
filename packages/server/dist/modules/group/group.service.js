"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const implementations_1 = require("../../core/implementations");
const group_repository_1 = require("./group.repository");
let GroupService = class GroupService extends implementations_1.BaseCrudService {
    groupRepository;
    constructor(groupRepository) {
        super(groupRepository);
        this.groupRepository = groupRepository;
    }
    async create(dto) {
        return this.groupRepository.create({
            name: dto.name,
            description: dto.description,
            ownerId: dto.ownerId,
            members: {
                create: {
                    userId: dto.ownerId,
                    role: 'OWNER',
                },
            },
        });
    }
    async addMember(groupId, dto) {
        return this.groupRepository.addMember(groupId, dto.userId);
    }
    async removeMember(groupId, userId) {
        return this.groupRepository.removeMember(groupId, userId);
    }
    async findByOwner(ownerId) {
        return this.groupRepository.findByOwner(ownerId);
    }
    async findByUserId(userId) {
        return this.groupRepository.findByUserId(userId);
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [group_repository_1.GroupRepository])
], GroupService);
//# sourceMappingURL=group.service.js.map