import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CartsModule } from "./carts/carts.module";
import { CommentsModule } from "./comments/comments.module";
import { CompaniesModule } from "./companies/companies.module";
import { ConfirmsModule } from "./confirms/confirms.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ProductsModule } from "./products/products.module";
import { SalesBatchModule } from "./sales-batch/sales-batch.module";
import { UserProductsModule } from "./user-products/user-products.module";
import { UsersModule } from "./users/users.module";
import { ValidateModule } from "./validate/validate.module";

import { Cart } from "./carts/entities/cart.entity";
import { Comment } from "./comments/entities/comment.entity";
import { Company } from "./companies/entities/company.entity";
import { Confirm } from "./confirms/entities/confirm.entity";
import { Favorite } from "./favorites/entities/favorite.entity";
import { Notification } from "./notifications/entities/notification.entity";
import { Product } from "./products/entities/product.entity";
import { DailySalesSummary } from "./sales-batch/entities/daily-sales-summary.entity";
import { UserProduct } from "./user-products/entities/user-product.entity";
import { User } from "./users/entities/user.entity";
import { CacheModule } from '@nestjs/cache-manager'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}`, ".env"],
    }),
    CacheModule.register({ ttl: 8000, isGlobal: true }),
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 200,
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<"postgres">("DB_TYPE") ?? "postgres",
        host: config.get<string>("DB_HOST") ?? "localhost",
        port: Number(config.get<string>("DB_PORT") ?? 5432),
        username: config.get<string>("DB_USERNAME") ?? config.get<string>("DB_USER") ?? "postgres",
        password: config.get<string>("DB_PASSWORD") ?? "postgres",
        database:
          config.get<string>("DB_DATABASE") ??
          config.get<string>("DB_NAME") ??
          config.get<string>("DATABASE_NAME") ??
          "parallel_ecommerce",
        entities: [Product, User, Comment, Company, Notification, Favorite, Cart, Confirm, UserProduct, DailySalesSummary],
        synchronize: (config.get<string>("DB_SYNCHRONIZE") ?? "true") === "true",
        extra: {
          max: Number(config.get<string>("DB_POOL_MAX") ?? 10),
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST") ?? "localhost",
          port: Number(config.get<string>("REDIS_PORT") ?? 6379),
          password: config.get<string>("REDIS_PASSWORD") || undefined,
        },
      }),
    }),

    AuthModule,
    UserProductsModule,
    UsersModule,
    CommentsModule,
    ConfirmsModule,
    CompaniesModule,
    CartsModule,
    NotificationsModule,
    ProductsModule,
    FavoritesModule,
    SalesBatchModule,
    ValidateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
