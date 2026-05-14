import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notifyNewMessage } from '@/lib/notifications';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const allowed = order.clientId === session.userId || order.deliveryId === session.userId;
  if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { orderId },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const allowed = order.clientId === session.userId || order.deliveryId === session.userId;
  if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
    return NextResponse.json({ error: 'Commande terminée' }, { status: 400 });
  }

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      orderId,
      senderId: session.userId,
      text: text.trim().slice(0, 500),
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  const recipientId = order.clientId === session.userId ? order.deliveryId : order.clientId;
  if (recipientId) {
    notifyNewMessage(orderId, recipientId, session.name).catch(() => {});
  }

  return NextResponse.json({ message });
}
