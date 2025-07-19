import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
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
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Registration logic
    try {
      await this.authService.register(registerUserDto, res);
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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.login(loginDto, res);
      return new ApiResponse('Login successful');
    } catch (error) {
      console.log('Login failed:', error);
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Handle other errors, e.g., database errors, etc.
      throw new InternalServerErrorException('Login failed');
    }
  }
}
