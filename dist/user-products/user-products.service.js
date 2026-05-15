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
exports.UserProductsService = void 0;
const common_1 = require("@nestjs/common");
const user_product_entity_1 = require("./entities/user-product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const products_service_1 = require("../products/products.service");
let UserProductsService = class UserProductsService {
    userProductRepository;
    dataSource;
    productsService;
    constructor(userProductRepository, dataSource, productsService) {
        this.userProductRepository = userProductRepository;
        this.dataSource = dataSource;
        this.productsService = productsService;
    }
    create(createuserProductDto) {
        return this.dataSource.transaction(async (entityManager) => {
            const product = await this.productsService.updateForBuy(createuserProductDto.productId, { count: createuserProductDto.count }, entityManager);
            if (!product) {
                throw new common_1.NotFoundException();
            }
            const userProduct = entityManager.create(user_product_entity_1.UserProduct, { ...createuserProductDto, price: createuserProductDto.count * product.price, product: { id: createuserProductDto.productId }, cart: { id: createuserProductDto.cartId } });
            return entityManager.save(userProduct);
        });
    }
    findAll() {
        return this.userProductRepository.find();
    }
    findOne(productId, cartId, entityManager = null) {
        const where = { where: { product: { id: productId }, cart: { id: cartId } }, loadRelationIds: true };
        if (entityManager) {
            entityManager.findOne(user_product_entity_1.UserProduct, where);
        }
        return this.userProductRepository.findOne(where);
    }
    update(createUserProductDto) {
        return this.dataSource.transaction(async (entityManager) => {
            try {
                const userProduct = await this.findOne(createUserProductDto.productId, createUserProductDto.cartId, entityManager);
                const product = await this.productsService.findOne(userProduct.product.id, entityManager);
                return entityManager.update(user_product_entity_1.UserProduct, userProduct.id, { ...createUserProductDto, price: product.price * createUserProductDto.count });
            }
            catch (e) {
                throw new common_1.NotFoundException();
            }
        });
    }
    updateForUser(createUserProductDto) {
        return this.dataSource.transaction(async (entityManager) => {
            try {
                const userProduct = await this.findOne(createUserProductDto.productId, createUserProductDto.cartId, entityManager);
                const product = await this.productsService.findOne(userProduct.product.id, entityManager);
                const newCount = (createUserProductDto.count + userProduct.count);
                return entityManager.update(user_product_entity_1.UserProduct, userProduct.id, { price: product.price * newCount, count: newCount });
            }
            catch (e) {
                throw new common_1.NotFoundException();
            }
        });
    }
    remove(productId, cartId) {
        return this.dataSource.transaction(async (entityManager) => {
            try {
                const userProduct = await this.findOne(productId, cartId, entityManager);
                const product = await this.productsService.updateForReturn(productId, { count: userProduct.count }, entityManager);
            }
            catch (e) {
                throw new common_1.NotFoundException();
            }
            return entityManager.delete(user_product_entity_1.UserProduct, { product: { id: productId }, cart: { id: cartId } });
        });
    }
};
exports.UserProductsService = UserProductsService;
exports.UserProductsService = UserProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_product_entity_1.UserProduct)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.DataSource, products_service_1.ProductsService])
], UserProductsService);
//# sourceMappingURL=user-products.service.js.map