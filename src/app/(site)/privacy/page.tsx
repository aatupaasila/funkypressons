import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Privacy policy" };

const updated = "25 October 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-3xl">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </section>
  );
}

// Keep this in sync with what the site actually collects (custom order form,
// emails, Sanity). Reviewed by the owner, not a lawyer.
export default function PrivacyPage() {
  const email = (
    <a href={`mailto:${site.email}`} className="font-semibold text-heart underline underline-offset-4">
      {site.email}
    </a>
  );

  return (
    <>
      <PageIntro eyebrow={`Updated ${updated}`} title={<>Privacy <em>policy</em></>}>
        This explains what personal information {site.name} collects, why, and what you can ask me to do with it.
      </PageIntro>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pb-16 sm:px-6">
        <Section title="Who is responsible">
          <p>
            The data controller is {site.company.name} (business ID {site.company.businessId}), which runs {site.name}. For anything about
            your data, email {email}.
          </p>
        </Section>

        <Section title="What I collect">
          <p>When you send a custom order request, I receive:</p>
          <ul>
            <li>your name, email address and, if you give it, your Instagram handle and the name of a friend who recommended me</li>
            <li>the country you want your nails shipped to</li>
            <li>your nail sizes and design choices (shape, length, colour, deadline)</li>
            <li>the inspiration photos and description you add, including any artist credits you write</li>
          </ul>
          <p>
            If you email me, I also have your email and whatever you write. When you buy something, payment and delivery details are needed to
            complete the order.
          </p>
        </Section>

        <Section title="Why I use it">
          <ul>
            <li>to prepare your quote, make your nails and deliver them — this is needed to agree on and fulfil your order</li>
            <li>to answer your questions and keep you updated about your order</li>
            <li>to keep accounting records of paid orders, as required by Finnish law</li>
          </ul>
          <p>I don&apos;t sell your information, use it for advertising or send newsletters.</p>
        </Section>

        <Section title="Where it is stored">
          <p>I use a few trusted services to run the shop. They only process your data on my behalf:</p>
          <ul>
            <li>Sanity — stores order requests and photos (EU data centre)</li>
            <li>Vercel — hosts the website (servers in Frankfurt, Germany)</li>
            <li>Resend — sends order emails (EU region, Ireland)</li>
            <li>Google (Gmail) and Cloudflare — receive and forward emails sent to {site.email}</li>
          </ul>
          <p>
            Some of these companies are based outside the EU. Where data may be transferred outside the EU, they rely on the EU&apos;s standard
            contractual clauses or the EU–US Data Privacy Framework to protect it.
          </p>
          <p>
            Inspiration photos are stored behind long, random links that aren&apos;t listed anywhere. Anyone who had the exact link could open the
            photo, so please don&apos;t upload anything private beyond what your design needs.
          </p>
        </Section>

        <Section title="How long I keep it">
          <p>
            Order requests, photos and related messages are deleted two years after our last contact. Records of paid orders are kept for the
            time Finnish accounting law requires (currently six years), but only what the accounts need.
          </p>
        </Section>

        <Section title="Cookies and your browser">
          <p>
            This site doesn&apos;t use tracking or advertising cookies. While you fill in the custom order form, your answers are saved in your
            own browser so you can continue later; they stay on your device and are cleared when you send the request. You can also clear them
            by clearing your browser&apos;s site data.
          </p>
        </Section>

        <Section title="Your rights">
          <p>You can ask me to:</p>
          <ul>
            <li>show you the information I have about you</li>
            <li>correct anything that&apos;s wrong</li>
            <li>delete your information, unless I have to keep it for accounting</li>
            <li>stop or limit using it, or give it to you in a portable format</li>
          </ul>
          <p>Just email {email} and I&apos;ll reply within a month.</p>
          <p>
            If you think your data has been handled wrongly, you can also contact the Finnish Data Protection Ombudsman (
            <a href="https://tietosuoja.fi/en" className="font-semibold text-heart underline underline-offset-4">
              tietosuoja.fi
            </a>
            ).
          </p>
        </Section>
      </div>
    </>
  );
}
