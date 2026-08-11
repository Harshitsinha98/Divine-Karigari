import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  AccountCard,
  AccountSection,
} from "@/components/account/AccountSection";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function ReviewsPage() {
  const session = await getSessionUser();
  if (!session) return null;
  const reviews = await prisma.review.findMany({
    where: { userId: session.id },
    include: { product: { select: { name: true, slug: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <AccountSection eyebrow="Your voice" title="My reviews">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          A few words can help another thoughtful giver choose well.
        </p>
      </AccountSection>
      <div className="mt-10 grid gap-4">
        {reviews.length ? (
          reviews.map((review) => (
            <AccountCard key={review.id}>
              <div className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-soft">
                  <Image
                    src={review.product.images[0]}
                    alt={`${review.product.name} product image`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/shop/${review.product.slug}`}
                    className="font-display text-xl hover:text-oxblood"
                  >
                    {review.product.name}
                  </Link>
                  <div className="mt-2 flex gap-1 text-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        fill={star <= review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h3 className="mt-3 font-medium">{review.title}</h3>
                  )}
                  <p className="mt-2 text-sm leading-7 text-muted-ink">
                    {review.body}
                  </p>
                </div>
              </div>
            </AccountCard>
          ))
        ) : (
          <p className="text-sm text-muted-ink">
            Reviews you write after an order will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
