import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Search, Plus, Heart, User } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

export default function Shop() {
  const [location, navigate] = useLocation(); // location عشان نجيب الرابط
  const { addItem, totalItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // بنجيب القسم المختار من رابط الصفحة (لو جاي من الرئيسية)
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
    { id: 'all', label: 'الكل' },
    { id: 'ahly', label: 'الأهلي 🦅' },
    { id: 'arab_clubs', label: 'أندية عربية' },
    { id: 'euro_clubs', label: 'أندية أوروبية' },
    { id: 'arab_teams', label: 'منتخبات عربية' },
    { id: 'euro_teams', label: 'منتخبات أوروبية' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-slate-900 cursor-pointer" onClick={() => navigate("/")}>
               ERA<span className="text-red-600">SPORT</span>
             </h1>
             
             <div className="flex gap-2">
               {/* زر البروفايل */}
               <Button onClick={() => navigate("/profile")} variant="ghost" className="rounded-full w-10 h-10 p-0 bg-slate-100 text-slate-700">
                 <User className="w-5 h-5" />
               </Button>
               {/* زر المفضلة */}
               <Button onClick={() => navigate("/wishlist")} variant="ghost" className="rounded-full w-10 h-10 p-0 bg-red-50 hover:bg-red-100">
                 <Heart className="w-5 h-5 text-red-500" />
               </Button>
               {/* زر السلة */}
               <Button onClick={() => navigate("/cart")} variant="ghost" className="relative rounded-full w-10 h-10 p-0 bg-slate-100">
                 <ShoppingBag className="w-5 h-5 text-slate-700" />
                 {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                     {totalItems}
                   </span>}
               </Button>
             </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-2.5 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="ابحث عن تيشيرت..." 
              className="pr-10 bg-slate-100 border-none rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* الفلاتر */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${
                  filter === cat.id 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المنتجات */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 group relative"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className={`absolute top-2 left-2 p-2 rounded-full shadow-sm z-10 transition-all ${isInWishlist(product.id) ? "bg-red-50 text-red-500" : "bg-white/90 text-slate-400"}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
                </button>

                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                </div>
                
                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-900 font-black">{product.price} ج.م</span>
                    <Button size="icon" className="h-8 w-8 rounded-full bg-slate-900 hover:bg-blue-600" onClick={(e) => { e.stopPropagation(); addItem(product); }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed mx-4">
            <h3 className="text-xl font-bold text-slate-400">لا توجد منتجات في هذا القسم</h3>
          </div>
        )}
      </div>
    </div>
  );
}

