// Utility functions for role-based logic

export function getUserRoleFromEmail(email: string): 'student' | 'mentor' | 'admin' {
  // Students - Primary users (FR 1.1: ALU email registration)
  if (email.endsWith('@alustudent.com')) {
    return 'student';
  } 
  // Staff/Mentors and System Administrators
  else if (email.endsWith('@alueducation.com')) {
    // System Administrator emails (NFR 5: verified ALU email)
    const adminEmails = [
      'admin@alueducation.com',
      'system@alueducation.com',
      'director@alueducation.com',
      'it@alueducation.com'
    ];
    return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'mentor';
  }
  return 'student'; // fallback
}

export function getRoleDisplayName(role: 'student' | 'mentor' | 'admin'): string {
  const roleNames = {
    student: 'Student',
    mentor: 'Faculty/Mentor', 
    admin: 'System Administrator'
  };
  return roleNames[role];
}

export function getRolePermissions(role: 'student' | 'mentor' | 'admin') {
  const permissions = {
    // Students - Primary users (FR 2, FR 2.1, FR 3, FR 3.1, FR 3.2)
    student: {
      canCreateMissions: true,        // FR 2: Mission Creation & Editing
      canManageProjects: true,        // FR 2.1: Project Workspace
      canWriteReflections: true,      // FR 3: Reflective Journaling
      canTrackProgress: true,         // FR 3.1: Progress Tracker
      canJoinCircles: true,           // FR 3.2: Peer Collaboration
      canViewOwnData: true,
      canViewAllUsers: false,
      canManageUsers: false,
      canViewSystemData: false
    },
    // Faculty/Mentors - Provide feedback and mentorship
    mentor: {
      canCreateMissions: false,
      canManageProjects: false,
      canWriteReflections: false,
      canTrackProgress: false,
      canJoinCircles: true,           // FR 3.2: Mentorship
      canViewOwnData: true,
      canViewAllUsers: true,
      canManageUsers: false,
      canViewSystemData: true,
      canProvideFeedback: true,       // FR 3.2: Mentor feedback
      canViewStudentProgress: true
    },
    // System Administrators - Full system access
    admin: {
      canCreateMissions: false,
      canManageProjects: false,
      canWriteReflections: false,
      canTrackProgress: false,
      canJoinCircles: false,
      canViewOwnData: true,
      canViewAllUsers: true,
      canManageUsers: true,           // System administration
      canViewSystemData: true,
      canProvideFeedback: false,
      canViewStudentProgress: true,
      canManageSystem: true
    }
  };
  
  return permissions[role];
}

export function isValidALUEmail(email: string): boolean {
  // NFR 5: Only verified ALU email addresses allowed
  return email.endsWith('@alustudent.com') || email.endsWith('@alueducation.com');
}

export function getEmailDomainType(email: string): 'student' | 'staff' | 'invalid' {
  if (email.endsWith('@alustudent.com')) return 'student';
  if (email.endsWith('@alueducation.com')) return 'staff';
  return 'invalid';
}