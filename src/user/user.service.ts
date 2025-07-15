import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const userExists = await this.findUserById(id);
    if (!userExists) {
      throw new Error('User not found');
    }
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findUserById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }
  async deleteUser(id: number): Promise<void> {
    const userExists = await this.findUserById(id);
    if (!userExists) {
      throw new Error('User not found');
    }
    await this.userRepository.delete(id);
  }
  async generateAuthToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = this.jwtService.signAsync(payload);

    return token;
  }
}
