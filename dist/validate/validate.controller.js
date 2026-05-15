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
exports.ValidateController = void 0;
const common_1 = require("@nestjs/common");
const validate_service_1 = require("./validate.service");
const create_validate_dto_1 = require("./dto/create-validate.dto");
const update_validate_dto_1 = require("./dto/update-validate.dto");
let ValidateController = class ValidateController {
    validateService;
    constructor(validateService) {
        this.validateService = validateService;
    }
    create(createValidateDto) {
        return this.validateService.create(createValidateDto);
    }
    findAll() {
        return this.validateService.findAll();
    }
    findOne(id) {
        return this.validateService.findOne(+id);
    }
    update(id, updateValidateDto) {
        return this.validateService.update(+id, updateValidateDto);
    }
    remove(id) {
        return this.validateService.remove(+id);
    }
};
exports.ValidateController = ValidateController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_validate_dto_1.CreateValidateDto]),
    __metadata("design:returntype", void 0)
], ValidateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ValidateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ValidateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_validate_dto_1.UpdateValidateDto]),
    __metadata("design:returntype", void 0)
], ValidateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ValidateController.prototype, "remove", null);
exports.ValidateController = ValidateController = __decorate([
    (0, common_1.Controller)('validate'),
    __metadata("design:paramtypes", [validate_service_1.ValidateService])
], ValidateController);
//# sourceMappingURL=validate.controller.js.map