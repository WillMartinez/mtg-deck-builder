"use client";

import { ScryfallCard } from "@/types/card";
import { RotateCw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CardDisplayProps {
  card: ScryfallCard;
  onClick?: () => void;
  showFlipIcon?: boolean;
  className?: string;
}

export function getCardImages(
  card: ScryfallCard,
): { front: string; back?: string } | null {
  // Single-faced card
  if (card.image_uris) {
    return { front: card.image_uris.normal };
  }

  // Double-faced card
  if (card.card_faces && card.card_faces.length >= 2) {
    return {
      front: card.card_faces[0]?.image_uris?.normal || "",
      back: card.card_faces[1]?.image_uris?.normal || "",
    };
  }

  return null;
}

export default function CardDisplay({
  card,
  onClick,
  showFlipIcon = true,
  className = "",
}: CardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const images = getCardImages(card);
  const isDoubleFaced = images?.back !== undefined;

  const handleImageClick = (e: React.MouseEvent) => {
    // Only flip if clicking the flip icon area, otherwise add to deck
    const target = e.target as HTMLElement;
    const isFlipIcon = target.closest(".flip-icon");

    if (isFlipIcon && isDoubleFaced && showFlipIcon) {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
    } else {
      onClick?.();
    }
  };

  return (
    <div className={className}>
      {images ? (
        <div
          className={`relative w-full aspect-5/7 mb-2 group cursor-pointer`}
          onClick={handleImageClick}
          title={
            isDoubleFaced && showFlipIcon
              ? "Click to add, click icon to flip"
              : undefined
          }
        >
          <Image
            src={isFlipped && images.back ? images.back : images.front}
            alt={card.name}
            fill
            className="object-contain rounded"
            unoptimized
          />
          {isDoubleFaced && showFlipIcon && (
            <div className="flip-icon absolute top-8 right-4 bg-black/30 text-white p-1.5 rounded-full group-hover:bg-black/50 transition-colors backdrop-blur-sm z-10">
              <RotateCw className="w-4 h-4" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-200 w-full aspect-5/7 flex items-center justify-center mb-2 rounded">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <h3 className="font-bold text-sm">{card.name}</h3>
      <p className="text-xs text-gray-600">{card.type_line}</p>
    </div>
  );
}
