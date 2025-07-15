import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { UserService } from '../user/user.service';
import { ResendEmailVerificationDTO } from './dto/resend.dto';
import { ApiBody } from '@nestjs/swagger';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly userService: UserService,
  ) {}

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token is required');
    return this.verificationService.verifyToken(token);
  }

  @Post('resend')
  @ApiBody({ type: ResendEmailVerificationDTO })
  async resendVerification(
    @Body() resendresendEmailVerification: ResendEmailVerificationDTO,
  ) {
    const user = await this.userService.findUserByEmail(
      resendresendEmailVerification.email,
    );
    if (!user) throw new BadRequestException('User not found');
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.verificationService.sendVerificationEmail(user);
    return { success: true, message: 'Verification email resent' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.verificationService.sendPasswordResetEmail(
      forgotPasswordDto,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.verificationService.resetPassword(resetPasswordDto);
  }
}
