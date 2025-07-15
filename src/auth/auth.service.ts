import { ConflictException, Injectable, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { VerificationService } from 'src/verification/verification.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ApiResponse } from 'src/common/response/response.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
  ) {}
  // Define your authentication logic here
  // For example, methods for login, registration, etc.

  async register(userData: RegisterUserDto, res: Response) {
    // Registration logic
    const existingUser = await this.userService.findUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userService.createUser({
      ...userData,
      password: hashedPassword,
    });
    await this.verificationService.sendVerificationEmail(user);
    const token = await this.userService.generateAuthToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return new ApiResponse(
      'User registered successfully, please check your email to verify your account.',
    );
  }

  async login(credentials: LoginDto, res: Response) {
    // Login logic
    const user = await this.userService.findUserByEmail(credentials.email);
    if (!user) {
      throw new ConflictException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid email or password');
    }
    const isVerified = user.isEmailVerified;
    if (!isVerified) {
      throw new ConflictException('Email not verified');
    }

    const token = await this.userService.generateAuthToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return new ApiResponse('Login successful');
  }
}
