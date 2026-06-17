import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserType } from './utils/user-type';
import { getRandomValues, randomUUID } from 'crypto';
import { encodePassword } from 'src/auth/utils/bcrypt';
import { CartsService } from 'src/carts/carts.service';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>,private cartsService: CartsService) { }
  create(createUserDto: CreateUserDto) {
    const password = encodePassword(createUserDto.password)
    const user = this.userRepository.create({ ...createUserDto, password });
    return this.userRepository.save(user)
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id, userType: Not(UserType.BANNED) } });
  }
  findOneByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }
  findOneById(user_id: number) {
    return this.userRepository.findOne({ where: { id: user_id } });
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    console.log('id'+id)
    await this.cartsService.remove(id);
    return this.userRepository.update(id, { userType: UserType.BANNED })
  }
  finOneForNotifications() {
    return this.userRepository.findOne({ where: {}, order: { id: 'DESC' } })
  }
}
