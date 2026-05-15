"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmsModule = void 0;
const common_1 = require("@nestjs/common");
const confirms_service_1 = require("./confirms.service");
const confirms_controller_1 = require("./confirms.controller");
const confirm_entity_1 = require("./entities/confirm.entity");
const typeorm_1 = require("@nestjs/typeorm");
const carts_module_1 = require("../carts/carts.module");
let ConfirmsModule = class ConfirmsModule {
};
exports.ConfirmsModule = ConfirmsModule;
exports.ConfirmsModule = ConfirmsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([confirm_entity_1.Confirm]), carts_module_1.CartsModule],
        controllers: [confirms_controller_1.ConfirmsController],
        providers: [confirms_service_1.ConfirmsService],
    })
], ConfirmsModule);
//# sourceMappingURL=confirms.module.js.map