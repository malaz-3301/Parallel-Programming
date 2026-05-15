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
exports.Product = void 0;
const comment_entity_1 = require("../../comments/entities/comment.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
const user_product_entity_1 = require("../../user-products/entities/user-product.entity");
const typeorm_1 = require("typeorm");
let Product = class Product {
    id;
    count;
    price;
    photo;
    details;
    company;
    comments;
    carts;
    deletedAt;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "count", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "photo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => company_entity_1.Company),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", company_entity_1.Company)
], Product.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.product),
    __metadata("design:type", Array)
], Product.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_product_entity_1.UserProduct, (userProduct) => userProduct.product),
    __metadata("design:type", Array)
], Product.prototype, "carts", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Product.prototype, "deletedAt", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)()
], Product);
//# sourceMappingURL=product.entity.js.map