import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from 'express';
import {AuthDto} from 'src/dto/auth.dto';
import {CreateUserDto} from 'src/dto/create-user.dto';
import {ForgotPasswordDto} from 'src/dto/forgot-password.dto';
import {ResetPasswordDto} from 'src/dto/reset-password.dto';
import {DataValidationPipe} from 'src/pipes/data-transformation.pipe';
import {AuthService} from './auth.service';
import {AccessTokenGuard} from './guards/accessToken.guard';
import {RefreshTokenGuard} from './guards/refreshToken.guard';


export interface AuthRequest extends Request {
    user?: {
        sub: string;
        refreshToken?: string;
        [key: string]: any; // if you have extra properties
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('signup')
    signup(@Body(DataValidationPipe) createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Post('signin')
    signin(@Body() data: AuthDto) {
        return this.authService.signIn(data);
    }

    @UseGuards(AccessTokenGuard)
    @Get('logout')
    logout(@Req() req: AuthRequest) {
        if (!req.user?.sub) {
            throw new Error('No user ID found in JWT');
        }
        return this.authService.logout(req.user.sub);
    }

    @Post('change-data')
    changeData(@Body(DataValidationPipe) data: CreateUserDto) {
        return this.authService.changeUserData(data);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    refreshTokens(@Req() req: AuthRequest) {
        if (!req.user || !req.user.refreshToken) {
            return {};
        }
        const userId = req.user.sub;
        const refreshToken = req.user.refreshToken;
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(AccessTokenGuard)
    @Get('profile')
    getProfile(@Req() req: AuthRequest) {
        return req.user;
    }

    @Post('forgot-password')
    forgotPassword(@Body(DataValidationPipe) data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data);
    }

    @Post('reset-password')
    resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data);
    }
}
