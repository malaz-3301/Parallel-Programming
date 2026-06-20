import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatus } from 'src/enums/enums';
import { PaymentService } from 'src/payments/payment.service';
import { ProductsService } from 'src/products/products.service';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { Confirm } from './entities/confirm.entity';

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

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
        createConfirmDto.paymentToken,
        totalAmount,
      );

      const confirm = entityManager.create(Confirm, {
        status: OrderStatus.PENDING,
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
      order: { createdAt: 'DESC' },
    });
  }

  findAllForUser(userId: number) {
    return this.confirmRepository.find({
      where: { cart: { userId } },
      relations: { cart: { userProducts: { product: true } } },
      order: { createdAt: 'DESC' },
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
      where: { id, cart: { userId } },
      relations: { cart: { userProducts: { product: true } } },
    });
  }

  update(id: number, statusChange: ChangeOrderStatusDto) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = await this.findOneForUpdate(id, entityManager);

      if (!confirm) {
        throw new NotFoundException();
      }

      if (statusChange.status === confirm.status) {
        return confirm;
      }

      if (!ORDER_TRANSITIONS[confirm.status].includes(statusChange.status)) {
        throw new ConflictException(
          `Order cannot move from ${confirm.status} to ${statusChange.status}`,
        );
      }

      if (statusChange.status === OrderStatus.CANCELLED) {
        await this.restoreOrderStock(confirm, entityManager);
      }

      const result = await entityManager.update(
        Confirm,
        { id },
        { status: statusChange.status },
      );
      if (result.affected !== 1) {
        throw new ConflictException('The order was changed by another request');
      }

      return entityManager.findOneByOrFail(Confirm, { id });
    });
  }

  cancelPendingOrder(id: number, userId: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = await this.findOneForUpdate(id, entityManager);

      if (!confirm) {
        throw new NotFoundException();
      }

      const belongsToUser = await entityManager.exists(Cart, {
        where: { id: confirm.cart.id, userId },
      });

      if (!belongsToUser) {
        throw new NotFoundException();
      }

      if (confirm.status !== OrderStatus.PENDING) {
        throw new ForbiddenException('Only pending orders can be cancelled');
      }

      await this.restoreOrderStock(confirm, entityManager);
      const result = await entityManager.update(
        Confirm,
        { id, status: OrderStatus.PENDING },
        { status: OrderStatus.CANCELLED },
      );

      if (result.affected !== 1) {
        throw new ConflictException('The order was changed by another request');
      }

      return entityManager.findOneByOrFail(Confirm, { id });
    });
  }

  private async restoreOrderStock(
    confirm: Confirm,
    entityManager: EntityManager,
  ) {
    await this.productsService.increaseStock(
      confirm.cart.userProducts.map((item) => ({
        productId: item.product.id,
        quantity: item.count,
      })),
      entityManager,
    );
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
