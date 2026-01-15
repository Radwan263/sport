import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, User } from "lucide-react"; // ضفنا User
import { useCart } from "@/contexts/CartContext"; // عشان عداد السلة

export default function Home() {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: "تيشيرتات الموسم الجديد", subtitle: "شجع فريقك بأفضل خامة وأقل سعر", bg: "bg-red-700", btnColor: "bg-slate-900" }, // لون أحمر عشان الأهلي 😉
    { title: "عروض الأندية الأوروبية", subtitle: "خصم خاص عند طلب قطعتين أو أكثر", bg: "bg-blue-900", btnColor: "bg-white text-blue-900" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // قائمة الأقسام الجديدة
  const categories = [
    { id: 'ahly', title: 'النادي الأهلي 🦅', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'arab_clubs', title: 'أندية عربية 🇸🇦', color: 'bg-green-50 text-green-700 border-green-200' },
    { id: 'euro_clubs', title: 'أندية أوروبية 🇪🇺', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'arab_teams', title: 'منتخبات عربية 🌍', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { id: 'euro_teams', title: 'منتخبات أوروبية 🏆', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      
      {/* === Header (اللوجو + البروفايل + السلة) === */}
      <div className="flex justify-between items-center p-4 sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm">
         <h1 className="text-2xl font-black text-slate-900 cursor-pointer" onClick={() => navigate("/")}>
           ERA<span className="text-red-600">SPORT</span>
         </h1>
         
         <div className="flex gap-3">
           {/* زر البروفايل */}
           <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700">
             <User className="w-5 h-5" />
           </Button>

           {/* زر السلة */}
           <Button variant="ghost" size="icon" onClick={() => navigate("/cart")} className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 relative">
             <ShoppingBag className="w-5 h-5" />
             {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
           </Button>
         </div>
      </div>

      {/* === Slider === */}
      <div className="relative h-[400px] overflow-hidden">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center text-center px-4 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"} ${slide.bg}`}>
             <div className="max-w-2xl text-white space-y-4 animate-in zoom-in">
               <h1 className="text-4xl md:text-5xl font-black">{slide.title}</h1>
               <p className="text-lg">{slide.subtitle}</p>
               <Button onClick={() => navigate("/shop")} className={`font-bold rounded-full ${slide.btnColor}`}>تصفح المتجر <ArrowRight className="ml-2 w-4 h-4"/></Button>
             </div>
          </div>
        ))}
      </div>

      {/* === الأقسام (Categories) === */}
      <div className="py-12 max-w-7xl mx-auto px-4">
         <h2 className="text-2xl font-black text-center mb-8 text-slate-900">تسوق حسب القسم</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/shop?cat=${cat.id}`)} // هيروح للمتجر ويفلتر بالقسم ده
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center h-32 ${cat.color}`}
              >
                <h3 className="font-bold text-sm md:text-lg">{cat.title}</h3>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}

