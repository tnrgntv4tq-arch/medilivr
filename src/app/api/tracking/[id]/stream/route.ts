export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const token = req.cookies.get('token')?.value;
  if (!token) return new Response('Non authentifié', { status: 401 });

  const session = await verifyToken(token);
  if (!session) return new Response('Token invalide', { status: 401 });

  const encoder = new TextEncoder();
  let lastLat: number | null = null;
  let lastLng: number | null = null;
  let lastStatus: string | null = null;
  let ticks = 0;

  const baseUrl = new URL(req.url).origin;

  const stream = new ReadableStream({
    async start(controller) {
      const poll = async () => {
        if (req.signal.aborted) {
          controller.close();
          return;
        }

        try {
          const res = await fetch(`${baseUrl}/api/tracking/${id}`, {
            headers: { Cookie: `token=${token}` },
          });

          if (!res.ok) {
            controller.close();
            return;
          }

          const { tracking } = await res.json();

          const changed =
            tracking.deliveryLat !== lastLat ||
            tracking.deliveryLng !== lastLng ||
            tracking.status !== lastStatus;

          if (changed) {
            lastLat = tracking.deliveryLat;
            lastLng = tracking.deliveryLng;
            lastStatus = tracking.status;

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  deliveryLat: tracking.deliveryLat,
                  deliveryLng: tracking.deliveryLng,
                  status: tracking.status,
                  delivery: tracking.delivery,
                })}\n\n`
              )
            );
          } else if (ticks % 6 === 0) {
            controller.enqueue(encoder.encode(`:keep-alive\n\n`));
          }

          if (['DELIVERED', 'CANCELLED'].includes(tracking.status)) {
            controller.close();
            return;
          }

          ticks++;
          setTimeout(poll, 2500);
        } catch {
          controller.close();
        }
      };

      await poll();
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
