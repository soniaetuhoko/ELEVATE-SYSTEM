import emailjs from '@emailjs/nodejs';

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID!;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID!;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY!;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY!;

export const sendOTPEmailViaEmailJS = async (email: string, otp: string, name: string) => {
  try {
    const templateParams = {
      email: email,     // {{email}} in template
      name: name,       // {{name}} in template  
      otp: otp,         // {{otp}} in template
      to_email: email,  // Alternative: {{to_email}}
      to_name: name,    // Alternative: {{to_name}}
      otp_code: otp,    // Alternative: {{otp_code}}
      user_email: email // Alternative: {{user_email}}
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY
      }
    );

    console.log(`✅ OTP sent via EmailJS to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ EmailJS failed:', error);
    return false;
  }
};

// Legacy function name for compatibility
export const sendEmailViaAPI = sendOTPEmailViaEmailJS;