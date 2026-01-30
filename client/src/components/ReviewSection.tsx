import { useState, useEffect } from "react";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { useLanguage } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

interface Review {
  id: number;
  author: string;
  rating: number;
  title?: string;
  comment: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  userId: number;
  currentUserId?: number;
  isAdmin?: boolean;
}

interface ReviewSectionProps {
  productId: number;
  currentUserId?: number;
  isAdmin?: boolean;
}

export function ReviewSection({ productId, currentUserId, isAdmin }: ReviewSectionProps) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          ...data,
        }),
      });

      if (response.ok) {
        await fetchReviews();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error("Failed to like review:", error);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const handleEditReview = async (reviewId: number, data: { rating: number; title: string; comment: string }) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchReviews();
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {t("averageRating") || "متوسط التقييم"}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-yellow-500">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("outOf5") || "من 5"} ({reviews.length} {t("reviews") || "تقييم"})
            </span>
          </div>
        </div>
      )}

      {/* Review Form */}
      {currentUserId && (
        <ReviewForm productId={productId} onSubmit={handleSubmitReview} isLoading={isSubmitting} />
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("reviews") || "التقييمات"} ({reviews.length})
          </h3>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              id={review.id}
              author={review.author}
              rating={review.rating}
              title={review.title}
              comment={review.comment}
              likes={review.likes}
              isLiked={review.isLiked}
              createdAt={review.createdAt}
              isOwner={review.userId === currentUserId}
              isAdmin={isAdmin || false}
              onLike={() => handleLikeReview(review.id)}
              onDelete={() => handleDeleteReview(review.id)}
              onEdit={(data) => handleEditReview(review.id, data)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>{t("noReviews") || "لا توجد تقييمات حتى الآن"}</p>
        </div>
      )}
    </div>
  );
}
