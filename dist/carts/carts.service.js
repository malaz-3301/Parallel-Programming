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
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const cart_entity_1 = require("./entities/cart.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_products_service_1 = require("../user-products/user-products.service");
const users_service_1 = require("../users/users.service");
let CartsService = class CartsService {
    cartRepository;
    userProdutsService;
    userService;
    constructor(cartRepository, userProdutsService, userService) {
        this.cartRepository = cartRepository;
        this.userProdutsService = userProdutsService;
        this.userService = userService;
    }
    async create(user_id) {
        const cart = this.cartRepository.create({ user: { id: user_id }, price: 0 });
        await this.cartRepository.insert(cart);
        return cart;
    }
    findAll() {
        return this.cartRepository.find();
    }
    findAllForUser(user_id) {
        return this.cartRepository.find({ where: { confirm: (0, typeorm_2.IsNull)(), user: { id: user_id } } });
    }
    findOne(user_id) {
        return this.cartRepository.findOne({ where: { confirm: (0, typeorm_2.IsNull)(), user: { id: user_id } }, relations: { userProducts: { product: true } } });
    }
    async update(updateCartDto, user_id) {
        return this.cartRepository.update({ user: { id: user_id } }, { confirm: { id: updateCartDto.confirmId } });
    }
    remove(user_id) {
        return this.cartRepository.delete({ user: { id: user_id } });
    }
    async addToCart(createCartDto, user_id) {
        const cart = await this.findOne(user_id);
        if (!cart) {
            const cart = await this.create(user_id);
            return this.userProdutsService.create({ ...createCartDto, cartId: cart.id }, user_id);
        }
        return this.userProdutsService.create({ ...createCartDto, cartId: cart.id }, user_id);
    }
    async removeFromCart(removeFromCart, user_id) {
        const cart = await this.findOne(user_id);
        if (!cart) {
            throw new common_1.NotFoundException();
        }
        return this.userProdutsService.remove(removeFromCart.productId, cart.id, user_id);
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __metadata("design:paramtypes", [typeorm_2.Repository, user_products_service_1.UserProductsService, users_service_1.UsersService])
], CartsService);
//# sourceMappingURL=carts.service.js.map