import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ArrowDown } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PublicEventRegistrationProps {
  event: Event;
  onSuccess?: () => void;
}

type RegistrationGroup = "group1" | "group2" | null;

interface FormData {
  fullName: string;
  institution: string;
  gender: string;
  email: string;
  phoneNumber: string;
  title: string;
  province: string;
  district: string;
  paymentModes: {
    cash: boolean;
    mobileMoney: boolean;
    bankTransfer: boolean;
  };
}

export function PublicEventRegistration({
  event,
  onSuccess,
}: PublicEventRegistrationProps) {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<RegistrationGroup>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    institution: "",
    gender: "",
    email: "",
    phoneNumber: "",
    title: "",
    province: "",
    district: "",
    paymentModes: {
      cash: false,
      mobileMoney: false,
      bankTransfer: false,
    },
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelect = (group: RegistrationGroup) => {
    setSelectedGroup(group);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({ title: "Valid email is required", variant: "destructive" });
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (!formData.institution.trim()) {
      toast({ title: "Institution is required", variant: "destructive" });
      return;
    }
    if (!formData.gender) {
      toast({ title: "Gender is required", variant: "destructive" });
      return;
    }
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!formData.province.trim()) {
      toast({ title: "Province is required", variant: "destructive" });
      return;
    }
    if (!formData.district.trim()) {
      toast({ title: "District is required", variant: "destructive" });
      return;
    }

    const hasPaymentMode = formData.paymentModes.cash || 
                          formData.paymentModes.mobileMoney || 
                          formData.paymentModes.bankTransfer;
    if (!hasPaymentMode) {
      toast({ title: "Please select at least one payment mode", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId: event.id,
        group: selectedGroup,
        fullName: formData.fullName,
        institution: formData.institution,
        gender: formData.gender,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        title: formData.title,
        province: formData.province,
        district: formData.district,
        paymentModes: Object.entries(formData.paymentModes)
          .filter(([_, selected]) => selected)
          .map(([mode]) => mode),
      };

      const response = await fetch("/api/events/public-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();
      setSuccess(true);
      
      // Scroll to success message
      setTimeout(() => {
        document.getElementById('success-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSelectedGroup(null);
    setSuccess(false);
    setShowForm(false);
    setFormData({
      fullName: "",
      institution: "",
      gender: "",
      email: "",
      phoneNumber: "",
      title: "",
      province: "",
      district: "",
      paymentModes: {
        cash: false,
        mobileMoney: false,
        bankTransfer: false,
      },
    });
  };

  if (success) {
    return (
      <div id="success-message" className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Registration Successful!
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for registering. We'll send confirmation details to your email.
          </p>
          <Button 
            onClick={reset} 
            className="bg-[#1C356B] hover:bg-[#2d4a7a] text-white px-8 py-6 text-lg"
          >
            Register Another Person
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Step 1: Event Title and Register Button */}
      <div className="text-center mb-12">
        <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-lg mb-6">
          1st step
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          2026 NATIONAL SEMINAR "MINISTRY OF HEALTH"
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
          THEME: "STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR"
        </p>
        
        {!selectedGroup && (
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-[#FDC123] animate-bounce" />
          </div>
        )}
      </div>

      {/* Step 2: Group Selection */}
      {!selectedGroup && (
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-lg mb-4">
              2nd step
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <Button
              onClick={() => handleGroupSelect("group1")}
              className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-12 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold">GROUP 1 REGISTER HERE</div>
                <div className="text-base font-medium opacity-90">25th - 27th MARCH 2026 - Livingstone</div>
              </div>
            </Button>
            
            <div className="flex justify-center">
              <ArrowDown className="w-8 h-8 text-[#FDC123] animate-bounce" />
            </div>
            
            <Button
              onClick={() => handleGroupSelect("group2")}
              className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-12 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold">GROUP 2 REGISTER HERE</div>
                <div className="text-base font-medium opacity-90">30th MARCH - 2nd April 2026 - Livingstone</div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Registration Form */}
      {selectedGroup && showForm && (
        <div id="registration-form" className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-lg mb-4">
              Final step
            </div>
            <p className="text-lg text-gray-700">
              Selected: {selectedGroup === "group1" ? "Group 1 (25-27 March 2026)" : "Group 2 (30 March - 2 April 2026)"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-gray-200">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-base font-bold text-gray-900 mb-2 block">
                  Full Names *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="institution" className="text-base font-bold text-gray-900 mb-2 block">
                  Institution *
                </Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  placeholder="Enter your institution"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-base font-bold text-gray-900 mb-2 block">
                  Gender *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                  <SelectTrigger className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-bold text-gray-900 mb-2 block">
                  Email address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter your email"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-base font-bold text-gray-900 mb-2 block">
                  Phone number *
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-base font-bold text-gray-900 mb-2 block">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter your title/position"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="province" className="text-base font-bold text-gray-900 mb-2 block">
                  Province *
                </Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  placeholder="Enter your province"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="district" className="text-base font-bold text-gray-900 mb-2 block">
                  District *
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Enter your district"
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#1C5B7D]"
                />
              </div>

              <div className="border-4 border-gray-300 rounded-xl p-6 bg-gray-50">
                <Label className="text-lg font-bold text-gray-900 mb-4 block">
                  Payment mode - Put check box for CASH, MOBILE MONEY AND BANK TRANSFER{" "}
                  <span className="text-red-600">"NO ATTACHMENT"</span>
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 hover:bg-white rounded-lg transition-colors">
                    <Checkbox
                      id="cash"
                      checked={formData.paymentModes.cash}
                      onCheckedChange={(checked) =>
                        updateField("paymentModes", {
                          ...formData.paymentModes,
                          cash: checked === true,
                        })
                      }
                      className="w-6 h-6"
                    />
                    <label htmlFor="cash" className="text-lg font-semibold cursor-pointer flex-1 text-gray-900">
                      CASH
                    </label>
                  </div>
                  <div className="flex items-center space-x-4 p-3 hover:bg-white rounded-lg transition-colors">
                    <Checkbox
                      id="mobileMoney"
                      checked={formData.paymentModes.mobileMoney}
                      onCheckedChange={(checked) =>
                        updateField("paymentModes", {
                          ...formData.paymentModes,
                          mobileMoney: checked === true,
                        })
                      }
                      className="w-6 h-6"
                    />
                    <label htmlFor="mobileMoney" className="text-lg font-semibold cursor-pointer flex-1 text-gray-900">
                      MOBILE MONEY
                    </label>
                  </div>
                  <div className="flex items-center space-x-4 p-3 hover:bg-white rounded-lg transition-colors">
                    <Checkbox
                      id="bankTransfer"
                      checked={formData.paymentModes.bankTransfer}
                      onCheckedChange={(checked) =>
                        updateField("paymentModes", {
                          ...formData.paymentModes,
                          bankTransfer: checked === true,
                        })
                      }
                      className="w-6 h-6"
                    />
                    <label htmlFor="bankTransfer" className="text-lg font-semibold cursor-pointer flex-1 text-gray-900">
                      BANK TRANSFER
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-8 text-2xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="text-gray-600 border-gray-300"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
