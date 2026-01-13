import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const SIZES = ["L", "XL", "XXL", "3XL", "4XL"];

const STEPS = [
  { id: 1, title: "معلومات شخصية", description: "الاسم والهاتف" },
  { id: 2, title: "العنوان", description: "موقع التسليم" },
  { id: 3, title: "المقاسات", description: "اختر المقاس أو الوزن" },
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    primaryPhone: "",
    backupPhone: "",
  });

  // Step 2: Location
  const [location, setLocation] = useState({
    address: "",
    city: "",
    country: "مصر",
  });

  // Step 3: Sizing
  const [sizing, setSizing] = useState({
    sizeMethod: "size",
    selectedSize: "",
    weight: "",
  });

  const [suggestedSize, setSuggestedSize] = useState<string | null>(null);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseFloat(e.target.value);
    setSizing(prev => ({ ...prev, weight: e.target.value }));

    if (weight >= 50 && weight <= 70) setSuggestedSize("L");
    else if (weight > 70 && weight <= 85) setSuggestedSize("XL");
    else if (weight > 85 && weight <= 100) setSuggestedSize("XXL");
    else if (weight > 100 && weight <= 120) setSuggestedSize("3XL");
    else if (weight > 120 && weight <= 200) setSuggestedSize("4XL");
    else setSuggestedSize(null);
  };

  const handleCompleteCheckout = async () => {
    setIsLoading(true);
    try {
      const finalSize = sizing.sizeMethod === "weight" ? suggestedSize : sizing.selectedSize;
      
      // تجهيز نص الرسالة للتليجرام
      const messageText = `
🚀 *أوردر جديد في EraSport!*
------------------------------
👤 *العميل:* ${personalInfo.fullName}
📞 *الموبايل:* ${personalInfo.primaryPhone}
📞 *موبايل بديل:* ${personalInfo.backupPhone || "لا يوجد"}
🏠 *العنوان:* ${location.address}
🏙️ *المدينة:* ${location.city}
📏 *المقاس المختاره:* ${finalSize}
⚖️ *الوزن:* ${sizing.weight ? sizing.weight + " كجم" : "لم يتم الإدخال"}
------------------------------
💰 *حالة الدفع:* عند الاستلام
      `.trim();

      // بيانات البوت الخاص بك
      const BOT_TOKEN = "7710056851:AAHFHJswIqf4c7h3HEN5LPGqhSuVZcHY2i8";
      const CHAT_ID = "654471191";

      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) throw new Error("Failed to send telegram message");

      setIsSuccess(true);
      toast.success("تم إرسال طلبك بنجاح ✅");
      
      // بعد 3 ثواني نرجعه للمتجر
      setTimeout(() => navigate("/shop"), 3000);

    } catch (error) {
      console.error(error);
      toast.error("عذراً، حدث خطأ أثناء إتمام الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
        <div className="space-y-4">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-3xl font-bold text-slate-900">شكراً لك!</h2>
          <p className="text-slate-600">تم استلام طلبك بنجاح في EraSport، سنتواصل معك قريباً لتأكيد الشحن.</p>
          <Button onClick={() => navigate("/shop")} variant="outline">العودة للمتجر</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-black text-blue-600 mb-8 text-center">إتمام الطلب - EraSport</h1>
        
        {/* خطوات التقدم */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${currentStep >= step.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {step.id}
              </div>
              <span className="text-xs font-bold">{step.title}</span>
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <Label>الاسم الكامل</Label>
                <Input name="fullName" value={personalInfo.fullName} onChange={handlePersonalInfoChange} placeholder="اكتب اسمك هنا" className="h-12" />
                <Label>رقم الهاتف</Label>
                <Input name="primaryPhone" value={personalInfo.primaryPhone} onChange={handlePersonalInfoChange} placeholder="01XXXXXXXXX" className="h-12" />
                <Label>رقم هاتف بديل (اختياري)</Label>
                <Input name="backupPhone" value={personalInfo.backupPhone} onChange={handlePersonalInfoChange} placeholder="01XXXXXXXXX" className="h-12" />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Label>العنوان بالتفصيل</Label>
                <Input name="address" value={location.address} onChange={handleLocationChange} placeholder="اسم الشارع / رقم العمارة" className="h-12" />
                <Label>المدينة</Label>
                <Input name="city" value={location.city} onChange={handleLocationChange} placeholder="مثلاً: القاهرة" className="h-12" />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <RadioGroup value={sizing.sizeMethod} onValueChange={(v) => setSizing(p => ({ ...p, sizeMethod: v }))}>
                  <div className="border rounded-xl p-4 flex items-center gap-3">
                    <RadioGroupItem value="size" id="s1" />
                    <Label htmlFor="s1" className="flex-1 cursor-pointer">اختر المقاس يدوياً</Label>
                  </div>
                  {sizing.sizeMethod === "size" && (
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {SIZES.map(s => (
                        <Button key={s} variant={sizing.selectedSize === s ? "default" : "outline"} onClick={() => setSizing(p => ({ ...p, selectedSize: s }))}>{s}</Button>
                      ))}
                    </div>
                  )}
                  <div className="border rounded-xl p-4 flex items-center gap-3 mt-4">
                    <RadioGroupItem value="weight" id="s2" />
                    <Label htmlFor="s2" className="flex-1 cursor-pointer">حدد مقاسي حسب وزني</Label>
                  </div>
                  {sizing.sizeMethod === "weight" && (
                    <div className="mt-2 space-y-3">
                      <Input type="number" value={sizing.weight} onChange={handleWeightChange} placeholder="وزنك بالكيلوجرام" className="h-12" />
                      {suggestedSize && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg font-bold text-center">المقاس المقترح: {suggestedSize}</div>}
                    </div>
                  )}
                </RadioGroup>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {currentStep > 1 && <Button onClick={() => setCurrentStep(currentStep - 1)} variant="outline" className="flex-1 h-12">السابق</Button>}
              {currentStep < 3 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 h-12 bg-blue-600">التالي</Button>
              ) : (
                <Button onClick={handleCompleteCheckout} disabled={isLoading} className="flex-1 h-12 bg-green-600 hover:bg-green-700">
                  {isLoading ? <Loader2 className="animate-spin" /> : "إتمام الطلب الآن"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

