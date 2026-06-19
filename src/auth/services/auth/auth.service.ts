import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords, encodePassword } from 'src/auth/utils/bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UserType } from 'src/users/utils/user-type';
import { JwtPayload } from '../../types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string) {
    const user = await this.usersService.findOneByPhone(phone);

    if (
      !user ||
      user.userType === UserType.BANNED ||
      !comparePasswords(password, user.password)
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  login(user: Pick<User, 'id' | 'phone' | 'userType'>) {
    const payload: JwtPayload = {
      id: user.id,
      phone: user.phone,
      userType: user.userType,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const password = encodePassword(createUserDto.password);
    const user = await this.usersService.create({ ...createUserDto, password });
    return this.login(user);
  }
}
