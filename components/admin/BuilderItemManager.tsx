"use client";
import { FormEvent, useEffect, useState } from "react";
import { guessEmoji } from "@/lib/builder";

type BuilderItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  bouquet: boolean;
  giftbox: boolean;
  active: boolean;
};

const blank = {
  name: "",
  imageUrl: "",
  price: 0,
  bouquet: true,
  giftbox: true,
  active: true,
};

export function BuilderItemManager() {
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<BuilderItem | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/builder-items");
    const payload = await res.json();
    setItems(payload.data ?? []);
  };
  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const endpoint = editing
      ? `/api/admin/builder-items/${editing.id}`
      : "/api/admin/builder-items";
    const response = await fetch(endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setNotice(result.error ?? "Unable to save item.");
    setNotice(editing ? "Item updated." : "Item added.");
    setEditing(null);
    setForm(blank);
    void load();
  };

  const edit = (item: BuilderItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      imageUrl: item.imageUrl ?? "",
      price: item.price,
      bouquet: item.bouquet,
      giftbox: item.giftbox,
      active: item.active,
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this item from the gift builder?")) return;
    const response = await fetch(`/api/admin/builder-items/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    setNotice(
      response.ok ? "Item removed." : (result.error ?? "Unable to remove."),
    );
    void load();
  };

  const loadStarter = async () => {
    setBusy(true);
    const response = await fetch("/api/admin/builder-items/starter", {
      method: "POST",
    });
    const result = await response.json();
    setBusy(false);
    setNotice(
      response.ok
        ? "Starter kit loaded (teddy, chocolate, pen, clutcher, scrunchy)."
        : (result.error ?? "Unable to load starter kit."),
    );
    void load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Gifting studio
          </p>
          <h1 className="mt-2 font-display text-4xl">Gift Builder</h1>
          <p className="mt-1 text-sm text-muted-ink">
            Items customers can add to a custom bouquet or gift box. Prices set
            here update the builder total live.
          </p>
        </div>
        <button
          onClick={loadStarter}
          disabled={busy}
          className="min-h-11 rounded-soft border border-gold bg-gold/10 px-4 text-sm font-medium text-oxblood disabled:opacity-60"
        >
          Load starter kit
        </button>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Price</th>
                <th className="p-4">Builders</th>
                <th className="p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td className="p-6 text-muted-ink" colSpan={5}>
                    No builder items yet. Add one on the right, or click
                    &ldquo;Load starter kit&rdquo;.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr
                  className="border-b border-sand-line/70 last:border-0"
                  key={item.id}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-soft bg-cream text-xl">
                        {guessEmoji(item.name)}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4">₹{item.price.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-xs">
                    {[item.bouquet && "Bouquet", item.giftbox && "Gift Box"]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        item.active ? "text-tulsi" : "text-muted-ink"
                      }
                    >
                      {item.active ? "Active" : "Hidden"}
                    </span>
                  </td>
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
            {editing ? "Edit item" : "Add item"}
          </h2>
          {notice && <p className="mt-3 text-sm text-oxblood">{notice}</p>}
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              Name
              <input
                required
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              Price (₹)
              <input
                required
                type="number"
                min="0"
                step="1"
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: Number(event.target.value) })
                }
              />
            </label>
            <label className="block text-sm">
              Image URL (optional)
              <input
                type="url"
                placeholder="https://..."
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm({ ...form, imageUrl: event.target.value })
                }
              />
              <span className="mt-1 block text-xs text-muted-ink">
                Leave empty to show a friendly emoji tile automatically.
              </span>
            </label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.bouquet}
                  onChange={(event) =>
                    setForm({ ...form, bouquet: event.target.checked })
                  }
                />{" "}
                In Bouquet
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.giftbox}
                  onChange={(event) =>
                    setForm({ ...form, giftbox: event.target.checked })
                  }
                />{" "}
                In Gift Box
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({ ...form, active: event.target.checked })
                  }
                />{" "}
                Active
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                disabled={busy}
                className="min-h-11 rounded-soft bg-ink px-4 text-sm text-parchment disabled:opacity-60"
              >
                {editing ? "Update" : "Add item"}
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
