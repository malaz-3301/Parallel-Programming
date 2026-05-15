import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateConfirmDto } from './dto/create-confirm.dto';
import { UpdateConfirmDto } from './dto/update-confirm.dto';
import { Confirm } from './entities/confirm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartsService } from 'src/carts/carts.service';
import { OrderStatus } from './utils/order-status';

@Injectable()
export class ConfirmsService {
  constructor(@InjectRepository(Confirm) private confirmRepository: Repository<Confirm>, private cartsService: CartsService) { }
  async create(createconfirmDto: CreateConfirmDto, user_id) {
    const confirm = this.confirmRepository.create(createconfirmDto);
    const savedConfirm = await this.confirmRepository.save(confirm)
    await this.cartsService.update({ confirmId: savedConfirm.id }, user_id)
    return savedConfirm
  }

  findAll() {
    return this.confirmRepository.find()
  }

  findOne(id: number) {
    return this.confirmRepository.findOne({ where: { id } })
  }

  findOneForUser(id: number, user_id: number) {
    return this.confirmRepository.findOne({ where: { id, cart: { user: { id: user_id } } }, relations: { cart: { user: true } } })
  }

  async update(id: number, updateconfirmDto: UpdateConfirmDto) {
    return this.confirmRepository.update(id, updateconfirmDto)
  }

  async remove(id: number, user_id: number) {
    const confirm = await this.findOneForUser(id, user_id)
    if (!confirm) {
      throw new NotFoundException();
    }
    if (confirm.status != OrderStatus.PENDING) {
      throw new UnauthorizedException();
    }
    return this.confirmRepository.delete({ id });
  }
}



