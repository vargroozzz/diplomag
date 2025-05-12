import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer'; // Import Mail type for transporter

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Mail;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const secure = this.configService.get<string>('EMAIL_SECURE') === 'true'; // Env vars are strings
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    if (!host || !port || !user || !pass) {
      this.logger.warn('Email service is not configured. Emails will not be sent.');
      // Create a mock transporter or handle this case as needed
      this.transporter = nodemailer.createTransport({
        jsonTransport: true // Doesn't send emails, just captures them as JSON
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure, // true for 465, false for other ports (like 587 with STARTTLS)
        auth: {
          user: user,
          pass: pass,
        },
        // Add tls: { ciphers: 'SSLv3' } if connecting to older SMTP servers or for specific providers
      });

      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('Email transporter verification error:', error);
        } else {
          this.logger.log('Email transporter is ready to send emails');
        }
      });
    }
  }

  private async sendMail(mailOptions: nodemailer.SendMailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Message sent: ${info.messageId}`);
      // Preview URL for Ethereal an/or jsonTransport if used:
      // this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error; // Re-throw to be handled by the calling service
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    const emailFrom = this.configService.get<string>('EMAIL_FROM') || 'noreply@beekeepers.com';

    const mailOptions: nodemailer.SendMailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Verify Your Email Address - Beekeepers Community',
      text: `Hi ${name},

Please click the following link to verify your email address for Beekeepers Community Platform:
${verificationLink}

This link expires in 1 hour.

If you did not request this, please ignore this email.

Thanks,
The Beekeepers Community Team`,
      html: `
        <p>Hi ${name},</p>
        <p>Please click the link below to verify your email address for Beekeepers Community Platform:</p>
        <p><a href="${verificationLink}">Verify Email Address</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br />The Beekeepers Community Team</p>
      `,
    };

    await this.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    const emailFrom = this.configService.get<string>('EMAIL_FROM') || 'noreply@beekeepers.com';

    const mailOptions: nodemailer.SendMailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Password Reset Request - Beekeepers Community',
      text: `Hi ${name},

You requested a password reset for your Beekeepers Community Platform account.
Click the link below to set a new password:
${resetLink}

This link expires in 1 hour.

If you did not request a password reset, please ignore this email.

Thanks,
The Beekeepers Community Team`,
      html: `
        <p>Hi ${name},</p>
        <p>You requested a password reset for your Beekeepers Community Platform account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thanks,<br />The Beekeepers Community Team</p>
      `,
    };
    // Placeholder for actual email sending for password reset
    // console.log('--- Sending Password Reset Email (Actual) --- ');
    // console.log(mailOptions.text);
    // console.log('------------------------------------------');
    await this.sendMail(mailOptions);
  }
} 