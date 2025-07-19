import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description:
      'Password must be at least 6 characters long, include an uppercase letter, a lowercase letter, a number, and a special character',
  })
  @IsNotEmpty()
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
  password: string;

  @ApiProperty({
    example: 'customer or vendor',
    description: 'The role of the user, either "user" or "vendor"',
  })
  @IsOptional()
  @IsEnum([UserRole.CUSTOMER, UserRole.VENDOR], {
    message: 'Role must be either customer or vendor',
  })
  role?: UserRole;
}
