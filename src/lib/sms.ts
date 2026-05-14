import twilio from 'twilio';

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM = process.env.TWILIO_PHONE_NUMBER;

async function send(to: string, body: string) {
  if (!client || !FROM) return;
  try {
    await client.messages.create({ from: FROM, to, body });
  } catch (err) {
    console.error('SMS send error:', err);
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'en attente',
  ACCEPTED: 'acceptée',
  PREPARING: 'en préparation',
  READY: 'prête',
  PICKED_UP: 'récupérée',
  IN_TRANSIT: 'en livraison',
  DELIVERED: 'livrée',
  CANCELLED: 'annulée',
};

function shortId(id: string) {
  return id.slice(-8).toUpperCase();
}

export async function smsNewOrder(data: {
  pharmacyPhone: string;
  clientName: string;
  orderId: string;
  price: number;
}) {
  await send(
    data.pharmacyPhone,
    `💊 MediLivr — Nouvelle commande #${shortId(data.orderId)} de ${data.clientName} (${data.price.toFixed(2)} €). Connectez-vous pour l'accepter.`
  );
}

export async function smsPaymentConfirmed(data: {
  clientPhone: string;
  orderId: string;
  price: number;
}) {
  await send(
    data.clientPhone,
    `💊 MediLivr — Paiement de ${data.price.toFixed(2)} € confirmé pour la commande #${shortId(data.orderId)}. La pharmacie va traiter votre commande.`
  );
}

export async function smsStatusChange(data: {
  clientPhone: string;
  orderId: string;
  newStatus: string;
  deliveryName?: string | null;
}) {
  const label = STATUS_LABELS[data.newStatus] || data.newStatus;
  let msg = `💊 MediLivr — Commande #${shortId(data.orderId)} : ${label}.`;

  if (data.newStatus === 'PICKED_UP' && data.deliveryName) {
    msg += ` ${data.deliveryName} a récupéré votre commande.`;
  } else if (data.newStatus === 'IN_TRANSIT') {
    msg += ` ${data.deliveryName || 'Le livreur'} est en route !`;
  } else if (data.newStatus === 'DELIVERED') {
    msg += ` Merci d'avoir utilisé MediLivr !`;
  }

  await send(data.clientPhone, msg);
}
