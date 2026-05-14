import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const pharmacies = await prisma.user.findMany({
    where: { role: 'PHARMACY' },
    select: {
      id: true,
      pharmacyName: true,
      address: true,
      lat: true,
      lng: true,
      phone: true,
      reviewsReceived: {
        where: { type: 'pharmacy' },
        select: { rating: true },
      },
    },
  });

  const result = pharmacies.map(({ reviewsReceived, ...p }) => ({
    ...p,
    avgRating: reviewsReceived.length > 0
      ? Math.round((reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewsReceived.length) * 10) / 10
      : null,
    reviewCount: reviewsReceived.length,
  }));

  return NextResponse.json({ pharmacies: result });
}
