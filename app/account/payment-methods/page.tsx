import { AccountSection } from "@/components/account/AccountSection";
import { PaymentMethodsManager } from "@/components/account/PaymentMethodsManager";
export default function PaymentMethodsPage() {
  return (
    <div>
      <AccountSection eyebrow="Ready for checkout" title="Payment methods">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          Your saved cards and UPI details, kept private and ready.
        </p>
      </AccountSection>
      <div className="mt-10">
        <PaymentMethodsManager />
      </div>
    </div>
  );
}
