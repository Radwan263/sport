import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ChevronRight, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const SIZES = ["L", "XL", "XXL", "3XL", "4XL"];

// Weight to size mapping
const WEIGHT_TO_SIZE: Record<string, string> = {
  "50-70": "L",
  "70-85": "XL",
  "85-100": "XXL",
  "100-120": "3XL",
  "120-200": "4XL",
};

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
}

const STEPS: CheckoutStep[] = [
  { id: 1, title: "معلومات شخصية", description: "الاسم والهاتف" },
  { id: 2, title: "العنوان", description: "موقع التسليم" },
  { id: 3, title: "المقاسات", description: "اختر المقاس أو الوزن" },
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    primaryPhone: "",
    backupPhone: "",
  });

  // Step 2: Location
  const [location, setLocation] = useState({
    address: "",
    city: "",
    country: "",
  });

  // Step 3: Sizing
  const [sizing, setSizing] = useState({
    sizeMethod: "size", // "size" or "weight"
    selectedSize: "",
    weight: "",
  });

  const [suggestedSize, setSuggestedSize] = useState<string | null>(null);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseFloat(e.target.value);
    setSizing(prev => ({ ...prev, weight: e.target.value }));

    // Suggest size based on weight
    if (weight >= 50 && weight <= 70) setSuggestedSize("L");
    else if (weight > 70 && weight <= 85) setSuggestedSize("XL");
    else if (weight > 85 && weight <= 100) setSuggestedSize("XXL");
    else if (weight > 100 && weight <= 120) setSuggestedSize("3XL");
    else if (weight > 120 && weight <= 200) setSuggestedSize("4XL");
    else setSuggestedSize(null);
  };

  const validateStep1 = () => {
    if (!personalInfo.fullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل");
      return false;
    }
    if (!personalInfo.primaryPhone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف الأساسي");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!location.address.trim()) {
      toast.error("يرجى إدخال العنوان");
      return false;
    }
    if (!location.city.trim()) {
      toast.error("يرجى إدخال المدينة");
      return false;
    }
    if (!location.country.trim()) {
      toast.error("يرجى إدخال الدولة");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (sizing.sizeMethod === "size" && !sizing.selectedSize) {
      toast.error("يرجى اختيار المقاس");
      return false;
    }
    if (sizing.sizeMethod === "weight" && !sizing.weight) {
      toast.error("يرجى إدخال الوزن");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteCheckout = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      // Prepare order data
      const finalSize = sizing.sizeMethod === "weight" ? suggestedSize : sizing.selectedSize;
      const orderData = {
        personalInfo,
        location,
        size: finalSize,
        weight: sizing.weight,
        totalPrice: 648, // Mock total
      };

      // Generate WhatsApp message
      const message = `
*طلب جديد من المتجر*

*بيانات العميل:*
الاسم: ${personalInfo.fullName}
الهاتف: ${personalInfo.primaryPhone}
الهاتف البديل: ${personalInfo.backupPhone}

*العنوان:*
${location.address}
${location.city}, ${location.country}

*المنتجات:*
- قميص منتخب مصر 2024 (299 ج.م) × 1
- هودي رياضي أسود (399 ج.م) × 2

*المقاس/الوزن:* ${finalSize}${sizing.weight ? ` (${sizing.weight} كجم)` : ""}

*الإجمالي:* 648 ج.م
      `.trim();

      // Redirect to WhatsApp
      const whatsappUrl = `https://wa.me/201234567890?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;

      toast.success("جاري إعادة التوجيه إلى WhatsApp");
    } catch (error) {
      toast.error("حدث خطأ في إتمام الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id
                        ? "bg-blue-600"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            {STEPS.map(step => (
              <div key={step.id} className="text-center flex-1">
                <p className="font-semibold">{step.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">الاسم الكامل *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={personalInfo.fullName}
                    onChange={handlePersonalInfoChange}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="primaryPhone">رقم الهاتف الأساسي *</Label>
                  <Input
                    id="primaryPhone"
                    name="primaryPhone"
                    value={personalInfo.primaryPhone}
                    onChange={handlePersonalInfoChange}
                    placeholder="+20..."
                  />
                </div>
                <div>
                  <Label htmlFor="backupPhone">رقم الهاتف البديل</Label>
                  <Input
                    id="backupPhone"
                    name="backupPhone"
                    value={personalInfo.backupPhone}
                    onChange={handlePersonalInfoChange}
                    placeholder="+20..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">العنوان الكامل *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={location.address}
                    onChange={handleLocationChange}
                    placeholder="أدخل عنوانك الكامل"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={location.city}
                      onChange={handleLocationChange}
                      placeholder="أدخل مدينتك"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">الدولة *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={location.country}
                      onChange={handleLocationChange}
                      placeholder="أدخل دولتك"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    سيتم استخدام هذا العنوان لتسليم الطلب
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Sizing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <RadioGroup
                  value={sizing.sizeMethod}
                  onValueChange={(value) => setSizing(prev => ({ ...prev, sizeMethod: value }))}
                >
                  <div className="space-y-4">
                    {/* Size Selection */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <RadioGroupItem value="size" id="size-method" />
                        <Label htmlFor="size-method" className="cursor-pointer font-semibold">
                          اختر المقاس
                        </Label>
                      </div>
                      {sizing.sizeMethod === "size" && (
                        <div className="grid grid-cols-5 gap-2 ml-6">
                          {SIZES.map(size => (
                            <Button
                              key={size}
                              variant={sizing.selectedSize === size ? "default" : "outline"}
                              onClick={() => setSizing(prev => ({ ...prev, selectedSize: size }))}
                              className="w-full"
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Weight Input */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <RadioGroupItem value="weight" id="weight-method" />
                        <Label htmlFor="weight-method" className="cursor-pointer font-semibold">
                          أدخل وزنك (سيتم اقتراح المقاس تلقائياً)
                        </Label>
                      </div>
                      {sizing.sizeMethod === "weight" && (
                        <div className="ml-6 space-y-4">
                          <div>
                            <Input
                              type="number"
                              value={sizing.weight}
                              onChange={handleWeightChange}
                              placeholder="أدخل وزنك بالكيلوجرام (50-200)"
                              min="50"
                              max="200"
                            />
                          </div>
                          {suggestedSize && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-sm text-green-600 dark:text-green-400">
                                المقاس المقترح: <span className="font-bold text-lg">{suggestedSize}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={handlePreviousStep}
                variant="outline"
                disabled={currentStep === 1}
                className="flex-1"
              >
                السابق
              </Button>
              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNextStep}
                  className="flex-1"
                >
                  التالي
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteCheckout}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    "إتمام الطلب عبر WhatsApp"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
