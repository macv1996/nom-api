import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: Express.Request) {
    const user = req.user as User;
    return this.authService.login(user);
  }

  // @Post('logout')
  // logout(@Body() dto: LogoutDto) {
  //   return this.authService.logout(dto);
  // }

  // @Post('refresh')
  // refresh(@Body() dto: RefreshTokenDto) {
  //   return this.authService.refresh(dto);
  // }

  // @Get('me')
  // getProfile(@Request() req) {
  //   return this.authService.getProfile(req.user);
  // }
}
