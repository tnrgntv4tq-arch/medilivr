import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedPaths: Record<string, string> = {
  '/client': 'CLIENT',
  '/pharmacy': 'PHARMACY',
  '/delivery': 'DELIVERY',
  '/admin': 'ADMIN',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  for (const [path, role] of Object.entries(protectedPaths)) {
    if (pathname.startsWith(path)) {
      const token = req.cookies.get('token')?.value;
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      const payload = await verifyToken(token);
      if (!payload || payload.role !== role) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/pharmacy/:path*', '/delivery/:path*', '/admin/:path*'],
};
