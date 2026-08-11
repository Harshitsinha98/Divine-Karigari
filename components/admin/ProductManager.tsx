"use client";
import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Upload } from "lucide-react";
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  category: { name: string };
  variants: { stock: number }[];
};
export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(
      `/api/admin/products?q=${encodeURIComponent(q)}&status=${status}`,
    );
    const data = await response.json();
    setProducts(data.data ?? []);
  }, [q, status]);
  useEffect(() => {
    void load();
  }, [load]);
  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/products/import", {
      method: "POST",
      body,
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? `${result.data?.created ?? 0} products imported.`
        : (result.error ?? "Import failed."),
    );
    event.target.value = "";
    void load();
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-4xl">Products</h1>
        </div>
        <div className="flex gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-soft border border-sand-line bg-parchment px-4 text-sm">
            <Upload size={16} /> CSV upload
            <input
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={importCsv}
            />
          </label>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center rounded-soft bg-ink px-4 text-sm text-parchment"
          >
            Add product
          </Link>
        </div>
      </div>
      {message && <p className="mt-4 text-sm text-tulsi">{message}</p>}
      <div className="mt-7 flex flex-wrap gap-3">
        <input
          className="h-11 min-w-64 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          placeholder="Search name or SKU"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select
          className="h-11 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="mt-5 overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase tracking-wide text-muted-ink">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                className="border-b border-sand-line/70 last:border-0"
                key={product.id}
              >
                <td className="p-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-ink">{product.sku}</p>
                </td>
                <td className="p-4">{product.category.name}</td>
                <td className="p-4">
                  ₹{product.price.toLocaleString("en-IN")}
                </td>
                <td
                  className={
                    product.stock <= 10 ? "p-4 font-medium text-oxblood" : "p-4"
                  }
                >
                  {product.stock}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-sand-line/50 px-2 py-1 text-xs">
                    {product.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    className="text-oxblood hover:text-gold"
                    href={`/admin/products/${product.id}`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-ink">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
