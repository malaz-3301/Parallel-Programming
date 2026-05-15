"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const comments_module_1 = require("./comments/comments.module");
const companies_module_1 = require("./companies/companies.module");
const products_module_1 = require("./products/products.module");
const users_module_1 = require("./users/users.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const comment_entity_1 = require("./comments/entities/comment.entity");
const user_entity_1 = require("./users/entities/user.entity");
const product_entity_1 = require("./products/entities/product.entity");
const company_entity_1 = require("./companies/entities/company.entity");
const carts_module_1 = require("./carts/carts.module");
const auth_module_1 = require("./auth/auth.module");
const notifications_module_1 = require("./notifications/notifications.module");
const favorites_module_1 = require("./favorites/favorites.module");
const notification_entity_1 = require("./notifications/entities/notification.entity");
const favorite_entity_1 = require("./favorites/entities/favorite.entity");
const cart_entity_1 = require("./carts/entities/cart.entity");
const confirms_module_1 = require("./confirms/confirms.module");
const confirm_entity_1 = require("./confirms/entities/confirm.entity");
const user_products_module_1 = require("./user-products/user-products.module");
const user_product_entity_1 = require("./user-products/entities/user-product.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            comments_module_1.CommentsModule,
            companies_module_1.CompaniesModule,
            products_module_1.ProductsModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    return {
                        type: 'mysql',
                        host: 'localhost',
                        port: 3306,
                        username: 'mohammed',
                        password: 'mohammed',
                        database: 'parallel_programming',
                        entities: [product_entity_1.Product, user_entity_1.User, comment_entity_1.Comment, company_entity_1.Company, notification_entity_1.Notification, favorite_entity_1.Favorite, cart_entity_1.Cart, confirm_entity_1.Confirm, user_product_entity_1.UserProduct],
                        synchronize: true,
                        logging: true
                    };
                },
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            carts_module_1.CartsModule,
            notifications_module_1.NotificationsModule,
            favorites_module_1.FavoritesModule,
            confirms_module_1.ConfirmsModule,
            user_products_module_1.UserProductsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService,]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map