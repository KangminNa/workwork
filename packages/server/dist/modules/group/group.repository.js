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
exports.GroupRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const implementations_1 = require("../../core/implementations");
let GroupRepository = class GroupRepository extends implementations_1.BaseCrudRepository {
    prisma;
    constructor(prisma) {
        super(prisma, 'group');
        this.prisma = prisma;
    }
    async findByOwner(ownerId) {
        return this.client.group.findMany({
            where: { ownerId },
            include: { members: true },
        });
    }
    async findByUserId(userId) {
        return this.client.group.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: { members: true },
        });
    }
    async addMember(groupId, userId) {
        return this.client.group.update({
            where: { id: groupId },
            data: {
                members: {
                    create: {
                        userId,
                        role: 'MEMBER',
                    },
                },
            },
            include: { members: true },
        });
    }
    async removeMember(groupId, userId) {
        return this.client.group.update({
            where: { id: groupId },
            data: {
                members: {
                    deleteMany: {
                        userId,
                    },
                },
            },
            include: { members: true },
        });
    }
};
exports.GroupRepository = GroupRepository;
exports.GroupRepository = GroupRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], GroupRepository);
//# sourceMappingURL=group.repository.js.map