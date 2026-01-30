import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { t, language } = useLanguage();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
            onClick={() => navigate("/")}
          >
            ERA<span className="text-red-600">SPORT</span>
          </h1>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/shop")}
            className="rounded-full"
          >
            <ArrowLeft className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`} />
          </Button>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t("cart")}</h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed dark:border-slate-700">
            <ShoppingBag className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-4">{t("cartEmpty")}</h3>
            <Button 
              onClick={() => navigate("/shop")}
              className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"
            >
              {t("continueShoppingButton")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 flex gap-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-2xl font-black text-red-600 dark:text-red-500">{item.price} ج.م</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-lg dark:bg-slate-700 dark:border-slate-600"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-lg dark:bg-slate-700 dark:border-slate-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <span className="flex-1 text-right font-bold text-slate-900 dark:text-white">
                        {(item.price * item.quantity).toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">{t("total")}</h3>
                
                <div className="space-y-3 mb-6 pb-6 border-b dark:border-slate-700">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t("quantity")}:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-white">
                    <span>{t("total")}:</span>
                    <span className="text-red-600 dark:text-red-500">{totalPrice.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-3 rounded-xl mb-3"
                >
                  {t("checkout")}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/shop")}
                  className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  {t("continueShoppingButton")}
                </Button>

                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="w-full text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-3"
                  >
                    {t("removeItem")} {t("all")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
