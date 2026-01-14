import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [, navigate] = useLocation();
  
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); 

  // 1. تسجيل دخول بجوجل
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) toast.error("تنبيه: لازم تفعل جوجل من إعدادات Supabase الأول");
  };

  // 2. تسجيل دخول عادي
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("البيانات غير صحيحة");
    } else {
      toast.success("تم الدخول بنجاح 👋");
      navigate("/");
    }
  };

  // 3. إنشاء حساب (ثم طلب الكود)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم التسجيل! اكتب الكود اللي وصلك ع الإيميل 📧");
      setMode('verify'); // تحويل لصفحة الكود
    }
  };

  // 4. تفعيل بالكود (OTP)
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    
    setLoading(false);
    
    if (error) {
      toast.error("الكود غلط ❌");
    } else {
      toast.success("تم تفعيل الحساب! 🎉");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg border-none animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-slate-900">
            {mode === 'login' && "تسجيل الدخول"}
            {mode === 'register' && "إنشاء حساب جديد"}
            {mode === 'verify' && "تفعيل الحساب"}
          </CardTitle>
          <p className="text-sm text-slate-500 font-bold">ERA SPORT STORE</p>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {/* زر جوجل */}
          {mode !== 'verify' && (
            <>
              <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 gap-2 font-bold border-slate-300 hover:bg-slate-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                دخول سريع بـ Google
              </Button>
              <div className="relative flex justify-center text-xs uppercase my-2">
                <span className="bg-white px-2 text-slate-400 font-bold">أو</span>
              </div>
            </>
          )}

          {/* الفورم */}
          {mode !== 'verify' ? (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div className="relative">
                 <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                 <Input required type="email" placeholder="البريد الإلكتروني" className="pr-10 h-12 bg-slate-50" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="relative">
                 <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                 <Input required type="password" placeholder="كلمة المرور" className="pr-10 h-12 bg-slate-50" value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-lg bg-slate-900 hover:bg-blue-600">
                {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? "دخول 🚀" : "إنشاء حساب ✨")}
              </Button>
            </form>
          ) : (
            // شاشة الكود
            <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right">
              <div className="text-center space-y-2 mb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                  <KeyRound className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-600">الكود وصل على: <span className="font-bold">{email}</span></p>
              </div>
              
              <Input 
                required 
                placeholder="------" 
                className="text-center text-3xl tracking-[10px] h-14 font-black bg-slate-50 border-2 border-blue-100 focus:border-blue-600" 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
              />
              
              <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-green-600 hover:bg-green-700">
                {loading ? <Loader2 className="animate-spin" /> : "تأكيد الكود ✅"}
              </Button>
            </form>
          )}

          {mode !== 'verify' && (
            <div className="text-center mt-4 pt-4 border-t">
              <Button variant="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-blue-600 font-bold">
                {mode === 'login' ? "لـسه جديد؟ اعمل حساب" : "عندك حساب؟ سجل دخول"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

