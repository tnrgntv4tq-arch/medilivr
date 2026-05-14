import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { status: 'READY', deliveryId: null },
    include: {
      pharmacy: { select: { pharmacyName: true, address: true, lat: true, lng: true } },
      client: { select: { name: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sanitized = orders.map(({ prescriptionPath, prescriptionIV, prescriptionKey, ...rest }) => {
    void prescriptionPath; void prescriptionIV; void prescriptionKey;
    return rest;
  });

  return NextResponse.json({ orders: sanitized });
}
