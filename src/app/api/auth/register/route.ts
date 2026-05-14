import { NextRequest, NextResponse } from 'next/server';
import { hash as bcryptHash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { success } = rateLimit(ip, 3, 60_000);
    if (!success) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard' }, { status: 429 });
    }

    const { email, password, name, phone, role, address, lat, lng, pharmacyName, pharmacyLicense } = await req.json();

    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    if (!['CLIENT', 'PHARMACY', 'DELIVERY'].includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }

    const hashedPassword = await bcryptHash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, role, address, lat, lng, pharmacyName, pharmacyLicense },
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
