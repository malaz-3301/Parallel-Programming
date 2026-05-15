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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("./entities/product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const companies_service_1 = require("../companies/companies.service");
let ProductsService = class ProductsService {
    productRepository;
    dataSource;
    companiesService;
    constructor(productRepository, dataSource, companiesService) {
        this.productRepository = productRepository;
        this.dataSource = dataSource;
        this.companiesService = companiesService;
    }
    create(createProductDto, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const company = await this.companiesService.findOneByUser(user_id, entityManager);
            if (!company) {
                throw new common_1.UnauthorizedException();
            }
            const product = entityManager.create(product_entity_1.Product, { ...createProductDto, company: { id: company.id }, });
            return entityManager.save(product_entity_1.Product, product);
        });
    }
    findAll() {
        return this.productRepository.find();
    }
    findOne(id, entityManager = null) {
        const where = { where: { id, deletedAt: (0, typeorm_2.IsNull)() } };
        if (entityManager) {
            entityManager.findOne(product_entity_1.Product, where);
        }
        return this.productRepository.findOne(where);
    }
    findOneForBuy(id, updateProductCountDto, entityManager = null) {
        const where = { where: { id, count: (0, typeorm_2.MoreThanOrEqual)(updateProductCountDto.count), deletedAt: (0, typeorm_2.IsNull)() } };
        if (entityManager) {
            entityManager.findOne(product_entity_1.Product, where);
        }
        return this.productRepository.findOne(where);
    }
    async updateForBuy(id, updateProductCountDto, entityManager) {
        const product = await this.findOneForBuy(id, updateProductCountDto, entityManager);
        if (!product) {
            throw new common_1.NotFoundException();
        }
        await entityManager.update(product_entity_1.Product, id, { count: product.count - updateProductCountDto.count });
        return product;
    }
    async updateForReturn(id, updateProductCountDto, entityManager) {
        const product = await this.findOne(id, entityManager);
        if (!product) {
            throw new common_1.NotFoundException();
        }
        await entityManager.update(product_entity_1.Product, id, { count: product.count + updateProductCountDto.count });
        return product;
    }
    update(id, updateProductDto, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const product = await this.findOne(id, entityManager);
            return entityManager.update(product_entity_1.Product, id, updateProductDto);
        });
    }
    remove(id, user_id) {
        return this.dataSource.transaction(async (entityManager) => {
            const company = await this.companiesService.findOneByUser(user_id, entityManager);
            if (!company) {
                throw new common_1.UnauthorizedException();
            }
            return entityManager.update(product_entity_1.Product, id, { deletedAt: Date.now() });
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.DataSource, companies_service_1.CompaniesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map