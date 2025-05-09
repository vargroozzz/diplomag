import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, name: string, token: string) {
    // In a real app, implement email sending using nodemailer, SendGrid, etc.
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    console.log('--- Sending Verification Email --- ');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email Address`);
    console.log(`Hi ${name},`);
    console.log(`Please click the following link to verify your email:`);
    console.log(verificationLink);
    console.log(`This link expires in 1 hour.`);
    console.log('-----------------------------------');
    // Simulate email sending delay (optional)
    await new Promise(resolve => setTimeout(resolve, 500)); 
  }

  async sendPasswordResetEmail(email: string, token: string) {
    // TODO: Implement password reset email sending
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log('--- Sending Password Reset Email --- ');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your Password`);
    console.log(`Click link to reset: ${resetLink}`);
    console.log('-----------------------------------');
  }
} 