import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { UserType } from 'src/users/utils/user-type';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get(Roles, context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return this.matchRoles(roles, user.userType);
    }
    matchRoles(roles, userRole) {
        if (userRole == UserType.BANNED) {
            return false
        }
        else {
            return roles.some(role => userRole.includes(role))
        }
    }
}


