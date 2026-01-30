import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { useLanguage } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: number;
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ReviewForm({ productId, onSubmit, isLoading = false }: ReviewFormProps) {
  const { t, language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError(t("selectRating") || "من فضلك اختر تقييم");
      return;
    }

    if (!comment.trim()) {
      setError(t("enterComment") || "من فضلك اكتب تعليق");
      return;
    }

    try {
      await onSubmit({ rating, title, comment });
      setRating(0);
      setTitle("");
      setComment("");
    } catch (err) {
      setError(t("error") || "حدث خطأ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        {t("addReview") || "أضف تقييمك"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("rating") || "التقييم"}
          </label>
          <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
          {rating > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {rating} {t("outOf5") || "من 5"}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("reviewTitle") || "عنوان التقييم"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("reviewTitlePlaceholder") || "مثال: منتج ممتاز جداً"}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            maxLength={255}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("comment") || "التعليق"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("commentPlaceholder") || "شارك تجربتك مع هذا المنتج..."}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {comment.length}/1000
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("submitting") || "جاري الإرسال..."}
            </>
          ) : (
            t("submitReview") || "إرسال التقييم"
          )}
        </Button>
      </div>
    </form>
  );
}
