import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import {Request} from 'express';
import {DataTransformationPipe} from '@/pipes/data-transformation.pipe';
import {AuthService} from './auth.service';
import {AccessTokenGuard} from './guards/accessToken.guard';
import {RefreshTokenGuard} from './guards/refreshToken.guard';
import {ThrottleConfig} from '@/constants';
import {AuthDto, CreateUserDto, ForgotPasswordDto, ResetPasswordDto} from "@/dto";

export interface AuthRequest extends Request {
    user?: {
        sub: string;
        refreshToken?: string;
        isPremium?: boolean;
        [key: string]: any;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Throttle(ThrottleConfig.SIGNUP)
    @Post('signup')
    async signup(@Body(DataTransformationPipe) createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Throttle(ThrottleConfig.SIGNIN)
    @Post('signin')
    async signin(@Body() data: AuthDto) {
        try {
            return this.authService.signIn(data);
        } catch (error) {
            throw new Error('Invalid credentials');
        }
    }

    @UseGuards(AccessTokenGuard)
    @Throttle(ThrottleConfig.LOGOUT)
    @Get('logout')
    async logout(@Req() req: AuthRequest) {
        if (!req.user?.userId) {
            throw new Error('No user ID found in JWT');
        }
        return this.authService.logout(req.user.sub);
    }

    @Throttle(ThrottleConfig.CHANGE_DATA)
    @Post('change-data')
    async changeData(@Body(DataTransformationPipe) data: CreateUserDto) {
        return this.authService.changeUserData(data);
    }

    @UseGuards(RefreshTokenGuard)
    @Throttle(ThrottleConfig.REFRESH_TOKENS)
    @Get('refresh')
    async refreshTokens(@Req() req: AuthRequest) {
        if (!req.user || !req.user.refreshToken) {
            throw new Error('Invalid refresh token');
        }
        const userId = req.user.sub;
        const refreshToken = req.user.refreshToken;
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(AccessTokenGuard)
    @Throttle(ThrottleConfig.PROFILE)
    @Get('profile')
    async getProfile(@Req() req: AuthRequest) {
        if (!req.user) {
            throw new Error('No user profile found');
        }
        return req.user;
    }

    @Throttle(ThrottleConfig.FORGOT_PASSWORD)
    @Post('forgot-password')
    async forgotPassword(@Body(DataTransformationPipe) data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data);
    }

    @Throttle(ThrottleConfig.RESET_PASSWORD)
    @Post('reset-password')
    async resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data);
    }
}
