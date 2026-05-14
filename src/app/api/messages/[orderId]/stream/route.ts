export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const token = req.cookies.get('token')?.value;
  if (!token) return new Response('Non authentifié', { status: 401 });

  const session = await verifyToken(token);
  if (!session) return new Response('Token invalide', { status: 401 });

  const encoder = new TextEncoder();
  let lastMessageId: string | null = null;

  const baseUrl = new URL(req.url).origin;

  const stream = new ReadableStream({
    async start(controller) {
      const poll = async () => {
        if (req.signal.aborted) {
          controller.close();
          return;
        }

        try {
          const res = await fetch(`${baseUrl}/api/messages/${orderId}`, {
            headers: { Cookie: `token=${token}` },
          });

          if (!res.ok) {
            controller.close();
            return;
          }

          const { messages } = await res.json();

          if (messages.length > 0) {
            const latest = messages[messages.length - 1];
            if (latest.id !== lastMessageId) {
              lastMessageId = latest.id;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ messages })}\n\n`)
              );
            }
          }

          setTimeout(poll, 2000);
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
