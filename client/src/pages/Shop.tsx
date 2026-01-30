import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Search, Plus, Heart, User, Menu, X } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Shop() {
  const [location, navigate] = useLocation();
  const { addItem, totalItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, language } = useLanguage();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getInitialFilter = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("cat") || "all";
  };
  const [filter, setFilter] = useState(getInitialFilter());

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');
        if (filter !== 'all') {
          query = query.eq('category', filter);
        }
        const { data, error } = await query;
        if (!error && data) setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filter]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: 'all', label: t("all") },
    { id: 'ahly', label: t("ahly") },
    { id: 'arab_clubs', label: t("arabClubs") },
    { id: 'euro_clubs', label: t("euroClubs") },
    { id: 'arab_teams', label: t("arabTeams") },
    { id: 'euro_teams', label: t("euroTeams") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 
              className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
              onClick={() => navigate("/")}
            >
              ERA<span className="text-red-600">SPORT</span>
            </h1>
             
            <div className="hidden md:flex gap-2 items-center">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button 
                onClick={() => navigate("/profile")} 
                variant="ghost" 
                className="rounded-full w-10 h-10 p-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate("/wishlist")} 
                variant="ghost" 
                className="rounded-full w-10 h-10 p-0 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </Button>
              <Button 
                onClick={() => navigate("/cart")} 
                variant="ghost" 
                className="relative rounded-full w-10 h-10 p-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
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
            <div className="md:hidden flex gap-2 mb-4 pb-4 border-b dark:border-slate-800">
              <Button 
                onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} 
                variant="ghost" 
                className="rounded-full w-10 h-10 p-0"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }} 
                variant="ghost" 
                className="rounded-full w-10 h-10 p-0"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </Button>
              <Button 
                onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }} 
                variant="ghost" 
                className="relative rounded-full w-10 h-10 p-0"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          )}
          
          <div className="relative mb-4">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-2.5 text-slate-400 w-5 h-5`} />
            <Input 
              placeholder={t("search")} 
              className={`${language === "ar" ? "pr-10" : "pl-10"} bg-slate-100 dark:bg-slate-800 border-none rounded-full dark:text-white`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${
                  filter === cat.id 
                    ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-900 dark:text-white w-8 h-8" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 dark:border-slate-700 group relative"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className={`absolute top-2 ${language === "ar" ? "left-2" : "right-2"} p-2 rounded-full shadow-sm z-10 transition-all ${
                    isInWishlist(product.id) 
                      ? "bg-red-50 dark:bg-red-900/30 text-red-500" 
                      : "bg-white/90 dark:bg-slate-700/90 text-slate-400 dark:text-slate-400"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
                </button>

                <div className="aspect-[3/4] bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-1 mb-1 dark:text-white">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-900 dark:text-white font-black">{product.price} ج.م</span>
                    <Button 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600" 
                      onClick={(e) => { e.stopPropagation(); addItem(product); }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed dark:border-slate-700 mx-4">
            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">{t("noProducts")}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
