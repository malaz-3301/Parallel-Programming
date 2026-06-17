import { Injectable, NotFoundException, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Confirm } from './entities/confirm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatus } from './utils/order-status';

@Injectable()
export class ConfirmsService {
  constructor(
    @InjectRepository(Confirm) private confirmRepository: Repository<Confirm>,
    @Inject(forwardRef(() => CartsService)) private cartsService: CartsService,
    private dataSource: DataSource,
  ) { }
  create(createconfirmDto: CreateConfirmDto, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const cart = await this.cartsService.findOneWithoutProductsByUserId(user_id, entityManager)
      if (!cart) {
        throw new NotFoundException();
      }
      const confirm = entityManager.create(Confirm, createconfirmDto);
      const savedConfirm = await entityManager.save(confirm)
      await this.cartsService.update({ confirmId: savedConfirm.id }, user_id, cart.version, entityManager)
      return savedConfirm
    })
  }

  findAll() {
    return this.confirmRepository.find()
  }

  findOne(id: number) {
    return this.confirmRepository.findOne({ where: { id } })
  }

  findOneForUser(id: number, user_id: number, entityManager: EntityManager | null = null) {
    const where = { where: { id, cart: { user: { id: user_id } } }, relations: { cart: { user: true } } };
    if (entityManager) {
      return entityManager.findOne(Confirm, { ...where, lock: { mode: 'pessimistic_write' } })
    }
    return this.confirmRepository.findOne(where)
  }

  update(id: number, updateconfirmDto: UpdateConfirmDto,) {
    return this.dataSource.transaction(async (entityManager) => {
      if (updateconfirmDto.status == OrderStatus.CANCELLED) {
        await this.cartsService.removeAllFromCart(id, entityManager)
      }
      return entityManager.update(Confirm, id, updateconfirmDto)
    })
  }

  remove(id: number, user_id: number) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = await this.findOneForUser(id, user_id, entityManager)
      if (!confirm) {
        throw new NotFoundException();
      }
      if (confirm.status != OrderStatus.PENDING) {
        throw new UnauthorizedException();
      }
      return entityManager.delete(Confirm, { id });
    })
  }
}



