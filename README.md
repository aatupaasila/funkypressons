# funkypressons

Website for Funkypressons — hand-painted press-on nails. Built with Next.js 16 (App Router, Cache Components) and Tailwind CSS 4.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The admin (Sanity Studio) is at http://localhost:3000/studio.

Needs a `.env.local` with:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=tkdcotec
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=…            # editor token from sanity.io/manage → API → Tokens
SANITY_REVALIDATE_SECRET=…    # optional locally; shared with the Sanity webhooks
RESEND_API_KEY=…              # order emails

# Payments (leave out to keep the shop in "opening soon" mode)
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_… # locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret`
NEXT_PUBLIC_PAYMENTS_ENABLED=true  # enables "Send payment link" in the Studio
```

Testing payments locally: run `stripe listen --forward-to localhost:3000/api/stripe/webhook` next to `npm run dev`
and pay with card `4242 4242 4242 4242`. The Studio's "Send payment link" relies on a Sanity webhook to
`/api/payment-link`, which can't reach localhost — send a signed request yourself when testing.

## Where things live

- `src/app/(site)/` — public pages: home, `shop`, `custom` (step-by-step order form), `gallery`, `about`, `faq`
- `src/app/studio/` — the embedded Sanity Studio
- `src/app/api/` — inspiration photo upload, revalidation webhook
- `src/sanity/` — schema (design, custom request, site settings), Studio menu, queries
- `src/content/` — fixed form options, sizing system, site details
- `src/components/` — shared UI (header, footer, product card, sizing guide)
- `src/app/globals.css` — brand colours and fonts
- `scripts/seed-sanity.ts` — one-off import of the placeholder designs
- `public/placeholder/`, `design/reference/` — Instagram screenshots used as stand-ins

The Sanity dataset is private (custom requests hold customer details); the site reads it server-side with the token. Uploaded images are public by URL.

## Not done yet

- Email notifications for new requests (Resend)
- Checkout (Stripe)
- Deploy to Vercel + Sanity webhook to `/api/revalidate`
