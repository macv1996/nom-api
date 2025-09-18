import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    await this.validateUniqueIdentifier(createUserDto.cc);
    await this.validateUniqueEmail(createUserDto.email);
    const { password, ...data } = createUserDto;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }
    return this.userRepository.save(user);
  }

  async findAll() {
    try {
      return this.userRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['documents'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (
      (updateUserDto.password && !updateUserDto.newPassword) ||
      (updateUserDto.newPassword && !updateUserDto.password)
    ) {
      throw new BadRequestException(
        'Both current and new password must be provided to change the password',
      );
    }
    if (updateUserDto.newPassword && updateUserDto.password) {
      const isMatch = await bcrypt.compare(
        updateUserDto.password,
        user.password,
      );
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }
      user.password = await bcrypt.hash(updateUserDto.newPassword, 10);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, newPassword, ...data } = updateUserDto;
    this.userRepository.merge(user, data);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.userRepository.delete(id);
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async getMe(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['name', 'email', 'role'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async validateUniqueIdentifier(identifier: string) {
    const userByIdentifier = await this.userRepository.findOne({
      where: { cc: identifier },
    });
    if (userByIdentifier) {
      throw new BadRequestException(
        `User whit identifier ${identifier} exists`,
      );
    }
    return userByIdentifier;
  }

  async validateUniqueEmail(email: string) {
    const userByEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (userByEmail) {
      throw new BadRequestException(`User whit email ${email} exists`);
    }
    return userByEmail;
  }
}
