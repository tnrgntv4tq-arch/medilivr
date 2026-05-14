import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL = 'alibensalem.french@gmail.com';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Service email non configuré' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MediLivr Contact <onboarding@resend.dev>',
        to: CONTACT_EMAIL,
        subject: `[MediLivr Contact] ${subject}`,
        reply_to: email,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #34C68A, #2AA876); padding: 24px; border-radius: 16px 16px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Nouveau message de contact</h1>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Nom</td>
                  <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #34C68A;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Sujet</td>
                  <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${subject}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <div style="background: white; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                Vous pouvez répondre directement à cet email pour contacter ${name}.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur d\'envoi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
