import emailjs from '@emailjs/nodejs';

// Environment variables
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_elevate';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_otp';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'your-public-key';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'your-private-key';

/**
 * Sends OTP email via EmailJS (works with any email address)
 */
export const sendOTPEmailViaEmailJS = async (email: string, otp: string, name: string) => {
  console.log(`[EMAILJS] Sending OTP to ${email}: ${otp}`);

  // Only proceed if EmailJS keys are set
  if (EMAILJS_PUBLIC_KEY !== 'your-public-key' && EMAILJS_PRIVATE_KEY !== 'your-private-key') {
    try {
      const templateParams = {
        email: email,  // must match {{email}} in template
        name: name,    // must match {{name}} in template
        otp: otp,      // must match {{otp}} in template
        from_name: 'ELEVATE Platform' // optional
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        {
          publicKey: EMAILJS_PUBLIC_KEY,
          privateKey: EMAILJS_PRIVATE_KEY,
        }
      );

      console.log(`✅ Email sent successfully via EmailJS to ${email}`);
      return true;
    } catch (error) {
      console.log('❌ EmailJS failed:', error);
    }
  } else {
    console.log('[EMAILJS] Public/private keys are not configured');
  }

  console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
  return false;
};
