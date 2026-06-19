import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../types/jwt-payload.type';
import { ROLES_KEY } from './roles.decorator';
import { UserType } from 'src/users/utils/user-type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      user.userType !== UserType.SUPERADMIN &&
      !requiredRoles.includes(user.userType)
    ) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
