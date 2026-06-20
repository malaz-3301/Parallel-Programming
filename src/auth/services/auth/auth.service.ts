import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/auth/utils/bcrypt';
import { UserType } from 'src/enums/enums';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
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
    const user = await this.usersService.createUser(createUserDto);
    return this.login(user);
  }
}
