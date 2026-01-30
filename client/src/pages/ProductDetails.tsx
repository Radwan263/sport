import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Heart, ArrowLeft, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ReviewSection } from "@/components/ReviewSection";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ direction: language === "ar" ? "rtl" : "ltr" });
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function getProduct() {
      if (!params?.id) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error) setProduct(data);
      setLoading(false);
    }
    getProduct();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-900 dark:text-white w-8 h-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t("noProducts")}</h2>
        <Button onClick={() => navigate("/shop")} className="bg-slate-900 dark:bg-slate-700">
          {t("continueShoppingButton")}
        </Button>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.image_urls || [])].filter(Boolean);

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/shop")}
              className="rounded-full"
            >
              <ArrowLeft className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`} />
            </Button>
            <h1 
              className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
              onClick={() => navigate("/")}
            >
              ERA<span className="text-red-600">SPORT</span>
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="aspect-square bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {allImages.length > 0 ? (
                  <img 
                    src={allImages[selectedImage]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-600 text-center">
                    {t("noProducts")}
                  </div>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? "border-red-600 dark:border-red-500"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">(0 {t("quantity")})</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t("price")}</p>
              <p className="text-4xl font-black text-red-600 dark:text-red-500">
                {product.price} ج.م
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">الوصف</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">الفئة</p>
                <p className="font-bold text-slate-900 dark:text-white">{product.category}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">المخزون</p>
                <p className={`font-bold ${product.stock > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                  {product.stock > 0 ? `${product.stock} متاح` : "غير متاح"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-3 h-12 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                {t("addToCart")}
              </Button>

              <Button
                onClick={() => toggleWishlist(product.id)}
                variant="outline"
                className={`w-full font-bold py-3 h-12 rounded-xl ${
                  isInWishlist(product.id)
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 border-red-200 dark:border-red-800"
                    : "dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <Heart className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"} ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                {isInWishlist(product.id) ? t("removeFromWishlist") : t("addToWishlist")}
              </Button>

              <Button
                onClick={() => navigate("/shop")}
                variant="outline"
                className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                {t("continueShoppingButton")}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <ReviewSection 
            productId={parseInt(params?.id || "0")} 
            currentUserId={user?.id}
            isAdmin={user?.role === "admin"}
          />
        </div>
      </div>
    </div>
  );
}
