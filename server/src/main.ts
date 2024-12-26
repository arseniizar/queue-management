import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {UsersService} from "@/users/users.service";
import {AuthService} from "@/auth/auth.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    if (!await usersService.findOne("admin")) {
        await authService.signUp({
            email: 'admin@gmail.com',
            password: 'admin',
            phone: '+380989860600',
            username: 'admin',
            cancelled: false,
            approved: false,
            processed: false,
            key: '',
            refreshToken: '',
            roles: 'admin'
        });
    }
    await app.listen(3000);
}

bootstrap().then(r => null);
