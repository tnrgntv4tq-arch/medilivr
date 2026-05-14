import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notifyStatusChange } from '@/lib/email';
import { smsStatusChange } from '@/lib/sms';
import { notifyStatusChange as pushStatusChange } from '@/lib/notifications';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, phone: true, address: true } },
      pharmacy: { select: { id: true, name: true, phone: true, pharmacyName: true, address: true, lat: true, lng: true } },
      delivery: { select: { id: true, name: true, phone: true } },
    },
  });

  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const isAllowed =
    order.clientId === session.userId ||
    order.pharmacyId === session.userId ||
    order.deliveryId === session.userId ||
    (session.role === 'DELIVERY' && ['READY', 'PICKED_UP', 'IN_TRANSIT'].includes(order.status));

  if (!isAllowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { prescriptionPath, prescriptionIV, prescriptionKey, ...sanitized } = order;
  void prescriptionPath; void prescriptionIV; void prescriptionKey;

  return NextResponse.json({ order: sanitized });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const { status, deliveryLat, deliveryLng } = body;

  const allowedTransitions: Record<string, { roles: string[]; nextStatuses: string[] }> = {
    PENDING: { roles: ['PHARMACY'], nextStatuses: ['ACCEPTED', 'CANCELLED'] },
    ACCEPTED: { roles: ['PHARMACY'], nextStatuses: ['PREPARING', 'CANCELLED'] },
    PREPARING: { roles: ['PHARMACY'], nextStatuses: ['READY'] },
    READY: { roles: ['DELIVERY'], nextStatuses: ['PICKED_UP'] },
    PICKED_UP: { roles: ['DELIVERY'], nextStatuses: ['IN_TRANSIT'] },
    IN_TRANSIT: { roles: ['DELIVERY'], nextStatuses: ['DELIVERED'] },
  };

  if (status) {
    const transition = allowedTransitions[order.status];
    if (!transition || !transition.roles.includes(session.role) || !transition.nextStatuses.includes(status)) {
      return NextResponse.json({ error: 'Transition non autorisée' }, { status: 403 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (deliveryLat !== undefined) updateData.deliveryLat = deliveryLat;
  if (deliveryLng !== undefined) updateData.deliveryLng = deliveryLng;

  if (status === 'PICKED_UP' && session.role === 'DELIVERY') {
    updateData.deliveryId = session.userId;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { email: true, name: true, phone: true } },
      pharmacy: { select: { name: true, pharmacyName: true } },
      delivery: { select: { name: true } },
    },
  });

  if (status) {
    notifyStatusChange({
      clientEmail: updated.client.email,
      clientName: updated.client.name,
      orderId: updated.id,
      newStatus: status,
      pharmacyName: updated.pharmacy?.pharmacyName || updated.pharmacy?.name || 'Pharmacie',
      deliveryName: updated.delivery?.name,
    }).catch(() => {});

    if (updated.client.phone) {
      smsStatusChange({
        clientPhone: updated.client.phone,
        orderId: updated.id,
        newStatus: status,
        deliveryName: updated.delivery?.name,
      }).catch(() => {});
    }

    pushStatusChange(
      updated.id,
      updated.clientId,
      status,
      updated.pharmacy?.pharmacyName || updated.pharmacy?.name || 'Pharmacie',
      updated.delivery?.name,
    ).catch(() => {});
  }

  return NextResponse.json({ order: { id: updated.id, status: updated.status } });
}
