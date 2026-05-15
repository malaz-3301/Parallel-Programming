import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Confirm } from './entities/confirm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatus } from './utils/order-status';

@Injectable()
export class ConfirmsService {
  constructor(@InjectRepository(Confirm) private confirmRepository: Repository<Confirm>, private cartsService: CartsService, private dataSource: DataSource) { }
  create(createconfirmDto: CreateConfirmDto, user_id) {
    return this.dataSource.transaction(async (entityManager) => {
      const confirm = this.confirmRepository.create(createconfirmDto);
      const savedConfirm = await this.confirmRepository.save(confirm)
      await this.cartsService.update({ confirmId: savedConfirm.id }, user_id, entityManager)
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
      entityManager.findOne(Confirm, where)
    }
    return this.confirmRepository.findOne(where)
  }

  update(id: number, updateconfirmDto: UpdateConfirmDto) {
    return this.confirmRepository.update(id, updateconfirmDto)
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



