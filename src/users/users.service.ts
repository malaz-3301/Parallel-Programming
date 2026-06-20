import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { encodePassword } from 'src/auth/utils/bcrypt';
import { CartsService } from 'src/carts/carts.service';
import { UserType } from 'src/enums/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cartsService: CartsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string } | undefined)?.code === '23505'
      ) {
        throw new ConflictException('Phone number is already registered');
      }

      throw error;
    }
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
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :phone', { phone })
      .getOne();
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

  async update(id: number, updateUserDto: UpdateUserDto, actorId: number) {
    const target = await this.getManageableUser(id, actorId);
    const changes = {
      ...updateUserDto,
      ...(updateUserDto.password
        ? { password: encodePassword(updateUserDto.password) }
        : {}),
    };

    const result = await this.userRepository.update(target.id, changes);
    if (result.affected !== 1) {
      throw new NotFoundException();
    }

    return this.findOneById(target.id);
  }

  async remove(id: number, actorId: number) {
    const target = await this.getManageableUser(id, actorId);
    const activeCart = await this.cartsService.findOne(target.id);

    if (activeCart) {
      await this.cartsService.remove(target.id);
    }

    await this.userRepository.update(target.id, {
      userType: UserType.BANNED,
    });

    return { id: target.id, userType: UserType.BANNED };
  }

  private async getManageableUser(targetId: number, actorId: number) {
    const [target, actor] = await Promise.all([
      this.findOneById(targetId),
      this.findOneById(actorId),
    ]);

    if (!target || !actor) {
      throw new NotFoundException();
    }

    if (target.id === actor.id) {
      throw new ForbiddenException('You cannot manage your own account here');
    }

    if (target.userType === UserType.SUPERADMIN) {
      throw new ForbiddenException('A super admin account cannot be managed');
    }

    if (
      actor.userType === UserType.ADMIN &&
      target.userType !== UserType.USER &&
      target.userType !== UserType.BANNED
    ) {
      throw new ForbiddenException('Admins can manage regular users only');
    }

    return target;
  }
}
