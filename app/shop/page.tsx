import Link from "next/link";
import { Filter } from "lucide-react";
import { ProductCard } from "@/components/home/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { SortSelect } from "@/components/shop/SortSelect";
import { PageIntro } from "@/components/pages/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { getListingProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Shop Handcrafted Gifts",
  "Browse personalized gifts, festive keepsakes, handcrafted home decor, and jewelry accessories made in India.",
  "/shop",
);

type SearchParams = Record<string, string | string[] | undefined>;
const value = (input: string | string[] | undefined) =>
  Array.isArray(input) ? input[0] : input;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const current = Object.fromEntries(
    Object.entries(searchParams).map(([key, item]) => [key, value(item)]),
  );
  const results = await getListingProducts({
    category: current.category,
    occasion: current.occasion,
    color: current.color,
    material: current.material,
    minPrice: current.minPrice ? Number(current.minPrice) : undefined,
    maxPrice: current.maxPrice ? Number(current.maxPrice) : undefined,
    sort: current.sort,
    page: current.page ? Number(current.page) : 1,
  });
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro
        eyebrow="The collection"
        title="Gifts with a little more meaning."
      >
        Small-batch pieces for festivals, celebrations, home, and the people who
        make life feel full.
      </PageIntro>
      <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-5 font-display text-2xl">Refine your search</p>
            <FilterSidebar current={current} />
          </div>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-ink">
              {results.total} pieces to discover
            </p>
            <div className="flex items-center gap-3">
              <details className="relative lg:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-soft border border-sand-line px-3 py-2 text-sm">
                  <Filter size={15} /> Filters
                </summary>
                <div className="absolute right-0 top-12 z-20 w-[calc(100vw-40px)] max-w-80 rounded-soft-xl border border-sand-line bg-parchment p-5 shadow-lift">
                  <FilterSidebar current={current} />
                </div>
              </details>
              <form method="get" className="flex items-center gap-2">
                {Object.entries(current)
                  .filter(
                    ([key]) =>
                      key !== "sort" && key !== "page" && itemTruthy(key),
                  )
                  .map(([key, item]) => (
                    <input key={key} type="hidden" name={key} value={item} />
                  ))}
                <SortSelect value={current.sort} />
              </form>
            </div>
          </div>
          <Reveal>
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {results.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
          <Pagination
            page={results.page}
            pageCount={results.pageCount}
            current={current}
          />
        </div>
      </div>
    </main>
  );
}

function itemTruthy(key: string) {
  return [
    "category",
    "occasion",
    "color",
    "material",
    "minPrice",
    "maxPrice",
  ].includes(key);
}
function Pagination({
  page,
  pageCount,
  current,
}: {
  page: number;
  pageCount: number;
  current: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;
  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    Object.entries(current).forEach(([key, item]) => {
      if (item && key !== "page") params.set(key, item);
    });
    params.set("page", String(nextPage));
    return `/shop?${params.toString()}`;
  };
  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {Array.from({ length: pageCount }, (_, index) => index + 1).map(
        (number) => (
          <Link
            key={number}
            href={makeHref(number)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${number === page ? "border-ink bg-ink text-parchment" : "border-sand-line hover:border-gold hover:text-gold"}`}
          >
            {number}
          </Link>
        ),
      )}
    </nav>
  );
}
