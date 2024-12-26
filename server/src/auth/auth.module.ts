import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { UsersModule } from "@/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AccessTokenStrategy } from "./strategies/accessToken.strategy";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { ResetToken, ResetTokenSchema } from "src/schemas/resetToken.schema";
import { MailModule } from "src/mail/mail.module";
import { RolesModule } from "src/roles/roles.module";
import { TimetablesModule } from "src/timetables/timetables.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResetToken.name, schema: ResetTokenSchema },
    ]),
    forwardRef(() => UsersModule),
    MailModule,
    PassportModule,
    JwtModule.register({}),
    RolesModule,
    TimetablesModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
