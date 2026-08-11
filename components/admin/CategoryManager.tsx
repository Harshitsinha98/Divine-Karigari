"use client";
import { FormEvent, useEffect, useState } from "react";
type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
  parentId?: string | null;
  parent?: { name: string } | null;
  _count: { products: number; children: number };
};
const blank = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  sortOrder: 0,
  active: true,
};
export function CategoryManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Category | null>(null);
  const [notice, setNotice] = useState("");
  const load = async () => {
    const res = await fetch("/api/admin/categories");
    const payload = await res.json();
    setItems(payload.data ?? []);
  };
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const endpoint = editing
      ? `/api/admin/categories/${editing.id}`
      : "/api/admin/categories";
    const response = await fetch(endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, parentId: form.parentId || null }),
    });
    const result = await response.json();
    if (!response.ok)
      return setNotice(result.error ?? "Unable to save category.");
    setNotice(editing ? "Category updated." : "Category added.");
    setEditing(null);
    setForm(blank);
    void load();
  };
  const edit = (item: Category) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      parentId: item.parentId ?? "",
      sortOrder: item.sortOrder,
      active: item.active,
    });
  };
  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this category? It must have no products or subcategories.",
      )
    )
      return;
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setNotice(
      response.ok
        ? "Category deleted."
        : (result.error ?? "Unable to delete category."),
    );
    void load();
  };
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
          Catalog structure
        </p>
        <h1 className="mt-2 font-display text-4xl">Categories</h1>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Parent</th>
                <th className="p-4">Products</th>
                <th className="p-4">Order</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  className="border-b border-sand-line/70 last:border-0"
                  key={item.id}
                >
                  <td className="p-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-ink">/{item.slug}</p>
                  </td>
                  <td className="p-4">{item.parent?.name ?? "—"}</td>
                  <td className="p-4">{item._count.products}</td>
                  <td className="p-4">{item.sortOrder}</td>
                  <td className="p-4 text-right">
                    <button
                      className="mr-3 text-oxblood"
                      onClick={() => edit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-muted-ink"
                      onClick={() => remove(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="h-fit rounded-soft-xl border border-sand-line bg-parchment p-5"
          onSubmit={submit}
        >
          <h2 className="font-display text-2xl">
            {editing ? "Edit category" : "Add category"}
          </h2>
          {notice && <p className="mt-3 text-sm text-oxblood">{notice}</p>}
          <div className="mt-4 space-y-3">
            {(["name", "slug"] as const).map((key) => (
              <label className="block text-sm" key={key}>
                {key[0].toUpperCase() + key.slice(1)}
                <input
                  required
                  className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              </label>
            ))}
            <label className="block text-sm">
              Description
              <textarea
                className="mt-1 min-h-20 w-full rounded-soft border border-sand-line p-3"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              Parent category
              <select
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.parentId}
                onChange={(event) =>
                  setForm({ ...form, parentId: event.target.value })
                }
              >
                <option value="">No parent</option>
                {items
                  .filter((item) => item.id !== editing?.id)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="block text-sm">
              Display order
              <input
                type="number"
                min="0"
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm({ ...form, sortOrder: Number(event.target.value) })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm({ ...form, active: event.target.checked })
                }
              />{" "}
              Visible on storefront
            </label>
            <div className="flex gap-3">
              <button className="min-h-11 rounded-soft bg-ink px-4 text-sm text-parchment">
                {editing ? "Update" : "Add category"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="text-sm"
                  onClick={() => {
                    setEditing(null);
                    setForm(blank);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
