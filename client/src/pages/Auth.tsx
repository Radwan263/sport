import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext"; // ✅ ده الصح
import { Loader2, Mail, Lock, Phone, Chrome } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  // لو هو مسجل دخول أصلاً، وديه الصفحة الرئيسية
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح 👋");
        navigate("/");
      } 
      else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              name: formData.fullName,
              phone: formData.phone // تخزين رقم الهاتف كبيانات إضافية مؤقتاً
            },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! افحص بريدك الإلكتروني للتفعيل 📧");
        setMode("login");
      }
      else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        toast.success("تم إرسال رابط الاستعادة لبريدك الإلكتروني 📨");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول بجوجل (يحتاج إعدادات في Supabase)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <h1 className="text-3xl font-black mb-2">ERA SPORT</h1>
          <p className="text-slate-400">
            {mode === "login" && "مرحباً بعودتك! 👋"}
            {mode === "register" && "انضم لعائلة الأبطال 🚀"}
            {mode === "reset" && "استعادة كلمة المرور 🔒"}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          
          {/* Tabs */}
          {mode !== "reset" && (
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button 
                onClick={() => setMode("login")} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
              >
                تسجيل دخول
              </button>
              <button 
                onClick={() => setMode("register")} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === "register" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
              >
                حساب جديد
              </button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">الاسم بالكامل</label>
                  <Input 
                    required 
                    placeholder="مثال: أحمد محمد" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">رقم الهاتف (اختياري)</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="010XXXXXXXX" 
                      className="pr-9"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pr-9"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {mode !== "reset" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                   <label className="text-xs font-bold text-slate-500">كلمة المرور</label>
                   {mode === "login" && (
                     <button type="button" onClick={() => setMode("reset")} className="text-xs text-blue-600 font-bold hover:underline">
                       نسيت كلمة السر؟
                     </button>
                   )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    className="pr-9"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-lg">
              {loading ? <Loader2 className="animate-spin" /> : 
                mode === "login" ? "دخــول" : 
                mode === "register" ? "إنشاء حساب" : "إرسال الرابط"}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">أو سجل عبر</span></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" onClick={handleGoogleLogin} className="w-full font-bold h-11 border-slate-200">
                  <Chrome className="w-5 h-5 mr-2 text-red-500" /> Google
                </Button>
              </div>
            </>
          )}

          {mode === "reset" && (
             <Button variant="link" onClick={() => setMode("login")} className="w-full mt-4">
               العودة لتسجيل الدخول
             </Button>
          )}

        </div>
      </div>
    </div>
  );
}
