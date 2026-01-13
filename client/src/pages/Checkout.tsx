import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Ruler, Weight, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ✅ بيانات البوت (محدثة)
const TELEGRAM_BOT_TOKEN = "7710056851:AAHFHJswIqf4c7h3HEN5LPGqhSuVZcHY2i8";
const TELEGRAM_CHAT_ID = "654471191";

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة البيانات (ضفنا الاسم fullName)
  const [formData, setFormData] = useState({
    fullName: "", // 👈 الاسم اللي هيكتبه بإيده
    phone: "",
    city: "",
    street: "",
    size: "XL",
    weight: "",
    shipping: 50,
  });

  useEffect(() => {
    if (items.length === 0) navigate("/shop");
  }, [items, navigate]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) { navigate("/auth"); return null; }

  // --- 📩 دالة إرسال الإشعار ---
  const sendTelegramNotification = async () => {
    const itemsList = items.map(item => `- ${item.name} (${item.quantity})`).join("\n");
    const fullAddress = `${formData.city} - ${formData.street}`;

    const sizeInfo = formData.weight 
      ? `المقاس: ${formData.size} | الوزن: ${formData.weight} كجم` 
      : `المقاس: ${formData.size}`;

    // 📝 شكل الرسالة الجديد (بدون رقم الشركة + اسم العميل)
    const message = `
اسم الشركه Era Store
---------------------------
👤 *بيانات العميل:*
الاسم: ${formData.fullName}
البريد: ${user?.email}
رقم العميل: ${formData.phone}
العنوان: ${fullAddress}
---------------------------
👕 *المقاسات:*
${sizeInfo}
---------------------------
🛒 *الطلبات:*
${itemsList}
---------------------------
💰 *الحساب:*
المنتجات: ${totalPrice}
الشحن: ${formData.shipping}
الإجمالي: ${totalPrice + formData.shipping} ج.م
`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        alert(`تنبيه: الرسالة موصلتش تليجرام! \nالسبب: ${data.description}`);
      }
    } catch (error) {
      console.error("خطأ تليجرام", error);
    }
  };

  // --- معالجة الطلب ---
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('orders').insert([{
        user_id: user?.id,
        items: items,
        total_price: totalPrice + formData.shipping,
        shipping_address: formData,
        status: 'pending'
      }]);

      if (error) throw error;

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
            <User className="text-blue-600" />
            <h2 className="text-xl font-bold">بيانات الطلب</h2>
          </div>
          
          <form onSubmit={handleOrder} className="space-y-4">
            
            {/* 1. خانة الاسم الجديد */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">الاسم بالكامل</label>
              <Input 
                required 
                placeholder="اكتب اسمك هنا..." 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            {/* الإيميل (للعرض فقط) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 flex items-center gap-1">
                 <Mail className="w-3 h-3" /> البريد الإلكتروني المسجل
              </label>
              <Input disabled value={user?.email} className="bg-slate-100 text-slate-500" />
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">رقم الهاتف (للتواصل)</label>
              <Input 
                required 
                placeholder="010xxxxxxx" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {/* العنوان */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">المحافظة</label>
                <Input required placeholder="الجيزة..." value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">المنطقة / الشارع</label>
                <Input required placeholder="تفاصيل العنوان..." value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
              </div>
            </div>

            <hr className="border-dashed my-4" />
            
            {/* المقاس والوزن */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-blue-600 mb-2">
                 <Ruler className="w-5 h-5" />
                 <h3 className="font-bold">المقاس المناسب</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600">المقاس</label>
                   <select 
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                     value={formData.size}
                     onChange={(e) => setFormData({...formData, size: e.target.value})}
                   >
                     <option value="L">L (لارج)</option>
                     <option value="XL">XL (اكس لارج)</option>
                     <option value="XXL">XXL (2 اكس)</option>
                     <option value="3XL">3XL (3 اكس)</option>
                     <option value="4XL">4XL (4 اكس)</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
                     <Weight className="w-4 h-4" /> الوزن (اختياري)
                   </label>
                   <Input 
                     placeholder="كجم" 
                     value={formData.weight}
                     onChange={(e) => setFormData({...formData, weight: e.target.value})}
                   />
                 </div>
               </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 mt-6 bg-slate-900 hover:bg-blue-600 font-bold text-lg shadow-lg">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد الطلب الآن 🚀"}
            </Button>
          </form>
        </div>

        {/* الفاتورة */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-6 text-slate-800">ملخص الفاتورة</h2>
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-blue-600">{item.price * item.quantity} ج.م</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2 text-slate-600">
             <div className="flex justify-between">
               <span>قيمة المنتجات</span>
               <span>{totalPrice} ج.م</span>
             </div>
             <div className="flex justify-between">
               <span>الشحن</span>
               <span>{formData.shipping} ج.م</span>
             </div>
             <div className="border-t my-2 border-dashed"></div>
             <div className="flex justify-between text-2xl font-black text-slate-900">
               <span>الإجمالي</span>
               <span>{totalPrice + formData.shipping} ج.م</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

