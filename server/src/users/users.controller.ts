import {
    Body,
    Controller,
    Delete,
    Get, NotFoundException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto} from 'src/dto/create-user.dto';
import {User} from 'src/schemas/user.schema';
import {AccessTokenGuard} from 'src/auth/guards/accessToken.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        await this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':username')
    async findOne(@Param('username') username: string): Promise<User> {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new NotFoundException(`User "${username}" not found`);
        }
        return user
    }

    @UseGuards(AccessTokenGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}
