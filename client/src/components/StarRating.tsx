import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = "md" 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={!interactive}
          className={`transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
