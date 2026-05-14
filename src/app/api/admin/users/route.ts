import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { pharmacyName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      pharmacyName: true,
      isAvailable: true,
      createdAt: true,
      _count: { select: { clientOrders: true, pharmacyOrders: true, deliveryOrders: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { userId, isAvailable } = await req.json();
  if (!userId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAvailable },
    select: { id: true, isAvailable: true },
  });

  return NextResponse.json({ user: updated });
}
