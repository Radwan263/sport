import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Ticket, CreditCard, Banknote, Upload, Smartphone, AlertTriangle, Image as ImageIcon, User, Phone, Mail, Home, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// ✅ بيانات البوت الجديدة
const TELEGRAM_BOT_TOKEN = "8505898687:AAHyu68rTcmpCjsm4DrBiN-2L7osaQLGd88";
const TELEGRAM_CHAT_ID = "1414736450";
// ✅ قائمة المحافظات
const GOVERNORATES = [
  { name: "القاهرة", price: 70 },
  { name: "الجيزة", price: 70 },
  { name: "الإسكندرية", price: 80 },
  { name: "البحيرة", price: 80 },
  { name: "كفر الشيخ", price: 80 },
  { name: "الدقهلية", price: 80 },
  { name: "الغربية", price: 80 },
  { name: "المنوفية", price: 80 },
  { name: "الشرقية", price: 80 },
  { name: "القليوبية", price: 80 },
  { name: "بورسعيد", price: 80 },
  { name: "الإسماعيلية", price: 80 },
  { name: "السويس", price: 80 },
  { name: "دمياط", price: 80 },
  { name: "الفيوم", price: 90 },
  { name: "بني سويف", price: 90 },
  { name: "المنيا", price: 90 },
  { name: "أسيوط", price: 90 },
  { name: "سوهاج", price: 90 },
  { name: "قنا", price: 90 },
  { name: "الأقصر", price: 90 },
  { name: "أسوان", price: 90 },
  { name: "البحر الأحمر", price: 90 },
  { name: "مرسى مطروح", price: 120, prepaidOnly: true },
  { name: "الوادي الجديد", price: 120, prepaidOnly: true },
];

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, totalPrice: cartTotal, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States للبيانات الجديدة
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "", // الإيميل اختياري
    phone: "",
    backupPhone: "", // رقم احتياطي
    addressType: "home", // نوع العنوان (home/work)
    street: "",
    size: "XL",
    weight: ""
  });
  
  const [selectedGov, setSelectedGov] = useState(GOVERNORATES[0]); 
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, percent: number} | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => { if (items.length === 0) navigate("/shop"); }, [items, navigate]);
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) { navigate("/auth"); return null; }

  // 🧮 الحسابات
  const shippingPrice = selectedGov.price;
  const isElectronicPayment = paymentMethod === 'vodafone' || paymentMethod === 'instapay';
  const electronicDiscount = isElectronicPayment ? Math.round(cartTotal * 0.10) : 0;
  const couponDiscount = appliedCoupon ? Math.round(cartTotal * (appliedCoupon.percent / 100)) : 0;
  const finalTotal = cartTotal + shippingPrice - electronicDiscount - couponDiscount;

  // تغيير المحافظة
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gov = GOVERNORATES.find(g => g.name === e.target.value) || GOVERNORATES[0];
    setSelectedGov(gov);
    if (gov.prepaidOnly && paymentMethod === 'cod') {
      setPaymentMethod('vodafone');
      toast.warning("الدفع عند الاستلام غير متاح لمحافظتك، تم تحويل الدفع لإلكتروني.");
    }
  };

  // تفعيل الكوبون
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
    if (data && data.is_active) {
      setAppliedCoupon({ code: data.code, percent: data.discount_percent });
      toast.success(`تم تفعيل خصم ${data.discount_percent}% بنجاح!`);
    } else {
      toast.error("الكود غير صحيح");
      setAppliedCoupon(null);
    }
  };

  // رفع الصورة
  const uploadReceipt = async () => {
    if (!receiptFile) return null;
    const fileName = `${Date.now()}_${user?.id}`;
    const { error } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
    return publicUrl;
  };

  // إرسال لتليجرام
  const sendTelegram = async (receiptUrl: string | null) => {
    const itemsList = items.map(item => `- ${item.name} (${item.quantity})`).join("\n");
    const addressTypeText = formData.addressType === 'home' ? "منزل 🏠" : "عمل 🏢";
    
    let paymentText = "الدفع عند الاستلام 💵";
    if (paymentMethod === 'vodafone') paymentText = "فودافون كاش 🔴";
    if (paymentMethod === 'instapay') paymentText = "انستا باي 🟣";

    const message = `
🌟 *طلب جديد من الموقع* 🌟
---------------------------
👤 *البيانات الشخصية:*
الاسم: ${formData.fullName}
البريد: ${formData.email}
📞 رقم أساسي: ${formData.phone}
📞 رقم احتياطي: ${formData.backupPhone}
---------------------------
📍 *العنوان:*
المحافظة: ${selectedGov.name}
النوع: ${addressTypeText}
التفاصيل: ${formData.street}
---------------------------
📐 *المواصفات:*
المقاس: ${formData.size}
الوزن: ${formData.weight}
---------------------------
🛒 *الطلبات:*
${itemsList}
---------------------------
💰 *الحساب:*
المنتجات: ${cartTotal}
الشحن: ${shippingPrice}
خصم إلكتروني: -${electronicDiscount}
خصم كوبون: -${couponDiscount}
*الإجمالي:* ${finalTotal} ج.م
---------------------------
💳 *الدفع:* ${paymentText}
${selectedGov.prepaidOnly ? "⚠️ شحن بريد (دفع مسبق)" : ""}
`;

    if (receiptUrl) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo: receiptUrl, caption: "🧾 إيصال التحويل" }),
      });
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
    });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isElectronicPayment && !receiptFile) {
      toast.error("مطلوب صورة التحويل 📸");
      return;
    }
    setIsSubmitting(true);

    try {
      let receiptUrl = null;
      if (receiptFile) receiptUrl = await uploadReceipt();

      const { error } = await supabase.from('orders').insert([{
        user_id: user?.id,
        items: items,
        total_price: finalTotal,
        shipping_address: { ...formData, governorate: selectedGov.name }, // بنخزن كل البيانات الجديدة هنا
        status: 'pending',
        payment_method: paymentMethod,
        payment_receipt_url: receiptUrl,
        coupon_code: appliedCoupon?.code,
        discount_amount: electronicDiscount + couponDiscount
      }]);

      if (error) throw error;
      await sendTelegram(receiptUrl);
      
      toast.success("تم الطلب بنجاح! 🎉");
      clearCart(); 
      navigate("/profile"); 

    } catch (error: any) {
      console.error(error);
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-50 mb-6 rounded-xl">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
            onClick={() => navigate("/")}
          >
            ERA<span className="text-red-600">SPORT</span>
          </h1>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === فورم البيانات (يمين) === */}
        <div className="space-y-6">
            
            {/* 1. البيانات الشخصية */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><User className="text-blue-600"/> بيانات العميل</h2>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">الاسم بالكامل</label>
                        <Input required placeholder="اسمك ثلاثي" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">البريد الإلكتروني (اختياري)</label>
                        <div className="relative">
                           <Mail className="absolute top-2.5 right-3 w-4 h-4 text-slate-400" />
                           <Input className="pr-10" placeholder="example@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">رقم أساسي</label>
                            <Input required type="tel" placeholder="010xxxxxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">رقم احتياطي (اختياري)</label>
                            <Input type="tel" placeholder="رقم آخر" value={formData.backupPhone} onChange={e => setFormData({...formData, backupPhone: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. العنوان */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><MapPin className="text-blue-600"/> العنوان والشحن</h2>
                <div className="space-y-4">
                    {/* اختيار المحافظة */}
                    <div>
                        <label className="text-sm font-bold text-slate-500 mb-1 block">المحافظة</label>
                        <select 
                            className="w-full h-10 rounded-md border bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600"
                            value={selectedGov.name}
                            onChange={handleGovChange}
                        >
                            {GOVERNORATES.map(gov => (
                                <option key={gov.name} value={gov.name}>{gov.name} ({gov.price} ج.م)</option>
                            ))}
                        </select>
                        {selectedGov.prepaidOnly && (
                            <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 bg-red-50 p-2 rounded">
                                <AlertTriangle className="w-4 h-4"/> تنبيه: الشحن هنا بريد فقط (دفع مسبق)
                            </p>
                        )}
                    </div>

                    {/* نوع العنوان */}
                    <div>
                       <label className="text-xs font-bold text-slate-500 mb-2 block">نوع العنوان</label>
                       <div className="flex gap-4">
                          <div 
                            onClick={() => setFormData({...formData, addressType: 'home'})}
                            className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${formData.addressType === 'home' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
                          >
                             <Home className="w-4 h-4" /> منزل
                          </div>
                          <div 
                            onClick={() => setFormData({...formData, addressType: 'work'})}
                            className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${formData.addressType === 'work' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
                          >
                             <Briefcase className="w-4 h-4" /> عمل
                          </div>
                       </div>
                    </div>

                    {/* العنوان بالتفصيل */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">العنوان بالتفصيل</label>
                        <Input 
                          placeholder="اسم الشارع، رقم العمارة، الدور، الشقة، علامة مميزة..." 
                          value={formData.street} 
                          onChange={e => setFormData({...formData, street: e.target.value})}
                          className="h-12"
                        />
                    </div>
                </div>
            </div>

            {/* 3. المقاس والوزن */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h2 className="font-bold text-xl mb-4 flex items-center gap-2">📏 المواصفات</h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">المقاس</label>
                        <select className="w-full h-10 border rounded px-2 text-sm" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})}>
                            <option value="L">L (لارج)</option>
                            <option value="XL">XL (اكس لارج)</option>
                            <option value="XXL">XXL (2 اكس)</option>
                            <option value="3XL">3XL (3 اكس)</option>
                            <option value="4XL">4XL (4 اكس)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">الوزن (كجم)</label>
                        <Input placeholder="مثال: 85" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    </div>
                 </div>
            </div>

            {/* 4. طريقة الدفع */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><CreditCard className="text-blue-600"/> الدفع</h2>
                
                <div className="space-y-3">
                    {/* عند الاستلام */}
                    <div 
                        onClick={() => !selectedGov.prepaidOnly && setPaymentMethod('cod')}
                        className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : ''} ${selectedGov.prepaidOnly ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <Banknote className="text-green-600"/>
                            <span className="font-bold">دفع عند الاستلام</span>
                        </div>
                    </div>

                    {/* فودافون كاش */}
                    <div 
                        onClick={() => setPaymentMethod('vodafone')}
                        className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'vodafone' ? 'border-red-600 bg-red-50 ring-1 ring-red-600' : ''}`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3"><Smartphone className="text-red-600"/><span className="font-bold">فودافون كاش</span></div>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">خصم 10%</span>
                        </div>
                        {paymentMethod === 'vodafone' && <div className="mt-2 text-sm bg-white p-2 rounded border">حول على: <span className="font-black select-all">01095442297</span></div>}
                    </div>

                    {/* انستا باي */}
                    <div 
                        onClick={() => setPaymentMethod('instapay')}
                        className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'instapay' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : ''}`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3"><span className="font-black text-purple-700">InstaPay</span><span className="font-bold">انستا باي</span></div>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded font-bold">خصم 10%</span>
                        </div>
                        {paymentMethod === 'instapay' && (
                            <div className="mt-2 text-center bg-white p-2 rounded border">
                                <img src="/instapay.jpg" className="w-32 h-32 object-contain mx-auto border mb-2 rounded" alt="QR"/>
                                <p className="font-bold text-purple-700 select-all">khaledelnapwy@instapay</p>
                            </div>
                        )}
                    </div>

                    {/* رفع الصورة للدفع الإلكتروني */}
                    {isElectronicPayment && (
                        <div className="mt-4 pt-4 border-t border-dashed">
                             <label className="text-sm font-bold mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> إرفاق صورة التحويل (مطلوب)</label>
                             <Input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} className="bg-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* === ملخص الفاتورة (يسار) === */}
        <div className="h-fit lg:sticky lg:top-4">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-2xl border border-slate-700">
                <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
                
                <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm items-center border-b border-white/10 pb-2 last:border-0">
                        <span className="text-slate-200">{item.name} <span className="text-slate-500 text-xs">x{item.quantity}</span></span>
                        <span className="font-mono">{item.price * item.quantity}</span>
                    </div>
                    ))}
                </div>

                <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                    <div className="flex justify-between text-slate-400"><span>المنتجات</span><span>{cartTotal} ج.م</span></div>
                    <div className="flex justify-between text-slate-400"><span>الشحن ({selectedGov.name})</span><span>{shippingPrice} ج.م</span></div>
                    
                    {electronicDiscount > 0 && <div className="flex justify-between text-green-400 font-bold"><span>خصم دفع إلكتروني</span><span>-{electronicDiscount} ج.م</span></div>}
                    {appliedCoupon && <div className="flex justify-between text-green-400 font-bold"><span>كوبون ({appliedCoupon.code})</span><span>-{couponDiscount} ج.م</span></div>}

                    <div className="border-t border-white/20 my-2"></div>
                    
                    <div className="flex justify-between text-3xl font-black mt-2">
                        <span>الإجمالي</span>
                        <span>{finalTotal} <span className="text-sm font-normal text-slate-400">ج.م</span></span>
                    </div>
                </div>

                {/* الكوبون */}
                <div className="mt-6 flex gap-2">
                    <Input 
                        placeholder="كود الخصم" 
                        className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                    />
                    <Button onClick={handleApplyCoupon} variant="secondary" className="whitespace-nowrap font-bold hover:bg-white hover:text-slate-900">
                        <Ticket className="w-4 h-4 ml-1"/> تفعيل
                    </Button>
                </div>

                {/* زر التأكيد */}
                <Button 
                    onClick={handleOrder} 
                    disabled={isSubmitting} 
                    className="w-full h-14 mt-6 bg-blue-600 hover:bg-blue-500 font-bold text-lg shadow-lg shadow-blue-900/50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد الطلب 🚀"}
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}

