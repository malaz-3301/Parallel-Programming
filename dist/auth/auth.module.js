"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const users_module_1 = require("../users/users.module");
const auth_controller_1 = require("./controllers/auth/auth.controller");
const JwtStrategy_1 = require("./utils/JwtStrategy");
const LocalStrategy_1 = require("./utils/LocalStrategy");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./services/auth/auth.service");
const core_1 = require("@nestjs/core");
const JwtGuard_1 = require("./utils/JwtGuard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, passport_1.PassportModule, jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('SECRET'),
                    signOptions: { expiresIn: configService.get('EXPIRES_IN') }
                }),
                inject: [config_1.ConfigService],
            }), config_1.ConfigModule],
        controllers: [auth_controller_1.AuthController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: JwtGuard_1.JwtAuthGuard,
            },
            auth_service_1.AuthService, JwtStrategy_1.JwtStrategy, LocalStrategy_1.LocalStrategy
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map