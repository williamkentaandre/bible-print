import { CONTACT_EMAIL } from "./print-ticket";
import { createMagicToken } from "./session";

export async function sendReadyEmail(email: string, origin: string, reference: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const token = createMagicToken(email, 14);
  const link = `${origin}/api/auth/magic?token=${encodeURIComponent(token)}`;
  const from = process.env.EMAIL_FROM || `Bible Deco <${CONTACT_EMAIL}>`;

  await resend.emails.send({
    from,
    to: email,
    replyTo: CONTACT_EMAIL,
    subject: "Vos impressions sont prêtes",
    html: `
      <div style="font-family:Georgia,serif;background:#f4efe7;padding:32px 20px;color:#2a241c">
        <div style="max-width:520px;margin:0 auto;background:#fffcf7;border:1px solid #d8cfc2;padding:28px 24px">
          <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#8a6a3e">Bible Deco</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:500">Vos impressions sont prêtes.</h1>
          <p style="margin:0 0 18px;line-height:1.5">
            ${reference} est dans votre espace. Les 12 PDF vous y attendent.
          </p>
          <p style="margin:0 0 22px">
            <a href="${link}" style="display:inline-block;background:#231e18;color:#fffcf7;text-decoration:none;padding:12px 18px">
              Ouvrir mes impressions
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6d655a">
            Une question ? Écrivez-nous à <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
          </p>
        </div>
      </div>
    `,
  });
  return true;
}

export async function sendLoginEmail(email: string, origin: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const token = createMagicToken(email, 2);
  const link = `${origin}/api/auth/magic?token=${encodeURIComponent(token)}`;
  const from = process.env.EMAIL_FROM || `Bible Deco <${CONTACT_EMAIL}>`;

  await resend.emails.send({
    from,
    to: email,
    replyTo: CONTACT_EMAIL,
    subject: "Votre espace Bible Deco",
    html: `
      <div style="font-family:Georgia,serif;background:#f4efe7;padding:32px 20px;color:#2a241c">
        <div style="max-width:520px;margin:0 auto;background:#fffcf7;border:1px solid #d8cfc2;padding:28px 24px">
          <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#8a6a3e">Bible Deco</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:500">Retrouvez vos impressions.</h1>
          <p style="margin:0 0 18px;line-height:1.5">
            Cliquez pour ouvrir votre espace. Aucun mot de passe.
          </p>
          <p style="margin:0 0 22px">
            <a href="${link}" style="display:inline-block;background:#231e18;color:#fffcf7;text-decoration:none;padding:12px 18px">
              Ouvrir mes impressions
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6d655a">
            Une question ? <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  });
  return true;
}
