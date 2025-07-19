import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEnum } from 'class-validator';
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  VENDOR = 'vendor',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER, // Default role is CUSTOMER
  })
  @IsEnum(UserRole)
  role: UserRole;
}
