import { useEffect, useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlist);

      if (data) setProducts(data);
      setLoading(false);
    }
    getWishlistProducts();
  }, [wishlist]);

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
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {t("wishlist")} ({products.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-900 dark:text-white w-8 h-8" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={product.name}
                  />
                  
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 bg-red-50 dark:bg-red-900/30 p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold line-clamp-1 text-slate-900 dark:text-white mb-2">{product.name}</h3>
                  <p className="text-red-600 dark:text-red-500 font-black text-lg mb-3">{product.price} ج.م</p>
                  
                  <Button 
                    onClick={() => addItem(product)} 
                    className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold"
                  >
                    <ShoppingBag className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("addToCart")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
            <Heart className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">{t("wishlist")} {t("cartEmpty")}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">أضف بعض المنتجات التي تعجبك هنا.</p>
            <Button 
              onClick={() => navigate("/shop")} 
              className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold"
            >
              {t("continueShoppingButton")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
