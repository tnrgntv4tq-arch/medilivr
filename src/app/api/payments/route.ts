import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { orderId } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.clientId !== session.userId) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.paid) {
      return NextResponse.json({ error: 'Déjà payée' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Livraison MediLivr',
              description: `Livraison de médicaments — ${order.distance} km`,
            },
            unit_amount: Math.round((order.totalPrice || 0) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${appUrl}/client/track/${order.id}?payment=success`,
      cancel_url: `${appUrl}/client/track/${order.id}?payment=cancel`,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Erreur de paiement' }, { status: 500 });
  }
}
