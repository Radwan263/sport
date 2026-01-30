import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) toast.error(t("googleError") || "تنبيه: لازم تفعل جوجل من إعدادات Supabase الأول");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(t("invalidCredentials") || "البيانات غير صحيحة");
    } else {
      toast.success(t("loginSuccess") || "تم الدخول بنجاح 👋");
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("registerSuccess") || "تم التسجيل! اكتب الكود اللي وصلك ع الإيميل 📧");
      setMode('verify');
    }
  };

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
      toast.error(t("invalidCode") || "الكود غلط ❌");
    } else {
      toast.success(t("verifySuccess") || "تم تفعيل الحساب! 🎉");
      navigate("/");
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors" 
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-sm p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors" 
            onClick={() => navigate("/")}
          >
            ERA<span className="text-red-600">SPORT</span>
          </h1>
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-none dark:bg-slate-800 dark:border-slate-700 animate-in fade-in zoom-in duration-500 mt-20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'login' && (t("login") || "تسجيل الدخول")}
            {mode === 'register' && (t("register") || "إنشاء حساب جديد")}
            {mode === 'verify' && (t("verify") || "تفعيل الحساب")}
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">ERA SPORT STORE</p>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {mode !== 'verify' && (
            <>
              <Button 
                onClick={handleGoogleLogin} 
                variant="outline" 
                className="w-full h-12 gap-2 font-bold border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t("googleLogin") || "دخول سريع بـ Google"}
              </Button>
              <div className="relative flex justify-center text-xs uppercase my-2">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-400 dark:text-slate-500 font-bold">{t("or") || "أو"}</span>
              </div>
            </>
          )}

          {mode !== 'verify' ? (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div className="relative">
                 <Mail className="absolute top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" style={{[language === "ar" ? "right" : "left"]: "12px"}} />
                 <Input 
                   required 
                   type="email" 
                   placeholder={t("email") || "البريد الإلكتروني"} 
                   className={`h-12 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${language === "ar" ? "pr-10" : "pl-10"}`}
                   value={email} 
                   onChange={e => setEmail(e.target.value)} 
                 />
              </div>
              <div className="relative">
                 <Lock className="absolute top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" style={{[language === "ar" ? "right" : "left"]: "12px"}} />
                 <Input 
                   required 
                   type="password" 
                   placeholder={t("password") || "كلمة المرور"} 
                   className={`h-12 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${language === "ar" ? "pr-10" : "pl-10"}`}
                   value={password} 
                   onChange={e => setPassword(e.target.value)} 
                 />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 font-bold text-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"
              >
                {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? (t("loginBtn") || "دخول 🚀") : (t("registerBtn") || "إنشاء حساب ✨"))}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right">
              <div className="text-center space-y-2 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 animate-pulse">
                  <KeyRound className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("codeMessage") || "الكود وصل على:"} <span className="font-bold">{email}</span>
                </p>
              </div>
              
              <Input 
                required 
                placeholder="------" 
                className="text-center text-3xl tracking-[10px] h-14 font-black bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-600" 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
              />
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 font-bold bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white"
              >
                {loading ? <Loader2 className="animate-spin" /> : (t("verifyBtn") || "تأكيد الكود ✅")}
              </Button>
            </form>
          )}

          {mode !== 'verify' && (
            <div className="text-center mt-4 pt-4 border-t dark:border-slate-700">
              <Button 
                variant="link" 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300"
              >
                {mode === 'login' ? (t("noAccount") || "لـسه جديد؟ اعمل حساب") : (t("haveAccount") || "عندك حساب؟ سجل دخول")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
