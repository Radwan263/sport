import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // إعداد سلايدر الصور
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

  // دمج الصورة الرئيسية مع الصور الإضافية في مصفوفة واحدة للعرض
  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* قسم الصور (سلايدر) */}
        <div className="overflow-hidden rounded-2xl bg-gray-50 border" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {allImages.length > 0 ? allImages.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0">
                <img src={img} className="w-full h-[500px] object-contain" alt={product.name} />
              </div>
            )) : (
              <div className="h-[500px] flex items-center justify-center text-gray-400">لا توجد صور</div>
            )}
          </div>
        </div>

        {/* قسم التفاصيل */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600">{product.price} ج.م</p>
          
          <div className="prose dark:prose-invert">
            <h3 className="text-xl font-bold mb-2">الوصف:</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "لا يوجد وصف متاح لهذا المنتج."}
            </p>
          </div>

          <div className="pt-6 border-t">
            <Button size="lg" className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700">
              <ShoppingBag className="ml-2" /> إضـافة للـسلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

