import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "hoodies", label: "Hoodies", icon: "🧥" },
  { id: "tshirts", label: "T-shirts", icon: "👕" },
  { id: "egypt", label: "منتخب مصر", icon: "🇪🇬" },
  { id: "arab-teams", label: "المنتخبات العربية", icon: "🏆" },
  { id: "al-ahly", label: "النادي الأهلي", icon: "🔴" },
  { id: "clubs", label: "أندية أخرى", icon: "⚽" },
  { id: "europe-clubs", label: "الأندية الأوروبية", icon: "🇪🇺" },
  { id: "europe-teams", label: "المنتخبات الأوروبية", icon: "🌍" },
];

// Mock products data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "قميص منتخب مصر 2024",
    price: 299,
    category: "egypt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    description: "قميص رسمي لمنتخب مصر بجودة عالية",
  },
  {
    id: 2,
    name: "قميص النادي الأهلي",
    price: 249,
    category: "al-ahly",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    description: "قميص النادي الأهلي الأحمر الكلاسيكي",
  },
  {
    id: 3,
    name: "هودي رياضي أسود",
    price: 399,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop",
    description: "هودي رياضي مريح وعملي",
  },
  {
    id: 4,
    name: "قميص ريال مدريد",
    price: 349,
    category: "europe-clubs",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop",
    description: "قميص ريال مدريد الأبيض الأصلي",
  },
  {
    id: 5,
    name: "قميص T-shirt أبيض",
    price: 149,
    category: "tshirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    description: "قميص T-shirt بسيط وأنيق",
  },
  {
    id: 6,
    name: "قميص منتخب السعودية",
    price: 299,
    category: "arab-teams",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    description: "قميص منتخب السعودية الأخضر",
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
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
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
    toast.success("تمت إضافة المنتج إلى السلة");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">متجر الملابس الرياضية</h1>
            <Button
              onClick={() => navigate("/cart")}
              variant="outline"
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="ابحث عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">التصنيفات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="text-xs"
            >
              الكل
            </Button>
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden bg-slate-200 dark:bg-slate-700 h-64">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  size="icon"
                  className="absolute bottom-4 right-4 rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-blue-600">{product.price} ج.م</span>
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    size="sm"
                    variant="outline"
                  >
                    أضف للسلة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">لم يتم العثور على منتجات</p>
            <Button onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}>
              عرض جميع المنتجات
            </Button>
          </div>
        )}

        {/* Checkout Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-4 md:w-auto">
            <Button
              onClick={handleCheckout}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              المتابعة للدفع ({cart.length} منتج)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
