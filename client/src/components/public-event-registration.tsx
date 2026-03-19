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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PublicEventRegistrationProps {
  event: Event;
  onSuccess?: () => void;
}

type RegistrationGroup = "group1" | "group2" | null;
type PaymentMethod = "cash" | "mobileMoney" | "bankTransfer" | "";

const GROUP_TITLES = {
  group1: [
    "Hospital Administrative Officers",
    "Hospital Officer in Charges",
    "Senior / Medical Superintendents",
    "Planning Personnel",
    "Accounts Personnel",
    "District Health Directors (DHDs)",
    "Principal Tutors",
    "Auditors and Stores Officers",
    "Human Resource Personnel",
  ],
  group2: [
    "Secretaries / Executive Officers / Personnel Assistants / Administrative Personnel",
    "Cashiers",
    "Registry / Records Personnel",
    "Procurement Officers",
    "Pharmacists",
  ],
};

interface FormData {
  fullName: string;
  institution: string;
  gender: string;
  email: string;
  phoneNumber: string;
  title: string;
  province: string;
  district: string;
  paymentMethod: PaymentMethod;
}

export function PublicEventRegistration({
  event,
  onSuccess,
}: PublicEventRegistrationProps) {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<RegistrationGroup>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    institution: "",
    gender: "",
    email: "",
    phoneNumber: "",
    title: "",
    province: "",
    district: "",
    paymentMethod: "",
  });
      mobileMoney: false,
      bankTransfer: false,
    },
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelect = (group: RegistrationGroup) => {
    setSelectedGroup(group);
    setFormData((prev) => ({ ...prev, title: "" }));
  };

  const handleSubmit = async () => {
    // Trim and validate all fields
    const fullNameTrimmed = formData.fullName.trim();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const phoneNumberTrimmed = formData.phoneNumber.trim();
    const institutionTrimmed = formData.institution.trim();
    const titleTrimmed = formData.title.trim();
    const provinceTrimmed = formData.province.trim();
    const districtTrimmed = formData.district.trim();

    // Validation checks
    if (!fullNameTrimmed || fullNameTrimmed.length < 2) {
      toast({ title: "Full name must be at least 2 characters", variant: "destructive" });
      return;
    }
    if (fullNameTrimmed.length > 100) {
      toast({ title: "Full name must be less than 100 characters", variant: "destructive" });
      return;
    }

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast({ title: "Valid email is required", variant: "destructive" });
      return;
    }

    if (!phoneNumberTrimmed || phoneNumberTrimmed.length < 7) {
      toast({ title: "Valid phone number is required", variant: "destructive" });
      return;
    }
    if (phoneNumberTrimmed.length > 20) {
      toast({ title: "Phone number is too long", variant: "destructive" });
      return;
    }

    if (!institutionTrimmed || institutionTrimmed.length < 2) {
      toast({ title: "Institution must be at least 2 characters", variant: "destructive" });
      return;
    }
    if (institutionTrimmed.length > 150) {
      toast({ title: "Institution name is too long", variant: "destructive" });
      return;
    }

    if (!formData.gender) {
      toast({ title: "Gender is required", variant: "destructive" });
      return;
    }

    if (!titleTrimmed) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (!provinceTrimmed || provinceTrimmed.length < 2) {
      toast({ title: "Province must be at least 2 characters", variant: "destructive" });
      return;
    }
    if (provinceTrimmed.length > 50) {
      toast({ title: "Province name is too long", variant: "destructive" });
      return;
    }

    if (!districtTrimmed || districtTrimmed.length < 2) {
      toast({ title: "District must be at least 2 characters", variant: "destructive" });
      return;
    }
    if (districtTrimmed.length > 50) {
      toast({ title: "District name is too long", variant: "destructive" });
      return;
    }

    if (!selectedGroup) {
      toast({ title: "Please select a group", variant: "destructive" });
      return;
    }

    if (!formData.paymentMethod) {
      toast({ title: "Please select a payment method", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId: event.id,
        group: selectedGroup,
        fullName: fullNameTrimmed,
        institution: institutionTrimmed,
        gender: formData.gender,
        email: emailTrimmed,
        phoneNumber: phoneNumberTrimmed,
        title: titleTrimmed,
        province: provinceTrimmed,
        district: districtTrimmed,
        paymentModes: [formData.paymentMethod],
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

      setSuccess(true);
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
    setFormData({
      fullName: "",
      institution: "",
      gender: "",
      email: "",
      phoneNumber: "",
      title: "",
      province: "",
      district: "",
      paymentMethod: "",
    });
  };

  if (success) {
    return (
      <div className="w-full bg-gradient-to-br from-[#1C356B] to-[#0f1e3d] py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-sm w-full text-center">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Registration Successful!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Thank you for registering. Confirmation details have been sent to your email.
            </p>
            <Button 
              onClick={reset} 
              className="w-full bg-[#1C356B] hover:bg-[#2d4a7a] text-white py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors"
            >
              Register Another Person
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Event Title Section */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C356B] mb-2 sm:mb-3 md:mb-4 leading-tight">
            2026 NATIONAL SEMINAR
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#1C5B7D] mb-3 sm:mb-4 md:mb-4">
            "MINISTRY OF HEALTH"
          </p>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-2 sm:mb-3">
            THEME: Strengthening Record Management and Internal Controls to Enhance Value for Money in the Public Sector
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Zambia Air Force (ZAF) Banquet Hall, Livingstone
          </p>
        </div>

        {/* Group Selection */}
        {!selectedGroup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-14 md:mb-16">
            <button
              onClick={() => handleGroupSelect("group1")}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-[#1C5B7D] cursor-pointer text-left"
            >
              <div className="space-y-4">
                <div className="inline-block bg-[#1C5B7D] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base">
                  GROUP 1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1C356B]">
                  25th - 28th March 2026
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Hospital Administrative Officers, Medical Superintendents, Planning Personnel, Accounts Personnel, District Health Directors, Principal Tutors, Auditors, HR Personnel
                </p>
                <Button className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors">
                  Register for Group 1
                </Button>
              </div>
            </button>

            <button
              onClick={() => handleGroupSelect("group2")}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-[#1C5B7D] cursor-pointer text-left"
            >
              <div className="space-y-4">
                <div className="inline-block bg-[#1C5B7D] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base">
                  GROUP 2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1C356B]">
                  30th March - 2nd April 2026
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Secretaries, Executive Officers, Administrative Personnel, Cashiers, Registry/Records Personnel, Procurement Officers, Pharmacists
                </p>
                <Button className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors">
                  Register for Group 2
                </Button>
              </div>
            </button>
          </div>
        ) : null}

        {/* Registration Form */}
        {selectedGroup && (
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl p-6 sm:p-8 md:p-12">
            <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-gray-200">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1C356B] mb-1 sm:mb-2">
                {selectedGroup === "group1" ? "Group 1 Registration" : "Group 2 Registration"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {selectedGroup === "group1" 
                  ? "25th - 28th March 2026" 
                  : "30th March - 2nd April 2026"}
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="institution" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                  Institution *
                </Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  placeholder="Enter your institution"
                  className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="gender" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                    Gender *
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]">
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
                  <Label htmlFor="title" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                    Title *
                  </Label>
                  <Select value={formData.title} onValueChange={(value) => updateField("title", value)}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]">
                      <SelectValue placeholder="Select your title" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_TITLES[selectedGroup].map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter your email"
                  className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="province" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                    Province *
                  </Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Enter your province"
                    className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                  />
                </div>

                <div>
                  <Label htmlFor="district" className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 block">
                    District *
                  </Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    placeholder="Enter your district"
                    className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-[#1C5B7D] focus:ring-[#1C5B7D]"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                <Label className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 block">
                  Payment Method *
                </Label>
                <RadioGroup value={formData.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value as PaymentMethod)}>
                  <div className="space-y-2.5 sm:space-y-3">
                    {[
                      { id: "cash", label: "Cash" },
                      { id: "mobileMoney", label: "Mobile Money" },
                      { id: "bankTransfer", label: "Bank Transfer" },
                    ].map(({ id, label }) => (
                      <div key={id} className="flex items-center space-x-2.5 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white transition-colors cursor-pointer">
                        <RadioGroupItem value={id} id={id} className="w-4 h-4 sm:w-5 sm:h-5" />
                        <label htmlFor={id} className="text-xs sm:text-sm font-medium cursor-pointer text-gray-900 flex-1">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
                <Button
                  onClick={() => setSelectedGroup(null)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
