import { IsEmail, IsNotEmpty, IsPhoneNumber, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  username: string;

  cancelled: boolean;

  approved: boolean;

  processed: boolean;

  key: string;

  refreshToken: string;

  roles: string;
}
