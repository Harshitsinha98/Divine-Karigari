"use client";
import { FormEvent, useEffect, useState } from "react";

type Staff = {
  id: string;
  role: "SUPER_ADMIN" | "ORDER_MANAGER" | "INVENTORY_MANAGER";
  active: boolean;
  user: { name: string | null; email: string; createdAt: string };
};

export function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ORDER_MANAGER",
  });
  const load = async () => {
    const response = await fetch("/api/admin/staff");
    const payload = await response.json();
    setStaff(payload.data ?? []);
  };
  useEffect(() => {
    void load();
  }, []);
  const add = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setNotice(
      response.ok ? "Staff account added." : (payload.error ?? "Add failed."),
    );
    if (response.ok) {
      setForm({ name: "", email: "", password: "", role: "ORDER_MANAGER" });
      void load();
    }
  };
  const update = async (
    id: string,
    input: { role?: Staff["role"]; active?: boolean },
  ) => {
    const response = await fetch(`/api/admin/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await response.json();
    setNotice(
      response.ok
        ? "Staff access updated."
        : (payload.error ?? "Update failed."),
    );
    if (response.ok) void load();
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
        Access control
      </p>
      <h1 className="mt-2 font-display text-4xl">Staff</h1>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
              <tr>
                <th className="p-4">Staff member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-sand-line/70 last:border-0"
                >
                  <td className="p-4">
                    <p className="font-medium">
                      {member.user.name ?? "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-ink">
                      {member.user.email}
                    </p>
                  </td>
                  <td className="p-4">
                    <select
                      className="h-10 rounded-soft border border-sand-line bg-parchment px-2 text-xs"
                      value={member.role}
                      onChange={(event) =>
                        update(member.id, {
                          role: event.target.value as Staff["role"],
                        })
                      }
                    >
                      <option value="SUPER_ADMIN">Super admin</option>
                      <option value="ORDER_MANAGER">Order manager</option>
                      <option value="INVENTORY_MANAGER">
                        Inventory manager
                      </option>
                    </select>
                  </td>
                  <td className="p-4">
                    {member.active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        update(member.id, { active: !member.active })
                      }
                      className="text-oxblood"
                    >
                      {member.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={add}
          className="h-fit rounded-soft-xl border border-sand-line bg-parchment p-5"
        >
          <h2 className="font-display text-2xl">Add staff member</h2>
          {notice && <p className="mt-3 text-sm text-tulsi">{notice}</p>}
          <div className="mt-4 grid gap-3">
            <input
              required
              placeholder="Full name"
              className="h-11 rounded-soft border border-sand-line px-3 text-sm"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
            <input
              required
              type="email"
              placeholder="Work email"
              className="h-11 rounded-soft border border-sand-line px-3 text-sm"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
            <input
              required
              minLength={10}
              type="password"
              placeholder="Temporary password"
              className="h-11 rounded-soft border border-sand-line px-3 text-sm"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            <select
              className="h-11 rounded-soft border border-sand-line px-3 text-sm"
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value })
              }
            >
              <option value="ORDER_MANAGER">Order manager</option>
              <option value="INVENTORY_MANAGER">Inventory manager</option>
              <option value="SUPER_ADMIN">Super admin</option>
            </select>
            <button className="min-h-11 rounded-soft bg-ink px-4 text-sm text-parchment">
              Create staff account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
