import { products } from "@/lib/products";
import { SetupNotice } from "@/components/site";
import { Catalog } from "@/components/catalog";
export const metadata = {
  title: "Apps",
  description:
    "Find thoughtfully engineered applications. Browse by category, platform and pricing.",
};
export const dynamic = "force-dynamic";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { items, mode } = await products();
  const value = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  return (
    <div className="wrap catalog-page">
      <div className="page-head">
        <div className="eyebrow">THE RADMAN LABS COLLECTION</div>
        <h1>Find something useful.</h1>
        <p>Practical apps. Clear purpose. Software that fits your day.</p>
      </div>
      <SetupNotice mode={mode} />
      <Catalog
        items={items}
        initial={{
          q: value("q"),
          category: value("category"),
          platform: value("platform"),
          pricing: value("pricing"),
          sort: value("sort") || "updated",
        }}
      />
    </div>
  );
}
