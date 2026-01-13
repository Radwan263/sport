import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("جاري جلب المنتجات...");
        // 1. محاولة جلب بسيطة بدون ترتيب للتجربة
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);

        if (error) {
          console.error("Supabase Error:", error);
          setErrorMsg(error.message);
        } else {
          console.log("Data fetched:", data);
          setProducts(data || []);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" dir="rtl">
      {/* Navigation */}
      <nav className="border-b border-slate-200 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-blue-700">ERA SPORT</h1>
        <Button onClick={() => navigate("/admin")} variant="outline">لوحة التحكم</Button>
      </nav>

      {/* قسم الاختبار */}
      <section className="p-8">
        <h2 className="text-3xl font-bold mb-6">تجربة عرض المنتجات</h2>

        {/* عرض رسالة الخطأ لو وجدت */}
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>خطأ: </strong> {errorMsg}
            <p className="text-sm mt-2">صور الشاشة دي وابعتها لو الرسالة دي ظهرت.</p>
          </div>
        )}

        {loading ? (
          <div className="flex gap-2 items-center"><Loader2 className="animate-spin" /> جاري التحميل...</div>
        ) : products.length === 0 ? (
          <div className="text-slate-500 text-xl border-2 border-dashed p-8 text-center rounded-xl">
            الجدول فاضي أو مفيش بيانات رجعت! 🤷‍♂️
            <br/> تأكد إنك ضفت منتجات من لوحة التحكم.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border rounded-xl overflow-hidden shadow-lg bg-white">
                <img 
                  src={p.image_url || "https://placehold.co/400"} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{p.name || "بدون اسم"}</h3>
                  <p className="text-blue-600 font-bold">{p.price} ج.م</p>
                  <p className="text-gray-500 text-sm">{p.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

