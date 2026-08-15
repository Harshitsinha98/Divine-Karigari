"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Category = { id: string; name: string };
type Product = Record<string, unknown> & {
  id?: string;
  variants?: {
    name?: string;
    size?: string;
    color?: string;
    sku: string;
    price?: number;
    stock: number;
    imageUrl?: string;
  }[];
};
const empty: Product = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  sku: "",
  price: 0,
  images: [],
  occasionTags: [],
  colors: [],
  materials: [],
  status: "DRAFT",
  customizationEnabled: false,
  customizationLabel: "",
  customizationMaxLength: 60,
  stock: 0,
  weightGrams: 300,
  lengthCm: 10,
  widthCm: 10,
  heightCm: 5,
  variants: [],
};
const list = (value: unknown) => (Array.isArray(value) ? value.join("\n") : "");
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [value, setValue] = useState<Product>({ ...empty, ...product });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((res) => setCategories(res.data ?? []));
  }, []);
  const set = (key: string, next: unknown) =>
    setValue((current) => {
      const updated = { ...current, [key]: next };
      // Auto-generate slug from name when slug is empty or was auto-generated
      if (key === "name" && typeof next === "string") {
        const autoSlug = next
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const currentSlug = String(current.slug ?? "");
        const prevAutoSlug = String(current.name ?? "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (!currentSlug || currentSlug === prevAutoSlug) {
          updated.slug = autoSlug;
        }
      }
      return updated;
    });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    // Ensure numeric fields are numbers (Prisma returns Decimal as string)
    const payload = {
      ...value,
      price: Number(value.price) || 0,
      compareAtPrice: value.compareAtPrice
        ? Number(value.compareAtPrice)
        : undefined,
      stock: Number(value.stock) || 0,
      weightGrams: Number(value.weightGrams) || 300,
      lengthCm: Number(value.lengthCm) || 10,
      widthCm: Number(value.widthCm) || 10,
      heightCm: Number(value.heightCm) || 5,
      customizationMaxLength: value.customizationMaxLength
        ? Number(value.customizationMaxLength)
        : undefined,
      variants: (value.variants ?? []).map((v) => ({
        ...v,
        price:
          v.price != null && String(v.price) !== ""
            ? Number(v.price)
            : undefined,
        stock: Number(v.stock) || 0,
      })),
    };
    const response = await fetch(
      product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      // Parse Zod validation errors into a readable message
      if (result.error && result.error.startsWith("[")) {
        try {
          const issues = JSON.parse(result.error) as {
            path: (string | number)[];
            message: string;
          }[];
          const readable = issues
            .map(
              (issue) =>
                `${issue.path.join(" → ")}: ${issue.message}`,
            )
            .join("\n");
          return setError(readable);
        } catch {
          /* fall through */
        }
      }
      return setError(result.error ?? "Unable to save product.");
    }
    router.push(`/admin/products/${result.data.id}`);
    router.refresh();
  };
  const text = (key: string, label: string, type = "text") => (
    <label className="block text-sm">
      <span>{label}</span>
      <input
        type={type}
        className="mt-1 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3"
        value={String(value[key] ?? "")}
        onChange={(event) =>
          set(
            key,
            type === "number" ? Number(event.target.value) : event.target.value,
          )
        }
      />
    </label>
  );
  return (
    <form onSubmit={submit}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-4xl">
            {product?.id ? "Edit product" : "New product"}
          </h1>
        </div>
        <button
          disabled={saving}
          className="min-h-11 rounded-soft bg-ink px-5 text-sm text-parchment disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save product"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-oxblood">{error}</p>}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-5 rounded-soft-xl border border-sand-line bg-parchment p-5">
          <h2 className="font-display text-2xl">Product details</h2>
          {text("name", "Name")}
          {text("slug", "URL slug")}
          <label className="block text-sm">
            Description
            <textarea
              className="mt-1 min-h-32 w-full rounded-soft border border-sand-line bg-parchment p-3"
              value={String(value.description ?? "")}
              onChange={(event) => set("description", event.target.value)}
            />
          </label>
          {text("shortDescription", "Short description")}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("sku", "Base SKU")}
            <label className="block text-sm">
              Category
              <select
                required
                className="mt-1 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3"
                value={String(value.categoryId)}
                onChange={(event) => set("categoryId", event.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            Image URLs (one per line)
            <textarea
              className="mt-1 min-h-24 w-full rounded-soft border border-sand-line bg-parchment p-3"
              value={list(value.images)}
              onChange={(event) =>
                set(
                  "images",
                  event.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {["occasionTags", "colors", "materials"].map((key) => (
              <label className="block text-sm" key={key}>
                {key.replace(/([A-Z])/g, " $1")}
                <textarea
                  className="mt-1 min-h-20 w-full rounded-soft border border-sand-line bg-parchment p-3"
                  value={list(value[key])}
                  onChange={(event) =>
                    set(
                      key,
                      event.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Pricing & stock</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {text("price", "Price (₹)", "number")}
              {text("compareAtPrice", "Compare-at price (₹)", "number")}
              {text("stock", "Stock", "number")}
              <label className="block text-sm">
                Status
                <select
                  className="mt-1 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3"
                  value={String(value.status)}
                  onChange={(event) => set("status", event.target.value)}
                >
                  <option>ACTIVE</option>
                  <option>DRAFT</option>
                  <option>ARCHIVED</option>
                </select>
              </label>
            </div>
          </section>
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Customisation</h2>
            <label className="mt-4 flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(value.customizationEnabled)}
                onChange={(event) =>
                  set("customizationEnabled", event.target.checked)
                }
              />{" "}
              Enable personalised gift text
            </label>
            {Boolean(value.customizationEnabled) && (
              <div className="mt-4 grid gap-4">
                {text("customizationLabel", "Field label")}
                {text("customizationMaxLength", "Character limit", "number")}
              </div>
            )}
          </section>
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">
              Shipping metrics{" "}
              <span className="text-xs font-normal text-oxblood">
                (required for Shiprocket)
              </span>
            </h2>
            <p className="mt-1 text-xs text-muted-ink">
              Packed dimensions of the product. Shiprocket charges the higher of
              actual weight vs volumetric weight (L×W×H÷5000).
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {text("weightGrams", "Weight (g) *", "number")}
              {text("lengthCm", "Length (cm) *", "number")}
              {text("widthCm", "Width (cm) *", "number")}
              {text("heightCm", "Height (cm) *", "number")}
            </div>
            {product?.id && (
              <ShippingEstimate productId={product.id as string} />
            )}
          </section>
        </aside>
      </div>
      <section className="mt-6 rounded-soft-xl border border-sand-line bg-parchment p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Variants</h2>
          <button
            type="button"
            className="text-sm text-oxblood"
            onClick={() =>
              set("variants", [
                ...(value.variants ?? []),
                { sku: "", stock: 0 },
              ])
            }
          >
            Add variant
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {(value.variants ?? []).map((variant, index) => (
            <div className="grid gap-2 sm:grid-cols-6" key={index}>
              {["name", "size", "color", "sku", "price", "stock"].map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  type={key === "price" || key === "stock" ? "number" : "text"}
                  className="h-10 rounded-soft border border-sand-line px-2 text-sm"
                  value={String(variant[key as keyof typeof variant] ?? "")}
                  onChange={(event) => {
                    const variants = [...(value.variants ?? [])];
                    variants[index] = {
                      ...variant,
                      [key]:
                        key === "price" || key === "stock"
                          ? Number(event.target.value)
                          : event.target.value,
                    };
                    set("variants", variants);
                  }}
                />
              ))}
              <button
                type="button"
                className="text-sm text-oxblood"
                onClick={() =>
                  set(
                    "variants",
                    (value.variants ?? []).filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
          {!(value.variants ?? []).length && (
            <p className="text-sm text-muted-ink">
              No variants added — the base product stock will be used.
            </p>
          )}
        </div>
      </section>
    </form>
  );
}


function ShippingEstimate({ productId }: { productId: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/shipping-estimate`,
      );
      const json = await res.json();
      if (!res.ok) return setErr(json.error ?? "Unable to fetch estimate.");
      setData(json.data);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-4 rounded-soft border border-tulsi/20 bg-tulsi/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-tulsi">Shipping estimate</p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-xs font-medium text-tulsi underline disabled:opacity-50"
        >
          {loading ? "Loading…" : "Fetch from Shiprocket"}
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-oxblood">{err}</p>}
      {data && !err && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink">
          <span>Test pincode:</span>
          <span>{String(data.testPincode)}</span>
          <span>Actual weight:</span>
          <span>{String(data.actualKg)} kg</span>
          <span>Volumetric weight:</span>
          <span>{String(data.volumetricKg)} kg</span>
          <span>Chargeable weight:</span>
          <span className="font-medium">
            {String(data.chargeableKg)} kg
          </span>
          <span>Courier:</span>
          <span>{String(data.courierName ?? "—")}</span>
          <span>Est. rate:</span>
          <span className="font-medium">
            {data.rate ? `₹${Number(data.rate).toLocaleString("en-IN")}` : "—"}
          </span>
          <span>Delivery days:</span>
          <span>{data.estimatedDays ? `${data.estimatedDays} days` : "—"}</span>
          {data.available === false && (
            <>
              <span className="col-span-2 mt-1 text-oxblood">
                {String(data.reason ?? "Delivery not available to test pincode.")}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
