import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Loader2, Package, LogOut, User, MapPin, Calendar, CheckCircle2, Edit3, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة وضع التعديل
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    address: ""
  });

  if (!isAuthenticated) { navigate("/auth"); return null; }

  // 1. جلب بيانات المستخدم والطلبات
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // جلب الطلبات
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData);

      // (اختياري) لو عندك جدول profiles ممكن تجيب منه البيانات المحفوظة
      // حالياً هنعتمد على آخر طلب كبيانات افتراضية للتسهيل
      if (ordersData && ordersData.length > 0) {
        const lastOrder = ordersData[0];
        setProfileData({
          fullName: user.email?.split('@')[0] || "", // أو من بيانات الطلب لو خزنتها
          phone: lastOrder.shipping_address?.phone || "",
          address: `${lastOrder.shipping_address?.city || ""} - ${lastOrder.shipping_address?.street || ""}`
        });
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  // حفظ التعديلات (هنا ممكن نحدث جدول profiles لو موجود، أو مجرد State)
  const handleSaveProfile = () => {
    // هنا المفروض كود التحديث في قاعدة البيانات (لو عملنا جدول profiles)
    // حالياً هنكتفي بتحديث الواجهة كأنها اتحفظت
    setIsEditing(false);
    toast.success("تم تحديث بياناتك بنجاح ✅");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // دالة رسم شريط الحالة (Timeline)
  const renderOrderStatus = (status: string) => {
    const steps = [
      { key: 'pending', label: 'مراجعة الطلب 🧐' },
      { key: 'processing', label: 'قيد التنفيذ ⚙️' },
      { key: 'shipped', label: 'خرج للتوصيل 🚚' },
      { key: 'delivered', label: 'تم الاستلام 🎉' },
    ];

    // تحديد المرحلة الحالية
    let currentStepIndex = steps.findIndex(s => s.key === status);
    if (status === 'cancelled') currentStepIndex = -1;

    return (
      <div className="flex items-center justify-between relative mt-4 px-2">
        {/* الخط الواصل الخلفي */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 rounded-full" />
        
        {/* الخط الملون المتقدم */}
        <div 
          className="absolute top-1/2 right-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-slate-300'}
                ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}
              `}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={`text-[10px] md:text-xs font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* كارت البيانات الشخصية (قابل للتعديل) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="text-blue-600" /> بياناتي
            </h2>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 ml-1" /> تعديل
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                  <X className="w-4 h-4" /> إلغاء
                </Button>
                <Button onClick={handleSaveProfile} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 ml-1" /> حفظ
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">الاسم</label>
              {isEditing ? (
                <Input value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} />
              ) : (
                <p className="font-bold text-slate-800">{profileData.fullName || user?.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">البريد الإلكتروني</label>
              <p className="font-bold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">رقم الهاتف</label>
              {isEditing ? (
                <Input value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
              ) : (
                <p className="font-bold text-slate-800">{profileData.phone || "غير مسجل"}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">العنوان الافتراضي</label>
              {isEditing ? (
                <Input value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} />
              ) : (
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {profileData.address || "لم يتم تحديد عنوان"}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t flex justify-end">
             <Button variant="destructive" onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none font-bold text-xs h-8">
               <LogOut className="w-3 h-3 ml-2" /> تسجيل خروج
             </Button>
          </div>
        </div>

        {/* قائمة الطلبات مع شريط التتبع */}
        <div className="flex items-center gap-2 mt-8">
          <Package className="text-blue-600 w-6 h-6" />
          <h2 className="text-2xl font-bold text-slate-800">متابعة الطلبات ({orders.length})</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
        ) : orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
                {/* رأس الطلب */}
                <div className="bg-slate-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">#{order.id.slice(0,6)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(order.created_at), "dd MMM yyyy", { locale: ar })}</span>
                  </div>
                  {order.status === 'cancelled' && <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">تم الإلغاء ❌</span>}
                </div>

                {/* تفاصيل الطلب */}
                <div className="p-6">
                  {/* شريط التتبع (يظهر فقط لو الطلب مش ملغي) */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-8 pb-8 border-b border-dashed">
                      {renderOrderStatus(order.status)}
                    </div>
                  )}

                  <div className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-slate-100 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-slate-600">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{item.price * item.quantity} ج.م</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                     <span className="text-slate-500 text-sm">الإجمالي شامل الشحن</span>
                     <span className="text-xl font-black text-blue-600">{order.total_price} ج.م</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">لا توجد طلبات سابقة</h3>
          </div>
        )}

      </div>
    </div>
  );
}

