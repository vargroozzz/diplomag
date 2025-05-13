import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer'; // Import Mail type for transporter

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    @Inject('MAILGUN_TRANSPORTER') private readonly transporter: Mail,
  ) {}

  private async sendMail(mailOptions: Mail.Options) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Message sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    const emailFrom = this.configService.get<string>('EMAIL_FROM') ?? `noreply@${this.configService.get<string>('MAILGUN_DOMAIN')}`;

    const mailOptions: Mail.Options = {
      from: emailFrom,
      to: email,
      subject: 'Verify Your Email Address - Beekeepers Community',
      text: `Hi ${name},\n\nPlease click the following link to verify your email address for Beekeepers Community Platform:\n${verificationLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Beekeepers Community Team`,
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
    const emailFrom = this.configService.get<string>('EMAIL_FROM') ?? `noreply@${this.configService.get<string>('MAILGUN_DOMAIN')}`;

    const mailOptions: Mail.Options = {
      from: emailFrom,
      to: email,
      subject: 'Password Reset Request - Beekeepers Community',
      text: `Hi ${name},\n\nYou requested a password reset for your Beekeepers Community Platform account.\nClick the link below to set a new password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nThanks,\nThe Beekeepers Community Team`,
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
    await this.sendMail(mailOptions);
  }
} 