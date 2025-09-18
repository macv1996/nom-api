import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { ConfigType } from '@nestjs/config';
import config from '../../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  validate(jwtPayload: JwtPayload) {
    return {
      id: jwtPayload.sub,
      role: jwtPayload.role,
      email: jwtPayload.email,
    };
  }
}
