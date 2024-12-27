import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || info) {
            throw err || info;
        }

        if (!user) {
            throw new Error('No user found');
        }

        return user;
    }
}
