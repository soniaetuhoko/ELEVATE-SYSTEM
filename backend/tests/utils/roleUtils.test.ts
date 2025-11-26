import { getUserRoleFromEmail, isValidEmail } from '../../src/utils/roleUtils';

describe('Role Utils', () => {
  describe('getUserRoleFromEmail', () => {
    it('should return student for @alustudent.com emails', () => {
      const role = getUserRoleFromEmail('john.doe@alustudent.com');
      expect(role).toBe('student');
    });

    it('should return mentor for @alueducation.com emails', () => {
      const role = getUserRoleFromEmail('jane.smith@alueducation.com');
      expect(role).toBe('mentor');
    });

    it('should return admin for admin emails', () => {
      const role = getUserRoleFromEmail('admin@alueducation.com');
      expect(role).toBe('admin');
    });

    it('should return student for non-ALU emails', () => {
      const role = getUserRoleFromEmail('user@gmail.com');
      expect(role).toBe('student');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('student@alustudent.com')).toBe(true);
      expect(isValidEmail('user@gmail.com')).toBe(true);
      expect(isValidEmail('test@outlook.com')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });
});