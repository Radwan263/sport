import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, ShoppingCart, Filter, Baby, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

// التصنيفات الجديدة المتخصصة
const CATEGORIES = [
  { id: "men", label: "رجالي", icon: <Users className="w-4 h-4" /> },
  { id: "kids", label: "أطفال", icon: <Baby className="w-4 h-4" /> },
  { id: "egypt", label: "منتخب مصر", icon: "🇪🇬" },
  { id: "ahly", label: "الأهلي", icon: "🔴" },
  { id: "zamalek", label: "الزمالك", icon: "🏹" },
  { id: "europe", label: "أندية أوروبية", icon: "🇪🇺" },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "تيشرت جيم EraSport برو - أسود",
    price: 350,
    category: "men",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?w=400",
    description: "خامة طاردة للعرق، مثالية للتمارين الشاقة.",
  },
  {
    id: 2,
    name: "طقم النادي الأهلي للأطفال 2025",
    price: 450,
    category: "kids",
    image: "https://images.unsplash.com/photo-1519340241574-2bc3993c66f9?w=400",
    description: "طقم كامل (تيشرت وشورت) جودة عالية للصغار.",
  },
  {
    id: 3,
    name: "بنطلون رياضي (سويت بانتس) رجالي",
    price: 550,
    category: "men",
    image: "https://images.unsplash.com/photo-1552062754-c8d8a220138d?w=400",
    description: "قطن مريح جداً للخروج والرياضة.",
  },
  {
    id: 4,
    name: "تيشرت منتخب مصر - نسخة الجماهير",
    price: 299,
    category: "egypt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    description: "ادعم الفراعنة بتيشرت خفيف ومريح.",
  },
  {
    id: 5,
    name: "هودي رياضي للأطفال - مبطن",
    price: 400,
    category: "kids",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400",
    description: "تدفئة مثالية للأطفال في الشتاء.",
  },
  {
    id: 6,
    name: "تيشرت ريال مدريد 2025",
    price: 600,
    category: "europe",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
    description: "تيشرت الملكي الأبيض بجودة الملاعب.",
  },
];

export default function Shop() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Array<{ id: number; quantity: number }>>([]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: productId, quantity: 1 }];
    });
    toast.success("تمت الإضافة للسلة بنجاح ✅");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
      {/* Sticky Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 onClick={() => navigate("/")} className="text-2xl font-black text-blue-600 cursor-pointer">
              ERA<span className="text-slate-900 dark:text-white">SPORT</span>
            </h1>
            
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="ابحث عن موديلك المفضل..."
                  className="pr-10 bg-slate-100 border-none rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={() => navigate("/cart")} variant="ghost" className="relative p-2">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full px-6 flex-shrink-0"
          >
            الكل
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full px-6 flex-shrink-0 flex gap-2"
            >
              {cat.icon}
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <Card key={product.id} className="border-0 shadow-sm hover:shadow-xl transition-all group rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {product.category === 'kids' ? 'للأطفال 👶' : 'رجالي 🔥'}
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 h-8">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-black text-blue-600">{product.price} ج.م</span>
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    size="icon"
                    className="rounded-xl bg-slate-900 hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner mt-10">
            <Filter className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">للأسف مفيش موديلات بالشكل ده حالياً</p>
            <Button variant="link" onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}>
              عرض كل المنتجات
            </Button>
          </div>
        )}
      </main>

      {/* Floating Checkout Action */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <Button
            onClick={() => navigate("/checkout")}
            className="w-full h-14 text-lg font-bold shadow-2xl bg-blue-600 hover:bg-blue-700 rounded-2xl flex justify-between px-8"
          >
            <span>إتمام الطلب ({cart.length})</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg">المتابعة ⬅️</span>
          </Button>
        </div>
      )}
    </div>
  );
}
