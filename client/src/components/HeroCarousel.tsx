import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

// صور العروض (تقدر تغير الروابط براحتك)
const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1556906781-9a412961d289?w=1200&q=80",
    title: "خصومات الشتاء",
    subtitle: "خصم 50%",
    buttonText: "تسوق",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
    title: "كولكشن الجيم",
    subtitle: "وصل حديثاً",
    buttonText: "اكتشف",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=1200&q=80",
    title: "أناقة وكاجوال",
    subtitle: "ستايلك عندنا",
    buttonText: "تصفح",
  },
];

export default function HeroCarousel() {
  const [, navigate] = useLocation();
  // إعداد السلايدر (يدوي فقط - بدون Autoplay)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, direction: 'rtl' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // تحديث النقطة لما السلايد يتغير
  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <div className="relative bg-white pb-8" dir="rtl">
      {/* جسم السلايدر */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 px-4 mt-4">
              {/* كارت العرض */}
              <div className="relative h-[250px] md:h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                
                {/* النص فوق الصورة (اختياري) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                    <h2 className="text-2xl font-bold mb-1">{slide.title}</h2>
                    <p className="text-sm opacity-90 mb-3">{slide.subtitle}</p>
                    <Button 
                      onClick={() => navigate("/shop")} 
                      size="sm" 
                      className="w-fit bg-white text-black hover:bg-slate-200 border-none font-bold"
                    >
                      {slide.buttonText}
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* النقط (Dots) تحت الصورة بالظبط زي أمازون */}
      <div className="flex justify-center gap-2 mt-4">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex 
                ? "w-2.5 h-2.5 bg-slate-800 scale-110" // النقطة النشطة (غامقة وكبيرة سنة)
                : "w-2 h-2 bg-slate-300 hover:bg-slate-400" // النقطة العادية (فاتحة)
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

