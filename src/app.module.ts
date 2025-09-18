import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import config from './config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: Joi.object({
        MAIL_HOST: Joi.string().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    UsersModule,
    DocumentsModule,
    DatabaseModule,
    MailerModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { host, user, password } = configService.nodeMailer;
        return {
          transport: {
            host: host,
            port: 587,
            secure: false,
            auth: {
              user: user,
              pass: password,
            },
          },
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
