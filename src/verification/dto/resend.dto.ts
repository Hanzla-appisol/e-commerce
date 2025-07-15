import { IsEmail, IsNotEmpty } from 'class-validator';
export class ResendEmailVerification {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
