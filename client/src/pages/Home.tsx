import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Truck, CreditCard, ShieldCheck } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // بيانات السلايدر (تقدر تغير النصوص والألوان براحتك)
  const slides = [
    {
      title: "أقوى كولكشن شتوي",
      subtitle: "خصومات تصل لـ 50% على جميع الهوديز",
      bg: "bg-slate-900", // لون الخلفية (ممكن تخليه صورة لو حبيت)
      btnColor: "bg-blue-600"
    },
    {
      title: "دفع إلكتروني آمن",
      subtitle: "خصم 10% إضافي عند الدفع بفودافون كاش أو انستا باي",
      bg: "bg-blue-900",
      btnColor: "bg-red-600"
    },
    {
      title: "شحن لجميع المحافظات",
      subtitle: "اطلب دلوقتي ويوصلك لحد باب البيت",
      bg: "bg-black",
      btnColor: "bg-green-600"
    }
  ];

  // كود التحريك التلقائي للسلايدر
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // بيقلب كل 4 ثواني
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      
      {/* === Hero Slider (البنر المتحرك) === */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center text-center px-4 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            } ${slide.bg}`}
          >
             <div className="max-w-2xl text-white space-y-6 animate-in zoom-in duration-700">
               <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                 {slide.title}
               </h1>
               <p className="text-lg md:text-2xl text-slate-200 font-medium">
                 {slide.subtitle}
               </p>
               <Button 
                 onClick={() => navigate("/shop")} 
                 className={`h-14 px-10 text-xl font-bold rounded-full shadow-lg ${slide.btnColor} hover:scale-105 transition-transform`}
               >
                 تسوق الآن <ArrowRight className="w-6 h-6 mr-2" />
               </Button>
             </div>
          </div>
        ))}
        
        {/* نقاط التنقل (Dots) تحت */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-white w-8" : "bg-white/40 hover:bg-white/80"}`} 
            />
          ))}
        </div>
      </div>

      {/* === Features (مميزات الموقع) === */}
      <div className="py-16 bg-slate-50">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            
            {/* ميزة 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="bg-blue-50 p-5 rounded-full text-blue-600 mb-6">
                 <Truck className="w-10 h-10"/>
               </div>
               <h3 className="font-black text-xl mb-2 text-slate-900">شحن سريع ومضمون</h3>
               <p className="text-slate-500 font-medium">توصيل لجميع محافظات مصر خلال 3-5 أيام عمل مع إمكانية المعاينة.</p>
            </div>

            {/* ميزة 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="bg-green-50 p-5 rounded-full text-green-600 mb-6">
                 <ShieldCheck className="w-10 h-10"/>
               </div>
               <h3 className="font-black text-xl mb-2 text-slate-900">خامات عالية الجودة</h3>
               <p className="text-slate-500 font-medium">ضمان استبدال واسترجاع خلال 14 يوم لو المنتج معجبكش.</p>
            </div>

            {/* ميزة 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
               <div className="bg-purple-50 p-5 rounded-full text-purple-600 mb-6">
                 <CreditCard className="w-10 h-10"/>
               </div>
               <h3 className="font-black text-xl mb-2 text-slate-900">طرق دفع متعددة</h3>
               <p className="text-slate-500 font-medium">دفع عند الاستلام، أو خصم خاص للدفع بفودافون كاش وانستا باي.</p>
            </div>

         </div>
      </div>

      {/* === Call to Action (دعوة أخيرة) === */}
      <div className="py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">جاهز تختار طقمك الجديد؟</h2>
        <Button 
          onClick={() => navigate("/shop")} 
          variant="outline"
          className="h-14 px-12 text-xl font-bold rounded-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ShoppingBag className="w-5 h-5 ml-2" /> عرض كل المنتجات
        </Button>
      </div>

    </div>
  );
}

