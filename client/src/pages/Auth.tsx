/**
 * هذا الملف يحتوي على الثوابت والدوال المساعدة للروابط
 * تم تعديل الكود لمنع حدوث "TypeError: Invalid URL" في بيئة Netlify
 */

export const getLoginUrl = () => {
  // 1. تحديد الرابط الأساسي (استخدام رابط الموقع الحالي كبديل في حالة عدم وجود المتغير)
  const baseUrl = import.meta.env.VITE_MANUS_APP_URL || window.location.origin;
  const appId = import.meta.env.VITE_MANUS_APP_ID || "";
  
  try {
    // 2. إنشاء الرابط ومحاولة تجنب أي قيمة undefined
    // السطر ده كان سبب الكراش وتم تأمينه الآن
    const loginUrl = new URL(`${baseUrl}/app-auth`);
    
    // 3. إعداد رابط الرجوع بعد تسجيل الدخول
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    // 4. إضافة البارامترات المطلوبة
    loginUrl.searchParams.set("appId", appId);
    loginUrl.searchParams.set("redirectUri", redirectUri);
    loginUrl.searchParams.set("state", state);
    loginUrl.searchParams.set("type", "signIn");

    return loginUrl.toString();
  } catch (error) {
    // في حالة حدوث أي خطأ في بناء الرابط، نطبع تحذير ونرجع رابط وهمي بدل ما نوقع الموقع
    console.error("Configuration Error: Check VITE_MANUS_APP_URL", error);
    return "#"; 
  }
};

// أي ثوابت تانية ممكن تكون عندك في الملف (أضفها هنا لو موجودة)
export const APP_NAME = "EraSport";
