import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: string[]; // هنخزن هنا أرقام المنتجات المحبوبة فقط
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  // تحميل المفضلة أول ما اليوزر يدخل
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    async function fetchWishlist() {
      const { data } = await supabase.from('wishlist').select('product_id');
      if (data) {
        setWishlist(data.map((item: any) => item.product_id));
      }
    }
    fetchWishlist();
  }, [user]);

  // دالة الإضافة/الحذف (القلب)
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("سجل دخولك الأول يا بطل 😉");
      return;
    }

    if (wishlist.includes(productId)) {
      // لو موجود -> احذفه 💔
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (!error) {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success("تم الحذف من المفضلة 💔");
      }
    } else {
      // لو مش موجود -> ضيفه ❤️
      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (!error) {
        setWishlist(prev => [...prev, productId]);
        toast.success("تمت الإضافة للمفضلة ❤️");
      }
    }
  };

  const isInWishlist = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

