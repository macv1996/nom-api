import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../../modules/users/entities/user.entity';
import { JwtPayload } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(email: string, password: string) {
    const user: User = await this.usersService.findUserByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
