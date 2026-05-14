import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'MediLivr <onboarding@resend.dev>';

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f7fa}
  .wrap{max-width:560px;margin:0 auto;padding:24px}
  .card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .logo{font-size:22px;font-weight:700;color:#2563eb;margin-bottom:20px}
  h1{font-size:18px;color:#1e293b;margin:0 0 16px}
  p{color:#475569;line-height:1.6;margin:8px 0}
  .badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;color:#fff}
  .info{background:#f1f5f9;border-radius:12px;padding:16px;margin:16px 0}
  .info td{padding:4px 0;color:#475569;font-size:14px}
  .info .label{color:#94a3b8;width:120px}
  .foot{text-align:center;padding:20px;color:#94a3b8;font-size:12px}
</style></head><body>
<div class="wrap">
  <div class="card">
    <div class="logo">💊 MediLivr</div>
    <h1>${title}</h1>
    ${body}
  </div>
  <div class="foot">MediLivr — Livraison de médicaments à domicile</div>
</div>
</body></html>`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: '#f59e0b' },
  ACCEPTED: { label: 'Acceptée', color: '#3b82f6' },
  PREPARING: { label: 'En préparation', color: '#8b5cf6' },
  READY: { label: 'Prête', color: '#06b6d4' },
  PICKED_UP: { label: 'Récupérée', color: '#6366f1' },
  IN_TRANSIT: { label: 'En livraison', color: '#f97316' },
  DELIVERED: { label: 'Livrée', color: '#22c55e' },
  CANCELLED: { label: 'Annulée', color: '#ef4444' },
};

function statusBadge(status: string) {
  const s = STATUS_LABELS[status] || { label: status, color: '#64748b' };
  return `<span class="badge" style="background:${s.color}">${s.label}</span>`;
}

function orderInfo(data: { id: string; address?: string; price?: number; pharmacy?: string; client?: string; notes?: string }) {
  const rows: string[] = [];
  rows.push(`<tr><td class="label">Commande</td><td><strong>#${data.id.slice(-8).toUpperCase()}</strong></td></tr>`);
  if (data.pharmacy) rows.push(`<tr><td class="label">Pharmacie</td><td>${data.pharmacy}</td></tr>`);
  if (data.client) rows.push(`<tr><td class="label">Client</td><td>${data.client}</td></tr>`);
  if (data.address) rows.push(`<tr><td class="label">Adresse</td><td>${data.address}</td></tr>`);
  if (data.price != null) rows.push(`<tr><td class="label">Prix</td><td><strong>${data.price.toFixed(2)} €</strong></td></tr>`);
  if (data.notes) rows.push(`<tr><td class="label">Notes</td><td>${data.notes}</td></tr>`);
  return `<div class="info"><table>${rows.join('')}</table></div>`;
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

export async function notifyNewOrder(data: {
  pharmacyEmail: string;
  pharmacyName: string;
  clientName: string;
  orderId: string;
  address: string;
  price: number;
  notes?: string | null;
}) {
  const html = layout(
    'Nouvelle commande reçue',
    `<p>Bonjour <strong>${data.pharmacyName}</strong>,</p>
     <p>Vous avez reçu une nouvelle commande d'ordonnance.</p>
     ${orderInfo({ id: data.orderId, client: data.clientName, address: data.address, price: data.price, notes: data.notes || undefined })}
     <p>Connectez-vous à votre espace pour accepter ou refuser cette commande.</p>`
  );
  await send(data.pharmacyEmail, `Nouvelle commande #${data.orderId.slice(-8).toUpperCase()}`, html);
}

export async function notifyPaymentConfirmed(data: {
  clientEmail: string;
  clientName: string;
  orderId: string;
  price: number;
  pharmacyName: string;
}) {
  const html = layout(
    'Paiement confirmé',
    `<p>Bonjour <strong>${data.clientName}</strong>,</p>
     <p>Votre paiement a été confirmé avec succès.</p>
     ${orderInfo({ id: data.orderId, pharmacy: data.pharmacyName, price: data.price })}
     ${statusBadge('PENDING')}
     <p style="margin-top:16px">La pharmacie va traiter votre commande. Vous recevrez un email à chaque étape.</p>`
  );
  await send(data.clientEmail, `Paiement confirmé — Commande #${data.orderId.slice(-8).toUpperCase()}`, html);
}

export async function notifyStatusChange(data: {
  clientEmail: string;
  clientName: string;
  orderId: string;
  newStatus: string;
  pharmacyName: string;
  deliveryName?: string | null;
}) {
  const statusInfo = STATUS_LABELS[data.newStatus] || { label: data.newStatus };
  let message = '';

  switch (data.newStatus) {
    case 'ACCEPTED':
      message = `<strong>${data.pharmacyName}</strong> a accepté votre commande et va la préparer.`;
      break;
    case 'PREPARING':
      message = `<strong>${data.pharmacyName}</strong> prépare votre commande.`;
      break;
    case 'READY':
      message = `Votre commande est prête et attend un livreur.`;
      break;
    case 'PICKED_UP':
      message = `<strong>${data.deliveryName || 'Un livreur'}</strong> a récupéré votre commande.`;
      break;
    case 'IN_TRANSIT':
      message = `Votre commande est en route ! <strong>${data.deliveryName || 'Le livreur'}</strong> se dirige vers vous.`;
      break;
    case 'DELIVERED':
      message = `Votre commande a été livrée. Merci d'avoir utilisé MediLivr !`;
      break;
    case 'CANCELLED':
      message = `Votre commande a été annulée par la pharmacie.`;
      break;
    default:
      message = `Le statut de votre commande a changé.`;
  }

  const html = layout(
    `Commande ${statusInfo.label.toLowerCase()}`,
    `<p>Bonjour <strong>${data.clientName}</strong>,</p>
     <p>${message}</p>
     ${orderInfo({ id: data.orderId, pharmacy: data.pharmacyName })}
     ${statusBadge(data.newStatus)}`
  );
  await send(data.clientEmail, `${statusInfo.label} — Commande #${data.orderId.slice(-8).toUpperCase()}`, html);
}
