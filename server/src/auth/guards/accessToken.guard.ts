import {Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ExecutionContext} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Inject} from '@nestjs/common';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
    constructor(@Inject(JwtService) private jwtService: JwtService) {
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || info) {
            throw err || info;
        }

        if (!user) {
            throw new Error('No user found in JWT');
        }

        const request = context.switchToHttp().getRequest();
        request.user = user;

        return user;
    }
}
