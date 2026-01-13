import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, Zap, TrendingUp, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ⚽ متجر الملابس الرياضية
          </h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button onClick={() => navigate("/profile")} variant="outline">
                  {user?.name || "ملفي"}
                </Button>
                <Button onClick={() => navigate("/shop")}>
                  متجري
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                >
                  دخول
                </Button>
                <Button onClick={() => navigate("/shop")}>
                  ابدأ التسوق
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                ارتدِ روح الفريق
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                اكتشف أفضل تشكيلة من قمصان الأندية والمنتخبات الرياضية بجودة عالية وأسعار منافسة
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/shop")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  تسوق الآن
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
                <Button
                  onClick={() => navigate("/shop")}
                  size="lg"
                  variant="outline"
                >
                  اعرف المزيد
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-square bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
                  alt="Sports Jersey"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">لماذا نحن؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShoppingBag,
                title: "تشكيلة واسعة",
                description: "أندية وفرق من حول العالم",
              },
              {
                icon: Zap,
                title: "جودة عالية",
                description: "منتجات أصلية وموثوقة",
              },
              {
                icon: TrendingUp,
                title: "أسعار منافسة",
                description: "أفضل قيمة مقابل المال",
              },
              {
                icon: Shield,
                title: "شراء آمن",
                description: "دفع آمن وسهل عبر WhatsApp",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-lg">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12">تصنيفاتنا</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🧥", label: "Hoodies" },
              { icon: "👕", label: "T-shirts" },
              { icon: "🇪🇬", label: "منتخب مصر" },
              { icon: "🔴", label: "النادي الأهلي" },
              { icon: "⚽", label: "أندية أخرى" },
              { icon: "🇪🇺", label: "الأندية الأوروبية" },
              { icon: "🏆", label: "المنتخبات" },
              { icon: "🌍", label: "المزيد" },
            ].map((category, index) => (
              <Button
                key={index}
                onClick={() => navigate("/shop")}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <span className="text-3xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 text-center text-white space-y-6">
          <h3 className="text-4xl font-bold">هل أنت مستعد؟</h3>
          <p className="text-lg opacity-90">
            اكتشف أفضل تشكيلة من قمصان الأندية والمنتخبات الرياضية
          </p>
          <Button
            onClick={() => navigate("/shop")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-100"
          >
            ابدأ التسوق الآن
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2024 متجر الملابس الرياضية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
