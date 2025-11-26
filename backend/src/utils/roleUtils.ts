export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getUserRoleFromEmail(email: string): 'student' | 'mentor' | 'admin' {
  // Special admin account
  if (email.toLowerCase() === 'admin@admin.com') {
    return 'admin';
  }
  // ALU Staff/Mentors
  else if (email.endsWith('@alueducation.com')) {
    return 'mentor';
  }
  // All other emails (including @alustudent.com, gmail, etc.) default to student
  return 'student';
}