import { useEffect, useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [, navigate] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // هات تفاصيل المنتجات اللي أرقامها في المفضلة
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlist);

      if (data) setProducts(data);
      setLoading(false);
    }
    getWishlistProducts();
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" /> المفضلة ({products.length})
        </h1>

        {loading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
                <div className="relative aspect-[3/4]">
                  <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                  
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold line-clamp-1">{product.name}</h3>
                  <p className="text-blue-600 font-black text-lg mb-3">{product.price} ج.م</p>
                  
                  <Button onClick={() => addItem(product)} className="w-full bg-slate-900 hover:bg-blue-600">
                    <ShoppingBag className="w-4 h-4 ml-2" /> إضافة للسلة
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl border-slate-300">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">القائمة فارغة 💔</h3>
            <p className="text-slate-500 mb-4">أضف بعض المنتجات التي تعجبك هنا.</p>
            <Button variant="link" onClick={() => navigate("/shop")} className="text-blue-600 font-bold">تصفح المنتجات</Button>
          </div>
        )}
      </div>
    </div>
  );
}
