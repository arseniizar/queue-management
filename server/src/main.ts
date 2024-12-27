import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {UsersService} from '@/users/users.service';
import {AuthService} from '@/auth/auth.service';
import {RolesService} from '@/roles/roles.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());

    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    const rolesService = app.get(RolesService);

    try {
        await initializeRoles(rolesService);

        await createDefaultAdmin(authService, usersService, rolesService);

    } catch (error) {
        console.error('Error during application initialization:', error);
    }

    await app.listen(3000);
    console.log('Application is running on http://localhost:3000');
}

async function initializeRoles(rolesService: RolesService) {
    try {
        const adminRole = await rolesService.findRoles({name: 'admin'});
        if (!adminRole) {
            console.log('Admin role not found. Initializing roles...');
            await rolesService.initRoles();
        } else {
            console.log('Roles are already initialized.');
        }
    } catch (error) {
        throw new Error(`Failed to initialize roles: ${error.message}`);
    }
}

async function createDefaultAdmin(authService: AuthService, usersService: UsersService, rolesService: RolesService) {
    try {
        const existingAdmin = await usersService.findOne('admin');
        if (!existingAdmin) {
            console.log('Default admin user not found. Creating admin user...');

            const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'StrongDefaultPassword123!';
            const adminRole = await rolesService.findRoles({name: 'admin'});

            if (!adminRole) {
                throw new Error('Admin role not found after initialization.');
            }

            await authService.signUp({
                email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
                password: defaultAdminPassword,
                phone: process.env.ADMIN_PHONE || '+380989860600',
                username: 'admin',
                cancelled: false,
                approved: false,
                processed: false,
                key: '',
                refreshToken: '',
                roles: adminRole._id.toString(),
            });

            await authService.makeAdmin('admin');

            console.log('Default admin user created successfully.');
            console.log(`Default admin email: ${process.env.ADMIN_EMAIL || 'admin@gmail.com'}`);
            console.log(`Default admin password: ${defaultAdminPassword}`);
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        throw new Error(`Failed to create default admin: ${error.message}`);
    }
}

bootstrap();
