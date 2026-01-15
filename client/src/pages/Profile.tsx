import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Loader2, Package, Clock, XCircle, LogOut, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
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

  // 🛑 دالة إلغاء الطلب
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟ 😢")) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    
    if (!error) {
      // تحديث الحالة فوراً قدام العميل
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success("تم إلغاء الطلب بنجاح");
    } else {
      toast.error("حدث خطأ، حاول مرة أخرى");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'processing': return { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-800', icon: Loader2 };
      case 'shipped': return { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: Package };
      case 'delivered': return { label: 'تم التسليم', color: 'bg-green-100 text-green-800', icon: Package };
      case 'cancelled': return { label: 'تم الإلغاء', color: 'bg-red-100 text-red-800', icon: XCircle };
      default: return { label: status, color: 'bg-gray-100', icon: Package };
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* رأس الصفحة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">أهلاً، {user?.email?.split('@')[0]} 👋</h1>
            <p className="text-slate-500 text-sm">أهلاً بيك في بروفايلك الشخصي</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="font-bold">
            <LogOut className="w-4 h-4 ml-2" /> تسجيل خروج
          </Button>
        </div>

        {/* قائمة الطلبات */}
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" /> طلباتي السابقة
        </h2>

        {orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => {
              const status = getStatusInfo(order.status);
              const StatusIcon = status.icon;

              return (
                <div key={order.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${order.status === 'cancelled' ? 'opacity-75 grayscale' : ''}`}>
                  {/* هيدر الطلب */}
                  <div className="bg-slate-50 p-4 border-b flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">#{order.id.slice(0, 6)}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400 font-bold">{format(new Date(order.created_at), "dd MMMM yyyy", { locale: ar })}</span>
                  </div>

                  {/* تفاصيل الطلب */}
                  <div className="p-4 md:p-6 grid md:grid-cols-3 gap-6">
                    {/* المنتجات */}
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="font-bold text-sm text-slate-500 mb-2">المنتجات</h3>
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-xs border">x{item.quantity}</div>
                             <span className="text-sm font-bold">{item.name}</span>
                           </div>
                           <span className="text-sm font-mono">{item.price * item.quantity} ج.م</span>
                        </div>
                      ))}
                    </div>

                    {/* المعلومات والملخص */}
                    <div className="space-y-4 border-r pr-0 md:pr-6 border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm text-slate-500 mb-1">عنوان التوصيل</h3>
                        <p className="text-sm flex items-center gap-1"><MapPin className="w-3 h-3"/> {order.shipping_address?.governorate}</p>
                        <p className="text-xs text-slate-400">{order.shipping_address?.street}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> {order.shipping_address?.phone}</p>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-slate-600">الإجمالي</span>
                          <span className="font-black text-xl text-blue-600">{order.total_price} ج.م</span>
                        </div>

                        {/* ✅✅ زر الإلغاء (يظهر فقط لو الطلب قيد المراجعة) ✅✅ */}
                        {order.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <XCircle className="w-4 h-4 ml-2" /> إلغاء الطلب
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">لا توجد طلبات سابقة</h3>
            <Button variant="link" onClick={() => navigate("/shop")} className="text-blue-600 font-bold mt-2">ابدأ التسوق الآن</Button>
          </div>
        )}
      </div>
    </div>
  );
}

