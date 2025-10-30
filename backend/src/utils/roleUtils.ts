export function isValidALUEmail(email: string): boolean {
  return email.endsWith('@alustudent.com') || email.endsWith('@alueducation.com');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getUserRoleFromEmail(email: string): 'student' | 'mentor' | 'admin' {
  // Students - Primary users (ALU students)
  if (email.endsWith('@alustudent.com')) {
    return 'student';
  } 
  // Staff/Mentors and System Administrators (ALU staff)
  else if (email.endsWith('@alueducation.com')) {
    // System Administrator emails
    const adminEmails = [
      'admin@alueducation.com',
      'system@alueducation.com',
      'director@alueducation.com',
      'it@alueducation.com'
    ];
    return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'mentor';
  }
  // All other email domains default to student role
  return 'student';
}