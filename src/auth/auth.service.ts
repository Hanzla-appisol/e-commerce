import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { VerificationService } from 'src/verification/verification.service';

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

  login() {
    // Login logic
  }
}
