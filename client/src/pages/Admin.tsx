import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Image as ImageIcon, Loader2, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  // --- 🔐 نظام الحماية بكلمة السر ---
  const [isAuthorized, setIsAuthorized] = useState(false); // هل هو مسموح له؟
  const [passwordInput, setPasswordInput] = useState(""); // الباسورد اللي بيكتبه

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا الباسورد اللي أنت حددته
    if (passwordInput === "263200") {
      setIsAuthorized(true);
    } else {
      alert("🚫 كلمة المرور خاطئة!");
      setPasswordInput("");
    }
  };
  // ---------------------------------
  
  // بيانات المنتج
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "men",
    description: "",
  });

  // إدارة الصور
  const [mainImage, setMainImage] = useState(""); 
  const [extraImages, setExtraImages] = useState<string[]>([]); 

  // دوال الصور الإضافية
  const addImageField = () => setExtraImages([...extraImages, ""]);
  const updateImageField = (index: number, value: string) => {
    const updatedImages = [...extraImages];
    updatedImages[index] = value;
    setExtraImages(updatedImages);
  };
  const removeImageField = (index: number) => {
    const updatedImages = extraImages.filter((_, i) => i !== index);
    setExtraImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanExtraImages = extraImages.filter(img => img.trim() !== "");

      const { error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          image_url: mainImage, 
          images: cleanExtraImages, 
        }
      ]);

      if (error) throw error;

      alert("تمت إضافة المنتج بنجاح! 🚀");
      setNewProduct({ name: "", price: "", category: "men", description: "" });
      setMainImage("");
      setExtraImages([]);

    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🛑 شاشة القفل: لو الباسورد غلط، اعرض دي بس
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">منطقة محظورة 🚫</h2>
          <p className="text-slate-500">أدخل كود المرور للوصول للوحة التحكم</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="اكتب الرقم السري..." 
              className="text-center text-lg tracking-widest"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold h-12">
              فتـح اللوحـة
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ لو الباسورد صح، اعرض اللوحة
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
             <ImageIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">لوحة التحكم</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم المنتج</label>
            <Input
              required
              placeholder="مثلا: تيشرت نايكي أسود"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">السعر (ج.م)</label>
              <Input
                required
                type="number"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">القسم</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="men">رجالي 🧔</option>
                <option value="kids">أطفال 👶</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">وصف المنتج</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="اكتب تفاصيل المنتج هنا..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>

          <hr className="border-dashed" />

          <div className="space-y-4">
            <label className="text-lg font-bold text-slate-800">صور المنتج</label>
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">الصورة الرئيسية (الغلاف)</span>
              <Input
                required
                placeholder="https://... رابط الصورة"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500">صور إضافية (للسلايدر)</span>
                 <Button 
                   type="button" 
                   onClick={addImageField}
                   size="sm"
                   className="bg-green-600 hover:bg-green-700 text-white gap-1"
                 >
                   <Plus className="w-4 h-4" /> إضافة صورة
                 </Button>
              </div>

              {extraImages.map((url, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-right-4 fade-in duration-300">
                  <Input
                    placeholder={`رابط الصورة رقم ${index + 1}`}
                    value={url}
                    onChange={(e) => updateImageField(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImageField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg font-bold">
            {loading ? <Loader2 className="animate-spin" /> : "نشر المنتج الآن 🚀"}
          </Button>
        </form>
      </div>
    </div>
  );
}

