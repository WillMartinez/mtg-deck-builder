import { ScryfallCard } from "@/types/card";
import Image from "next/image";
import { useState } from "react";
import { getCardImages } from "./CardDisplay";

interface CardHoverPreviewProps {
  card: ScryfallCard;
  onRemove: () => void;
}

export default function CardHoverPreview({
  card,
  onRemove,
}: CardHoverPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const images = getCardImages(card);

  if (!images) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      {/* Small card thumbnail */}
      <div className="relative w-full aspect-5/7 rounded overflow-hidden group cursor-pointer">
        <Image
          src={images.front}
          alt={card.name}
          fill
          className="object-cover"
          unoptimized
        />
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
            title="Remove card"
          >
            ×
          </button>
        )}
      </div>

      {/* Hover preview - large card */}
      {showPreview && (
        <div className="fixed z-50 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white rounded-lg shadow-2xl border-4 border-gray-800">
            <Image
              src={images.front}
              alt={card.name}
              width={400}
              height={560}
              className="rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
