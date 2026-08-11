"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ReturnRequest = {
  id: string;
  status: string;
  reason: string;
  notes: string | null;
  adminNotes: string | null;
  shiprocketReturnId: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
  };
};

export function ReturnManager() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/returns?status=${status}`);
    const payload = await response.json();
    setReturns(payload.data ?? []);
  }, [status]);
  useEffect(() => {
    void load();
  }, [load]);
  const act = async (id: string, action: "approve" | "reject" | "sync") => {
    const response = await fetch(`/api/admin/returns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNotes: notes[id] }),
    });
    const payload = await response.json();
    setNotice(
      payload.warning ??
        (response.ok ? "Return updated." : (payload.error ?? "Update failed.")),
    );
    if (response.ok) void load();
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Reverse logistics
          </p>
          <h1 className="mt-2 font-display text-4xl">Returns</h1>
        </div>
        <select
          className="h-11 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {["REQUESTED", "APPROVED", "REJECTED", "SHIPPED", "COMPLETED"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
      </div>
      {notice && <p className="mt-4 text-sm text-oxblood">{notice}</p>}
      <div className="mt-6 grid gap-4">
        {returns.map((request) => (
          <article
            key={request.id}
            className="rounded-soft-xl border border-sand-line bg-parchment p-5"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <Link
                  href={`/admin/orders/${request.order.id}`}
                  className="font-medium text-oxblood"
                >
                  {request.order.orderNumber}
                </Link>
                <p className="text-xs text-muted-ink">
                  {request.user.name ?? request.user.email} ·{" "}
                  {new Date(request.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span className="h-fit rounded-full bg-sand-line/50 px-3 py-1 text-xs">
                {request.status}
              </span>
            </div>
            <p className="mt-4 text-sm">
              <strong>Reason:</strong> {request.reason}
            </p>
            {request.notes && (
              <p className="mt-1 text-sm text-muted-ink">{request.notes}</p>
            )}
            <textarea
              className="mt-4 min-h-20 w-full rounded-soft border border-sand-line p-3 text-sm"
              placeholder="Internal decision notes"
              value={notes[request.id] ?? request.adminNotes ?? ""}
              onChange={(event) =>
                setNotes({ ...notes, [request.id]: event.target.value })
              }
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {request.status === "REQUESTED" && (
                <>
                  <button
                    onClick={() => act(request.id, "approve")}
                    className="min-h-10 rounded-soft bg-tulsi px-4 text-sm text-parchment"
                  >
                    Approve & sync
                  </button>
                  <button
                    onClick={() => act(request.id, "reject")}
                    className="min-h-10 rounded-soft bg-oxblood px-4 text-sm text-parchment"
                  >
                    Reject
                  </button>
                </>
              )}
              {request.status === "APPROVED" && !request.shiprocketReturnId && (
                <button
                  onClick={() => act(request.id, "sync")}
                  className="min-h-10 rounded-soft border border-sand-line px-4 text-sm"
                >
                  Retry Shiprocket sync
                </button>
              )}
              {request.shiprocketReturnId && (
                <span className="self-center text-xs text-tulsi">
                  Shiprocket return: {request.shiprocketReturnId}
                </span>
              )}
            </div>
          </article>
        ))}
        {!returns.length && (
          <p className="rounded-soft-xl border border-sand-line bg-parchment p-8 text-center text-sm text-muted-ink">
            No return requests found.
          </p>
        )}
      </div>
    </div>
  );
}
