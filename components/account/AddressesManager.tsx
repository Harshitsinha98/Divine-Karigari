"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AccountCard } from "@/components/account/AccountSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StateCitySelect } from "@/components/shop/StateCitySelect";
type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};
const blank = {
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};
export function AddressesManager() {
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const load = async () => {
    const response = await fetch("/api/account/addresses");
    if (response.ok) setItems((await response.json()).data);
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch(
      editing ? `/api/account/addresses/${editing}` : "/api/account/addresses",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    setForm(blank);
    setEditing(null);
    void load();
  };
  const edit = (item: Address) => {
    setEditing(item.id);
    setForm({ ...item, line2: item.line2 ?? "" });
  };
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <AccountCard key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{item.label}</h2>
                  {item.isDefault && (
                    <span className="text-xs text-tulsi">Default</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-ink">
                  {item.recipientName}
                  <br />
                  {item.line1}
                  {item.line2 && (
                    <>
                      <br />
                      {item.line2}
                    </>
                  )}
                  <br />
                  {item.city}, {item.state} {item.postalCode}
                  <br />
                  {item.phone}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => edit(item)}
                  aria-label="Edit address"
                  className="rounded-full border border-sand-line p-2 hover:text-gold"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/account/addresses/${item.id}`, {
                      method: "DELETE",
                    });
                    void load();
                  }}
                  aria-label="Delete address"
                  className="rounded-full border border-sand-line p-2 hover:text-oxblood"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </AccountCard>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-ink">No saved addresses yet.</p>
        )}
      </div>
      <AccountCard>
        <h2 className="font-display text-2xl">
          {editing ? "Edit address" : "Add an address"}
        </h2>
        <form onSubmit={save} className="mt-5 grid gap-3">
          {["label", "recipientName", "phone", "line1", "line2"].map(
            (field) => (
              <Input
                key={field}
                required={field !== "line2"}
                placeholder={
                  field === "recipientName"
                    ? "Recipient name"
                    : field[0].toUpperCase() + field.slice(1)
                }
                value={form[field as keyof typeof form] as string}
                onChange={(event) =>
                  setForm({ ...form, [field]: event.target.value })
                }
              />
            ),
          )}
          <StateCitySelect
            state={form.state}
            city={form.city}
            onStateChange={(state) => setForm({ ...form, state })}
            onCityChange={(city) => setForm({ ...form, city })}
          />
          <Input
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="Postal code (6-digit pincode)"
            value={form.postalCode}
            onChange={(event) =>
              setForm({
                ...form,
                postalCode: event.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) =>
                setForm({ ...form, isDefault: event.target.checked })
              }
            />{" "}
            Make default
          </label>
          <div className="flex gap-2">
            <Button type="submit">Save address</Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </AccountCard>
    </div>
  );
}
