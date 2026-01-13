import { useAuth } from "@/contexts/AuthContext"; // ✅ ده الصح
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("فشل تحديث الملف الشخصي");
    },
  });

  const [formData, setFormData] = useState({
    fullName: "",
    primaryPhone: "",
    backupPhone: "",
    address: "",
    city: "",
    country: "",
    preferredSize: "",
    weight: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        primaryPhone: profile.primaryPhone || "",
        backupPhone: profile.backupPhone || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
        preferredSize: profile.preferredSize || "",
        weight: profile.weight || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>إدارة بيانات حسابك الشخصية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400">الاسم</Label>
                  <p className="font-medium">{user?.name || "غير محدد"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400">البريد الإلكتروني</Label>
                  <p className="font-medium">{user?.email || "غير محدد"}</p>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">الاسم الكامل</Label>
                      <p className="text-sm">{formData.fullName || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="text-xs">الهاتف الأساسي</Label>
                      <p className="text-sm">{formData.primaryPhone || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="text-xs">الهاتف البديل</Label>
                      <p className="text-sm">{formData.backupPhone || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="text-xs">المدينة</Label>
                      <p className="text-sm">{formData.city || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="text-xs">الدولة</Label>
                      <p className="text-sm">{formData.country || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="text-xs">المقاس المفضل</Label>
                      <p className="text-sm">{formData.preferredSize || "غير محدد"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">العنوان</Label>
                    <p className="text-sm">{formData.address || "غير محدد"}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    تعديل البيانات
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryPhone">الهاتف الأساسي</Label>
                      <Input
                        id="primaryPhone"
                        name="primaryPhone"
                        value={formData.primaryPhone}
                        onChange={handleInputChange}
                        placeholder="+20..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="backupPhone">الهاتف البديل</Label>
                      <Input
                        id="backupPhone"
                        name="backupPhone"
                        value={formData.backupPhone}
                        onChange={handleInputChange}
                        placeholder="+20..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">المدينة</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="أدخل مدينتك"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">الدولة</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="أدخل دولتك"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredSize">المقاس المفضل</Label>
                      <Input
                        id="preferredSize"
                        name="preferredSize"
                        value={formData.preferredSize}
                        onChange={handleInputChange}
                        placeholder="L, XL, XXL..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="أدخل عنوانك الكامل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">الوزن (كجم)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="50-200"
                      min="50"
                      max="200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="flex-1"
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ التغييرات"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              )}

              <Button
                onClick={() => navigate("/shop")}
                variant="outline"
                className="w-full"
              >
                العودة للمتجر
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
