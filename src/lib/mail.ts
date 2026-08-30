import { getCopy, parseLocale, type Locale } from "@/i18n";
import { CONTACT_EMAIL } from "./print-ticket";
import { createMagicToken } from "./session";

function magicLink(origin: string, token: string, locale: Locale, next?: string) {
  const url = new URL("/api/auth/magic", origin);
  url.searchParams.set("token", token);
  if (locale === "en") url.searchParams.set("locale", "en");
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export async function sendReadyEmail(
  email: string,
  origin: string,
  reference: string,
  locale: Locale = "fr",
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const copy = getCopy(parseLocale(locale));
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const token = createMagicToken(email, 14);
  const link = magicLink(origin, token, copy.locale);
  const from = process.env.EMAIL_FROM || `Bible Deco <${CONTACT_EMAIL}>`;

  await resend.emails.send({
    from,
    to: email,
    replyTo: CONTACT_EMAIL,
    subject: copy.mail.readySubject,
    html: `
      <div style="font-family:Georgia,serif;background:#f4efe7;padding:32px 20px;color:#2a241c">
        <div style="max-width:520px;margin:0 auto;background:#fffcf7;border:1px solid #d8cfc2;padding:28px 24px">
          <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#8a6a3e">Bible Deco</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:500">${copy.mail.readyTitle}</h1>
          <p style="margin:0 0 18px;line-height:1.5">
            ${copy.mail.readyBody(reference)}
          </p>
          <p style="margin:0 0 22px">
            <a href="${link}" style="display:inline-block;background:#231e18;color:#fffcf7;text-decoration:none;padding:12px 18px">
              ${copy.mail.readyCta}
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6d655a">
            ${copy.mail.readyFooter} <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
          </p>
        </div>
      </div>
    `,
  });
  return true;
}

export async function sendLoginEmail(email: string, origin: string, locale: Locale = "fr") {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const copy = getCopy(parseLocale(locale));
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const token = createMagicToken(email, 2);
  const link = magicLink(origin, token, copy.locale);
  const from = process.env.EMAIL_FROM || `Bible Deco <${CONTACT_EMAIL}>`;

  await resend.emails.send({
    from,
    to: email,
    replyTo: CONTACT_EMAIL,
    subject: copy.mail.loginSubject,
    html: `
      <div style="font-family:Georgia,serif;background:#f4efe7;padding:32px 20px;color:#2a241c">
        <div style="max-width:520px;margin:0 auto;background:#fffcf7;border:1px solid #d8cfc2;padding:28px 24px">
          <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#8a6a3e">Bible Deco</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:500">${copy.mail.loginTitle}</h1>
          <p style="margin:0 0 18px;line-height:1.5">
            ${copy.mail.loginBody}
          </p>
          <p style="margin:0 0 22px">
            <a href="${link}" style="display:inline-block;background:#231e18;color:#fffcf7;text-decoration:none;padding:12px 18px">
              ${copy.mail.loginCta}
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6d655a">
            ${copy.mail.loginFooter} <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    `,
  });
  return true;
}

export async function sendFreeDownloadEmail(
  email: string,
  origin: string,
  reference: string,
  locale: Locale = "fr",
  ticket?: string,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const copy = getCopy(parseLocale(locale));
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const token = createMagicToken(email, 14);
  const next = new URL(copy.paths.home, origin);
  if (ticket) next.searchParams.set("ticket", ticket);
  const link = magicLink(origin, token, copy.locale, `${next.pathname}${next.search}`);
  const from = process.env.EMAIL_FROM || `Bible Deco <${CONTACT_EMAIL}>`;

  await resend.emails.send({
    from,
    to: email,
    replyTo: CONTACT_EMAIL,
    subject: copy.mail.freeDownloadSubject,
    html: `
      <div style="font-family:Georgia,serif;background:#f4efe7;padding:32px 20px;color:#2a241c">
        <div style="max-width:520px;margin:0 auto;background:#fffcf7;border:1px solid #d8cfc2;padding:28px 24px">
          <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#8a6a3e">Bible Deco</p>
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:500">${copy.mail.freeDownloadTitle}</h1>
          <p style="margin:0 0 18px;line-height:1.5">
            ${copy.mail.freeDownloadBody(reference)}
          </p>
          <p style="margin:0 0 22px">
            <a href="${link}" style="display:inline-block;background:#231e18;color:#fffcf7;text-decoration:none;padding:12px 18px">
              ${copy.mail.freeDownloadCta}
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6d655a">
            ${copy.mail.freeDownloadFooter} <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
          </p>
        </div>
      </div>
    `,
  });
  return true;
}
