import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: ('student' | 'mentor' | 'admin')[];
  fallback?: ReactNode;
}

export default function RoleBasedAccess({ children, allowedRoles, fallback = null }: RoleBasedAccessProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role-specific components
export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['student']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function MentorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['mentor']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function MentorOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['mentor', 'admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}