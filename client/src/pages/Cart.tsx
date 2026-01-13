import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [, navigate] = useLocation();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <ShoppingBag className="w-16 h-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">سلة التسوق فارغة</h2>
        <p className="text-slate-500 mb-6">لم تقم بإضافة أي منتجات بعد.</p>
        <Button onClick={() => navigate("/shop")} className="bg-blue-600 hover:bg-blue-700">
          تصفح المنتجات الآن
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> سلة المشتريات
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قائمة المنتجات */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100" 
                />
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                  <p className="text-blue-600 font-bold">{item.price} ج.م</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-red-600"><Minus className="w-4 h-4" /></button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-green-600"><Plus className="w-4 h-4" /></button>
                </div>

                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full" onClick={clearCart}>
              تفريغ السلة بالكامل
            </Button>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border sticky top-4">
              <h3 className="text-xl font-bold mb-6">ملخص الطلب</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span>{totalPrice} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الشحن</span>
                  <span className="text-green-600 font-bold">مجاني</span>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between text-xl font-black text-slate-900">
                  <span>الإجمالي</span>
                  <span>{totalPrice} ج.م</span>
                </div>
              </div>

              <Button onClick={() => navigate("/checkout")} className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-blue-600 transition-colors">
                إتمام الشراء <ArrowRight className="mr-2 w-5 h-5" />
              </Button>
              
              <Button onClick={() => navigate("/shop")} variant="link" className="w-full mt-2 text-slate-500">
                العودة للتسوق
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
