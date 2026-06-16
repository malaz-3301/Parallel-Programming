import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Company } from './companies/entities/company.entity';
import { Product } from './products/entities/product.entity';
import { Comment } from './comments/entities/comment.entity';
import { Cart } from './carts/entities/cart.entity';
import { Confirm } from './confirms/entities/confirm.entity';
import { UserProduct } from './user-products/entities/user-product.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { Notification } from './notifications/entities/notification.entity';
import { DailySalesSummary } from './sales-batch/entities/daily-sales-summary.entity';
import { UserType } from './users/utils/user-type';
import { OrderStatus } from './confirms/utils/order-status';
import { encodePassword } from './auth/utils/bcrypt';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInstance() {
    return {
      instanceId: process.env.INSTANCE_ID ?? 'local',
      appName: process.env.APP_NAME ?? 'local',
      nodeEnv: process.env.NODE_ENV ?? 'development',
    };
  }

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Clear all tables safely
      await queryRunner.query('TRUNCATE TABLE "daily_sales_summary", "favorite", "notification", "comment", "confirm", "user_product", "cart", "product", "company", "user" CASCADE;');

      // 1. Create 105 Users
      const users: User[] = [];
      const passwordHash = encodePassword('password123');
      for (let i = 1; i <= 105; i++) {
        const user = queryRunner.manager.create(User, {
          name: `User ${i}`,
          password: passwordHash,
          phone: `0999999${String(i).padStart(3, '0')}`,
          photo: `user-${i}.jpg`,
          userType: i <= 5 ? UserType.ADMIN : UserType.USER,
        });
        users.push(user);
      }
      await queryRunner.manager.save(User, users);

      // 2. Create 105 Companies
      const companies: Company[] = [];
      for (let i = 1; i <= 105; i++) {
        const company = queryRunner.manager.create(Company, {
          name: `Company ${i}`,
          location: `Location ${i}`,
          phone: `0888888${String(i).padStart(3, '0')}`,
          user: users[i - 1],
        });
        companies.push(company);
      }
      await queryRunner.manager.save(Company, companies);

      // 3. Create 105 Products
      const products: Product[] = [];
      for (let i = 1; i <= 105; i++) {
        const product = queryRunner.manager.create(Product, {
          count: 1000,
          price: 10 + i * 5,
          photo: `product-${i}.jpg`,
          details: `Details of product ${i}`,
          company: companies[i - 1],
        });
        products.push(product);
      }
      await queryRunner.manager.save(Product, products);

      // 4. Create 105 Comments
      const comments: Comment[] = [];
      for (let i = 1; i <= 105; i++) {
        const comment = queryRunner.manager.create(Comment, {
          description: `Excellent product ${i}!`,
          rating: (i % 5) + 1,
          user: users[(i + 10) % 105],
          product: products[i - 1],
        });
        comments.push(comment);
      }
      await queryRunner.manager.save(Comment, comments);

      // 5. Create 105 Carts
      const carts: Cart[] = [];
      for (let i = 1; i <= 105; i++) {
        const cart = queryRunner.manager.create(Cart, {
          price: 0,
          user: users[i - 1],
        });
        carts.push(cart);
      }
      await queryRunner.manager.save(Cart, carts);

      // 6. Create 105 Confirms
      const confirms: Confirm[] = [];
      for (let i = 1; i <= 105; i++) {
        const confirm = queryRunner.manager.create(Confirm, {
          card_password: `pin-${i}`,
          card_number: `1234-5678-9012-${String(i).padStart(4, '0')}`,
          status: OrderStatus.COMPLETED,
          cart: carts[i - 1],
        });
        confirms.push(confirm);
      }
      await queryRunner.manager.save(Confirm, confirms);

      // Link Cart to Confirm
      for (let i = 1; i <= 105; i++) {
        carts[i - 1].confirm = confirms[i - 1];
      }
      await queryRunner.manager.save(Cart, carts);

      // 7. Create UserProducts (items in cart)
      // To show best sellers, make some products have higher sales
      const userProducts: UserProduct[] = [];
      for (let i = 1; i <= 105; i++) {
        let count = 1;
        const product = products[i - 1];
        
        if (i === 1) count = 50;
        else if (i === 2) count = 40;
        else if (i === 3) count = 30;
        else if (i === 4) count = 20;
        else if (i === 5) count = 15;
        
        const userProduct = queryRunner.manager.create(UserProduct, {
          count: count,
          price: product.price * count,
          product: product,
          cart: carts[i - 1],
        });
        userProducts.push(userProduct);
      }
      await queryRunner.manager.save(UserProduct, userProducts);

      // Update cart prices
      for (let i = 0; i < 105; i++) {
        carts[i].price = userProducts[i].price;
      }
      await queryRunner.manager.save(Cart, carts);

      // 8. Create 105 Favorites
      const favorites: Favorite[] = [];
      for (let i = 1; i <= 105; i++) {
        const favorite = queryRunner.manager.create(Favorite, {
          user: users[(i + 5) % 105],
          product: products[i - 1],
        });
        favorites.push(favorite);
      }
      await queryRunner.manager.save(Favorite, favorites);

      // 9. Create 105 Notifications
      const notifications: Notification[] = [];
      for (let i = 1; i <= 105; i++) {
        const notification = queryRunner.manager.create(Notification, {
          data: `Notification text ${i}`,
          user: users[i - 1],
        });
        notifications.push(notification);
      }
      await queryRunner.manager.save(Notification, notifications);

      // 10. Create 105 DailySalesSummaries
      const summaries: DailySalesSummary[] = [];
      for (let i = 1; i <= 105; i++) {
        const summary = queryRunner.manager.create(DailySalesSummary, {
          summaryDate: new Date().toISOString().split('T')[0],
          productId: products[i - 1].id,
          totalQuantity: userProducts[i - 1].count,
          totalRevenue: userProducts[i - 1].price,
        });
        summaries.push(summary);
      }
      await queryRunner.manager.save(DailySalesSummary, summaries);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Database seeded successfully with 105 records per table' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
