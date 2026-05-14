import { prisma } from '@/lib/db';

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
  type: string;
  orderId?: string;
}) {
  return prisma.notification.create({ data });
}

export async function notifyOrderCreated(orderId: string, pharmacyId: string, clientName: string) {
  await createNotification({
    userId: pharmacyId,
    title: 'Nouvelle commande',
    body: `${clientName} a envoyé une ordonnance`,
    type: 'order_created',
    orderId,
  });
}

export async function notifyStatusChange(
  orderId: string,
  clientId: string,
  status: string,
  pharmacyName: string,
  deliveryName?: string | null,
) {
  const messages: Record<string, string> = {
    ACCEPTED: `${pharmacyName} a accepté votre commande`,
    PREPARING: `${pharmacyName} prépare votre commande`,
    READY: 'Votre commande est prête, en attente d\'un livreur',
    PICKED_UP: `${deliveryName || 'Un livreur'} a récupéré votre commande`,
    IN_TRANSIT: `${deliveryName || 'Le livreur'} est en route`,
    DELIVERED: 'Votre commande a été livrée !',
    CANCELLED: 'Votre commande a été annulée',
  };

  const titles: Record<string, string> = {
    ACCEPTED: 'Commande acceptée',
    PREPARING: 'En préparation',
    READY: 'Commande prête',
    PICKED_UP: 'Commande récupérée',
    IN_TRANSIT: 'En livraison',
    DELIVERED: 'Livraison terminée',
    CANCELLED: 'Commande annulée',
  };

  if (messages[status]) {
    await createNotification({
      userId: clientId,
      title: titles[status],
      body: messages[status],
      type: 'status_change',
      orderId,
    });
  }
}

export async function notifyNewMessage(orderId: string, recipientId: string, senderName: string) {
  await createNotification({
    userId: recipientId,
    title: 'Nouveau message',
    body: `${senderName} vous a envoyé un message`,
    type: 'new_message',
    orderId,
  });
}

export async function notifyPayment(orderId: string, clientId: string) {
  await createNotification({
    userId: clientId,
    title: 'Paiement confirmé',
    body: 'Votre paiement a été traité avec succès',
    type: 'payment',
    orderId,
  });
}
