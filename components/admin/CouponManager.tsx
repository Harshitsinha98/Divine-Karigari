"use client";
import { FormEvent, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  value: number;
  minimumOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
};
type CouponForm = {
  code: string;
  description: string;
  discountType: string;
  value: number;
  minimumOrder: string | number;
  maxDiscount: string | number;
  usageLimit: string | number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};
const blank: CouponForm = {
  code: "",
  description: "",
  discountType: "percentage",
  value: 10,
  minimumOrder: "",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  active: true,
};
const localDate = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponForm>(blank);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [notice, setNotice] = useState("");
  const load = async () => {
    const response = await fetch("/api/admin/coupons");
    const payload = await response.json();
    setCoupons(payload.data ?? []);
  };
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      value: Number(form.value),
      minimumOrder: form.minimumOrder === "" ? null : Number(form.minimumOrder),
      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    const response = await fetch(
      editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    setNotice(response.ok ? "Coupon saved." : (result.error ?? "Save failed."));
    if (response.ok) {
      setEditing(null);
      setForm(blank);
      void load();
    }
  };
  const edit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description ?? "",
      discountType: coupon.discountType,
      value: coupon.value,
      minimumOrder: coupon.minimumOrder ?? "",
      maxDiscount: coupon.maxDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      startsAt: localDate(coupon.startsAt),
      expiresAt: localDate(coupon.expiresAt),
      active: coupon.active,
    });
  };
  const deactivate = async (id: string) => {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    void load();
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
        Promotions
      </p>
      <h1 className="mt-2 font-display text-4xl">Coupons</h1>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-sand-line/70 last:border-0"
                >
                  <td className="p-4">
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-xs text-muted-ink">
                      {coupon.description}
                    </p>
                  </td>
                  <td className="p-4">
                    {coupon.discountType === "percentage"
                      ? `${coupon.value}%`
                      : `₹${coupon.value}`}
                  </td>
                  <td className="p-4">
                    {coupon.usedCount}/{coupon.usageLimit ?? "∞"}
                  </td>
                  <td className="p-4">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("en-IN")
                      : "No expiry"}
                  </td>
                  <td className="p-4">
                    {coupon.active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => edit(coupon)}
                      className="mr-3 text-oxblood"
                    >
                      Edit
                    </button>
                    {coupon.active && (
                      <button
                        onClick={() => deactivate(coupon.id)}
                        className="text-muted-ink"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={submit}
          className="h-fit rounded-soft-xl border border-sand-line bg-parchment p-5"
        >
          <h2 className="font-display text-2xl">
            {editing ? "Edit coupon" : "New coupon"}
          </h2>
          {notice && <p className="mt-3 text-sm text-tulsi">{notice}</p>}
          <div className="mt-4 grid gap-3">
            <input
              required
              placeholder="Code"
              className="h-11 rounded-soft border border-sand-line px-3 text-sm uppercase"
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
            />
            <input
              placeholder="Description"
              className="h-11 rounded-soft border border-sand-line px-3 text-sm"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-11 rounded-soft border border-sand-line px-3 text-sm"
                value={form.discountType}
                onChange={(event) =>
                  setForm({ ...form, discountType: event.target.value })
                }
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                placeholder="Value"
                className="h-11 rounded-soft border border-sand-line px-3 text-sm"
                value={form.value}
                onChange={(event) =>
                  setForm({ ...form, value: Number(event.target.value) })
                }
              />
            </div>
            {[
              ["minimumOrder", "Minimum order"],
              ["maxDiscount", "Maximum discount"],
              ["usageLimit", "Usage limit"],
            ].map(([key, label]) => (
              <input
                key={key}
                min="0"
                type="number"
                placeholder={label}
                className="h-11 rounded-soft border border-sand-line px-3 text-sm"
                value={String(form[key as keyof typeof form])}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            ))}
            <label className="text-sm">
              Starts
              <input
                type="datetime-local"
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.startsAt}
                onChange={(event) =>
                  setForm({ ...form, startsAt: event.target.value })
                }
              />
            </label>
            <label className="text-sm">
              Expires
              <input
                type="datetime-local"
                className="mt-1 h-11 w-full rounded-soft border border-sand-line px-3"
                value={form.expiresAt}
                onChange={(event) =>
                  setForm({ ...form, expiresAt: event.target.value })
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
              />
              Active
            </label>
            <div className="flex gap-3">
              <button className="min-h-11 rounded-soft bg-ink px-4 text-sm text-parchment">
                Save coupon
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm(blank);
                  }}
                  className="text-sm"
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
