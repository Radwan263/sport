import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createElement } from "react";

export type Language = "ar" | "en";

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    profile: "الملف الشخصي",
    cart: "السلة",
    wishlist: "المفضلة",
    admin: "لوحة التحكم",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    newSeason: "تيشيرتات الموسم الجديد",
    supportYourTeam: "شجع فريقك بأفضل خامة وأقل سعر",
    browseStore: "تصفح المتجر",
    europeanClubsOffers: "عروض الأندية الأوروبية",
    specialDiscount: "خصم خاص عند طلب قطعتين أو أكثر",
    shopByCategory: "تسوق حسب القسم",
    all: "الكل",
    ahly: "النادي الأهلي 🦅",
    arabClubs: "أندية عربية 🇸🇦",
    euroClubs: "أندية أوروبية 🇪🇺",
    arabTeams: "منتخبات عربية 🌍",
    euroTeams: "منتخبات أوروبية 🏆",
    search: "ابحث عن تيشيرت...",
    noProducts: "لا توجد منتجات في هذا القسم",
    price: "السعر",
    addToCart: "إضافة للسلة",
    addToWishlist: "إضافة للمفضلة",
    removeFromWishlist: "إزالة من المفضلة",
    cartEmpty: "السلة فارغة",
    continueShoppingButton: "متابعة التسوق",
    quantity: "الكمية",
    total: "الإجمالي",
    checkout: "الدفع",
    removeItem: "إزالة",
    updateQuantity: "تحديث الكمية",
    customerName: "اسم العميل",
    customerEmail: "البريد الإلكتروني",
    customerPhone: "رقم الهاتف",
    customerAddress: "العنوان",
    city: "المدينة",
    country: "الدولة",
    notes: "ملاحظات إضافية",
    placeOrder: "تأكيد الطلب",
    orderConfirmed: "تم تأكيد الطلب بنجاح",
    myProfile: "ملفي الشخصي",
    editProfile: "تعديل الملف الشخصي",
    fullName: "الاسم الكامل",
    primaryPhone: "الهاتف الأساسي",
    backupPhone: "الهاتف البديل",
    address: "العنوان",
    preferredSize: "المقاس المفضل",
    weight: "الوزن",
    save: "حفظ",
    saved: "تم الحفظ بنجاح",
    addedToCart: "تمت الإضافة للسلة ✅",
    addedToWishlist: "تمت الإضافة للمفضلة ❤️",
    removedFromCart: "تم حذف المنتج من السلة 🗑️",
    contactUs: "تواصل معنا",
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",
    dashboard: "لوحة التحكم",
    products: "المنتجات",
    orders: "الطلبات",
    users: "المستخدمون",
    addProduct: "إضافة منتج",
    editProduct: "تعديل المنتج",
    deleteProduct: "حذف المنتج",
    register: "إنشاء حساب جديد",
    verify: "تفعيل الحساب",
    googleLogin: "دخول سريع بـ Google",
    or: "أو",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "دخول 🚀",
    registerBtn: "إنشاء حساب ✨",
    verifyBtn: "تأكيد الكود ✅",
    codeMessage: "الكود وصل على:",
    noAccount: "لـسه جديد؟ اعمل حساب",
    haveAccount: "عندك حساب؟ سجل دخول",
    googleError: "تنبيه: لازم تفعل جوجل من إعدادات Supabase الأول",
    invalidCredentials: "البيانات غير صحيحة",
    loginSuccess: "تم الدخول بنجاح 👋",
    registerSuccess: "تم التسجيل! اكتب الكود اللي وصلك ع الإيميل 📧",
    invalidCode: "الكود غلط ❌",
    verifySuccess: "تم تفعيل الحساب! 🎉",
    welcome: "أهلاً",
    trackOrders: "تابع حالة طلباتك من هنا",
    myOrders: "طلباتي السابقة",
    noOrders: "لسه مفيش طلبات",
    shippingInfo: "بيانات الشحن",
    cancelOrder: "إلغاء الطلب",
    orderCancelled: "تم إلغاء هذا الطلب",
    confirmCancel: "هل أنت متأكد من إلغاء هذا الطلب؟ 😢",
    cancelSuccess: "تم إلغاء الطلب بنجاح",
    error: "حدث خطأ، حاول مرة أخرى",
    pending: "قيد المراجعة",
    processing: "قيد التنفيذ",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "تم الإلغاء",
  },
  en: {
    home: "Home",
    shop: "Shop",
    profile: "Profile",
    cart: "Cart",
    wishlist: "Wishlist",
    admin: "Admin",
    logout: "Logout",
    login: "Login",
    newSeason: "New Season T-Shirts",
    supportYourTeam: "Support your team with the best quality and lowest price",
    browseStore: "Browse Store",
    europeanClubsOffers: "European Clubs Offers",
    specialDiscount: "Special discount when ordering 2 or more items",
    shopByCategory: "Shop by Category",
    all: "All",
    ahly: "Al-Ahly Club 🦅",
    arabClubs: "Arab Clubs 🇸🇦",
    euroClubs: "European Clubs 🇪🇺",
    arabTeams: "Arab Teams 🌍",
    euroTeams: "European Teams 🏆",
    search: "Search for a t-shirt...",
    noProducts: "No products in this category",
    price: "Price",
    addToCart: "Add to Cart",
    addToWishlist: "Add to Wishlist",
    removeFromWishlist: "Remove from Wishlist",
    cartEmpty: "Your cart is empty",
    continueShoppingButton: "Continue Shopping",
    quantity: "Quantity",
    total: "Total",
    checkout: "Checkout",
    removeItem: "Remove",
    updateQuantity: "Update Quantity",
    customerName: "Customer Name",
    customerEmail: "Email",
    customerPhone: "Phone Number",
    customerAddress: "Address",
    city: "City",
    country: "Country",
    notes: "Additional Notes",
    placeOrder: "Place Order",
    orderConfirmed: "Order confirmed successfully",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    fullName: "Full Name",
    primaryPhone: "Primary Phone",
    backupPhone: "Backup Phone",
    address: "Address",
    preferredSize: "Preferred Size",
    weight: "Weight",
    save: "Save",
    saved: "Saved successfully",
    addedToCart: "Added to cart ✅",
    addedToWishlist: "Added to wishlist ❤️",
    removedFromCart: "Removed from cart 🗑️",
    contactUs: "Contact Us",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    users: "Users",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    register: "Create New Account",
    verify: "Verify Account",
    googleLogin: "Quick Login with Google",
    or: "Or",
    email: "Email",
    password: "Password",
    loginBtn: "Login 🚀",
    registerBtn: "Create Account ✨",
    verifyBtn: "Verify Code ✅",
    codeMessage: "Code sent to:",
    noAccount: "New here? Create an account",
    haveAccount: "Have an account? Sign in",
    googleError: "Alert: You need to enable Google in Supabase settings first",
    invalidCredentials: "Invalid credentials",
    loginSuccess: "Login successful 👋",
    registerSuccess: "Registration successful! Enter the code sent to your email 📧",
    invalidCode: "Invalid code ❌",
    verifySuccess: "Account verified! 🎉",
    welcome: "Hello",
    trackOrders: "Track your orders here",
    myOrders: "My Previous Orders",
    noOrders: "No orders yet",
    shippingInfo: "Shipping Information",
    cancelOrder: "Cancel Order",
    orderCancelled: "This order has been cancelled",
    confirmCancel: "Are you sure you want to cancel this order? 😢",
    cancelSuccess: "Order cancelled successfully",
    error: "An error occurred, please try again",
    pending: "Under Review",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language | null;
      return stored || "ar";
    }
    return "ar";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const value: LanguageContextType = { language, setLanguage, t };

  return createElement(
    LanguageContext.Provider,
    { value },
    children
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
