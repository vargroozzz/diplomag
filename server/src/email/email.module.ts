import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
// Use require for nodemailer-mailgun-transport to avoid type errors
import * as mailgunTransport from 'nodemailer-mailgun-transport';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MAILGUN_TRANSPORTER',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('MAILGUN_API_KEY');
        const domain = configService.get<string>('MAILGUN_DOMAIN');
        if (!apiKey || !domain) {
          throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN must be set');
        }
        const options = {
          auth: {
            username: 'api',
            api_key: apiKey,
            domain: domain,
          },
          host: 'api.eu.mailgun.net',
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