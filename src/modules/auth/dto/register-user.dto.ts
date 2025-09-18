import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dtos/create-user.dto';

export class RegisterUserDto extends CreateUserDto {}

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
