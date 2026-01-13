import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Image as ImageIcon, Tag, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "men",
    image_url: "",
    description: ""
  });

  // جلب المنتجات من Supabase
  const fetchProducts = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("فشل في جلب البيانات");
    else setProducts(data || []);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة منتج جديد
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert([
      { 
        ...formData, 
        price: parseFloat(formData.price) 
      }
    ]);

    if (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } else {
      toast.success("تمت إضافة المنتج بنجاح ✨");
      setFormData({ name: "", price: "", category: "men", image_url: "", description: "" });
      fetchProducts();
    }
  };

  // حذف منتج
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("تعذر حذف المنتج");
    else {
      toast.success("تم حذف المنتج");
      fetchProducts();
    }
  };

  // تحديث السعر بسرعة
  const updatePrice = async (id: number, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    const { error } = await supabase
      .from("products")
      .update({ price })
      .eq("id", id);

    if (error) toast.error("فشل تحديث السعر");
    else toast.success("تم تحديث السعر");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900">لوحة تحكم EraSport 🏗️</h1>
          <Button variant="outline" onClick={fetchProducts} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="animate-spin" /> : "تحديث القائمة"}
          </Button>
        </div>

        {/* نموذج الإضافة */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} /> إضافة منتج جديد للمتجر
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><Tag size={14}/> اسم المنتج</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="مثلاً: تيشرت جيم أديداس" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><DollarSign size={14}/> السعر (ج.م)</label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2"><ImageIcon size={14}/> رابط الصورة</label>
                <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">الفئة</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="men">رجالي 🔥</option>
                  <option value="kids">أطفال 👶</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold">وصف المنتج</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="اكتب تفاصيل المنتج هنا..." />
              </div>
              <Button type="submit" className="md:col-span-2 h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold">
                نشر المنتج في المتجر 🚀
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* قائمة المنتجات الحالية */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700">المنتجات المعروضة حالياً ({products.length})</h2>
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={product.image_url || "https://placehold.co/100"} className="w-20 h-20 object-cover rounded-lg bg-slate-100" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.category === 'men' ? 'قسم الرجال' : 'قسم الأطفال'}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Input 
                        className="w-24 h-8 text-blue-600 font-bold" 
                        defaultValue={product.price} 
                        onBlur={(e) => updatePrice(product.id, e.target.value)}
                       />
                       <span className="text-xs font-bold text-slate-400">ج.م</span>
                    </div>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => {
                    if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) handleDelete(product.id)
                  }}>
                    <Trash2 size={18} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
