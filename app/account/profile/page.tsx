import { AccountSection } from "@/components/account/AccountSection";
import { ProfileManager } from "@/components/account/ProfileManager";
import { VerificationManager } from "@/components/account/VerificationManager";
export default function ProfilePage() {
  return (
    <div>
      <AccountSection eyebrow="Your details" title="Profile settings">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          Keep your details and preferences up to date.
        </p>
      </AccountSection>
      <div className="mt-10 grid gap-6">
        <VerificationManager />
        <ProfileManager />
      </div>
    </div>
  );
}
