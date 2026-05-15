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
let CartsService = class CartsService {
    cartRepository;
    userProdutsService;
    dataSource;
    constructor(cartRepository, userProdutsService, dataSource) {
        this.cartRepository = cartRepository;
        this.userProdutsService = userProdutsService;
        this.dataSource = dataSource;
    }
    create(user_id, entityManager) {
        const cart = entityManager.create(cart_entity_1.Cart, { user: { id: user_id }, price: 0 });
        return entityManager.save(cart);
    }
    findAll() {
        return this.cartRepository.find();
    }
    findAllForUser(user_id, entityManager) {
        return entityManager.findOne(cart_entity_1.Cart, { where: { confirm: (0, typeorm_2.IsNull)(), user: { id: user_id } } });
    }
    findOne(user_id, entityManager) {
        return entityManager.findOne(cart_entity_1.Cart, { where: { confirm: (0, typeorm_2.IsNull)(), user: { id: user_id } }, relations: { userProducts: { product: true } } });
    }
    update(updateCartDto, user_id, entityManager) {
        return entityManager.update(cart_entity_1.Cart, { user: { id: user_id } }, { confirm: { id: updateCartDto.confirmId } });
    }
    remove(user_id, entityManager) {
        return entityManager.delete(cart_entity_1.Cart, { user: { id: user_id } });
    }
    addToCart(addToCart, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const cart = await this.findOne(user_id, entityManager);
            if (!cart) {
                const cart = await this.create(user_id, entityManager);
                return this.userProdutsService.create({ ...addToCart, cartId: cart.id });
            }
            if (cart.userProducts.some(userProduct => userProduct.product.id == addToCart.productId))
                return this.userProdutsService.updateForUser({ ...addToCart, cartId: cart.id });
            return this.userProdutsService.create({ ...addToCart, cartId: cart.id });
        });
    }
    updateCountForCartProduct(addToCart, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const cart = await this.findOne(user_id, entityManager);
            if (!cart) {
                throw new common_1.NotFoundException();
            }
            if (cart.userProducts.some(userProduct => userProduct.product.id == addToCart.productId))
                return this.userProdutsService.update({ ...addToCart, cartId: cart.id });
            throw new common_1.NotFoundException();
        });
    }
    removeFromCart(removeFromCart, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const cart = await this.findOne(user_id, entityManager);
            if (!cart) {
                throw new common_1.NotFoundException();
            }
            return this.userProdutsService.remove(removeFromCart.productId, cart.id);
        });
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __metadata("design:paramtypes", [typeorm_2.Repository, user_products_service_1.UserProductsService, typeorm_2.DataSource])
], CartsService);
//# sourceMappingURL=carts.service.js.map