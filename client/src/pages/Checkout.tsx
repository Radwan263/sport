import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ✅ بيانات البوت (تأكد إنها صحيحة)
const TELEGRAM_BOT_TOKEN = "7710056851:AAHFHJswIqf4c7h3HEN5LPGqhSuVZcHY2i8";
const TELEGRAM_CHAT_ID = "6059260672";

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة العنوان (البيانات اللي العميل بيكتبها)
  const [address, setAddress] = useState({
    street: "", // تفاصيل الشارع والعمارة
    city: "",   // المحافظة أو المنطقة
    phone: "",
    shipping: 50, // مصاريف الشحن
  });

  useEffect(() => {
    if (items.length === 0) navigate("/shop");
  }, [items, navigate]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) { navigate("/auth"); return null; }

  // --- 📩 دالة إرسال الإشعار لتليجرام ---
  const sendTelegramNotification = async () => {
    // 1. تجهيز قائمة المنتجات
    const itemsList = items.map(item => `${item.name} (${item.quantity})`).join("\n");
    
    // 2. تجهيز العنوان كامل (المحافظة + الشارع)
    const fullAddress = `${address.city} - ${address.street}`;

    // 3. تنسيق الرسالة النهائي
    const message = `
اسم الشركه Era Store
رقم الشركه 01095442297
${user?.email}
${address.phone}
${fullAddress}
${itemsList}
${totalPrice}+${address.shipping} شحن
`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      });
    } catch (error) {
      console.error("خطأ في الإرسال لتليجرام", error);
    }
  };

  // --- معالجة الطلب ---
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // حفظ في Supabase
      const { error } = await supabase.from('orders').insert([{
        user_id: user?.id,
        items: items,
        total_price: totalPrice + address.shipping,
        shipping_address: address,
        status: 'pending'
      }]);

      if (error) throw error;

      // إرسال الإشعار
      await sendTelegramNotification();
      
      toast.success("تم استلام طلبك بنجاح! 🎉");
      clearCart(); 
      navigate("/"); 

    } catch (error: any) {
      console.error(error);
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* فورم البيانات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <MapPin className="text-blue-600" />
            <h2 className="text-xl font-bold">بيانات التوصيل</h2>
          </div>
          
          <form onSubmit={handleOrder} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">الاسم</label>
              <Input disabled value={user?.email} className="bg-slate-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">رقم الهاتف</label>
              <Input 
                required 
                placeholder="010xxxxxxx" 
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
              />
            </div>

            {/* خانة المحافظة / المنطقة */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">المحافظة / المنطقة</label>
              <Input 
                required 
                placeholder="مثال: الجيزة - حدائق أكتوبر" 
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
              />
            </div>

            {/* خانة العنوان التفصيلي */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">العنوان بالتفصيل (عمارة - شقة - علامة مميزة)</label>
              <Input 
                required 
                placeholder="مثال: دار مصر عماره ١٥٦ الدور الأول" 
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 font-bold text-lg">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد الطلب"}
            </Button>
          </form>
        </div>

        {/* ملخص الفاتورة */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-6">تفاصيل الدفع</h2>
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="font-bold">{item.price * item.quantity} ج.م</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/20 pt-4 space-y-2">
             <div className="flex justify-between text-slate-300">
               <span>قيمة المنتجات</span>
               <span>{totalPrice} ج.م</span>
             </div>
             <div className="flex justify-between text-slate-300">
               <span>الشحن</span>
               <span>{address.shipping} ج.م</span>
             </div>
             <div className="flex justify-between text-2xl font-black mt-4 pt-4 border-t border-white/20">
               <span>الإجمالي المطلوب</span>
               <span>{totalPrice + address.shipping} ج.م</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
