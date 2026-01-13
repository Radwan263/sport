import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Zap, TrendingUp, Shield, Loader2, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import HeroCarousel from "@/components/HeroCarousel";
import { useCart } from "@/contexts/CartContext"; // 👈 استدعاء السلة

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { addItem, totalItems } = useCart(); // 👈 استدعاء دالة الإضافة والعداد
  
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
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
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-3xl font-black tracking-tighter text-blue-700 dark:text-blue-500">
              ERA<span className="text-slate-900 dark:text-white">SPORT</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* زر السلة الجديد 🛒 */}
            <Button onClick={() => navigate("/cart")} variant="ghost" className="relative rounded-full w-10 h-10 p-0">
              <ShoppingBag className="w-6 h-6 text-slate-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <Button onClick={() => navigate("/profile")} variant="ghost" className="font-bold hidden md:flex">
                {user?.name || "حسابي"}
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="ghost" className="font-bold">
                دخول
              </Button>
            )}
            
            <Button onClick={() => navigate("/shop")} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hidden md:flex">
              تسوق الآن
              <ArrowLeft className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      <HeroCarousel />

      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-3xl font-bold">وصل حديثاً للمتجر</h3>
            <Button variant="link" onClick={() => navigate("/shop")} className="text-blue-600">عرض الكل &larr;</Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 cursor-pointer"
                >
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
                      <h4 className="font-bold text-sm md:text-lg line-clamp-1">{product.name}</h4>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-blue-600 font-black text-lg">
                            {product.price} ج.م
                        </span>
                        {/* ✅ زر الإضافة السريع (+) */}
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation(); // عشان ميفتحش الصفحة
                            addItem(product);
                          }}
                          className="rounded-full w-8 h-8 md:w-10 md:h-10 p-0 bg-slate-900 hover:bg-blue-600 shadow-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
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

