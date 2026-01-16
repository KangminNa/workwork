"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudRepository = void 0;
class BaseCrudRepository {
    client;
    modelName;
    constructor(client, modelName) {
        this.client = client;
        this.modelName = modelName;
    }
    async get(id, options) {
        return this.client[this.modelName].findUnique({
            where: { id },
            ...options,
        });
    }
    async list(filter) {
        return this.client[this.modelName].findMany(filter);
    }
    async findOne(filter) {
        return this.client[this.modelName].findFirst(filter);
    }
    async create(data) {
        return this.client[this.modelName].create({ data });
    }
    async update(id, data) {
        return this.client[this.modelName].update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.client[this.modelName].delete({
            where: { id },
        });
    }
    async count(filter) {
        return this.client[this.modelName].count(filter);
    }
    async exists(id) {
        const count = await this.client[this.modelName].count({
            where: { id },
        });
        return count > 0;
    }
    async transaction(callback) {
        return this.client.$transaction(callback);
    }
}
exports.BaseCrudRepository = BaseCrudRepository;
//# sourceMappingURL=base.repository.js.map