import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || '',
  nodeMailer: {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  },
}));
