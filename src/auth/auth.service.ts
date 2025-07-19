import { ConflictException, Injectable, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { VerificationService } from 'src/verification/verification.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ApiResponse } from 'src/common/response/response.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}
  // Define your authentication logic here
  // For example, methods for login, registration, etc.

  async generateAuthToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      isVerified: user.isEmailVerified,
    };

    const token = this.jwtService.signAsync(payload);

    return token;
  }

  async register(userData: RegisterUserDto, res: Response) {
    // Registration logic
    const existingUser = await this.userService.findUserByEmail(userData.email);
    console.log('existingUser:', existingUser);
    if (existingUser && existingUser.isEmailVerified) {
      throw new ConflictException('User already exists');
    }

    if (existingUser && !existingUser.isEmailVerified) {
      console.log('im running');
      existingUser.password = await bcrypt.hash(userData.password, 10);
      await this.userService.saveUser(existingUser);
      // If user exists but email is not verified, resend verification email
      await this.verificationService.sendVerificationEmail(existingUser);
      throw new ConflictException(
        'User already exists, please check your email to verify your account.',
      );
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userService.createUser({
      ...userData,
      password: hashedPassword,
    });
    await this.verificationService.sendVerificationEmail(user);
    const token = await this.generateAuthToken(user);
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

    const token = await this.generateAuthToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return new ApiResponse('Login successful');
  }
}
