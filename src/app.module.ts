import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsModule } from "./comments/comments.module";
import { CompaniesModule } from "./companies/companies.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Comment } from "./comments/entities/comment.entity";
import { User } from "./users/entities/user.entity";
import { Product } from "./products/entities/product.entity";
import { Company } from "./companies/entities/company.entity";
import { CartsModule } from './carts/carts.module';
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/utils/JwtGuard";
import { APP_GUARD } from "@nestjs/core";
import { ValidateModule } from './validate/validate.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FavoritesModule } from './favorites/favorites.module';
import { Notification } from "./notifications/entities/notification.entity";
import { Favorite } from "./favorites/entities/favorite.entity";
import { Cart } from "./carts/entities/cart.entity";
import { ConfirmsModule } from './confirms/confirms.module';
import { Confirm } from "./confirms/entities/confirm.entity";
import { UserProductsModule } from './user-products/user-products.module';
import { UserProduct } from "./user-products/entities/user-product.entity";
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bullmq';
import * as path from 'path';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommentsModule,
    CompaniesModule,
    ProductsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: config.get<string>('DB_TYPE') as any,
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          entities: [Product, User, Comment, Company, Notification, Favorite, Cart, Confirm, UserProduct],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CartsModule,
    NotificationsModule,
    FavoritesModule,
    ConfirmsModule,
    UserProductsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10000,
        },

      ],
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    AppService,]
})
export class AppModule { }
