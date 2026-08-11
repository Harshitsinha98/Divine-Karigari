import {
  AccountCard,
  AccountSection,
} from "@/components/account/AccountSection";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function WalletPage() {
  const session = await getSessionUser();
  if (!session) return null;
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.id },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });
  return (
    <div>
      <AccountSection eyebrow="Store credit" title="My wallet">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          Refunds and gifting credits, kept close.
        </p>
      </AccountSection>
      <AccountCard className="mt-10 bg-tulsi text-parchment">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">
          Available balance
        </p>
        <p className="mt-3 font-display text-5xl">
          ₹{Number(wallet?.balance ?? 0).toLocaleString("en-IN")}
        </p>
      </AccountCard>
      <div className="mt-10">
        <h2 className="font-display text-3xl">Transaction history</h2>
        <div className="mt-5 grid gap-3">
          {wallet?.transactions.length ? (
            wallet.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-sand-line py-4"
              >
                <div>
                  <p className="text-sm">{transaction.description}</p>
                  <p className="mt-1 text-xs text-muted-ink">
                    {transaction.createdAt.toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span
                  className={
                    transaction.type === "DEBIT" ? "text-oxblood" : "text-tulsi"
                  }
                >
                  {transaction.type === "DEBIT" ? "−" : "+"}₹
                  {Number(transaction.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-ink">
              Wallet activity will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
