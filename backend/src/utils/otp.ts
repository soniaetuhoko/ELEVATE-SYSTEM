export function generateOTP(): string {
  // Development mode - use fixed OTP for testing
  if (process.env.NODE_ENV !== 'production') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function verifyOTP(provided: string, stored: string): boolean {
  return provided === stored;
}