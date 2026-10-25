import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/sanity/queries";

// Public pages get the header and footer; /studio does not
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { announcement } = await getSettings();
  return (
    <>
      <SiteHeader announcement={announcement} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
