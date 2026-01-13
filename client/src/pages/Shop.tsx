import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext"; // 👈 استدعاء السلة

export default function Shop() {
  const [, navigate] = useLocation();
  const { addItem, totalItems } = useCart(); // 👈 استدعاء السلة
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); 

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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filter]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20" dir="rtl">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-blue-600 cursor-pointer" onClick={() => navigate("/")}>
               ERA<span className="text-slate-900 dark:text-white">SPORT</span>
             </h1>
             
             {/* زر السلة في المتجر 🛒 */}
             <Button onClick={() => navigate("/cart")} variant="ghost" className="relative rounded-full w-10 h-10 p-0 bg-slate-100">
               <ShoppingBag className="w-5 h-5 text-slate-700" />
               {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                   {totalItems}
                 </span>
               )}
             </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-2.5 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="ابحث عن موديلك المفضل..." 
              className="pr-10 bg-slate-100 border-none rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'men', label: 'رجالي 🧔' },
              { id: 'kids', label: 'أطفال 👶' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${
                  filter === cat.id 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 group"
              >
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image_url || "https://placehold.co/400"} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                    {product.category === 'kids' ? 'أطفال' : 'رجالي'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-sm md:text-base line-clamp-1 mb-1 text-slate-800 dark:text-white">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-blue-600 font-black text-lg">{product.price} ج.م</span>
                    
                    {/* ✅ زر الإضافة السريع (+) */}
                    <Button 
                      size="icon" 
                      className="h-9 w-9 rounded-full bg-slate-900 hover:bg-blue-600 text-white shadow-lg transition-colors"
                      onClick={(e) => {
                         e.stopPropagation(); // منع فتح الصفحة
                         addItem(product);
                      }}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed mx-4">
            <Filter className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">المتجر فارغ حالياً</h3>
            <p className="text-slate-500 text-sm mt-2">ابدأ بإضافة منتجاتك من لوحة التحكم</p>
            <Button variant="link" onClick={() => navigate("/admin")} className="mt-4">
              الذهاب للوحة التحكم &larr;
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

