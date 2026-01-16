"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudService = void 0;
class BaseCrudService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async get(id, options) {
        return this.repository.get(id, options);
    }
    async list(filter) {
        return this.repository.list(filter);
    }
    async create(dto) {
        return this.repository.create(dto);
    }
    async update(id, dto) {
        return this.repository.update(id, dto);
    }
    async remove(id) {
        return this.repository.remove(id);
    }
    async count(filter) {
        return this.repository.count(filter);
    }
    async transaction(callback) {
        if ('transaction' in this.repository) {
            return this.repository.transaction(callback);
        }
        throw new Error('Transaction not supported by repository');
    }
}
exports.BaseCrudService = BaseCrudService;
//# sourceMappingURL=base.service.js.map