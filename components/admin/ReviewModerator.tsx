"use client";
import { useCallback, useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  approved: boolean;
  rejectedAt: string | null;
  adminReply: string | null;
  createdAt: string;
  product: { name: string };
  user: { name: string | null; email: string };
};

export function ReviewModerator() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState("pending");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/reviews?status=${status}`);
    const payload = await response.json();
    setReviews(payload.data ?? []);
  }, [status]);
  useEffect(() => {
    void load();
  }, [load]);
  const act = async (id: string, action: "approve" | "reject" | "reply") => {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reply: replies[id] }),
    });
    const payload = await response.json();
    setNotice(
      response.ok ? "Review updated." : (payload.error ?? "Update failed."),
    );
    if (response.ok) void load();
  };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Community
          </p>
          <h1 className="mt-2 font-display text-4xl">Reviews</h1>
        </div>
        <select
          className="h-11 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All reviews</option>
        </select>
      </div>
      {notice && <p className="mt-4 text-sm text-tulsi">{notice}</p>}
      <div className="mt-6 grid gap-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-soft-xl border border-sand-line bg-parchment p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-medium">{review.product.name}</p>
                <p className="text-xs text-muted-ink">
                  {review.user.name ?? review.user.email} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span className="text-gold">
                {"★".repeat(review.rating)}
                <span className="text-sand-line">
                  {"★".repeat(5 - review.rating)}
                </span>
              </span>
            </div>
            {review.title && (
              <h2 className="mt-4 font-medium">{review.title}</h2>
            )}
            <p className="mt-2 text-sm text-muted-ink">
              {review.body ?? "No written review."}
            </p>
            {review.adminReply && (
              <div className="mt-4 rounded-soft bg-sand-line/25 p-3 text-sm">
                <strong>Divine Karigari:</strong> {review.adminReply}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => act(review.id, "approve")}
                className="min-h-10 rounded-soft bg-tulsi px-4 text-sm text-parchment"
              >
                Approve
              </button>
              <button
                onClick={() => act(review.id, "reject")}
                className="min-h-10 rounded-soft bg-oxblood px-4 text-sm text-parchment"
              >
                Reject
              </button>
              <input
                className="h-10 min-w-64 flex-1 rounded-soft border border-sand-line px-3 text-sm"
                placeholder="Write a public brand reply"
                value={replies[review.id] ?? review.adminReply ?? ""}
                onChange={(event) =>
                  setReplies({ ...replies, [review.id]: event.target.value })
                }
              />
              <button
                onClick={() => act(review.id, "reply")}
                className="min-h-10 rounded-soft border border-sand-line px-4 text-sm"
              >
                Save reply
              </button>
            </div>
          </article>
        ))}
        {!reviews.length && (
          <p className="rounded-soft-xl border border-sand-line bg-parchment p-8 text-center text-sm text-muted-ink">
            No reviews in this queue.
          </p>
        )}
      </div>
    </div>
  );
}
