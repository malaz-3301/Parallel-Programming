import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserType } from 'src/enums/enums';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ??
        configService.get<string>('SECRET') ??
        'development-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersService.findOneById(payload.id);

    if (!user || user.userType === UserType.BANNED) {
      throw new UnauthorizedException('The account is unavailable');
    }

    return {
      id: user.id,
      phone: user.phone,
      userType: user.userType,
    };
  }
}
