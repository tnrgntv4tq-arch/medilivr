import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      clientLat: true,
      clientLng: true,
      clientAddress: true,
      deliveryLat: true,
      deliveryLng: true,
      pharmacy: { select: { lat: true, lng: true, pharmacyName: true, address: true } },
      delivery: { select: { name: true, phone: true } },
    },
  });

  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  return NextResponse.json({ tracking: order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = await params;
  const { lat, lng } = await req.json();

  await prisma.order.update({
    where: { id },
    data: { deliveryLat: lat, deliveryLng: lng },
  });

  return NextResponse.json({ success: true });
}
