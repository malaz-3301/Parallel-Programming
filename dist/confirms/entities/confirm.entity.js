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
exports.Confirm = void 0;
const cart_entity_1 = require("../../carts/entities/cart.entity");
const typeorm_1 = require("typeorm");
const order_status_1 = require("../utils/order-status");
let Confirm = class Confirm {
    id;
    card_password;
    status;
    card_number;
    cart;
};
exports.Confirm = Confirm;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Confirm.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Confirm.prototype, "card_password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: order_status_1.OrderStatus, default: order_status_1.OrderStatus.PENDING }),
    __metadata("design:type", String)
], Confirm.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Confirm.prototype, "card_number", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cart_entity_1.Cart),
    __metadata("design:type", cart_entity_1.Cart)
], Confirm.prototype, "cart", void 0);
exports.Confirm = Confirm = __decorate([
    (0, typeorm_1.Entity)()
], Confirm);
//# sourceMappingURL=confirm.entity.js.map