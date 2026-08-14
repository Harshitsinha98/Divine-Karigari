"use client";
import { useEffect, useState } from "react";
import { AccountCard } from "@/components/account/AccountSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { realEmailOrEmpty } from "@/lib/placeholder-email";
export function ProfileManager() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    notificationPreferences: {
      orderUpdates: true,
      giftingNotes: false,
      mobileUpdates: false,
    },
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    void fetch("/api/account/profile")
      .then((response) => response.json())
      .then(
        (result) =>
          result.data &&
          setProfile((current) => ({
            ...current,
            ...result.data,
            notificationPreferences: {
              ...current.notificationPreferences,
              ...(result.data.notificationPreferences ?? {}),
            },
          })),
      );
  }, []);
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setMessage(
      response.ok
        ? "Your details have been saved."
        : "Please check your details.",
    );
  };
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(password),
    });
    setMessage(
      response.ok ? "Password updated." : (await response.json()).error,
    );
    if (response.ok) setPassword({ currentPassword: "", newPassword: "" });
  };
  return (
    <div className="grid gap-6">
      <AccountCard>
        <h2 className="font-display text-2xl">Personal details</h2>
        <form onSubmit={saveProfile} className="mt-5 grid gap-3 sm:max-w-xl">
          <Input
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full name"
          />
          <Input
            disabled
            value={realEmailOrEmpty(profile.email)}
            placeholder="Email address"
          />
          <Input
            required
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone number"
          />
          <Button type="submit" className="justify-self-start">
            Save details
          </Button>
        </form>
      </AccountCard>
      <AccountCard>
        <h2 className="font-display text-2xl">Change password</h2>
        <form onSubmit={savePassword} className="mt-5 grid gap-3 sm:max-w-xl">
          <Input
            required
            type="password"
            value={password.currentPassword}
            onChange={(e) =>
              setPassword({ ...password, currentPassword: e.target.value })
            }
            placeholder="Current password"
          />
          <Input
            required
            minLength={10}
            type="password"
            value={password.newPassword}
            onChange={(e) =>
              setPassword({ ...password, newPassword: e.target.value })
            }
            placeholder="New password"
          />
          <Button
            type="submit"
            variant="outline"
            className="justify-self-start"
          >
            Update password
          </Button>
        </form>
      </AccountCard>
      <AccountCard>
        <h2 className="font-display text-2xl">Notifications</h2>
        <div className="mt-5 grid gap-4 text-sm">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={profile.notificationPreferences.orderUpdates}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  notificationPreferences: {
                    ...profile.notificationPreferences,
                    orderUpdates: e.target.checked,
                  },
                })
              }
            />{" "}
            Order and delivery updates
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={profile.notificationPreferences.mobileUpdates}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  notificationPreferences: {
                    ...profile.notificationPreferences,
                    mobileUpdates: e.target.checked,
                  },
                })
              }
            />{" "}
            SMS and WhatsApp order updates
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={profile.notificationPreferences.giftingNotes}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  notificationPreferences: {
                    ...profile.notificationPreferences,
                    giftingNotes: e.target.checked,
                  },
                })
              }
            />{" "}
            Occasional gifting notes
          </label>
          <Button
            onClick={saveProfile}
            variant="ghost"
            className="justify-self-start"
          >
            Save preferences
          </Button>
        </div>
      </AccountCard>
      {message && <p className="text-sm text-tulsi">{message}</p>}
    </div>
  );
}
