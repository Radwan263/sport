import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Check } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCart } from "@/contexts/CartContext"; // 👈 استدعاء السلة

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const { addItem } = useCart(); // 👈 دالة الإضافة
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ direction: 'rtl' });

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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (!product) return <div className="text-center p-20">المنتج غير موجود</div>;

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);

  // دالة التعامل مع الزرار
  const handleAddToCart = () => {
    addItem(product);
    // الـ Toast بيظهر أوتوماتيك من جوه CartContext
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* صور المنتج */}
        <div className="overflow-hidden rounded-2xl bg-gray-50 border border-slate-200" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {allImages.length > 0 ? allImages.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 bg-white flex items-center justify-center">
                <img src={img} className="w-full h-[500px] object-contain" alt={product.name} />
              </div>
            )) : (
              <div className="h-[500px] flex items-center justify-center text-gray-400">لا توجد صور</div>
            )}
          </div>
        </div>

        {/* التفاصيل */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600">{product.price} ج.م</p>
          
          <div className="prose dark:prose-invert">
            <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">الوصف:</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {product.description || "لا يوجد وصف متاح لهذا المنتج."}
            </p>
          </div>

          <div className="pt-8 border-t border-slate-200">
            {/* ✅ الزرار ده دلوقتي شغال لأي حد */}
            <Button 
              onClick={handleAddToCart}
              size="lg" 
              className="w-full text-lg h-14 bg-slate-900 hover:bg-blue-600 transition-colors font-bold shadow-lg"
            >
              <ShoppingBag className="ml-2 w-5 h-5" /> إضـافة للـسلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
