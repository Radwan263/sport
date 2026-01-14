import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package, ShoppingBag, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');
  
  // --- States for Products ---
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "men",
    image_url: "",
    description: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // --- States for Orders ---
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    
    // اشتراك لحظي في الطلبات (عشان لو حد طلب وانت فاتح الصفحة تظهر علطول)
    const channel = supabase
      .channel('realtime orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new, ...prev]);
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

  // --- Handlers: Products ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const { error } = await supabase.from('products').insert([newProduct]);
    
    if (!error) {
      toast.success("تم إضافة المنتج بنجاح");
      setNewProduct({ name: "", price: "", category: "men", image_url: "", description: "" });
      fetchProducts();
    } else {
      toast.error("حدث خطأ أثناء الإضافة");
    }
    setIsAdding(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      toast.success("تم الحذف");
      fetchProducts();
    }
  };

  // --- Handlers: Orders ---
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    // تحديث الواجهة فوراً (Optimistic UI)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error("فشل تحديث الحالة");
      fetchOrders(); // تراجع لو حصل خطأ
    } else {
      toast.success("تم تحديث حالة الطلب ✅");
    }
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
          <div className="flex bg-white rounded-lg p-1 border shadow-sm">
             <button 
               onClick={() => setActiveTab('orders')}
               className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               الطلبات ({orders.length})
             </button>
             <button 
               onClick={() => setActiveTab('products')}
               className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               المنتجات ({products.length})
             </button>
          </div>
        </div>

        {/* --- تبويب الطلبات (Orders Tab) --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="text-center py-20"><Loader2 className="animate-spin w-10 h-10 mx-auto text-blue-600" /></div>
            ) : orders.length > 0 ? (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* رأس الكارت */}
                    <div className="bg-slate-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <span className="font-bold text-slate-700">طلب #{order.id.slice(0, 6)}</span>
                        <span className="text-slate-400 text-sm mr-2">{format(new Date(order.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}</span>
                      </div>
                      
                      {/* 🚦 تغيير الحالة */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">الحالة:</label>
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`h-9 rounded-md border text-sm font-bold px-2 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">⏳ قيد المراجعة</option>
                          <option value="processing">⚙️ قيد التنفيذ</option>
                          <option value="shipped">🚚 خرج للتوصيل</option>
                          <option value="delivered">✅ تم الاستلام</option>
                          <option value="cancelled">❌ ملغي</option>
                        </select>
                      </div>
                    </div>

                    {/* تفاصيل العميل والطلب */}
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-sm">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" /> بيانات العميل
                        </h3>
                        <p><span className="text-slate-400">الاسم:</span> {order.shipping_address?.fullName || "غير محدد"}</p>
                        <p><span className="text-slate-400">الهاتف:</span> {order.shipping_address?.phone}</p>
                        <p><span className="text-slate-400">العنوان:</span> {order.shipping_address?.city} - {order.shipping_address?.street}</p>
                        {order.shipping_address?.weight && (
                           <p className="text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                             المقاس: {order.shipping_address?.size} | الوزن: {order.shipping_address?.weight}
                           </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-blue-600" /> المنتجات
                        </h3>
                        <div className="max-h-[150px] overflow-y-auto custom-scrollbar border rounded-lg p-2 bg-slate-50">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0 border-dashed border-slate-200">
                              <span>{item.name} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                              <span className="font-bold">{item.price * item.quantity} ج.م</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 font-black text-lg">
                          <span>الإجمالي:</span>
                          <span className="text-green-600">{order.total_price} ج.م</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-400">
                لا توجد طلبات حتى الآن 😴
              </div>
            )}
          </div>
        )}

        {/* --- تبويب المنتجات (Products Tab) --- */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* فورم الإضافة */}
            <div className="lg:col-span-1 h-fit bg-white p-6 rounded-xl shadow-sm border sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="bg-slate-900 text-white rounded p-1" /> إضافة منتج جديد
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <Input required placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <Input required type="number" placeholder="السعر" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="men">رجالي</option>
                  <option value="women">حريمي</option>
                  <option value="kids">أطفال</option>
                </select>

                <Input required placeholder="رابط الصورة (URL)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                <Textarea placeholder="وصف المنتج..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />

                <Button type="submit" disabled={isAdding} className="w-full bg-slate-900 font-bold">
                  {isAdding ? <Loader2 className="animate-spin" /> : "نشر المنتج"}
                </Button>
              </form>
            </div>

            {/* قائمة المنتجات */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-3 rounded-xl border shadow-sm flex gap-4 items-start relative group hover:border-blue-300 transition-colors">
                  <img src={product.image_url} className="w-20 h-20 object-cover rounded-lg bg-slate-100" alt="" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                    <p className="text-blue-600 font-black">{product.price} ج.م</p>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{product.category}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

