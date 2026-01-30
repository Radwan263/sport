import { useState } from "react";
import { Heart, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { useLanguage } from "@/lib/i18n";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReviewItemProps {
  id: number;
  author: string;
  rating: number;
  title?: string;
  comment: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  isOwner: boolean;
  isAdmin: boolean;
  onLike: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit?: (data: { rating: number; title: string; comment: string }) => Promise<void>;
}

export function ReviewItem({
  id,
  author,
  rating,
  title,
  comment,
  likes,
  isLiked,
  createdAt,
  isOwner,
  isAdmin,
  onLike,
  onDelete,
  onEdit,
}: ReviewItemProps) {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(rating);
  const [editTitle, setEditTitle] = useState(title || "");
  const [editComment, setEditComment] = useState(comment);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEdit = async () => {
    if (!onEdit) return;
    setIsLoading(true);
    try {
      await onEdit({ rating: editRating, title: editTitle, comment: editComment });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete") || "هل أنت متأكد من الحذف؟")) return;
    setIsLoading(true);
    try {
      await onDelete();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    setIsLoading(true);
    try {
      await onLike();
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("rating") || "التقييم"}
            </label>
            <StarRating rating={editRating} onRatingChange={setEditRating} interactive size="md" />
          </div>

          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder={t("reviewTitle") || "عنوان التقييم"}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm"
            maxLength={255}
          />

          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            placeholder={t("comment") || "التعليق"}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm resize-none"
            maxLength={1000}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              {t("save") || "حفظ"}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4 mr-1" />
              {t("cancel") || "إلغاء"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{author}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(createdAt), "dd MMMM yyyy", { locale: language === "ar" ? ar : undefined })}
          </p>
        </div>
        <div className="flex gap-2">
          {(isOwner || isAdmin) && (
            <>
              {isOwner && (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-2">
        <StarRating rating={rating} onRatingChange={() => {}} interactive={false} size="sm" />
      </div>

      {/* Title */}
      {title && (
        <p className="font-bold text-slate-900 dark:text-white mb-2">{title}</p>
      )}

      {/* Comment */}
      <p className="text-slate-700 dark:text-slate-300 mb-3 text-sm leading-relaxed">{comment}</p>

      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 text-sm font-bold transition-colors ${
          isLiked
            ? "text-red-600 dark:text-red-400"
            : "text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
        {likes} {t("likes") || "إعجاب"}
      </button>
    </div>
  );
}
