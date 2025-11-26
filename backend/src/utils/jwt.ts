import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elevate-secret-key';

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}