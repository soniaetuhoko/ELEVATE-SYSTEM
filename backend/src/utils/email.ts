import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  // Development mode - skip actual email sending
  if (process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY) {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ELEVATE <noreply@elevate-system.com>',
      to: [email],
      subject: 'Your ELEVATE Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ELEVATE!</h2>
          <p>Hi ${name},</p>
          <p>Your one-time password (OTP) for logging into ELEVATE is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007acc; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from ELEVATE - Empowering ALU Students Through Mission-Driven Learning
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};