import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as nodemailer from 'nodemailer';
import { User } from '../user/entities/user.entity';
import { ApiResponse } from 'src/common/response/response.dto';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async sendVerificationEmail(user: User) {
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '5m' },
    );

    const verificationLink = `${process.env.CLIENT_URL}/api/verification/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <h2>Confirm your email</h2>
        <p>Click below to confirm your email:</p>
        <a href="${verificationLink}">Yeah, it's me</a>
        <p>If you didn’t request this, ignore this email.</p>
      `,
    });
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      await this.userService.updateUser(payload.sub, {
        isEmailVerified: true,
      });

      return new ApiResponse('Email verified successfully');
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
  async sendPasswordResetEmail(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findUserByEmail(
      forgotPasswordDto.email,
    );
    if (!user) throw new NotFoundException('User not found');

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<a href="${resetLink}">Reset your password</a>`,
    });

    return { message: 'Password reset email sent' };
  }
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userService.findUserById(payload.sub);
      if (!user) throw new NotFoundException('User not found');

      const hashed = await bcrypt.hash(resetPasswordDto.newPassword, 10);
      await this.userService.updateUser(user.id, { password: hashed });

      return { message: 'Password reset successful' };
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
