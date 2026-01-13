import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Image as ImageIcon, Loader2, Lock, Edit2, X } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]); // قائمة المنتجات

  // --- 🔐 نظام الحماية ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "263200") {
      setIsAuthorized(true);
      fetchProducts(); // جلب المنتجات عند الدخول
    } else {
      alert("🚫 كلمة المرور خاطئة!");
      setPasswordInput("");
    }
  };
  // ----------------------

  // بيانات الفورم
  const [editingId, setEditingId] = useState<string | null>(null); // لو فيه قيمة يبقى بنعدل، لو null يبقى بنضيف جديد
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "men",
    description: "",
  });

  const [mainImage, setMainImage] = useState(""); 
  const [extraImages, setExtraImages] = useState<string[]>([]); 

  // --- دوال جلب البيانات ---
  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }); // الأحدث فوق
    if (!error && data) setProducts(data);
  }

  // --- تعبئة الفورم للتعديل ---
  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
    });
    setMainImage(product.image_url || "");
    setExtraImages(product.images || []);
    
    // اطلع فوق للفورم
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- إلغاء التعديل ---
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", category: "men", description: "" });
    setMainImage("");
    setExtraImages([]);
  };

  // --- حذف منتج ---
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع!")) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      alert("تم الحذف بنجاح 🗑️");
      fetchProducts(); // تحديث القائمة
    } else {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // --- إدارة حقول الصور ---
  const addImageField = () => setExtraImages([...extraImages, ""]);
  const updateImageField = (index: number, value: string) => {
    const updated = [...extraImages];
    updated[index] = value;
    setExtraImages(updated);
  };
  const removeImageField = (index: number) => {
    setExtraImages(extraImages.filter((_, i) => i !== index));
  };

  // --- الحفظ (إضافة أو تعديل) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanExtraImages = extraImages.filter(img => img.trim() !== "");
      
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        image_url: mainImage, 
        images: cleanExtraImages, 
      };

      if (editingId) {
        // ✏️ وضع التعديل
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        alert("تم تعديل المنتج بنجاح! ✅");
      } else {
        // ➕ وضع الإضافة
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
        alert("تمت إضافة المنتج بنجاح! 🚀");
      }
      
      // إعادة ضبط الصفحة
      cancelEdit();
      fetchProducts();

    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 شاشة القفل
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">منطقة محظورة 🚫</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="اكتب الرقم السري..." 
              className="text-center text-lg tracking-widest"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold h-12">فتـح اللوحـة</Button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ اللوحة الرئيسية
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto grid gap-8">
        
        {/* === فورم الإضافة/التعديل === */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                {editingId ? <Edit2 className="text-white w-6 h-6" /> : <Plus className="text-white w-6 h-6" />}
              </div>
              <h1 className="text-2xl font-black text-slate-800">
                {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h1>
            </div>
            {editingId && (
              <Button onClick={cancelEdit} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <X className="w-4 h-4 ml-2" /> إلغاء التعديل
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المنتج</label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السعر (ج.م)</label>
                <Input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">القسم</label>
                <select className="flex h-10 w-full rounded-md border border-input px-3" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="men">رجالي 🧔</option>
                  <option value="kids">أطفال 👶</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">وصف المنتج</label>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <hr className="border-dashed" />

            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800">الصور</label>
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">الصورة الرئيسية</span>
                <Input required placeholder="رابط الصورة..." value={mainImage} onChange={(e) => setMainImage(e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500">صور إضافية</span>
                   <Button type="button" onClick={addImageField} size="sm" className="bg-green-600 text-white gap-1"><Plus className="w-4 h-4" /> إضافة</Button>
                </div>
                {extraImages.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input placeholder={`رابط صورة ${index + 1}`} value={url} onChange={(e) => updateImageField(index, e.target.value)} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeImageField(index)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className={`w-full h-12 text-lg font-bold ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {loading ? <Loader2 className="animate-spin" /> : editingId ? "حفظ التعديلات ✨" : "نشر المنتج 🚀"}
            </Button>
          </form>
        </div>

        {/* === قائمة المنتجات الحالية === */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
             <ImageIcon className="w-6 h-6 text-blue-600" /> المنتجات المنشورة ({products.length})
          </h2>
          
          <div className="grid gap-4">
            {products.length === 0 ? (
               <p className="text-center text-slate-500 py-8">لا توجد منتجات مضافة بعد.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <img src={product.image_url || "https://placehold.co/100"} alt={product.name} className="w-20 h-20 object-cover rounded-md bg-gray-100" />
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                    <p className="text-blue-600 font-bold">{product.price} ج.م</p>
                    <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{product.category === 'men' ? 'رجالي' : 'أطفال'}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={() => handleEditClick(product)} size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Edit2 className="w-4 h-4" /> تعديل
                    </Button>
                    <Button onClick={() => handleDelete(product.id)} size="sm" variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none">
                      <Trash2 className="w-4 h-4" /> حذف
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

