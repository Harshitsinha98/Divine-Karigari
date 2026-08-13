"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Phone, ShieldAlert } from "lucide-react";
import { AccountCard } from "@/components/account/AccountSection";
import { Button } from "@/components/ui/Button";

type Profile = {
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  authProvider: string | null;
};

export function VerificationManager() {
  const [profile, setProfile] = useState<Profile | null>(null);

  // Email verification state
  const [emailInput, setEmailInput] = useState("");
  const [emailStep, setEmailStep] = useState<"idle" | "code">("idle");
  const [emailCode, setEmailCode] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");

  // Phone verification state
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setEmailInput(res.data.email ?? "");
          const digits = (res.data.phone ?? "").replace(/^\+91/, "");
          setPhoneInput(digits);
        }
      });

  useEffect(() => {
    void load();
  }, []);

  if (!profile) return null;

  // ── Email verification ──
  const sendEmailCode = async () => {
    setEmailErr("");
    setEmailMsg("");
    setBusy(true);
    const res = await fetch("/api/account/verify/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setEmailErr(data.error ?? "Unable to send code.");
      return;
    }
    setEmailStep("code");
    setEmailMsg(
      data.data?.devCode
        ? `Dev code: ${data.data.devCode}`
        : "Verification code sent to your email.",
    );
  };

  const confirmEmailCode = async () => {
    setEmailErr("");
    setBusy(true);
    const res = await fetch("/api/account/verify/email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: emailCode }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setEmailErr(data.error ?? "Verification failed.");
      return;
    }
    setEmailStep("idle");
    setEmailCode("");
    setEmailMsg("Email verified!");
    void load();
  };

  // ── Phone verification (Firebase) ──
  const phoneValid = /^[6-9]\d{9}$/.test(phoneInput);
  const fullPhone = `+91${phoneInput}`;

  const sendPhoneOtp = async () => {
    if (!phoneValid) {
      setPhoneErr("Enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneErr("");
    setPhoneMsg("");
    setBusy(true);
    try {
      const { auth } = await import("@/lib/firebase/config");
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import(
        "firebase/auth"
      );
      const w = window as unknown as Record<string, unknown>;
      if (w.__recaptchaVerifierAcc) {
        try {
          (w.__recaptchaVerifierAcc as { clear: () => void }).clear();
        } catch {}
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-acc", {
        size: "invisible",
      });
      w.__recaptchaVerifierAcc = verifier;
      await verifier.render();
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      w.__confirmAcc = result;
      setPhoneSent(true);
      setPhoneMsg(`OTP sent to ${fullPhone}.`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setPhoneErr(e.message ?? "Unable to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const confirmPhoneOtp = async () => {
    setPhoneErr("");
    setBusy(true);
    try {
      const w = window as unknown as Record<string, unknown>;
      const confirmation =
        w.__confirmAcc as import("firebase/auth").ConfirmationResult;
      if (!confirmation) {
        setPhoneErr("Session expired. Request a new OTP.");
        setPhoneSent(false);
        setBusy(false);
        return;
      }
      const cred = await confirmation.confirm(phoneCode);
      const res = await fetch("/api/account/verify/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cred.user.phoneNumber, uid: cred.user.uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneErr(data.error ?? "Verification failed.");
        setBusy(false);
        return;
      }
      setPhoneSent(false);
      setPhoneCode("");
      setPhoneMsg("Phone verified!");
      void load();
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setPhoneErr(
        e.code === "auth/invalid-verification-code"
          ? "Invalid OTP."
          : (e.message ?? "Verification failed."),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountCard>
      <div className="flex items-center gap-2">
        <ShieldAlert size={18} className="text-gold" />
        <h2 className="font-display text-2xl">Account verification</h2>
      </div>
      <p className="mt-2 text-sm text-muted-ink">
        Verify both your email and phone for a secure account and smoother
        checkout.
      </p>

      <div className="mt-6 grid gap-4">
        {/* EMAIL */}
        <div className="rounded-soft-xl border border-sand-line bg-parchment p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-ink" />
              <span className="text-sm font-medium">
                {profile.email || "No email"}
              </span>
            </div>
            {profile.emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tulsi/10 px-3 py-1 text-xs font-medium text-tulsi">
                <CheckCircle2 size={13} /> Verified
              </span>
            ) : (
              <span className="rounded-full bg-oxblood/10 px-3 py-1 text-xs font-medium text-oxblood">
                Not verified
              </span>
            )}
          </div>

          {!profile.emailVerified && (
            <div className="mt-4">
              {emailStep === "idle" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Your email address"
                    className="h-11 flex-1 rounded-soft border border-sand-line bg-parchment px-3 text-sm outline-none focus:border-gold"
                  />
                  <Button
                    type="button"
                    onClick={sendEmailCode}
                    disabled={busy || !emailInput}
                  >
                    Send code
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailCode}
                    onChange={(e) =>
                      setEmailCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="6-digit code"
                    className="h-11 flex-1 rounded-soft border border-sand-line bg-parchment px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-gold"
                  />
                  <Button
                    type="button"
                    onClick={confirmEmailCode}
                    disabled={busy || emailCode.length !== 6}
                  >
                    Verify
                  </Button>
                </div>
              )}
              {emailMsg && <p className="mt-2 text-xs text-tulsi">{emailMsg}</p>}
              {emailErr && (
                <p className="mt-2 text-xs text-oxblood">{emailErr}</p>
              )}
            </div>
          )}
        </div>

        {/* PHONE */}
        <div className="rounded-soft-xl border border-sand-line bg-parchment p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-muted-ink" />
              <span className="text-sm font-medium">
                {profile.phone || "No phone number"}
              </span>
            </div>
            {profile.phoneVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tulsi/10 px-3 py-1 text-xs font-medium text-tulsi">
                <CheckCircle2 size={13} /> Verified
              </span>
            ) : (
              <span className="rounded-full bg-oxblood/10 px-3 py-1 text-xs font-medium text-oxblood">
                Not verified
              </span>
            )}
          </div>

          {!profile.phoneVerified && (
            <div className="mt-4">
              {!phoneSent ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-stretch overflow-hidden rounded-soft border border-sand-line bg-parchment">
                    <span className="flex items-center border-r border-sand-line bg-sand-line/20 px-3 text-sm">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phoneInput}
                      onChange={(e) =>
                        setPhoneInput(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="98765 43210"
                      className="h-11 flex-1 bg-transparent px-3 text-sm outline-none"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={sendPhoneOtp}
                    disabled={busy || !phoneValid}
                  >
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={phoneCode}
                    onChange={(e) =>
                      setPhoneCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="6-digit OTP"
                    className="h-11 flex-1 rounded-soft border border-sand-line bg-parchment px-3 text-center text-sm tracking-[0.3em] outline-none focus:border-gold"
                  />
                  <Button
                    type="button"
                    onClick={confirmPhoneOtp}
                    disabled={busy || phoneCode.length !== 6}
                  >
                    Verify
                  </Button>
                </div>
              )}
              {phoneMsg && <p className="mt-2 text-xs text-tulsi">{phoneMsg}</p>}
              {phoneErr && (
                <p className="mt-2 text-xs text-oxblood">{phoneErr}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invisible reCAPTCHA for phone OTP */}
      <div id="recaptcha-acc" />
    </AccountCard>
  );
}
