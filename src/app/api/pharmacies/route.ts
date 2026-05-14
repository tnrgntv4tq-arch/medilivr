import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const minRating = searchParams.get('minRating');
  const sortBy = searchParams.get('sortBy');
  const userLat = searchParams.get('lat');
  const userLng = searchParams.get('lng');

  const where: Record<string, unknown> = { role: 'PHARMACY', isAvailable: true };
  if (search) {
    where.OR = [
      { pharmacyName: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const pharmacies = await prisma.user.findMany({
    where,
    select: {
      id: true,
      pharmacyName: true,
      address: true,
      lat: true,
      lng: true,
      phone: true,
      isAvailable: true,
      reviewsReceived: {
        where: { type: 'pharmacy' },
        select: { rating: true },
      },
    },
  });

  let result = pharmacies.map(({ reviewsReceived, ...p }) => {
    const avg = reviewsReceived.length > 0
      ? Math.round((reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewsReceived.length) * 10) / 10
      : null;
    let dist: number | null = null;
    if (userLat && userLng && p.lat && p.lng) {
      const R = 6371;
      const dLat = (p.lat - +userLat) * Math.PI / 180;
      const dLng = (p.lng - +userLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(+userLat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
    }
    return { ...p, avgRating: avg, reviewCount: reviewsReceived.length, distance: dist };
  });

  if (minRating) {
    const min = parseFloat(minRating);
    result = result.filter(p => p.avgRating !== null && p.avgRating >= min);
  }

  if (sortBy === 'rating') {
    result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  } else if (sortBy === 'distance' && userLat && userLng) {
    result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } else if (sortBy === 'name') {
    result.sort((a, b) => (a.pharmacyName ?? '').localeCompare(b.pharmacyName ?? ''));
  }

  return NextResponse.json({ pharmacies: result });
}
