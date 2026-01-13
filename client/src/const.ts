export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  // نقوم بفحص المتغير، إذا كان غير موجود أو قيمته النصية "undefined" نستخدم بديل آمن
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const baseUrl = (portalUrl && portalUrl !== 'undefined') ? portalUrl : window.location.origin;
  const appId = import.meta.env.VITE_APP_ID || "";

  try {
    // نضمن أن الرابط يبدأ بـ http/https دائماً لمنع الـ Invalid URL error
    const safeBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const url = new URL(`${safeBase.replace(/\/$/, '')}/app-auth`);
    
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (e) {
    console.error("Login URL Construction failed:", e);
    return "#"; // نرجع رابط غير فعال بدلاً من إسقاط الموقع بالكامل
  }
};
