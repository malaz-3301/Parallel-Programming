import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import passport from 'passport';
import { comparePasswords, encodePassword } from 'src/auth/utils/bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByPhone(phone);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (comparePasswords(pass, user?.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { phone: user.phone, id: user.id, userType : user.userType};
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async register(createUserDto: CreateUserDto) {
    const password = encodePassword(createUserDto.password)
    const user = await this.usersService.create({ ...createUserDto, password: password })
    return this.login(user)
  }
}