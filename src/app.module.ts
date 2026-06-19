import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartsModule } from './carts/carts.module';
import { CommentsModule } from './comments/comments.module';
import { CompaniesModule } from './companies/companies.module';
import { ConfirmsModule } from './confirms/confirms.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ModulesSetModule } from './modules-set/modules-set.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProductsModule } from './products/products.module';
import { SalesBatchModule } from './sales-batch/sales-batch.module';
import { UserProductsModule } from './user-products/user-products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ModulesSetModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
