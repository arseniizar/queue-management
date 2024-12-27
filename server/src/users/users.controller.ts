import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import {UsersService} from './users.service';
import {CreateUserDto} from 'src/dto/create-user.dto';
import {User} from 'src/schemas/user.schema';
import {AccessTokenGuard} from 'src/auth/guards/accessToken.guard';
import {RolesGuard} from 'src/auth/guards/roles.guard';
import {Roles} from '@/decorators/roles.decorator';
import {Role} from '@/enums/role.enum';
import {ThrottleConfig} from "@/constants";

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Throttle(ThrottleConfig.CREATE_USER)
    @Post()
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async create(@Body() createUserDto: CreateUserDto) {
        await this.usersService.create(createUserDto);
    }

    @Throttle(ThrottleConfig.FIND_ALL_USERS)
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Throttle(ThrottleConfig.FIND_ONE_USER)
    @Get(':username')
    async findOne(@Param('username') username: string): Promise<User> {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new NotFoundException(`User "${username}" not found`);
        }
        return user;
    }

    @Throttle(ThrottleConfig.DELETE_USER)
    @Delete(':id')
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}
