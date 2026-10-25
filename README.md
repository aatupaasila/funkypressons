# funkypressons

Website for Funkypressons — hand-painted press-on nails. Built with Next.js 16 (App Router, Cache Components) and Tailwind CSS 4.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

- `src/app/` — pages: home, `shop`, `custom` (step-by-step order form), `gallery`, `about`, `faq`
- `src/content/` — products, gallery and order-form options (temporary; moving to Sanity)
- `src/components/` — shared UI (header, footer, product card, buttons)
- `src/app/globals.css` — brand colours and fonts
- `public/placeholder/` — Instagram screenshots used as stand-in photos
- `design/reference/` — reference screenshots, not published

## Not done yet

- Sanity admin for products, gallery and incoming custom requests
- Saving custom requests + photo upload, email notifications (Resend)
- Checkout (Stripe)
