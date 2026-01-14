import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Ticket, CheckCircle, ShoppingBag } from "lucide-react"; // ✅ ضفنا Ticket
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons'>('orders');
  
  // --- بيانات المنتجات ---
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "men", image_url: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);

  // --- بيانات الطلبات ---
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- بيانات الكوبونات (الجديد) ---
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_percent: "" });

  // جلب البيانات عند الفتح
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCoupons(); // 👈 دالة جديدة

    // اشتراك لحظي في الطلبات
    const channel = supabase
      .channel('realtime admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new, ...prev]);
        toast("🔔 طلب جديد وصل!");
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- دوال الجلب ---
  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoadingOrders(false);
  }

  async function fetchCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
  }

  // --- دوال الكوبونات (جديد) ---
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount_percent) return;

    const { error } = await supabase.from('coupons').insert([{
      code: newCoupon.code.toUpperCase(), // نخلي الكود حروف كبيرة
      discount_percent: Number(newCoupon.discount_percent)
    }]);
    
    if (!error) {
      toast.success("تم إضافة الكوبون بنجاح 🎉");
      setNewCoupon({ code: "", discount_percent: "" });
      fetchCoupons();
    } else {
      toast.error("خطأ: تأكد إن الكود مش متكرر");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if(!confirm("هل أنت متأكد من حذف الكوبون؟")) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
    toast.success("تم الحذف");
  };

  // --- دوال المنتجات والطلبات (القديمة) ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const { error } = await supabase.from('products').insert([newProduct]);
    if (!error) { toast.success("تم النشر"); setNewProduct({ name: "", price: "", category: "men", image_url: "", description: "" }); fetchProducts(); }
    setIsAdding(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("حذف المنتج؟")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    toast.success("تم تحديث الحالة");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">لوحة التحكم 🛠️</h1>
          
          {/* أزرار التنقل بين التابات */}
          <div className="flex bg-white rounded-lg p-1 border shadow-sm">
             <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>الطلبات</button>
             <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>المنتجات</button>
             <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'coupons' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>الكوبونات</button>
          </div>
        </div>

        {/* --- 1. قسم الطلبات (Orders) --- */}
        {activeTab === 'orders' && (
           <div className="grid gap-6">
             {loadingOrders ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></div> : 
              orders.length > 0 ? orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
                   <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                      <div>
                        <span className="font-bold text-lg">#{order.id.slice(0,6)}</span>
                        <span className="mr-2 text-sm text-slate-400">{format(new Date(order.created_at), "dd MMM HH:mm", {locale: ar})}</span>
                      </div>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)} 
                        className={`text-xs font-bold p-2 rounded cursor-pointer outline-none border ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">⏳ مراجعة</option>
                        <option value="processing">⚙️ تنفيذ</option>
                        <option value="shipped">🚚 شحن</option>
                        <option value="delivered">✅ تم</option>
                        <option value="cancelled">❌ ملغي</option>
                      </select>
                   </div>
                   
                   {/* تفاصيل الدفع والكوبون في الطلب */}
                   <div className="bg-slate-50 p-3 rounded mb-4 text-sm border border-slate-100">
                      <p className="mb-1">💳 <strong>الدفع:</strong> {order.payment_method === 'cod' ? 'عند الاستلام' : order.payment_method}</p>
                      
                      {order.coupon_code && (
                        <p className="text-green-600 font-bold mb-1">
                          🎟️ تم استخدام كوبون: {order.coupon_code} (وفر {order.discount_amount}ج)
                        </p>
                      )}
                      
                      {order.payment_receipt_url && (
                        <div className="mt-2 bg-white p-2 rounded border w-fit">
                          <p className="font-bold mb-1 text-xs text-slate-500">صورة التحويل:</p>
                          <a href={order.payment_receipt_url} target="_blank" className="text-blue-600 underline text-xs font-bold">عرض الصورة 🔗</a>
                        </div>
                      )}
                   </div>

                   <div className="text-sm space-y-1">
                      <p className="font-bold">👤 {order.shipping_address?.fullName}</p>
                      <p>📞 {order.shipping_address?.phone}</p>
                      <p>📍 {order.shipping_address?.governorate} - {order.shipping_address?.street}</p>
                      <div className="mt-2 pt-2 border-t flex justify-between font-black text-lg">
                        <span>الإجمالي:</span>
                        <span className="text-blue-600">{order.total_price} ج.م</span>
                      </div>
                   </div>
                </div>
             )) : <p className="text-center text-slate-400 py-10">مفيش طلبات لسه 😴</p>}
           </div>
        )}

        {/* --- 2. قسم المنتجات (Products) --- */}
        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border h-fit sticky top-4">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> منتج جديد</h3>
                    <form onSubmit={handleAddProduct} className="space-y-3">
                        <Input placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                        <Input placeholder="السعر" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                        <select className="w-full border rounded p-2 bg-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                            <option value="men">رجالي</option>
                            <option value="women">حريمي</option>
                            <option value="kids">أطفال</option>
                        </select>
                        <Input placeholder="رابط الصورة" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                        <Textarea placeholder="وصف المنتج" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                        <Button disabled={isAdding} className="w-full bg-slate-900 font-bold text-lg">{isAdding ? <Loader2 className="animate-spin"/> : "نشر المنتج"}</Button>
                    </form>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-3 rounded-xl border flex gap-3 relative group hover:shadow-md transition-all">
                            <img src={p.image_url} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                              <p className="text-blue-600 font-black">{p.price} ج.م</p>
                              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{p.category}</span>
                            </div>
                            <button onClick={() => handleDeleteProduct(p.id)} className="absolute top-2 left-2 text-red-500 bg-red-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- 3. قسم الكوبونات (Coupons) - الجديد --- */}
        {activeTab === 'coupons' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* فورم إضافة كوبون */}
            <div className="bg-white p-6 rounded-xl border h-fit shadow-sm">
               <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-slate-800">
                 <Ticket className="w-5 h-5 text-blue-600"/> إنشاء كوبون جديد
               </h3>
               <form onSubmit={handleAddCoupon} className="space-y-4">
                 <div>
                   <label className="text-sm font-bold text-slate-500 mb-1 block">كود الخصم (انجليزي)</label>
                   <Input required placeholder="مثال: SAVE50" className="uppercase font-mono font-bold" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-sm font-bold text-slate-500 mb-1 block">نسبة الخصم %</label>
                   <Input required type="number" placeholder="مثال: 10" value={newCoupon.discount_percent} onChange={e => setNewCoupon({...newCoupon, discount_percent: e.target.value})} />
                 </div>
                 <Button className="w-full bg-slate-900 font-bold h-12 text-lg hover:bg-blue-600 transition-colors">إضافة الكوبون ✨</Button>
               </form>
            </div>
            
            {/* قائمة الكوبونات */}
            <div className="space-y-4">
               {coupons.length > 0 ? coupons.map(c => (
                 <div key={c.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center">
                        <Ticket className="w-6 h-6"/>
                      </div>
                      <div>
                        <p className="font-black text-xl text-slate-800 tracking-wider">{c.code}</p>
                        <p className="text-green-600 font-bold text-sm">خصم {c.discount_percent}%</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => handleDeleteCoupon(c.id)} className="text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full w-10 h-10 p-0"><Trash2 className="w-5 h-5"/></Button>
                 </div>
               )) : (
                 <div className="text-center py-10 bg-white rounded-xl border border-dashed text-slate-400">
                   <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                   <p>مفيش كوبونات خصم حالياً</p>
                 </div>
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

