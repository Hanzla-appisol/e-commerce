import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/response/response.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Define your authentication endpoints here
  // For example, login, register, etc.
  @Post('register')
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto) {
    // Registration logic
    try {
      await this.authService.register(registerUserDto);
      return new ApiResponse(
        'User registered successfully,Please check your email to verify your account.',
      );
    } catch (error) {
      console.log('Registration failed:', error);
      if (error instanceof ConflictException) throw error;
      // Handle other errors, e.g., database errors, etc.
      throw new InternalServerErrorException('Registration failed');
    }     
  }
}
