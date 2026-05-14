import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { orderId, targetId, type, rating, comment } = await req.json();

  if (!orderId || !targetId || !type || !rating) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  if (rating < 1 || rating > 5 || !['pharmacy', 'delivery'].includes(type)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== session.userId || order.status !== 'DELIVERED') {
    return NextResponse.json({ error: 'Commande non éligible' }, { status: 403 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        orderId,
        authorId: session.userId,
        targetId,
        type,
        rating,
        comment: comment?.trim() || null,
      },
    });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: 'Avis déjà soumis' }, { status: 409 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');
  const orderId = searchParams.get('orderId');

  if (orderId) {
    const reviews = await prisma.review.findMany({
      where: { orderId },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json({ reviews });
  }

  if (targetId) {
    const reviews = await prisma.review.findMany({
      where: { targetId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const avg = reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

    return NextResponse.json({ reviews, average: avg, count: reviews.length });
  }

  return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 });
}
