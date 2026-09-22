/**
 * useLayouts auth email HTML — Figma 400:9195 layout.
 * Paste each template into Supabase → Authentication → Email Templates.
 *
 * Shared Go vars: {{ .ConfirmationURL }} {{ .SiteURL }} {{ .Email }} {{ .Token }}
 */

export type AuthEmailKind =
  | "magic-link"
  | "confirm-signup"
  | "reset-password"
  | "change-email"
  | "invite";

type EmailCopy = {
  subject: string;
  greeting: string;
  headline: string;
  paragraphs: string[];
  cta: string;
  footerNote: string;
};

/** Live absolute URL — must exist on production after deploy (`public/brand/logomark-email.png`). */
const SITE = "https://uselayouts.com";
const LOGO = `${SITE}/brand/logomark-email.png`;

const COPY: Record<AuthEmailKind, EmailCopy> = {
  "magic-link": {
    subject: "Sign in to useLayouts",
    greeting: "Hi,",
    headline: "Sign in to useLayouts",
    paragraphs: [
      "Click the button below to sign in. This link expires in about an hour.",
      "If you didn't ask for this email, you can ignore it.",
    ],
    cta: "Sign in",
    footerNote: "This link signs you into useLayouts.",
  },
  "confirm-signup": {
    subject: "Confirm your useLayouts email",
    greeting: "Hi,",
    headline: "Confirm your email",
    paragraphs: [
      "Thanks for joining useLayouts. Confirm your email so you can copy components into your projects.",
      "If you didn't create an account, you can ignore this email.",
    ],
    cta: "Confirm email",
    footerNote: "Confirming unlocks copy on uselayouts.com.",
  },
  "reset-password": {
    subject: "Reset your useLayouts password",
    greeting: "Hi,",
    headline: "Reset your password",
    paragraphs: [
      "We got a request to reset your useLayouts password. Click below to choose a new one.",
      "If you didn't ask for a reset, you can ignore this email.",
    ],
    cta: "Reset password",
    footerNote: "This link lets you set a new password.",
  },
  "change-email": {
    subject: "Confirm your new email",
    greeting: "Hi,",
    headline: "Confirm your new email",
    paragraphs: [
      "Confirm this address to use it with your useLayouts account.",
      "If you didn't request an email change, you can ignore this email.",
    ],
    cta: "Confirm email",
    footerNote: "This verifies a new email on your account.",
  },
  invite: {
    subject: "You're invited to useLayouts",
    greeting: "Hi,",
    headline: "You've been invited",
    paragraphs: [
      "Someone invited you to useLayouts. Accept to start browsing and copying components.",
      "If this wasn't meant for you, you can ignore this email.",
    ],
    cta: "Accept invite",
    footerNote: "Accepting creates your useLayouts account.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paragraphHtml(text: string) {
  return `<p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.4;color:#e2e3e4;">${escapeHtml(text)}</p>`;
}

/** Builds pixel-matched auth email HTML (Figma 400:9195). `ctaUrl` may be a Go template var. */
export function buildAuthEmailHtml(
  kind: AuthEmailKind,
  options?: { ctaUrl?: string; logoUrl?: string },
): { subject: string; html: string } {
  const copy = COPY[kind];
  const ctaUrl = options?.ctaUrl ?? "{{ .ConfirmationURL }}";
  const logoUrl = options?.logoUrl ?? LOGO;
  const paragraphs = copy.paragraphs.map(paragraphHtml).join(
    `\n                    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>\n                    `,
  );

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(copy.subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#1b1c1f;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(copy.headline)} — ${escapeHtml(copy.footerNote)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#1b1c1f;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:560px;">
          <!-- Header / logo -->
          <tr>
            <td style="padding:0 0 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding:0;">
                          <img src="${logoUrl}" width="42" height="42" alt="useLayouts" style="display:block;width:42px;height:42px;border:0;border-radius:8px;" />
                        </td>
                        <td valign="middle" style="padding:0 0 0 11px;font-family:Geist,Inter,Helvetica,Arial,sans-serif;font-size:24px;font-weight:500;line-height:normal;letter-spacing:-0.72px;color:#ffffff;">
                          useLayouts
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="padding:12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#323239;border-radius:20px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:20px;font-weight:600;line-height:26px;letter-spacing:-0.3px;color:#e2e3e4;">
                      ${escapeHtml(copy.greeting)}
                    </p>
                    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
                    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:18px;font-weight:600;line-height:normal;letter-spacing:-0.27px;color:#e2e3e4;">
                      ${escapeHtml(copy.headline)}
                    </p>
                    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
                    ${paragraphs}
                    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" bgcolor="#3351e5" style="background-color:#3351e5;border-radius:14px;">
                          <a href="${ctaUrl}" target="_blank" style="display:block;padding:10px 10px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:18px;font-weight:500;line-height:20px;letter-spacing:-0.108px;color:#ffffff;text-decoration:none;text-align:center;">
                            ${escapeHtml(copy.cta)}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="height:20px;line-height:20px;font-size:20px;">&nbsp;</div>
                    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;font-weight:400;line-height:1.4;color:#b7b7b8;word-break:break-all;">
                      Button not working? Paste this link into your browser:<br />
                      <a href="${ctaUrl}" style="color:#b7b7b8;text-decoration:underline;">${ctaUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:18px;color:#b7b7b8;text-align:center;">
              <p style="margin:0;">
                © 2026 useLayouts
                &nbsp;|&nbsp;
                <a href="${SITE}" style="color:#b7b7b8;text-decoration:none;">uselayouts.com</a>
                &nbsp;|&nbsp;
                <a href="${SITE}" style="color:#b7b7b8;text-decoration:underline;">Privacy Policy</a>
              </p>
              <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
              <p style="margin:0;color:#b7b7b8;">
                ${escapeHtml(copy.footerNote)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject: copy.subject, html };
}

export const AUTH_EMAIL_KINDS = Object.keys(COPY) as AuthEmailKind[];
