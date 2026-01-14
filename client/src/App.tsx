import { MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext"; 
import { AuthProvider } from "./contexts/AuthContext"; 
import { WishlistProvider } from "./contexts/WishlistContext"; // ✅ استدعاء جديد

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";
import WishlistPage from "./pages/WishlistPage"; // ✅ صفحة المفضلة

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/profile" component={Profile} />
      <Route path="/shop" component={Shop} />
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={WishlistPage} /> {/* ✅ الرابط الجديد */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/admin" component={AdminDashboard} /> 
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider> 
          <WishlistProvider> 
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Router />

                {/* 👇👇👇 الصق كود الواتساب هنا بالظبط 👇👇👇 */}
                <a 
                  href="https://wa.me/201143207766" 
                  target="_blank" 
                  rel="noreferrer"
                  className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center gap-2 font-bold animate-in fade-in zoom-in"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="hidden md:inline">تواصل معنا</span>
                </a>
                {/* 👆👆👆 نهاية كود الواتساب 👆👆👆 */}

              </TooltipProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

