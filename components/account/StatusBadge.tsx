import { Badge } from "@/components/ui/Badge";
export function StatusBadge({ status }: { status: string }) {
  const label = status.toLowerCase().replaceAll("_", " ");
  const green = ["delivered", "confirmed"].includes(label);
  return (
    <Badge
      className={
        green
          ? "border-tulsi/30 bg-tulsi/10 text-tulsi"
          : label === "cancelled" || label === "returned" || label === "rto"
            ? "border-oxblood/30 bg-oxblood/10 text-oxblood"
            : ""
      }
    >
      {label}
    </Badge>
  );
}
