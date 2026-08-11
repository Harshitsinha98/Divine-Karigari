import { AccountSection } from "@/components/account/AccountSection";
import { AddressesManager } from "@/components/account/AddressesManager";
export default function AddressesPage() {
  return (
    <div>
      <AccountSection eyebrow="For easy checkout" title="Saved addresses">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          Keep the places and people you gift close at hand.
        </p>
      </AccountSection>
      <div className="mt-10">
        <AddressesManager />
      </div>
    </div>
  );
}
