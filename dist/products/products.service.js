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
    async create(createProductDto, user_id) {
        const company = await this.companiesService.findOneByUser(user_id);
        if (!company) {
            throw new common_1.UnauthorizedException();
        }
        const product = this.productRepository.create({ ...createProductDto, company: { id: company.id } });
        return this.productRepository.save(product);
    }
    findAll() {
        return this.productRepository.find();
    }
    findOne(id) {
        return this.productRepository.findOne({ where: { id, deletedAt: (0, typeorm_2.IsNull)() } });
    }
    findOneForBuy(id, updateProductCountDto) {
        return this.productRepository.findOne({ where: { id, count: (0, typeorm_2.MoreThanOrEqual)(updateProductCountDto.count), deletedAt: (0, typeorm_2.IsNull)() } });
    }
    async updateForBuy(id, updateProductCountDto, user_id) {
        const product = await this.findOneForBuy(id, updateProductCountDto);
        if (!product) {
            throw new common_1.NotFoundException();
        }
        await this.productRepository.update(id, { count: product.count - updateProductCountDto.count });
        return product;
    }
    async update(id, updateProductDto, user_id) {
        const product = await this.productRepository.findOne({ where: { id } });
        return this.productRepository.update(id, updateProductDto);
    }
    async remove(id, user_id) {
        const company = await this.companiesService.findOneByUser(user_id);
        if (!company) {
            throw new common_1.UnauthorizedException();
        }
        return this.productRepository.update(id, { deletedAt: Date.now() });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeorm_2.DataSource, companies_service_1.CompaniesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map