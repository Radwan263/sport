import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "قميص منتخب مصر 2024",
    price: 299,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "قميص النادي الأهلي",
    price: 249,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "هودي رياضي أسود",
    price: 399,
    image: "https://images.unsplash.com/photo-1556821552-7f41c5d440db?w=400&h=400&fit=crop",
  },
];

export default function Cart() {
  const [, navigate] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: "قميص منتخب مصر 2024", price: 299, quantity: 1, image: MOCK_PRODUCTS[0].image },
    { id: 3, name: "هودي رياضي أسود", price: 399, quantity: 2, image: MOCK_PRODUCTS[2].image },
  ]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success("تمت إزالة المنتج من السلة");
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.success("تم تفريغ السلة");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/shop")}
            variant="outline"
            size="icon"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">سلة التسوق</h1>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">السلة فارغة</p>
              <Button onClick={() => navigate("/shop")}>
                العودة للتسوق
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {item.price} ج.م
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center"
                            min="1"
                          />
                          <Button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleRemoveItem(item.id)}
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>عدد المنتجات</span>
                      <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي</span>
                      <span>{totalPrice} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الشحن</span>
                      <span className="text-green-600">مجاني</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>الإجمالي</span>
                      <span className="text-lg text-blue-600">{totalPrice} ج.م</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    المتابعة للدفع
                  </Button>

                  <Button
                    onClick={() => navigate("/shop")}
                    variant="outline"
                    className="w-full"
                  >
                    متابعة التسوق
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="destructive"
                    className="w-full"
                  >
                    تفريغ السلة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
