// dto/forgot-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
export class ForgotPasswordDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

// dto/reset-password.dto.ts
export class ResetPasswordDto {
  @ApiProperty({ example: 'resetToken123' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password too weak. It must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
