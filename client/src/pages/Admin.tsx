import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Ticket, CheckCircle, ShoppingBag, Banknote, Package } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons'>('orders');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "men", image_url: "", description: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_percent: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // حساب الإحصائيات
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total_price || 0), 0);
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCoupons();

    const channel = supabase.channel('realtime admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => [payload.new, ...prev]);
        toast("🔔 طلب جديد وصل!");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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

  // الدوال
  const handleAddProduct = async (e: React.FormEvent) => { e.preventDefault(); setIsAdding(true); const { error } = await supabase.from('products').insert([newProduct]); if (!error) { toast.success("تم النشر"); setNewProduct({ name: "", price: "", category: "men", image_url: "", description: "" }); fetchProducts(); } setIsAdding(false); };
  const handleDeleteProduct = async (id: string) => { if(!confirm("حذف؟")) return; await supabase.from('products').delete().eq('id', id); fetchProducts(); };
  const handleUpdateStatus = async (orderId: string, newStatus: string) => { setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)); await supabase.from('orders').update({ status: newStatus }).eq('id', orderId); toast.success("تم تحديث الحالة"); };
  const handleAddCoupon = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await supabase.from('coupons').insert([{ code: newCoupon.code.toUpperCase(), discount_percent: Number(newCoupon.discount_percent) }]); if (!error) { toast.success("تم الكوبون"); setNewCoupon({ code: "", discount_percent: "" }); fetchCoupons(); } };
  const handleDeleteCoupon = async (id: string) => { if(!confirm("حذف؟")) return; await supabase.from('coupons').delete().eq('id', id); fetchCoupons(); };

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
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900">لوحة التحكم 🛠️</h1>
          <div className="flex bg-white rounded-lg p-1 border shadow-sm">
             <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>الطلبات</button>
             <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>المنتجات</button>
             <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'coupons' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>الكوبونات</button>
          </div>
        </div>

        {/* ✅ إحصائيات سريعة (Stats Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">إجمالي المبيعات</p>
                <h3 className="text-2xl font-black text-slate-900">{totalSales} ج.م</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600"><Banknote className="w-6 h-6"/></div>
           </div>

           <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">عدد الطلبات</p>
                <h3 className="text-2xl font-black text-slate-900">{orders.length} <span className="text-xs text-yellow-500">({pendingOrders} قيد الانتظار)</span></h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600"><ShoppingBag className="w-6 h-6"/></div>
           </div>

           <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400">عدد المنتجات</p>
                <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Package className="w-6 h-6"/></div>
           </div>
        </div>

        {/* المحتوى */}
        {activeTab === 'orders' && (
           <div className="grid gap-6">
             {loadingOrders ? <Loader2 className="animate-spin mx-auto"/> : orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
                   <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                      <div><span className="font-bold">#{order.id.slice(0,6)}</span> <span className="text-sm text-slate-400">{format(new Date(order.created_at), "dd MMM HH:mm", {locale: ar})}</span></div>
                      <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} className={`text-xs font-bold p-2 rounded cursor-pointer outline-none border ${getStatusColor(order.status)}`}>
                        <option value="pending">⏳ مراجعة</option>
                        <option value="processing">⚙️ تنفيذ</option>
                        <option value="shipped">🚚 شحن</option>
                        <option value="delivered">✅ تم</option>
                        <option value="cancelled">❌ ملغي</option>
                      </select>
                   </div>
                   <div className="bg-slate-50 p-3 rounded text-sm mb-2">
                      <p>💳 {order.payment_method}</p>
                      {order.payment_receipt_url && <a href={order.payment_receipt_url} target="_blank" className="text-blue-600 font-bold underline text-xs">عرض صورة التحويل 🔗</a>}
                   </div>
                   <div className="text-sm">
                      <p>👤 {order.shipping_address?.fullName} - {order.shipping_address?.phone}</p>
                      <p className="font-bold text-blue-600 mt-2 text-lg">{order.total_price} ج.م</p>
                   </div>
                </div>
             ))}
           </div>
        )}

        {activeTab === 'products' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border h-fit"><h3 className="font-bold mb-4">إضافة منتج</h3><form onSubmit={handleAddProduct} className="space-y-3"><Input placeholder="الاسم" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /><Input placeholder="السعر" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /><select className="w-full border rounded p-2" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="men">رجالي</option><option value="women">حريمي</option><option value="kids">أطفال</option></select><Input placeholder="رابط الصورة" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} /><Textarea placeholder="وصف" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} /><Button disabled={isAdding} className="w-full bg-slate-900">{isAdding ? <Loader2 className="animate-spin"/> : "نشر"}</Button></form></div>
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">{products.map(p => (<div key={p.id} className="bg-white p-3 rounded border flex gap-3 relative group"><img src={p.image_url} className="w-16 h-16 rounded object-cover" /><div><p className="font-bold">{p.name}</p><p className="text-blue-600">{p.price}ج</p></div><button onClick={() => handleDeleteProduct(p.id)} className="absolute top-2 left-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button></div>))}</div>
             </div>
        )}
        
        {activeTab === 'coupons' && (
             <div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl border h-fit"><h3 className="font-bold mb-4 flex items-center gap-2"><Ticket className="w-5 h-5"/> كوبون جديد</h3><form onSubmit={handleAddCoupon} className="space-y-4"><Input required placeholder="CODE" className="uppercase" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} /><Input required type="number" placeholder="%" value={newCoupon.discount_percent} onChange={e => setNewCoupon({...newCoupon, discount_percent: e.target.value})} /><Button className="w-full bg-slate-900">إضافة</Button></form></div><div className="space-y-4">{coupons.map(c => (<div key={c.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm"><div><p className="font-black text-lg">{c.code}</p><p className="text-green-600 font-bold">{c.discount_percent}%</p></div><Button variant="ghost" onClick={() => handleDeleteCoupon(c.id)} className="text-red-500"><Trash2 className="w-5 h-5"/></Button></div>))}</div></div>
        )}

      </div>
    </div>
  );
}

