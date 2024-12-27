import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ROLES_KEY} from 'src/decorators/roles.decorator';
import {Role} from 'src/enums/role.enum';
import {RolesService} from '@/roles/roles.service';
import {UsersService} from '@/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rolesService: RolesService,
        private readonly usersService: UsersService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;


        if (!user || !user.userId) {
            return false;
        }

        const foundUser = await this.usersService.findById(user.userId);


        if (!foundUser || !foundUser.roles) {
            return false;
        }

        const userRole = await this.rolesService.findById(foundUser.roles);


        if (!userRole) {
            return false;
        }


        return requiredRoles.includes(userRole.name as Role);
    }
}
