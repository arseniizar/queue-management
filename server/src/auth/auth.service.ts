import {BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable,} from '@nestjs/common';
import {UsersService} from '@/users/users.service';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {ConfigService} from '@nestjs/config';
import {isEmail, isPhoneNumber} from 'class-validator';
import {MailService} from 'src/mail/mail.service';
import {ResetToken, ResetTokenDocument} from 'src/schemas/resetToken.schema';
import {Model, Types} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {v4 as uuid} from 'uuid';
import {RolesService} from 'src/roles/roles.service';
import {TimetablesService} from 'src/timetables/timetables.service';
import {defaultSchedule} from "@/constants";
import {CreateUserDto, AuthDto, ForgotPasswordDto, ResetPasswordDto, ResetTokenDto} from '@/dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
        @InjectModel(ResetToken.name)
        private readonly resetTokenModel: Model<ResetTokenDocument>,
        private readonly rolesService: RolesService,
        private readonly timetablesService: TimetablesService,
    ) {
    }

    async signUp(data: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userRole = await this.rolesService.findRoles({name: 'client'});

        if (userRole === null)
            throw new HttpException('User role not found', HttpStatus.BAD_REQUEST);

        const createdUser = await this.usersService.create({
            ...data,
            roles: userRole._id.toString(),
            password: hashedPassword,
        });

        const tokens = await this.getTokens(createdUser?._id, createdUser?.username, userRole._id.toString());
        await this.updateRefreshToken(createdUser?._id, tokens.refreshToken);

        return tokens;
    }


    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const {password: _, ...result} = user.toObject();
        return result;
    }

    async employ(username: string) {
        const user = await this.usersService.findOne(username);
        if (!user) throw new HttpException("User not found", HttpStatus.BAD_REQUEST);

        const employeeRole = await this.rolesService.findRoles({name: "employee"});
        if (!employeeRole) {
            throw new HttpException("Employee role not found", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const employee = await this.usersService.findOneAndUpdate(user._id, {
            roles: employeeRole._id,
        });

        await this.timetablesService.create({
            placeId: user._id.toString(),
            schedule: defaultSchedule,
        });

        return employee;
    }


    async makeAdmin(username: string) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }

        const adminRole = await this.rolesService.findRoles({name: 'admin'});
        if (!adminRole) {
            throw new HttpException('Admin role not found', HttpStatus.BAD_REQUEST);
        }


        const updatedUser = await this.usersService.findOneAndUpdate(
            {_id: user._id},
            {roles: adminRole._id.toString()},
        );

        if (!updatedUser) {
            throw new HttpException('Failed to update user role', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return updatedUser;
    }


    async signIn(data: AuthDto) {
        const user = await this.validateUser(data.username, data.password);

        const userRole = await this.rolesService.findById(user.roles);
        if (!userRole) {
            throw new HttpException('User role not found', HttpStatus.BAD_REQUEST);
        }
        const tokens = await this.getTokens(user._id, user.username, userRole._id.toString());
        await this.updateRefreshToken(user._id, tokens.refreshToken);

        return tokens;
    }


    async forgotPassword(data: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }
        const resetDate = new Date(Date.now() + 180 * 60_000);
        const resetTokenDoc = await this.createResetToken({
            value: uuid(),
            expTime: resetDate,
            userId: user._id.toString(),
        });
        await this.mailService.sendPassReset(user, resetTokenDoc.value);
        return {message: 'Email sent'};
    }

    async resetPassword(data: ResetPasswordDto) {
        const resetTokenDoc = await this.checkResetToken(data.token);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await this.usersService.findOneAndUpdate({_id: resetTokenDoc.userId}, {
            password: hashedPassword,
        });
        await this.resetTokenModel.findOneAndUpdate(resetTokenDoc._id, {expTime: null});
    }

    async logout(userId: string | Types.ObjectId) {
        return this.usersService.findOneAndUpdate({_id: userId}, {refreshToken: null});
    }

    private async verifyBcrypt(plainText?: string, hashedData?: string) {
        if (!plainText || !hashedData) {
            throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
        }
        const isMatching = await bcrypt.compare(plainText, hashedData);
        if (!isMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    async changeUserData(data: CreateUserDto) {
        const user = await this.usersService.findOne(data.username);
        if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        await this.verifyBcrypt(data.password, user.password);
        data.password = user.password;
        await this.dataValidation(data);
        await this.usersService.findOneAndUpdate({username: user.username}, data);
        return data;
    }

    async dataValidation(user: any) {
        const validEmail = isEmail(user.email || '');
        const validPhone = isPhoneNumber(user.phone || '');
        if (!validEmail || !validPhone) {
            throw new HttpException('Invalid email or phone', HttpStatus.BAD_REQUEST);
        }
    }

    async getTokens(userId?: Types.ObjectId | string, username?: string, roles?: string) {
        if (!userId || !username || !roles) {
            throw new HttpException('Invalid user data', HttpStatus.BAD_REQUEST);
        }
        const sub = userId.toString();
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({sub, username, roles}, { // Include roles here
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({sub, username, roles}, { // Include roles here
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {accessToken, refreshToken};
    }


    async updateRefreshToken(userId?: Types.ObjectId | string, refreshToken?: string) {
        if (!userId || !refreshToken) {
            throw new HttpException('Invalid refresh token data', HttpStatus.BAD_REQUEST);
        }
        const hashed = await bcrypt.hash(refreshToken, 10);
        return this.usersService.findOneAndUpdate({_id: userId}, {refreshToken: hashed});
    }

    async refreshTokens(userId?: string, rawRefreshToken?: string) {
        if (!userId || !rawRefreshToken) {
            throw new ForbiddenException('userId or refreshToken missing');
        }
        const user = await this.usersService.findById(userId);
        if (!user?.refreshToken) {
            throw new ForbiddenException('Access Denied');
        }
        const isMatching = await bcrypt.compare(rawRefreshToken, user.refreshToken);
        if (!isMatching) {
            throw new ForbiddenException('Access Denied');
        }
        const tokens = await this.getTokens(user._id, user.username);
        await this.updateRefreshToken(user._id, tokens.refreshToken);
        return tokens;
    }

    async createResetToken(data: ResetTokenDto): Promise<ResetTokenDocument> {
        const existingToken = await this.resetTokenModel.findOne({userId: data.userId});

        if (existingToken) {
            const updatedDoc = await this.resetTokenModel.findOneAndUpdate(
                {_id: existingToken._id},
                data,
                {new: true},
            );

            if (!updatedDoc) {
                throw new Error('Reset token doc not found after update');
            }

            return updatedDoc;
        }

        const created = new this.resetTokenModel(data);
        return created.save();
    }

    async checkResetToken(token: string) {
        const currentToken = await this.resetTokenModel.findOne({value: token});
        if (!currentToken || currentToken.expTime === null) {
            throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
        }
        const now = new Date();
        if (now.getTime() > currentToken.expTime.getTime()) {
            throw new HttpException('Expired token', HttpStatus.BAD_REQUEST);
        }
        return currentToken;
    }
}
