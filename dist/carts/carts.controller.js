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
exports.CartsController = void 0;
const common_1 = require("@nestjs/common");
const carts_service_1 = require("./carts.service");
const add_to_cart_1 = require("./dto/add-to-cart");
const remove_from_cart_1 = require("./dto/remove-from-cart");
let CartsController = class CartsController {
    cartsService;
    constructor(cartsService) {
        this.cartsService = cartsService;
    }
    addToCart(addToCart, req) {
        return this.cartsService.addToCart(addToCart, req.user.id);
    }
    removeFromCart(removeFromCart, req) {
        return this.cartsService.removeFromCart(removeFromCart, req.user.id);
    }
    updateCountForCartProduct(addToCart, req) {
        return this.cartsService.updateCountForCartProduct(addToCart, req.user.id);
    }
    findAll(req) {
        return this.cartsService.findAll();
    }
};
exports.CartsController = CartsController;
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_to_cart_1.AddToCart, Object]),
    __metadata("design:returntype", void 0)
], CartsController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Post)('remove'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [remove_from_cart_1.RemoveFromCart, Object]),
    __metadata("design:returntype", void 0)
], CartsController.prototype, "removeFromCart", null);
__decorate([
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_to_cart_1.AddToCart, Object]),
    __metadata("design:returntype", void 0)
], CartsController.prototype, "updateCountForCartProduct", null);
__decorate([
    (0, common_1.Get)('all_carts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartsController.prototype, "findAll", null);
exports.CartsController = CartsController = __decorate([
    (0, common_1.Controller)('carts'),
    __metadata("design:paramtypes", [carts_service_1.CartsService])
], CartsController);
//# sourceMappingURL=carts.controller.js.map