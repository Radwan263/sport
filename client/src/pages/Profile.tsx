import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Loader2, Package, Clock, XCircle, LogOut, MapPin, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const TELEGRAM_BOT_TOKEN = "8505898687:AAHyu68rTcmpCjsm4DrBiN-2L7osaQLGd88";
const TELEGRAM_CHAT_ID = "1414736450";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, [user, navigate]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t("confirmCancel") || "هل أنت متأكد من إلغاء هذا الطلب؟ 😢")) return;
    
    const orderToCancel = orders.find(o => o.id === orderId);

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success(t("cancelSuccess") || "تم إلغاء الطلب بنجاح");

      if (orderToCancel) {
        const message = `
🚨 *تنبيه: عميل لغى أوردر* 🚨
---------------------------
📦 *رقم الطلب:* #${orderToCancel.id.slice(0, 6)}
👤 *العميل:* ${orderToCancel.shipping_address?.fullName}
📞 *الهاتف:* ${orderToCancel.shipping_address?.phone}
📍 *المحافظة:* ${orderToCancel.shipping_address?.governorate}
💰 *قيمة الطلب:* ${orderToCancel.total_price} ج.م
---------------------------
⚠️ *الحالة:* قام العميل بإلغاء الطلب بنفسه من الموقع.
`;
        try {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
          });
        } catch (err) {
          console.error("فشل إرسال الإشعار", err);
        }
      }

    } else {
      toast.error(t("error") || "حدث خطأ، حاول مرة أخرى");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: t("pending") || 'قيد المراجعة', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400', icon: Clock };
      case 'processing': return { label: t("processing") || 'قيد التنفيذ', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400', icon: Loader2 };
      case 'shipped': return { label: t("shipped") || 'تم الشحن', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400', icon: Package };
      case 'delivered': return { label: t("delivered") || 'تم التسليم', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', icon: Package };
      case 'cancelled': return { label: t("cancelled") || 'تم الإلغاء', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400', icon: XCircle };
      default: return { label: status, color: 'bg-gray-100 dark:bg-gray-900/30', icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-900 dark:text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/shop")}
              className="rounded-full"
            >
              <ArrowLeft className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`} />
            </Button>
            <h1 
              className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
              onClick={() => navigate("/")}
            >
              ERA<span className="text-red-600">SPORT</span>
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t("welcome") || "أهلاً"}, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t("trackOrders") || "تابع حالة طلباتك من هنا"}</p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleLogout} 
            className="font-bold dark:bg-red-700 dark:hover:bg-red-800"
          >
            <LogOut className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {t("logout") || "تسجيل خروج"}
          </Button>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <Package className="text-blue-600 dark:text-blue-500" />
            {t("myOrders") || "طلباتي السابقة"}
          </h2>

          {orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => {
                const status = getStatusInfo(order.status);
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={order.id} 
                    className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all ${
                      order.status === 'cancelled' ? 'opacity-75 grayscale' : ''
                    }`}
                  >
                    {/* Order Header */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b dark:border-slate-700 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-slate-900 dark:text-white">#{order.id.slice(0, 6)}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </span>
                      </div>
                      <span className="text-sm text-slate-400 dark:text-slate-500 font-bold">
                        {format(new Date(order.created_at), "dd MMMM yyyy", { locale: ar })}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="p-4 md:p-6 grid md:grid-cols-3 gap-6">
                      {/* Products */}
                      <div className="md:col-span-2 space-y-3">
                        <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-2">{t("products") || "المنتجات"}</h3>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-2">
                               <div className="w-8 h-8 bg-white dark:bg-slate-600 rounded flex items-center justify-center font-bold text-xs border dark:border-slate-600">x{item.quantity}</div>
                               <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                             </div>
                             <span className="text-sm font-mono text-slate-900 dark:text-white">{item.price * item.quantity} ج.م</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Info & Summary */}
                      <div className="space-y-4 border-t md:border-t-0 md:border-r md:border-slate-200 dark:md:border-slate-700 pt-4 md:pt-0 md:pr-6">
                        <div>
                          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-2">{t("shippingInfo") || "بيانات الشحن"}</h3>
                          <p className="text-sm flex items-center gap-1 font-bold text-slate-900 dark:text-white">{order.shipping_address?.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3"/> {order.shipping_address?.governorate} - {order.shipping_address?.street}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3"/> {order.shipping_address?.phone}
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t dark:border-slate-700">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-600 dark:text-slate-400">{t("total") || "الإجمالي"}</span>
                            <span className="font-black text-xl text-red-600 dark:text-red-500">{order.total_price} ج.م</span>
                          </div>

                          {order.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <XCircle className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                              {t("cancelOrder") || "إلغاء الطلب"}
                            </Button>
                          )}
                          {order.status === 'cancelled' && (
                            <div className="text-center text-red-500 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                              {t("orderCancelled") || "تم إلغاء هذا الطلب"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <Package className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">{t("noOrders") || "لسه مفيش طلبات"}</h3>
              <Button 
                onClick={() => navigate("/shop")} 
                className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold mt-4"
              >
                {t("continueShoppingButton") || "ابدأ التسوق"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
