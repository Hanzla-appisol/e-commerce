import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { VerificationModule } from 'src/verification/verification.module';

@Module({
  imports: [UserModule,VerificationModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
