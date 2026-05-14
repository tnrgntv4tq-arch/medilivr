import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { decryptBuffer, decryptKey } from '@/lib/encryption';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  if (session.role !== 'PHARMACY') {
    return NextResponse.json({ error: 'Seule la pharmacie peut consulter les ordonnances' }, { status: 403 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  if (order.pharmacyId !== session.userId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    if (!order.prescriptionData) {
      return NextResponse.json({ error: 'Ordonnance non disponible' }, { status: 404 });
    }

    const encryptedData = Buffer.from(order.prescriptionData);
    const dataKey = decryptKey(order.prescriptionKey);
    const decrypted = decryptBuffer(encryptedData, order.prescriptionIV, dataKey);

    return new NextResponse(decrypted, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  } catch (error) {
    console.error('Prescription decrypt error:', error);
    return NextResponse.json({ error: 'Erreur de déchiffrement' }, { status: 500 });
  }
}
