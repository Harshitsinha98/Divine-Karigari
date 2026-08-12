"use client";

import { useState } from "react";
import { Camera, X, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const RETURN_REASONS = [
  "Product damaged during shipping",
  "Wrong item received",
  "Product quality not as expected",
  "Size/color doesn't match description",
  "Changed my mind",
  "Product defective/not working",
  "Other",
];

export function ReturnForm({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed.");
        return;
      }
      const { data } = await res.json();
      setPhotos((prev) => [...prev, data.url]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!reason) {
      setError("Please select a reason for return.");
      return;
    }
    if (photos.length === 0) {
      setError("Please upload at least one photo of the product.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch(`/api/account/orders/${orderId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, notes: notes || undefined, photos }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Unable to submit return request.");
      return;
    }
    setSuccess(true);
    onSuccess?.();
  };

  if (success)
    return (
      <div className="rounded-soft-xl border border-tulsi/20 bg-tulsi/5 p-6 text-center">
        <p className="font-display text-xl text-tulsi">
          Return request submitted!
        </p>
        <p className="mt-2 text-sm text-muted-ink">
          We&apos;ll review your request within 24-48 hours and notify you.
        </p>
      </div>
    );

  return (
    <div className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft">
      <h3 className="font-display text-2xl">Request a Return</h3>
      <p className="mt-2 text-sm text-muted-ink">
        Please tell us why you&apos;d like to return and upload photos of the
        product.
      </p>

      {/* Reason selection */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-ink">
          Reason for return <span className="text-oxblood">*</span>
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-12 w-full rounded-soft border border-sand-line bg-parchment px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
        >
          <option value="">Select a reason</option>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-ink">
          Additional details (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe the issue in detail..."
          maxLength={1000}
          rows={3}
          className="w-full rounded-soft border border-sand-line bg-parchment px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-ink/60 focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {/* Photo upload */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-ink">
          Upload photos <span className="text-oxblood">*</span>
          <span className="ml-1 text-xs font-normal text-muted-ink">
            (min 1, max 5)
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div
              key={i}
              className="relative h-20 w-20 overflow-hidden rounded-soft border border-sand-line"
            >
              <img
                src={url}
                alt={`Return photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-parchment"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-soft border-2 border-dashed border-sand-line text-muted-ink transition hover:border-gold hover:text-gold">
              {uploading ? (
                <Upload size={18} className="animate-pulse" />
              ) : (
                <Camera size={18} />
              )}
              <span className="text-[10px]">
                {uploading ? "Uploading" : "Add photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-oxblood">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        onClick={submit}
        disabled={loading || !reason || photos.length === 0}
        className="mt-6 w-full"
      >
        {loading ? "Submitting..." : "Submit Return Request"}
      </Button>
    </div>
  );
}
