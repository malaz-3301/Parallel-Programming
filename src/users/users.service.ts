import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { encodePassword } from 'src/auth/utils/bcrypt';
import { CartsService } from 'src/carts/carts.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserType } from './utils/user-type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cartsService: CartsService,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  createUser(createUserDto: CreateUserDto) {
    const password = encodePassword(createUserDto.password);
    return this.create({ ...createUserDto, password });
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id, userType: Not(UserType.BANNED) },
    });
  }

  findOneByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }

  findOneById(userId: number) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  findIdsForNotifications() {
    return this.userRepository.find({
      select: { id: true },
      where: { userType: Not(UserType.BANNED) },
      order: { id: 'ASC' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);

    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return result;
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException();
    }

    const activeCart = await this.cartsService.findOne(id);
    if (activeCart) {
      await this.cartsService.remove(id);
    }

    return this.userRepository.update(id, { userType: UserType.BANNED });
  }
}
