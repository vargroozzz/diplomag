import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
// Use require for nodemailer-mailgun-transport to avoid type errors
const mailgunTransport = require('nodemailer-mailgun-transport');

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MAILGUN_TRANSPORTER',
      useFactory: (configService: ConfigService) => {
        const options = {
          auth: {
            api_key: configService.get<string>('MAILGUN_API_KEY'),
            domain: configService.get<string>('MAILGUN_DOMAIN'),
          },
        };
        return nodemailer.createTransport(mailgunTransport(options));
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService], // Export service to be used in other modules
})
export class EmailModule {} 