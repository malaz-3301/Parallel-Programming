"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateService = void 0;
const common_1 = require("@nestjs/common");
let ValidateService = class ValidateService {
    create(createValidateDto) {
        return 'This action adds a new validate';
    }
    findAll() {
        return `This action returns all validate`;
    }
    findOne(id) {
        return `This action returns a #${id} validate`;
    }
    update(id, updateValidateDto) {
        return `This action updates a #${id} validate`;
    }
    remove(id) {
        return `This action removes a #${id} validate`;
    }
};
exports.ValidateService = ValidateService;
exports.ValidateService = ValidateService = __decorate([
    (0, common_1.Injectable)()
], ValidateService);
//# sourceMappingURL=validate.service.js.map