import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Zap, TrendingUp, Shield, Users, Baby, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // حالة لتخزين المنتجات القادمة من قاعدة البيانات
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب المنتجات الحقيقية عند فتح الموقع
  useEffect(() => {
    async function fetchProducts() {
      try {
        // جلب أحدث 4 منتجات (بدون ترتيب معقد مؤقتاً لضمان العمل)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(4);

        if (!error && data) {
          setLatestProducts(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" dir="rtl">
      {/* Navigation - الناف بار الاحترافي بدون زر الأدمن */}
      <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-3xl font-black tracking-tighter text-blue-700 dark:text-blue-500">
              ERA<span className="text-slate-900 dark:text-white">SPORT</span>
            </h1>
          </div>
          
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/profile")} variant="ghost" className="font-bold">
                {user?.name || "حسابي"}
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="ghost" className="font-bold">
                دخول
              </Button>
            )}
            
            <Button onClick={() => navigate("/shop")} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              تسوق الآن
              <ArrowLeft className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - الواجهة الرئيسية */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-right">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                وصل حديثاً: تشكيلة شتاء 2025 ❄️
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white">
                أداء رياضي <br />
                <span className="text-blue-600">بلا حدود</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                في EraSport، نقدم لك أجود ملابس الرياضة الرجالية وأطقم الأطفال المصممة لتحمل أصعب التمارين.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/shop")} size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700">
                  تصفح المنتجات
                </Button>
              </div>
            </div>
            
            <div className="relative group">
               <div className="absolute -inset-4 bg-blue-500/10 rounded-[2rem] blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
                  alt="Men Fitness"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 قسم المنتجات المضافة حديثاً (ديناميكي) */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-3xl font-bold">وصل حديثاً للمتجر</h3>
            <Button variant="link" onClick={() => navigate("/shop")} className="text-blue-600">عرض الكل &larr;</Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <div key={product.id} className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={product.image_url || "https://placehold.co/400"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                        جديد
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg line-clamp-1">{product.name}</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-blue-600 font-black text-xl">
                            {product.price} ج.م
                        </span>
                        <Button size="sm" onClick={() => navigate("/shop")} className="rounded-full w-10 h-10 p-0 bg-slate-900 hover:bg-blue-600">
                        <ShoppingBag className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                <p className="text-slate-500">جاري تجهيز الكولكشن الجديد... انتظرونا! 🔥</p>
            </div>
          )}
        </div>
      </section>

      {/* Why EraSport Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl font-bold">لماذا تختار EraSport؟</h3>
            <p className="text-slate-400">نحن نهتم بالتفاصيل التي تمنحك الأفضلية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "خامات ذكية", desc: "أقمشة طاردة للعرق وسريعة الجفاف" },
              { icon: TrendingUp, title: "أحدث الموديلات", desc: "تصميمات عصرية تناسب الجيم والخروج" },
              { icon: Shield, title: "ضمان الاستبدال", desc: "سياسة استبدال مرنة لضمان رضاك" },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <item.icon className="w-12 h-12 text-blue-500 mx-auto" />
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-black text-blue-600 mb-4">ERA SPORT</h2>
        <p className="text-slate-500">العنوان: القاهرة، مصر | واتساب: 010XXXXXXXX</p>
        <div className="mt-6 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} EraSport. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
