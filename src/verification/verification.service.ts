import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as nodemailer from 'nodemailer';
import { User } from '../user/entities/user.entity';
import { ApiResponse } from 'src/common/response/response.dto';

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

    const verificationLink = `${process.env.CLIENT_URL}/verification/verify-email?token=${token}`;

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
}
