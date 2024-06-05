// update-password-with-otp.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdatePasswordWithOTPDto {
  @IsNumber()
  @IsNotEmpty()
  idUser: number;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  newPasswordConfirm: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

  