import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { notifyPaymentConfirmed } from '@/lib/email';
import { smsPaymentConfirmed } from '@/lib/sms';
import { notifyPayment } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId && session.payment_status === 'paid') {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { paid: true, stripePaymentId: session.payment_intent as string },
          include: {
            client: { select: { email: true, name: true, phone: true } },
            pharmacy: { select: { name: true, pharmacyName: true } },
          },
        });

        notifyPaymentConfirmed({
          clientEmail: order.client.email,
          clientName: order.client.name,
          orderId: order.id,
          price: order.totalPrice || 0,
          pharmacyName: order.pharmacy?.pharmacyName || order.pharmacy?.name || 'Pharmacie',
        }).catch(() => {});

        if (order.client.phone) {
          smsPaymentConfirmed({
            clientPhone: order.client.phone,
            orderId: order.id,
            price: order.totalPrice || 0,
          }).catch(() => {});
        }

        notifyPayment(order.id, order.clientId).catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
