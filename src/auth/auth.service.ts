import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { VerificationService } from 'src/verification/verification.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
  ) {}
  // Define your authentication logic here
  // For example, methods for login, registration, etc.

  async register(userData: RegisterUserDto): Promise<User> {
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
    return user;
  }

  async login(credentials: LoginDto): Promise<string> {
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

    return token;
  }
}
