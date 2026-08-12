"use client";

import { CheckCircle2, Clock, Package, Truck, RotateCcw } from "lucide-react";

type ReturnEvent = {
  id: string;
  status: string;
  title: string;
  description: string | null;
  location: string | null;
  happenedAt: string;
};

type ReturnData = {
  status: string;
  reason: string;
  notes: string | null;
  photos: string[];
  returnAwb: string | null;
  returnCourier: string | null;
  adminNotes: string | null;
  createdAt: string;
  trackingEvents: ReturnEvent[];
};

const RETURN_STAGES = [
  { key: "REQUESTED", label: "Requested", icon: RotateCcw },
  { key: "APPROVED", label: "Approved", icon: CheckCircle2 },
  { key: "SHIPPED", label: "Picked Up", icon: Truck },
  { key: "COMPLETED", label: "Returned", icon: Package },
];

export function ReturnTracking({ returnData }: { returnData: ReturnData }) {
  const currentIndex = RETURN_STAGES.findIndex(
    (s) => s.key === returnData.status,
  );
  const isRejected = returnData.status === "REJECTED";

  return (
    <div className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft">
      <h3 className="font-display text-2xl">Return Status</h3>

      {isRejected ? (
        <div className="mt-4 rounded-soft border border-oxblood/20 bg-oxblood/5 p-4 text-sm text-oxblood">
          <p className="font-medium">Return request was rejected</p>
          {returnData.adminNotes && (
            <p className="mt-2 text-muted-ink">{returnData.adminNotes}</p>
          )}
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mt-6 flex items-center justify-between">
            {RETURN_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const active = i <= currentIndex;
              return (
                <div key={stage.key} className="flex flex-1 flex-col items-center">
                  <div className="relative flex w-full items-center justify-center">
                    {i > 0 && (
                      <div
                        className={`absolute left-0 right-1/2 top-1/2 h-0.5 -translate-y-1/2 ${
                          i <= currentIndex ? "bg-gold" : "bg-sand-line"
                        }`}
                      />
                    )}
                    {i < RETURN_STAGES.length - 1 && (
                      <div
                        className={`absolute left-1/2 right-0 top-1/2 h-0.5 -translate-y-1/2 ${
                          i < currentIndex ? "bg-gold" : "bg-sand-line"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        active
                          ? "border-gold bg-gold text-parchment"
                          : "border-sand-line bg-parchment text-muted-ink"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-center text-xs ${
                      active ? "font-medium text-ink" : "text-muted-ink"
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AWB info */}
          {returnData.returnAwb && (
            <div className="mt-6 border-t border-sand-line pt-4 text-sm">
              <p className="text-muted-ink">
                Return AWB:{" "}
                <span className="font-medium text-ink">
                  {returnData.returnAwb}
                </span>
              </p>
              {returnData.returnCourier && (
                <p className="mt-1 text-muted-ink">
                  Courier:{" "}
                  <span className="font-medium text-ink">
                    {returnData.returnCourier}
                  </span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Tracking events timeline */}
      {returnData.trackingEvents.length > 0 && (
        <div className="mt-6 border-t border-sand-line pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">
            Return updates
          </p>
          <div className="mt-4 grid gap-4">
            {returnData.trackingEvents.map((event) => (
              <div key={event.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-muted-ink">{event.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-ink">
                    {event.location ? `${event.location} · ` : ""}
                    {new Date(event.happenedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos submitted */}
      {returnData.photos.length > 0 && (
        <div className="mt-6 border-t border-sand-line pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">
            Photos submitted
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {returnData.photos.map((url, i) => (
              <div
                key={i}
                className="h-16 w-16 overflow-hidden rounded-soft border border-sand-line"
              >
                <img
                  src={url}
                  alt={`Return photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="mt-6 border-t border-sand-line pt-4 text-sm text-muted-ink">
        <p>
          <span className="font-medium text-ink">Reason:</span>{" "}
          {returnData.reason}
        </p>
        {returnData.notes && (
          <p className="mt-1">
            <span className="font-medium text-ink">Details:</span>{" "}
            {returnData.notes}
          </p>
        )}
      </div>
    </div>
  );
}
