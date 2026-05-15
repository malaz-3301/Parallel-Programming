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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmsService = void 0;
const common_1 = require("@nestjs/common");
const confirm_entity_1 = require("./entities/confirm.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const carts_service_1 = require("../carts/carts.service");
const order_status_1 = require("./utils/order-status");
let ConfirmsService = class ConfirmsService {
    confirmRepository;
    cartsService;
    constructor(confirmRepository, cartsService) {
        this.confirmRepository = confirmRepository;
        this.cartsService = cartsService;
    }
    async create(createconfirmDto, user_id) {
        const confirm = this.confirmRepository.create(createconfirmDto);
        const savedConfirm = await this.confirmRepository.save(confirm);
        await this.cartsService.update({ confirmId: savedConfirm.id }, user_id);
        return savedConfirm;
    }
    findAll() {
        return this.confirmRepository.find();
    }
    findOne(id) {
        return this.confirmRepository.findOne({ where: { id } });
    }
    findOneForUser(id, user_id) {
        return this.confirmRepository.findOne({ where: { id, cart: { user: { id: user_id } } }, relations: { cart: { user: true } } });
    }
    async update(id, updateconfirmDto) {
        return this.confirmRepository.update(id, updateconfirmDto);
    }
    async remove(id, user_id) {
        const confirm = await this.findOneForUser(id, user_id);
        if (!confirm) {
            throw new common_1.NotFoundException();
        }
        if (confirm.status != order_status_1.OrderStatus.PENDING) {
            throw new common_1.UnauthorizedException();
        }
        return this.confirmRepository.delete({ id });
    }
};
exports.ConfirmsService = ConfirmsService;
exports.ConfirmsService = ConfirmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(confirm_entity_1.Confirm)),
    __metadata("design:paramtypes", [typeorm_2.Repository, carts_service_1.CartsService])
], ConfirmsService);
//# sourceMappingURL=confirms.service.js.map