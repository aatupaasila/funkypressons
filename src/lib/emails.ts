import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";

// Emails go out from orders@funkypressons.com (domain verified in Resend).
// Replies land in the same inbox via Cloudflare Email Routing.
const FROM = `Funkypressons <${site.email}>`;

export type RequestEmail = {
  reference: string;
  documentId: string;
  name: string;
  email: string;
  /** Label/value pairs summarising the order */
  rows: [string, string][];
  photoCount: number;
};

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(heading: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#fff7fa;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#4a3333">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:26px;color:#d62a66">Funkypressons ✦</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.15">${heading}</h1>
    ${body}
  </div>
</body></html>`;
}

function summaryTable(rows: [string, string][]) {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#7a5c5c;font-size:14px;vertical-align:top;white-space:nowrap">${escape(label)}</td><td style="padding:8px 0;font-size:15px;white-space:pre-line">${escape(value)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:16px;padding:8px 16px;margin:16px 0">${cells}</table>`;
}

let resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/** Notifies her of a new request and sends the customer a confirmation. Never throws — the request is already saved. */
export async function sendRequestEmails(request: RequestEmail) {
  const client = getResend();
  if (!client) {
    console.warn("RESEND_API_KEY not set — skipping emails for", request.reference);
    return;
  }

  const studioLink = `${site.url}/studio/intent/edit/id=${request.documentId};type=customRequest`;
  const firstName = request.name.split(" ")[0];

  const results = await Promise.allSettled([
    client.emails.send({
      from: FROM,
      to: site.email,
      replyTo: request.email,
      subject: `New custom request ${request.reference} from ${request.name}`,
      html: layout(
        `New request from <em>${escape(request.name)}</em>`,
        `<p style="margin:0">${request.photoCount} inspiration photo${request.photoCount === 1 ? "" : "s"} attached in the Studio. Reply to this email to answer ${escape(firstName)} directly.</p>
        ${summaryTable([["Reference", request.reference], ["Email", request.email], ...request.rows])}
        <p><a href="${studioLink}" style="display:inline-block;background:#d62a66;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px">Open in Studio</a></p>`,
      ),
    }),
    client.emails.send({
      from: FROM,
      to: request.email,
      replyTo: site.email,
      subject: `I got your custom nail request ✦ ${request.reference}`,
      html: layout(
        `Thank you, ${escape(firstName)}!`,
        `<p style="margin:0 0 12px;line-height:1.6">Your request is in. I'll look at your idea and email you a personal quote and timeline — nothing is charged until you've accepted it.</p>
        ${summaryTable([["Reference", request.reference], ...request.rows])}
        <p style="line-height:1.6">Questions or something to add? Just reply to this email.</p>
        <p style="color:#7a5c5c;font-size:14px">${escape(site.instagramHandle)} · ${escape(site.url.replace("https://", ""))}</p>`,
      ),
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") console.error("Email failed", request.reference, result.reason);
    else if (result.value.error) console.error("Email failed", request.reference, result.value.error);
  }
}
