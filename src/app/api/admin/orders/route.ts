import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paid = searchParams.get('paid');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paid === 'true') where.paid = true;
  if (paid === 'false') where.paid = false;

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      pharmacy: { select: { id: true, name: true, pharmacyName: true } },
      delivery: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const sanitized = orders.map(({ prescriptionPath, prescriptionIV, prescriptionKey, prescriptionData, ...rest }) => {
    void prescriptionPath; void prescriptionIV; void prescriptionKey; void prescriptionData;
    return rest;
  });

  return NextResponse.json({ orders: sanitized });
}
