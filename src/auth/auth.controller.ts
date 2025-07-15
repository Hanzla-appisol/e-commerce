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
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    try {
      this.authService.login(loginDto);
      return new ApiResponse('Login successful');
    } catch (error) {
      console.log('Login failed:', error);
      if (error instanceof ConflictException) throw error;
      
      throw new InternalServerErrorException('Login failed');
    }
    
  }
}
