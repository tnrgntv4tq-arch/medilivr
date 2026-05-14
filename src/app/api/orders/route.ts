import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptBuffer, encryptKey } from '@/lib/encryption';
import { haversineDistance, calculatePrice } from '@/lib/distance';
import { notifyNewOrder } from '@/lib/email';
import { smsNewOrder } from '@/lib/sms';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('prescription') as File | null;
    const pharmacyId = formData.get('pharmacyId') as string;
    const clientAddress = formData.get('clientAddress') as string;
    const clientLat = parseFloat(formData.get('clientLat') as string);
    const clientLng = parseFloat(formData.get('clientLng') as string);
    const notes = formData.get('notes') as string | null;

    if (!file || !pharmacyId || !clientAddress || isNaN(clientLat) || isNaN(clientLng)) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const pharmacy = await prisma.user.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy || pharmacy.role !== 'PHARMACY') {
      return NextResponse.json({ error: 'Pharmacie introuvable' }, { status: 404 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { encrypted, iv, key } = encryptBuffer(fileBuffer);
    const encryptedKeyStr = encryptKey(key);

    const fileName = `${Date.now()}-${session.userId}.enc`;

    const dist = haversineDistance(clientLat, clientLng, pharmacy.lat || 0, pharmacy.lng || 0);
    const pricing = calculatePrice(dist);

    const order = await prisma.order.create({
      data: {
        clientId: session.userId,
        pharmacyId,
        prescriptionPath: fileName,
        prescriptionIV: iv,
        prescriptionKey: encryptedKeyStr,
        prescriptionData: Uint8Array.from(encrypted),
        clientAddress,
        clientLat,
        clientLng,
        distance: pricing.distance,
        basePrice: pricing.basePrice,
        pricePerKm: pricing.pricePerKm,
        totalPrice: pricing.totalPrice,
        notes,
      },
    });

    notifyNewOrder({
      pharmacyEmail: pharmacy.email,
      pharmacyName: pharmacy.pharmacyName || pharmacy.name,
      clientName: session.name,
      orderId: order.id,
      address: clientAddress,
      price: pricing.totalPrice,
      notes,
    }).catch(() => {});

    if (pharmacy.phone) {
      smsNewOrder({
        pharmacyPhone: pharmacy.phone,
        clientName: session.name,
        orderId: order.id,
        price: pricing.totalPrice,
      }).catch(() => {});
    }

    return NextResponse.json({ order: { id: order.id, status: order.status, totalPrice: order.totalPrice, distance: order.distance } });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let where: Record<string, unknown> = {};

  if (session.role === 'CLIENT') {
    where.clientId = session.userId;
  } else if (session.role === 'PHARMACY') {
    where.pharmacyId = session.userId;
  } else if (session.role === 'DELIVERY') {
    where.deliveryId = session.userId;
  }

  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, phone: true, address: true } },
      pharmacy: { select: { id: true, name: true, phone: true, pharmacyName: true, address: true, lat: true, lng: true } },
      delivery: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sanitized = orders.map((o) => {
    const { prescriptionPath, prescriptionIV, prescriptionKey, prescriptionData, ...rest } = o;
    void prescriptionPath; void prescriptionIV; void prescriptionKey; void prescriptionData;
    return rest;
  });

  return NextResponse.json({ orders: sanitized });
}
