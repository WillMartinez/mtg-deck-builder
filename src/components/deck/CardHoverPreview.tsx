import { ScryfallCard } from "@/types/card";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getCardImages } from "./CardDisplay";

interface CardHoverPreviewProps {
  card: ScryfallCard;
  isLegal?: boolean;
  isGameChanger?: boolean;
  onRemove: () => void;
}

export default function CardHoverPreview({
  card,
  isLegal = true,
  isGameChanger = false,
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

        {/* Illegal card warning */}
        {!isLegal && (
          <div data-testid="card-isLegal-status" className="absolute bottom-1 left-1 bg-red-500 text-white text-xs px-1 rounded flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" />
            <span>Illegal</span>
          </div>
        )}

        {/* Remove button */}
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

        {/* Badges */}
        <div className="absolute bottom-1 left-1 flex gap-1">
          {!isLegal && (
            <div className="bg-red-500 text-white text-xs px-1 rounded flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Illegal</span>
            </div>
          )}
          {isGameChanger && isLegal && (
            <div className="bg-blue-500 text-white text-xs px-1 rounded flex items-center gap-0.5">
              <span>⭐</span>
              <span>Game Changer</span>
            </div>
          )}
        </div>

        {/* Hover preview - large card */}
        {showPreview && (
          <div className="fixed z-50 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-400px h-560px bg-white rounded-lg shadow-2xl border-4 border-gray-800">
              <Image
                src={images.front}
                alt={card.name}
                // fill // Use fill instead of width/height
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
                className="rounded-lg object-contain"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
