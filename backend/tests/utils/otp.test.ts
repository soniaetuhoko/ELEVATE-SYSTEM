import { generateOTP, verifyOTP } from '../../src/utils/otp';

describe('OTP Utils', () => {
  describe('generateOTP', () => {
    it('should generate fixed OTP in test environment', () => {
      const otp = generateOTP();
      expect(otp).toBe('123456');
    });
  });

  describe('verifyOTP', () => {
    it('should return true for matching OTPs', () => {
      const result = verifyOTP('123456', '123456');
      expect(result).toBe(true);
    });

    it('should return false for non-matching OTPs', () => {
      const result = verifyOTP('123456', '654321');
      expect(result).toBe(false);
    });

    it('should return false for empty OTPs', () => {
      const result = verifyOTP('', '123456');
      expect(result).toBe(false);
    });
  });
});