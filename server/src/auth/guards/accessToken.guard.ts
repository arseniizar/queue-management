import {Injectable, UnauthorizedException} from '@nestjs/common';
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
        if (err) {
            throw new UnauthorizedException('An error occurred while validating the token.');
        }

        if (info?.name === 'TokenExpiredError') {
            throw new UnauthorizedException('The token has expired. Please log in again.');
        }

        if (info?.name === 'JsonWebTokenError') {
            throw new UnauthorizedException('Invalid token. Please log in again.');
        }

        if (info || !user) {
            throw new UnauthorizedException('Authentication failed. Please provide a valid token.');
        }

        const request = context.switchToHttp().getRequest();
        request.user = user;

        return user;
    }
}
