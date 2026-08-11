import Image from "next/image";

const images = [
  ["photo-1513475382585-d06e58bcb0e0", "A small note, beautifully kept"],
  ["photo-1604917877934-07d8d248d396", "Festive details"],
  ["photo-1603006905003-be475563bc59", "Light for the evenings"],
  ["photo-1610701596007-11502861dcfa", "Made for gathering"],
  ["photo-1612902456551-333ac5afa26e", "A little celebration"],
  ["photo-1523779917675-b6ed3a42a561", "Everyday heirlooms"],
];

export function SocialProofGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map(([id, alt]) => (
        <div
          key={id}
          className="relative aspect-square overflow-hidden rounded-soft-xl"
        >
          <Image
            src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
