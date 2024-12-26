import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    console.dir('AUTH GUARD');
  }

  canActivate(context: ExecutionContext): any {
    console.log(context);
    console.log(this.reflector);

    // const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    // if (!requiredRoles) {
    //   return true;
    // }
    // const ctx = GqlExecutionContext.create(context);
    // const user = ctx.getContext().req.user;
    // console.log(user);
    // return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
