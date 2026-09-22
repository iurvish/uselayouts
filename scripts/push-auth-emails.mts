#!/usr/bin/env npx tsx
/**
 * Push useLayouts auth email HTML to Supabase Auth config.
 *
 * Requires: SUPABASE_ACCESS_TOKEN from
 * https://supabase.com/dashboard/account/tokens
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npx tsx scripts/push-auth-emails.mts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  AUTH_EMAIL_KINDS,
  buildAuthEmailHtml,
  type AuthEmailKind,
} from "../lib/emails/auth-templates";

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ?? "sjjpqdkofyzrlvmhhflb";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

/** Map our kinds → Supabase Management API fields */
const FIELD_MAP: Record<
  AuthEmailKind,
  { subject: string; content: string }
> = {
  "confirm-signup": {
    subject: "mailer_subjects_confirmation",
    content: "mailer_templates_confirmation_content",
  },
  "magic-link": {
    subject: "mailer_subjects_magic_link",
    content: "mailer_templates_magic_link_content",
  },
  "reset-password": {
    subject: "mailer_subjects_recovery",
    content: "mailer_templates_recovery_content",
  },
  "change-email": {
    subject: "mailer_subjects_email_change",
    content: "mailer_templates_email_change_content",
  },
  invite: {
    subject: "mailer_subjects_invite",
    content: "mailer_templates_invite_content",
  },
};

function stripHtmlComment(html: string) {
  return html.replace(/^<!--[\s\S]*?-->\s*/m, "").trim();
}

async function main() {
  if (!TOKEN) {
    console.error(
      "Missing SUPABASE_ACCESS_TOKEN.\nCreate one at https://supabase.com/dashboard/account/tokens\nthen run:\n  SUPABASE_ACCESS_TOKEN=sbp_… npx tsx scripts/push-auth-emails.mts",
    );
    process.exit(1);
  }

  const body: Record<string, string> = {};

  for (const kind of AUTH_EMAIL_KINDS) {
    const { subject, html } = buildAuthEmailHtml(kind);
    // Prefer generated file if present (includes comment header we strip)
    let content = html;
    try {
      content = stripHtmlComment(
        readFileSync(
          resolve(process.cwd(), `emails/auth/${kind}.html`),
          "utf8",
        ),
      );
    } catch {
      /* use builder output */
    }
    const fields = FIELD_MAP[kind];
    body[fields.subject] = subject;
    body[fields.content] = content;
    console.log(`+ ${kind} → ${fields.content} (${content.length} chars)`);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error(`Failed ${res.status}:`, text.slice(0, 2000));
    process.exit(1);
  }

  console.log(`OK — updated auth email templates on ${PROJECT_REF}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
