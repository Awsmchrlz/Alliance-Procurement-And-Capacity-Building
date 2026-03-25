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
import { CheckCircle, ArrowLeft } from "lucide-react";
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
  titleOther: string;
  position: string;
  positionOther: string;
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
  const [successData, setSuccessData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    institution: "",
    gender: "",
    email: "",
    phoneNumber: "",
    title: "",
    titleOther: "",
    position: "",
    positionOther: "",
    province: "",
    district: "",
    paymentMethod: "",
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelect = (group: RegistrationGroup) => {
    setSelectedGroup(group);
    setFormData((prev) => ({ ...prev, position: "" }));
  };

  const handleSubmit = async () => {
    const fullNameTrimmed = formData.fullName.trim();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const phoneNumberTrimmed = formData.phoneNumber.trim();
    const institutionTrimmed = formData.institution.trim();
    const titleTrimmed = formData.title.trim();
    const titleOtherTrimmed = formData.titleOther.trim();
    const positionTrimmed = formData.position.trim();
    const positionOtherTrimmed = formData.positionOther.trim();
    const provinceTrimmed = formData.province.trim();
    const districtTrimmed = formData.district.trim();

    if (!fullNameTrimmed || fullNameTrimmed.length < 2) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return;
    }

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    if (!phoneNumberTrimmed || phoneNumberTrimmed.length < 7) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    if (!institutionTrimmed || institutionTrimmed.length < 2) {
      toast({ title: "Please enter your institution", variant: "destructive" });
      return;
    }

    if (!formData.gender) {
      toast({ title: "Please select your gender", variant: "destructive" });
      return;
    }

    if (!titleTrimmed) {
      toast({ title: "Please select your title", variant: "destructive" });
      return;
    }

    if (titleTrimmed === "Other" && !titleOtherTrimmed) {
      toast({ title: "Please specify your title", variant: "destructive" });
      return;
    }

    if (!positionTrimmed) {
      toast({ title: "Please enter your position", variant: "destructive" });
      return;
    }

    if (!provinceTrimmed) {
      toast({ title: "Please enter your province", variant: "destructive" });
      return;
    }

    if (!districtTrimmed) {
      toast({ title: "Please enter your district", variant: "destructive" });
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
        title: titleTrimmed === "Other" ? titleOtherTrimmed : titleTrimmed,
        position: positionTrimmed,
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

      const data = await response.json();
      setSuccessData({
        registrationNumber: data.registrationNumber,
        fullName: fullNameTrimmed,
        email: emailTrimmed,
        institution: institutionTrimmed,
        group: selectedGroup,
        eventTitle: event.title,
      });
      setSuccess(true);
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
    setSuccessData(null);
    setFormData({
      fullName: "",
      institution: "",
      gender: "",
      email: "",
      phoneNumber: "",
      title: "",
      titleOther: "",
      position: "",
      positionOther: "",
      province: "",
      district: "",
      paymentMethod: "",
    });
  };

  if (success) {
    return (
      <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50"></div>
                <CheckCircle className="w-20 h-20 text-green-600 relative" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 text-lg">
              Your registration for {successData?.eventTitle} has been confirmed
            </p>
          </div>

          {/* Registration Number Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
                Your Registration Number
              </p>
              <div className="text-5xl font-bold text-green-600 font-mono tracking-wider">
                {successData?.registrationNumber}
              </div>
              <p className="text-gray-500 text-sm mt-3">
                Please save this number for your records
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              Registration Details
            </h3>
            
            <div className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData?.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900 break-all">
                    {successData?.email}
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Institution
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData?.institution}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Group
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData?.group === "group1" 
                      ? "Group 1 (25-28 March)" 
                      : "Group 2 (30 March - 2 April)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-900 text-center">
              A confirmation email with your registration details has been sent to <span className="font-semibold">{successData?.email}</span>. Please check your inbox and spam folder.
            </p>
          </div>

          {/* WhatsApp Group Link */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-900 text-center mb-4">
              Join our WhatsApp group to stay updated with event information and announcements.
            </p>
            <Button 
              onClick={() => window.open("https://chat.whatsapp.com/CW29irWXZGx2xxSJKo9yjQ?mode=gi_tto", "_blank")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-lg transition-colors"
            >
              Continue to WhatsApp Group
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={reset} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-lg transition-colors"
            >
              Register Another Person
            </Button>
            <Button 
              onClick={() => {
                if (onSuccess) onSuccess();
                window.location.href = "/";
              }} 
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 py-3 text-base font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Group Selection */}
        {!selectedGroup ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C356B] mb-2 text-center">
              Select Your Group
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Choose the group that matches your role
            </p>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleGroupSelect("group1")}
                className="w-full bg-white border-2 border-[#1C356B] hover:bg-[#1C356B] hover:text-white text-[#1C356B] p-6 rounded-lg transition-all duration-200 text-left"
              >
                <div className="font-bold text-lg mb-2">Group 1: 25th - 28th March 2026</div>
                <div className="text-sm opacity-90">
                  Hospital Officers, Medical Superintendents, Planning & Accounts Personnel, District Health Directors, Principal Tutors, Auditors, HR Personnel
                </div>
              </button>

              <button
                onClick={() => handleGroupSelect("group2")}
                className="w-full bg-white border-2 border-[#1C356B] hover:bg-[#1C356B] hover:text-white text-[#1C356B] p-6 rounded-lg transition-all duration-200 text-left"
              >
                <div className="font-bold text-lg mb-2">Group 2: 30th March - 2nd April 2026</div>
                <div className="text-sm opacity-90">
                  Secretaries, Executive Officers, Administrative Personnel, Cashiers, Registry/Records Personnel, Procurement Officers, Pharmacists
                </div>
              </button>
            </div>
          </>
        ) : null}

        {/* Registration Form */}
        {selectedGroup && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1C356B]" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#1C356B]">
                  {selectedGroup === "group1" ? "Group 1" : "Group 2"} Registration
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedGroup === "group1" 
                    ? "25th - 28th March 2026" 
                    : "30th March - 2nd April 2026"}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Row 1: Full Name & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Your full name"
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Institution *
                  </Label>
                  <Input
                    value={formData.institution}
                    onChange={(e) => updateField("institution", e.target.value)}
                    placeholder="Your institution"
                    className="h-11 text-base"
                  />
                </div>
              </div>

              {/* Row 2: Gender & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Gender *
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Title *
                  </Label>
                  <Select value={formData.title} onValueChange={(value) => updateField("title", value)}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.title === "Other" && (
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Specify your title *
                  </Label>
                  <Input
                    value={formData.titleOther}
                    onChange={(e) => updateField("titleOther", e.target.value)}
                    placeholder="Enter your title"
                    className="h-11 text-base"
                  />
                </div>
              )}

              {/* Row 3: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Phone Number *
                  </Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="Your phone number"
                    className="h-11 text-base"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Position *
                </Label>
                <Input
                  value={formData.position}
                  onChange={(e) => updateField("position", e.target.value)}
                  placeholder="Enter your position"
                  className="h-11 text-base"
                />
              </div>

              {/* Row 4: Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Province *
                  </Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Your province"
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    District *
                  </Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    placeholder="Your district"
                    className="h-11 text-base"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <Label className="text-sm font-semibold text-gray-900 mb-4 block">
                  Payment Method *
                </Label>
                <RadioGroup value={formData.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value as PaymentMethod)}>
                  <div className="space-y-3">
                    {[
                      { id: "cash", label: "Cash" },
                      { id: "mobileMoney", label: "Mobile Money" },
                      { id: "bankTransfer", label: "Bank Transfer" },
                    ].map(({ id, label }) => (
                      <div key={id} className="flex items-center space-x-3 cursor-pointer">
                        <RadioGroupItem value={id} id={id} />
                        <label htmlFor={id} className="text-sm font-medium cursor-pointer text-gray-900">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
                <Button
                  onClick={() => setSelectedGroup(null)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 py-3 text-base font-semibold rounded-lg"
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
