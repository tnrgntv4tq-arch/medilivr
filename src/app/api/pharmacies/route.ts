import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const pharmacies = await prisma.user.findMany({
    where: { role: 'PHARMACY' },
    select: { id: true, pharmacyName: true, address: true, lat: true, lng: true, phone: true },
  });

  return NextResponse.json({ pharmacies });
}
