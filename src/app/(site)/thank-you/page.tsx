import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/content/site";
import { stripe } from "@/lib/stripe";
import { Sparkle } from "@/components/sparkle";
import { button } from "@/components/ui";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

// Where Stripe sends buyers after paying. Purely a thank-you: the order itself
// is recorded by the Stripe webhook, so visiting this page proves nothing.
export default function ThankYouPage({ searchParams }: PageProps<"/thank-you">) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <Sparkle size={44} className="text-heart" />
      <h1 className="font-serif text-5xl leading-none">
        Thank <em>you!</em>
      </h1>
      <Suspense fallback={<p className="text-lg leading-relaxed">Your payment went through.</p>}>
        <Greeting searchParams={searchParams} />
      </Suspense>
      <p className="text-sm text-cocoa">
        Questions? Email{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-heart underline underline-offset-4">
          {site.email}
        </a>
      </p>
      <Link href="/gallery" className={button.outline}>
        Browse the gallery
      </Link>
    </div>
  );
}

async function Greeting({ searchParams }: Pick<PageProps<"/thank-you">, "searchParams">) {
  const id = (await searchParams).session_id;
  const session =
    stripe && typeof id === "string" && /^cs_[A-Za-z0-9_]+$/.test(id) ? await stripe.checkout.sessions.retrieve(id).catch(() => null) : null;
  const name = session?.customer_details?.name?.split(" ")[0];
  const email = session?.customer_details?.email;

  return (
    <p className="text-lg leading-relaxed">
      {name ? `${name}, your` : "Your"} payment went through and I&apos;ll get started on your nails.
      {email ? (
        <>
          {" "}
          A confirmation is on its way to <strong className="font-semibold">{email}</strong>.
        </>
      ) : null}
    </p>
  );
}
