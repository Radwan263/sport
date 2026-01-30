import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Home() {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    { 
      title: t("newSeason"), 
      subtitle: t("supportYourTeam"), 
      bg: "bg-gradient-to-r from-red-700 to-red-600", 
      btnColor: "bg-slate-900 hover:bg-slate-800 text-white" 
    },
    { 
      title: t("europeanClubsOffers"), 
      subtitle: t("specialDiscount"), 
      bg: "bg-gradient-to-r from-blue-900 to-blue-800", 
      btnColor: "bg-white hover:bg-gray-100 text-blue-900" 
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'ahly', title: t("ahly"), color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
    { id: 'arab_clubs', title: t("arabClubs"), color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
    { id: 'euro_clubs', title: t("euroClubs"), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    { id: 'arab_teams', title: t("arabTeams"), color: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800' },
    { id: 'euro_teams', title: t("euroTeams"), color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* === Header === */}
      <div className="flex justify-between items-center p-4 sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-sm">
        <h1 
          className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
          onClick={() => navigate("/")}
        >
          ERA<span className="text-red-600">SPORT</span>
        </h1>
         
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-3 items-center">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/profile")} 
            className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <User className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/cart")} 
            className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex gap-2 items-center">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 p-4 border-b dark:border-slate-800 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} 
            className="rounded-full"
          >
            <User className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }} 
            className="rounded-full relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* === Slider === */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center text-center px-4 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            } ${slide.bg}`}
          >
            <div className="max-w-2xl text-white space-y-4 animate-in zoom-in">
              <h1 className="text-3xl md:text-5xl font-black drop-shadow-lg">{slide.title}</h1>
              <p className="text-base md:text-lg drop-shadow">{slide.subtitle}</p>
              <Button 
                onClick={() => navigate("/shop")} 
                className={`font-bold rounded-full px-8 py-2 ${slide.btnColor}`}
              >
                {t("browseStore")} <ArrowRight className={`w-4 h-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`}/>
              </Button>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* === Categories === */}
      <div className="py-12 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-slate-900 dark:text-white">
          {t("shopByCategory")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => navigate(`/shop?cat=${cat.id}`)}
              className={`p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center h-28 md:h-32 ${cat.color}`}
            >
              <h3 className="font-bold text-xs md:text-base">{cat.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* === Footer === */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">© 2024 EraSport. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
