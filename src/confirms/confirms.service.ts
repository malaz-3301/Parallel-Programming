import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartsService } from 'src/carts/carts.service';
import { PaymentService } from 'src/payments/payment.service';
import { ProductsService } from 'src/products/products.service';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Confirm } from './entities/confirm.entity';
import { OrderStatus } from './utils/order-status';

@Injectable()
export class ConfirmsService {
  constructor(
    @InjectRepository(Confirm)
    private readonly confirmRepository: Repository<Confirm>,
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
  ) {}

  create(createConfirmDto: CreateConfirmDto, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.cartsService.findOneWithoutProductsByUserId(
        userId,
        entityManager,
      );

      if (!cart) {
        throw new NotFoundException('Active cart was not found');
      }

      if (!cart.userProducts.length) {
        throw new BadRequestException('Cannot checkout an empty cart');
      }

      const stockItems = cart.userProducts.map((item) => ({
        productId: item.product.id,
        quantity: item.count,
      }));
      const totalAmount = cart.userProducts.reduce(
        (total, item) => total + Number(item.price),
        0,
      );

      await this.productsService.decreaseStock(stockItems, entityManager);

      const payment = await this.paymentService.authorize(
        createConfirmDto.payment_token,
        totalAmount,
      );

      const confirm = entityManager.create(Confirm, {
        status: OrderStatus.COMPLETED,
        paymentReference: payment.reference,
        totalAmount,
      });
      const savedConfirm = await entityManager.save(Confirm, confirm);

      await this.cartsService.attachConfirm(
        cart,
        savedConfirm.id,
        totalAmount,
        entityManager,
      );

      return savedConfirm;
    });
  }

  findAll() {
    return this.confirmRepository.find({
      relations: { cart: { user: true, userProducts: { product: true } } },
    });
  }

  findOne(id: number) {
    return this.confirmRepository.findOne({
      where: { id },
      relations: { cart: { user: true, userProducts: { product: true } } },
    });
  }

  findOneForUser(id: number, userId: number) {
    return this.confirmRepository.findOne({
      where: { id, cart: { user: { id: userId } } },
      relations: { cart: { user: true } },
    });
  }

  update(id: number, updateConfirmDto: UpdateConfirmDto) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = await this.findOneForUpdate(id, entityManager);

      if (!confirm) {
        throw new NotFoundException();
      }

      if (
        confirm.status === OrderStatus.CANCELLED &&
        updateConfirmDto.status !== OrderStatus.CANCELLED
      ) {
        throw new ConflictException('A cancelled order cannot be reopened');
      }

      if (
        updateConfirmDto.status === OrderStatus.CANCELLED &&
        confirm.status !== OrderStatus.CANCELLED &&
        (confirm.status === OrderStatus.COMPLETED ||
          confirm.status === OrderStatus.PROCESSING)
      ) {
        await this.productsService.increaseStock(
          confirm.cart.userProducts.map((item) => ({
            productId: item.product.id,
            quantity: item.count,
          })),
          entityManager,
        );
      }

      const result = await entityManager.update(Confirm, { id }, updateConfirmDto);
      if (result.affected !== 1) {
        throw new ConflictException('The order was changed by another request');
      }

      return entityManager.findOneByOrFail(Confirm, { id });
    });
  }

  remove(id: number, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = await this.findOneForUpdate(id, entityManager);

      if (!confirm) {
        throw new NotFoundException();
      }

      const belongsToUser = await entityManager.exists(Cart, {
        where: { id: confirm.cart.id, user: { id: userId } },
      });

      if (!belongsToUser) {
        throw new NotFoundException();
      }

      if (confirm.status !== OrderStatus.PENDING) {
        throw new UnauthorizedException('Only pending orders can be deleted');
      }

      const result = await entityManager.delete(Confirm, { id });
      if (result.affected !== 1) {
        throw new ConflictException('The order was changed by another request');
      }
    });
  }

  private async findOneForUpdate(id: number, entityManager: EntityManager) {
    const confirm = await entityManager.findOne(Confirm, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!confirm) {
      return null;
    }

    const cart = await this.cartsService.findConfirmedCartForUpdate(
      id,
      entityManager,
    );

    if (!cart) {
      throw new ConflictException('The order is not linked to a cart');
    }

    confirm.cart = cart;
    return confirm;
  }
}
