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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommentsModule,
    CompaniesModule,
    ProductsModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'mohammed',
          password: 'mohammed',
          database: 'parallel_programming',
          // host: config.get<string>('DB_HOST'),
          // port: config.get<number>('DB_PORT'),
          // username: config.get<string>('DB_USERNAME'),
          // password: config.get<string>('DB_PASSWORD'),
          // database: config.get<string>('DB_DATABASE'),
          entities: [Product, User, Comment, Company, Notification, Favorite, Cart, Confirm, UserProduct],
          // autoLoadEntities: true,
          synchronize: true,
          logging: true
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
    // ValidateModule,c
  ],
  controllers: [AppController],
  providers: [AppService,]
})
export class AppModule { }
