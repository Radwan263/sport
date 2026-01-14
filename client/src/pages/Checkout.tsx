import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Ticket, CreditCard, Banknote, Upload, Smartphone, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ✅ بيانات البوت (تأكد إنها صحيحة)
const TELEGRAM_BOT_TOKEN = "7710056851:AAHFHJswIqf4c7h3HEN5LPGqhSuVZcHY2i8";
const TELEGRAM_CHAT_ID = "654471191";

// ✅ قائمة المحافظات وأسعار الشحن
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
  { name: "الفيوم", price: 80 },
  { name: "بني سويف", price: 80 },
  { name: "المنيا", price: 90 },
  { name: "أسيوط", price: 90 },
  { name: "سوهاج", price: 90 },
  { name: "قنا", price: 90 },
  { name: "الأقصر", price: 90 },
  { name: "أسوان", price: 90 },
  { name: "البحر الأحمر", price: 90 },
  // محافظات الدفع المسبق فقط
  { name: "مرسى مطروح", price: 120, prepaidOnly: true },
  { name: "الوادي الجديد", price: 120, prepaidOnly: true },
];

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, totalPrice: cartTotal, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States
  const [formData, setFormData] = useState({ fullName: "", phone: "", street: "", size: "XL", weight: "" });
  const [selectedGov, setSelectedGov] = useState(GOVERNORATES[0]); 
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, vodafone, instapay, visa
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, percent: number} | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => { if (items.length === 0) navigate("/shop"); }, [items, navigate]);
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAuthenticated) { navigate("/auth"); return null; }

  // 🧮 الحسابات المالية
  const shippingPrice = selectedGov.price;
  const isElectronicPayment = paymentMethod === 'vodafone' || paymentMethod === 'instapay';
  const electronicDiscount = isElectronicPayment ? Math.round(cartTotal * 0.10) : 0; // خصم 10%
  const couponDiscount = appliedCoupon ? Math.round(cartTotal * (appliedCoupon.percent / 100)) : 0;
  
  const finalTotal = cartTotal + shippingPrice - electronicDiscount - couponDiscount;

  // تغيير المحافظة
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gov = GOVERNORATES.find(g => g.name === e.target.value) || GOVERNORATES[0];
    setSelectedGov(gov);
    // لو محافظة نائية ومختار دفع عند الاستلام، نحوله لفودافون كاش
    if (gov.prepaidOnly && paymentMethod === 'cod') {
      setPaymentMethod('vodafone');
      toast.warning("الدفع عند الاستلام غير متاح لمحافظتك، يرجى اختيار وسيلة دفع إلكترونية.");
    }
  };

  // تفعيل الكوبون
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
    if (data && data.is_active) {
      setAppliedCoupon({ code: data.code, percent: data.discount_percent });
      toast.success(`تم تفعيل خصم ${data.discount_percent}% بنجاح! 🎟️`);
    } else {
      toast.error("الكوبون غير صحيح أو منتهي الصلاحية ❌");
      setAppliedCoupon(null);
    }
  };

  // رفع الصورة
  const uploadReceipt = async () => {
    if (!receiptFile) return null;
    const fileName = `${Date.now()}_${user?.id}`;
    // الرفع للمخزن 'receipts'
    const { error } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);
    return publicUrl;
  };

  // إرسال لتليجرام
  const sendTelegram = async (receiptUrl: string | null) => {
    const itemsList = items.map(item => `- ${item.name} (${item.quantity})`).join("\n");
    const fullAddress = `${selectedGov.name} - ${formData.street}`;
    
    let paymentText = "الدفع عند الاستلام 💵";
    if (paymentMethod === 'vodafone') paymentText = "فودافون كاش 🔴";
    if (paymentMethod === 'instapay') paymentText = "انستا باي 🟣";
    if (paymentMethod === 'visa') paymentText = "فيزا (خطأ سيستم) 💳";

    const message = `
🌟 *طلب جديد من الموقع* 🌟
---------------------------
👤 *العميل:* ${formData.fullName}
📞 *الهاتف:* ${formData.phone}
📍 *العنوان:* ${fullAddress}
📐 *المقاس:* ${formData.size} ${formData.weight ? `| وزن: ${formData.weight}` : ""}
---------------------------
🛒 *الطلبات:*
${itemsList}
---------------------------
💰 *الحساب:*
المنتجات: ${cartTotal}
الشحن: ${shippingPrice}
${electronicDiscount > 0 ? `خصم دفع إلكتروني: -${electronicDiscount}` : ""}
${couponDiscount > 0 ? `خصم كوبون: -${couponDiscount}` : ""}
*الإجمالي النهائي:* ${finalTotal} ج.م
---------------------------
💳 *الدفع:* ${paymentText}
${selectedGov.prepaidOnly ? "⚠️ (محافظة نائية - شحن بريد)" : ""}
`;

    // إرسال الصورة الأول
    if (receiptUrl) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo: receiptUrl, caption: "🧾 إيصال التحويل" }),
      });
    }

    // إرسال النص
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
    });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isElectronicPayment && !receiptFile) {
      toast.error("لازم ترفع صورة التحويل عشان نأكد الطلب 📸");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. رفع الصورة
      let receiptUrl = null;
      if (receiptFile) receiptUrl = await uploadReceipt();

      // 2. حفظ الطلب في Supabase
      const { error } = await supabase.from('orders').insert([{
        user_id: user?.id,
        items: items,
        total_price: finalTotal,
        shipping_address: { ...formData, governorate: selectedGov.name },
        status: 'pending',
        payment_method: paymentMethod,
        payment_receipt_url: receiptUrl,
        coupon_code: appliedCoupon?.code,
        discount_amount: electronicDiscount + couponDiscount
      }]);

      if (error) throw error;

      // 3. تليجرام
      await sendTelegram(receiptUrl);
      
      toast.success("تم الطلب بنجاح! 🎉");
      clearCart(); 
      navigate("/profile"); 

    } catch (error: any) {
      console.error(error);
      toast.error("حصل مشكلة: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* === القسم الأيمن: البيانات والدفع === */}
        <div className="space-y-6">
            {/* كارت البيانات */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><MapPin className="text-blue-600"/> بيانات التوصيل</h2>
                <div className="space-y-4">
                    <Input required placeholder="الاسم بالكامل (ثلاثي)" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    <Input required placeholder="رقم الهاتف" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    
                    <div>
                        <label className="text-sm font-bold text-slate-500 mb-1 block">المحافظة</label>
                        <select 
                            className="w-full h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            value={selectedGov.name}
                            onChange={handleGovChange}
                        >
                            {GOVERNORATES.map(gov => (
                                <option key={gov.name} value={gov.name}>{gov.name} ({gov.price} ج.م)</option>
                            ))}
                        </select>
                        {selectedGov.prepaidOnly && (
                            <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 bg-red-50 p-2 rounded">
                                <AlertTriangle className="w-4 h-4"/> تنبيه: الشحن للمحافظة دي "بريد" فقط والدفع مسبق.
                            </p>
                        )}
                    </div>
                    
                    <Input required placeholder="العنوان بالتفصيل (الشارع، رقم العمارة، علامة مميزة)" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <select className="border rounded p-2 text-sm bg-white" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})}>
                            <option value="L">مقاس L</option>
                            <option value="XL">مقاس XL</option>
                            <option value="XXL">مقاس XXL</option>
                            <option value="3XL">مقاس 3XL</option>
                            <option value="4XL">مقاس 4XL</option>
                        </select>
                        <Input placeholder="الوزن (اختياري - كجم)" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* كارت الدفع */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><CreditCard className="text-blue-600"/> طريقة الدفع</h2>
                
                <div className="space-y-3">
                    {/* 1. عند الاستلام */}
                    <div 
                        onClick={() => !selectedGov.prepaidOnly && setPaymentMethod('cod')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between 
                        ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'hover:bg-slate-50'} 
                        ${selectedGov.prepaidOnly ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <Banknote className="text-green-600"/>
                            <span className="font-bold">دفع عند الاستلام</span>
                        </div>
                    </div>

                    {/* 2. فودافون كاش */}
                    <div 
                        onClick={() => setPaymentMethod('vodafone')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'vodafone' ? 'border-red-600 bg-red-50 ring-1 ring-red-600' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Smartphone className="text-red-600"/>
                                <span className="font-bold">فودافون كاش</span>
                            </div>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold animate-pulse">خصم 10% 🔥</span>
                        </div>
                        {paymentMethod === 'vodafone' && (
                            <div className="text-sm text-slate-600 mt-2 bg-white p-3 rounded border border-red-100">
                                <p>حولي المبلغ الإجمالي على الرقم ده:</p>
                                <p className="text-xl font-black text-slate-900 my-2 copy-text select-all">01095442297</p>
                            </div>
                        )}
                    </div>

                    {/* 3. انستا باي */}
                    <div 
                        onClick={() => setPaymentMethod('instapay')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'instapay' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-purple-700">InstaPay</span>
                                <span className="font-bold">انستا باي</span>
                            </div>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded font-bold animate-pulse">خصم 10% 🔥</span>
                        </div>
                        {paymentMethod === 'instapay' && (
                            <div className="text-sm text-slate-600 mt-2 bg-white p-3 rounded border border-purple-100 flex flex-col items-center">
                                {/* ✅ الصورة لازم تكون في مجلد public باسم instapay.jpg */}
                                <img src="/instapay.jpg" alt="InstaPay QR" className="w-40 h-40 object-contain mb-2 border rounded shadow-sm" />
                                <p className="font-bold select-all text-purple-700">khaledelnapwy@instapay</p>
                            </div>
                        )}
                    </div>

                    {/* 4. فيزا */}
                    <div className="p-4 border rounded-lg opacity-60 bg-slate-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <CreditCard className="text-slate-400"/>
                            <span className="font-bold text-slate-500">فيزا / ماستركارد</span>
                            <span className="text-xs bg-slate-200 text-slate-500 px-2 py-1 rounded">قريباً جداً</span>
                        </div>
                    </div>

                    {/* 📸 منطقة رفع السكرين شوت */}
                    {isElectronicPayment && (
                        <div className="mt-4 pt-4 border-t border-dashed animate-in fade-in slide-in-from-top-2">
                             <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4"/> إرفاق صورة التحويل (مطلوب)
                             </label>
                             <div className="flex items-center gap-2">
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} 
                                    className="cursor-pointer bg-white file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:px-2 file:text-xs"
                                />
                             </div>
                             <p className="text-xs text-slate-400 mt-1">سكرين شوت من الموبايل أو صورة للإيصال</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* === القسم الأيسر: الفاتورة === */}
        <div className="h-fit">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-2xl sticky top-4 border border-slate-700">
                <h2 className="text-xl font-bold mb-6">ملخص الفاتورة</h2>
                
                {/* المنتجات */}
                <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm items-center">
                        <span className="text-slate-300">{item.name} <span className="text-slate-500 text-xs">x{item.quantity}</span></span>
                        <span className="font-mono">{item.price * item.quantity}</span>
                    </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-400">
                        <span>قيمة المنتجات</span>
                        <span>{cartTotal} ج.م</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>الشحن ({selectedGov.name})</span>
                        <span>{shippingPrice} ج.م</span>
                    </div>
                    
                    {/* الخصومات */}
                    {electronicDiscount > 0 && (
                        <div className="flex justify-between text-green-400 font-bold bg-green-400/10 p-2 rounded">
                            <span>خصم الدفع الإلكتروني</span>
                            <span>-{electronicDiscount} ج.م</span>
                        </div>
                    )}
                    {appliedCoupon && (
                         <div className="flex justify-between text-green-400 font-bold bg-green-400/10 p-2 rounded">
                            <span>كوبون ({appliedCoupon.code})</span>
                            <span>-{couponDiscount} ج.م</span>
                        </div>
                    )}

                    <div className="border-t border-white/20 my-2"></div>
                    
                    <div className="flex justify-between text-3xl font-black mt-2 tracking-tight">
                        <span>الإجمالي</span>
                        <span>{finalTotal} <span className="text-sm font-normal text-slate-400">ج.م</span></span>
                    </div>
                </div>

                {/* الكوبون */}
                <div className="mt-6 flex gap-2">
                    <Input 
                        placeholder="معاك كود خصم؟" 
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-slate-500"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                    />
                    <Button onClick={handleApplyCoupon} variant="secondary" className="whitespace-nowrap font-bold hover:bg-white hover:text-slate-900 transition-colors">
                        <Ticket className="w-4 h-4 ml-1"/> تفعيل
                    </Button>
                </div>

                {/* زر التأكيد */}
                <Button 
                    onClick={handleOrder} 
                    disabled={isSubmitting} 
                    className="w-full h-14 mt-6 bg-blue-600 hover:bg-blue-500 font-bold text-lg shadow-lg shadow-blue-900/50 transition-all hover:scale-[1.02]"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "تأكيد الطلب الآن 🚀"}
                </Button>
                
                <p className="text-center text-xs text-slate-500 mt-4 flex justify-center items-center gap-1">
                    <Upload className="w-3 h-3"/> بياناتك مشفرة ومؤمنة 100%
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}

