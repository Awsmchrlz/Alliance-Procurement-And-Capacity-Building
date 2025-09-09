import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { Event } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Banknote,
  Wallet,
  Copy,
  Info,
  ChevronRight,
  Upload,
} from "lucide-react";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSuccess?: () => void;
}

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  country: string;
  organization: string;
  position: string;
  notes: string;
  paymentMethod: "mobile" | "bank" | "cash" | "";
  delegateType: "private" | "public" | "international";
};

type PricingTier = {
  type: "private" | "public" | "international";
  label: string;
  price: string;
  currency: string;
  description: string;
};

const pricingTiers: PricingTier[] = [
  {
    type: "private",
    label: "Private Sector",
    price: "7,000",
    currency: "ZMW",
    description: "Corporate and private organizations",
  },
  {
    type: "public",
    label: "Public Sector",
    price: "6,500",
    currency: "ZMW",
    description: "Government and public institutions",
  },
  {
    type: "international",
    label: "International Delegates",
    price: "650",
    currency: "USD",
    description: "International participants",
  },
];

const mobileMoneyNumbers = [
  { provider: "MTN Mobile Money", number: "+260 974486945" },
  { provider: "Airtel Money", number: "+260977897943" },
  { provider: "Zamtel Kwacha", number: "+260977414203" },
];

const bankDetails = {
  bankName: "Standard Chartered Bank Zambia",
  accountName: "Alliance Procurement & Capacity Building",
  accountNumber: "0100123456789",
  branchCode: "010001",
  swiftCode: "SCBLZMLU",
  instructions:
    "Please use your full name and event title as payment reference",
};

export function RegistrationDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: RegistrationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormDataType>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    country: "Zambia", // Default to Zambia, will be updated by auto-detection
    organization: "",
    position: "",
    notes: "",
    paymentMethod: "",
    delegateType: "private",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [detectedCountry, setDetectedCountry] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Function to detect user's country based on IP
  const detectCountry = async () => {
    try {
      setDetectingLocation(true);
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data.country_name && data.country_name !== "Zambia") {
        setDetectedCountry(data.country_name);
        setFormData((prev) => ({
          ...prev,
          country: data.country_name,
        }));
      } else {
        setDetectedCountry("Zambia");
      }
    } catch (error) {
      console.log("Could not detect location:", error);
      setDetectedCountry("Zambia");
    } finally {
      setDetectingLocation(false);
    }
  };

  // Detect country on component mount
  useEffect(() => {
    if (open && !detectedCountry && !detectingLocation) {
      detectCountry();
    }
  }, [open]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const updateField = (
    field: keyof FormDataType,
    value: FormDataType[typeof field],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const reset = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      country: "",
      organization: "",
      position: "",
      notes: "",
      paymentMethod: "",
      delegateType: "private",
    });
    setCurrentStep(1);
    setSuccess(false);
    setSubmitting(false);
    setError("");
    setEvidenceFile(null);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        const required: (keyof FormDataType)[] = [
          "firstName",
          "lastName",
          "email",
          "country",
        ];
        for (const field of required) {
          if (!formData[field]) {
            return `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`;
          }
        }
        if (!formData.email.includes("@")) {
          return "Please enter a valid email address";
        }
        break;
      case 2:
        if (!formData.organization) return "Organization is required";
        if (!formData.position) return "Position is required";
        break;
      case 3:
        if (!formData.paymentMethod) return "Please select a payment method";
        break;
    }
    return null;
  };

  const nextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleRegister = async () => {
    if (!user || !isAuthenticated) {
      setError("Authentication required. Please log in again.");
      return;
    }

    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let evidencePath = null;

      // Upload evidence file if provided
      if (evidenceFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || "anonymous";
        const fileName = `payment-evidence/${userId}/${Date.now()}-${evidenceFile.name}`;
        const bucket =
          import.meta.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, evidenceFile);

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          if (uploadError.message?.toLowerCase().includes("bucket")) {
            throw new Error(
              `Storage bucket 'registrations' not found. Please contact support or try again later.`,
            );
          } else if (uploadError.message?.toLowerCase().includes("policy")) {
            throw new Error(
              `Upload permission denied. Please ensure you're logged in and try again.`,
            );
          } else if (uploadError.message?.toLowerCase().includes("size")) {
            throw new Error(
              `File is too large. Please choose a file smaller than 10MB.`,
            );
          } else if (
            uploadError.message?.toLowerCase().includes("mime") ||
            uploadError.message?.toLowerCase().includes("type")
          ) {
            throw new Error(
              `Invalid file type. Please upload PNG, JPG, or PDF files only.`,
            );
          } else {
            throw new Error(
              `Evidence upload failed: ${uploadError.message}. Please try again or proceed without evidence.`,
            );
          }
        }
        evidencePath = uploadData.path;
      }

      // Prepare registration payload
      const registrationPayload = {
        eventId: event.id,
        userId: user.id,
        country: formData.country.trim(),
        organization: formData.organization.trim(),
        position: formData.position.trim(),
        notes: formData.notes || null,
        paymentMethod: formData.paymentMethod,
        delegateType: formData.delegateType,
        hasPaid: false,
        paymentEvidence: evidencePath,
        paymentStatus: "pending",
      };

      console.log("Sending registration payload:", registrationPayload);

      await apiRequest("POST", "/api/events/register", registrationPayload);

      // Automatically subscribe to newsletter (fire-and-forget)
      await apiRequest("POST", "/api/newsletter/subscribe", {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      }).catch((newsletterError) => {
        console.error("Newsletter subscription failed:", newsletterError);
      });

      // Send confirmation email (fire-and-forget)
      await apiRequest("POST", "/api/notifications/registration-confirmation", {
        email: formData.email,
        eventId: event.id,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      }).catch((emailError) => {
        console.error("Email confirmation failed:", emailError);
      });

      setSuccess(true);

      // Invalidate relevant queries to refresh dashboard data
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/events"],
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("Registration error:", err);

      if (
        err.message?.includes("Storage bucket") ||
        err.message?.includes("bucket")
      ) {
        setError(
          "File upload system temporarily unavailable. You can complete registration without evidence and upload it later from your dashboard.",
        );
      } else if (err.message?.includes("Evidence upload failed")) {
        setError(err.message);
      } else if (err.message?.includes("null value in column")) {
        const match = err.message.match(/column "([^"]+)"/);
        const columnName = match ? match[1] : "required field";
        setError(`Missing required field: ${columnName}`);
      } else if (err.message?.includes("Already registered")) {
        setError("You are already registered for this event.");
      } else if (err.message?.includes("Event is full")) {
        setError("Sorry, this event is now full.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const selectedPricing = pricingTiers.find(
    (tier) => tier.type === formData.delegateType,
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl rounded-xl sm:rounded-2xl flex flex-col">
        {!success ? (
          <>
            <DialogHeader className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a] opacity-95" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />

              <div className="relative px-4 sm:px-8 py-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <Calendar className="w-8 h-8 text-[#FDC123]" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Registration
                </DialogTitle>

                {/* Progress Steps */}
                <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentStep >= step
                            ? "bg-sky-400 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-8 sm:w-16 h-0.5 ${
                            currentStep > step ? "bg-sky-400" : "bg-white/20"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Labels */}
                <div className="flex justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-blue-100">
                  <span
                    className={
                      currentStep >= 1 ? "text-sky-400 font-medium" : ""
                    }
                  >
                    Personal
                  </span>
                  <span
                    className={
                      currentStep >= 2 ? "text-sky-400 font-medium" : ""
                    }
                  >
                    Professional
                  </span>
                  <span
                    className={
                      currentStep >= 3 ? "text-sky-400 font-medium" : ""
                    }
                  >
                    Payment
                  </span>
                </div>

                {/* Event Info Cards */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-sky-400/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-sky-400/30">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span className="text-sky-400 text-xs sm:text-sm font-medium">
                      {format(new Date(event.startDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-sky-400/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-sky-400/30">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span className="text-sky-400 text-xs sm:text-sm font-medium">
                      {event.location || "Location TBA"}
                    </span>
                  </div>
                  {selectedPricing && (
                    <div className="flex items-center gap-2 bg-sky-400/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-sky-400/30">
                      <span className="text-sky-400 text-xs sm:text-sm font-bold">
                        {selectedPricing.currency} {selectedPricing.price}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1C356B] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] bg-gray-50"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        readOnly
                      />
                      <p className="text-xs text-gray-500">
                        Pre-filled from your profile
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] bg-gray-50"
                        value={formData.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        readOnly
                      />
                      <p className="text-xs text-gray-500">
                        Pre-filled from your profile
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          updateField("phoneNumber", e.target.value)
                        }
                        placeholder="+260 974486945"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Country <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="Enter country"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {/* Step 2: Organization Information */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1C356B] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Organization Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Organization <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                        value={formData.organization}
                        onChange={(e) =>
                          updateField("organization", e.target.value)
                        }
                        placeholder="Enter organization name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Position/Role <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                      value={formData.position}
                      onChange={(e) => updateField("position", e.target.value)}
                      placeholder="Enter your current position"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Additional Notes
                    </Label>
                    <Textarea
                      className="min-h-[120px] border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] resize-none"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Share any special requirements, dietary restrictions, or additional information..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Payment */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1C356B] rounded-lg sm:rounded-xl flex items-center justify-center">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Choose Your Package & Payment
                    </h3>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Select Your Category{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-3">
                      {pricingTiers.map((tier) => (
                        <div
                          key={tier.type}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.delegateType === tier.type
                              ? "border-[#1C356B] bg-[#1C356B]/5 shadow-lg"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                          }`}
                          onClick={() => updateField("delegateType", tier.type)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                formData.delegateType === tier.type
                                  ? "border-[#1C356B] bg-[#1C356B]"
                                  : "border-slate-300"
                              }`}
                            >
                              {formData.delegateType === tier.type && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col space-y-2">
                                <div>
                                  <h4 className="font-bold text-base text-gray-900">
                                    {tier.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {tier.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <span className="text-sm text-gray-500">
                                    Price per person
                                  </span>
                                  <div className="text-xl font-bold text-[#1C356B]">
                                    {tier.currency} {tier.price}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      How would you like to pay?{" "}
                      <span className="text-red-500">*</span>
                    </Label>

                    <div className="space-y-3">
                      {/* Mobile Money */}
                      <div
                        className={`p-3 sm:p-4 md:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                          formData.paymentMethod === "mobile"
                            ? "border-green-500 bg-green-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                        onClick={() => updateField("paymentMethod", "mobile")}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                              formData.paymentMethod === "mobile"
                                ? "border-green-500 bg-green-500"
                                : "border-slate-300"
                            }`}
                          >
                            {formData.paymentMethod === "mobile" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                              <h4 className="font-bold text-base sm:text-lg text-gray-900">
                                Mobile Money
                              </h4>
                            </div>
                            {formData.paymentMethod === "mobile" && (
                              <div className="space-y-3 mt-4">
                                <p className="text-sm text-gray-600 mb-4">
                                  Send payment to any of these mobile money
                                  numbers:
                                </p>
                                {mobileMoneyNumbers.map((provider, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-white rounded-lg border border-green-200"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm">
                                          {provider.provider}
                                        </p>
                                        <p className="text-lg font-mono text-green-700 break-all">
                                          {provider.number}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          copyToClipboard(
                                            provider.number,
                                            provider.provider,
                                          )
                                        }
                                        className="border-green-300 text-green-700 hover:bg-green-50 shrink-0"
                                      >
                                        {copiedText === provider.provider ? (
                                          <>
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="hidden xs:inline">
                                              Copied
                                            </span>
                                            <span className="xs:hidden">✓</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            <span className="hidden xs:inline">
                                              Copy
                                            </span>
                                            <span className="xs:hidden">
                                              📋
                                            </span>
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                {selectedPricing && (
                                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                      <Info className="w-4 h-4 text-green-700" />
                                      <p className="text-sm text-green-800 font-medium">
                                        Amount to send:{" "}
                                        <span className="font-bold">
                                          {selectedPricing.currency}{" "}
                                          {selectedPricing.price}
                                        </span>
                                      </p>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">
                                      Use your full name as reference:{" "}
                                      {formData.firstName} {formData.lastName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bank Transfer */}
                      <div
                        className={`p-3 sm:p-4 md:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                          formData.paymentMethod === "bank"
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                        onClick={() => updateField("paymentMethod", "bank")}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                              formData.paymentMethod === "bank"
                                ? "border-blue-500 bg-blue-500"
                                : "border-slate-300"
                            }`}
                          >
                            {formData.paymentMethod === "bank" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                              <h4 className="font-bold text-base sm:text-lg text-gray-900">
                                Bank Transfer
                              </h4>
                            </div>
                            {formData.paymentMethod === "bank" && (
                              <div className="space-y-3 mt-4">
                                <p className="text-sm text-gray-600 mb-4">
                                  Transfer funds to our bank account:
                                </p>
                                <div className="bg-white rounded-lg border border-blue-200 p-3 space-y-3">
                                  <div className="space-y-3">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Bank Name
                                      </span>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-900 text-sm break-words">
                                          {bankDetails.bankName}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            copyToClipboard(
                                              bankDetails.bankName,
                                              "Bank Name",
                                            )
                                          }
                                          className="h-6 w-6 p-0 hover:bg-blue-50 shrink-0"
                                        >
                                          {copiedText === "Bank Name" ? (
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-gray-500" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Account Name
                                      </span>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-900 text-sm break-words">
                                          {bankDetails.accountName}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            copyToClipboard(
                                              bankDetails.accountName,
                                              "Account Name",
                                            )
                                          }
                                          className="h-6 w-6 p-0 hover:bg-blue-50 shrink-0"
                                        >
                                          {copiedText === "Account Name" ? (
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-gray-500" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Account Number
                                      </span>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono font-bold text-blue-700 text-sm break-all">
                                          {bankDetails.accountNumber}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            copyToClipboard(
                                              bankDetails.accountNumber,
                                              "Account Number",
                                            )
                                          }
                                          className="h-6 w-6 p-0 hover:bg-blue-50 shrink-0"
                                        >
                                          {copiedText === "Account Number" ? (
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-gray-500" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                          Branch Code
                                        </span>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-mono font-semibold text-gray-900 text-sm">
                                            {bankDetails.branchCode}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              copyToClipboard(
                                                bankDetails.branchCode,
                                                "Branch Code",
                                              )
                                            }
                                            className="h-5 w-5 p-0 hover:bg-blue-50 shrink-0"
                                          >
                                            {copiedText === "Branch Code" ? (
                                              <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                                            ) : (
                                              <Copy className="w-2.5 h-2.5 text-gray-500" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                          SWIFT Code
                                        </span>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-mono font-semibold text-gray-900 text-sm">
                                            {bankDetails.swiftCode}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              copyToClipboard(
                                                bankDetails.swiftCode,
                                                "SWIFT Code",
                                              )
                                            }
                                            className="h-5 w-5 p-0 hover:bg-blue-50 shrink-0"
                                          >
                                            {copiedText === "SWIFT Code" ? (
                                              <CheckCircle className="w-2.5 h-2.5 text-green-600" />
                                            ) : (
                                              <Copy className="w-2.5 h-2.5 text-gray-500" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {selectedPricing && (
                                  <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                      <Info className="w-4 h-4 text-blue-700" />
                                      <p className="text-sm text-blue-800 font-medium">
                                        Amount to transfer:{" "}
                                        <span className="font-bold">
                                          {selectedPricing.currency}{" "}
                                          {selectedPricing.price}
                                        </span>
                                      </p>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                      <strong>Reference:</strong>{" "}
                                      {bankDetails.instructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cash on Entry */}
                      {/* Cash Payment */}
                      <div
                        className={`p-3 sm:p-4 md:p-6 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                          formData.paymentMethod === "cash"
                            ? "border-amber-500 bg-amber-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                        onClick={() => updateField("paymentMethod", "cash")}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                              formData.paymentMethod === "cash"
                                ? "border-amber-500 bg-amber-500"
                                : "border-slate-300"
                            }`}
                          >
                            {formData.paymentMethod === "cash" && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                              <h4 className="font-bold text-base sm:text-lg text-gray-900">
                                Cash Payment
                              </h4>
                            </div>
                            {formData.paymentMethod === "cash" && (
                              <div className="mt-4">
                                <div className="p-4 bg-white rounded-lg border border-amber-200">
                                  <p className="text-sm text-gray-700 mb-3">
                                    Pay in cash when you arrive at the event
                                    venue. Please bring the exact amount if
                                    possible.
                                  </p>
                                  {selectedPricing && (
                                    <div className="flex items-center gap-2 p-2 bg-amber-100 rounded border border-amber-200">
                                      <Info className="w-4 h-4 text-amber-700" />
                                      <p className="text-sm text-amber-800 font-medium">
                                        Amount to pay:{" "}
                                        <span className="font-bold">
                                          {selectedPricing.currency}{" "}
                                          {selectedPricing.price}
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                  <p className="text-xs text-amber-700 mt-2">
                                    <strong>Note:</strong> Please arrive 30
                                    minutes early to complete payment and
                                    check-in procedures.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Evidence Upload */}
                  {formData.paymentMethod &&
                    formData.paymentMethod !== "cash" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#1C356B] rounded-lg sm:rounded-xl flex items-center justify-center">
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                            Upload Payment Evidence
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">
                            Proof of Payment (Optional)
                          </Label>
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 text-center hover:border-slate-400 transition-colors">
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                setEvidenceFile(e.target.files?.[0] || null)
                              }
                              className="hidden"
                              id="evidence-upload"
                            />
                            <Label
                              htmlFor="evidence-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              <div className="text-sm">
                                <span className="font-medium text-blue-600">
                                  Tap to upload
                                </span>
                                <span className="text-gray-500 hidden sm:inline">
                                  {" "}
                                  or drag and drop
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, PDF up to 10MB
                              </p>
                            </Label>
                            {evidenceFile && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                    📎
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-green-800 font-medium truncate">
                                      {evidenceFile.name}
                                    </p>
                                    <p className="text-xs text-green-600">
                                      {(
                                        evidenceFile.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Upload a screenshot of your payment confirmation,
                              bank transfer receipt, or mobile money
                              transaction. This helps us verify your payment
                              faster.
                            </p>
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                              <strong>📱 Mobile Tip:</strong> If upload fails,
                              you can complete registration and add evidence
                              later from your dashboard.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Newsletter Subscription Notice */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        Newsletter Subscription
                      </p>
                      <p>
                        By registering, you'll automatically receive our
                        newsletter with future events, training opportunities,
                        and industry insights.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-200 shrink-0">
              <div className="flex flex-col gap-3 sm:gap-4 w-full">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-end gap-2 sm:gap-3">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={submitting}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-slate-300 hover:bg-slate-100 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={close}
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-slate-300 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </Button>
                  {currentStep < 3 ? (
                    <Button
                      onClick={nextStep}
                      disabled={submitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRegister}
                      disabled={submitting || !formData.paymentMethod}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">
                            Submitting...
                          </span>
                          <span className="sm:hidden">Wait...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">
                            Complete Registration
                          </span>
                          <span className="sm:hidden">Complete</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 opacity-95" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2210%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2250%22%20r%3D%224%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

              <div className="relative px-4 sm:px-8 py-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Registration Successful!
                </DialogTitle>
                <DialogDescription className="text-green-100 text-base sm:text-lg">
                  Welcome aboard! We've sent a confirmation email to{" "}
                  {formData.email} with your payment details.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#1C356B] rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#FDC123]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-gray-600">Registration confirmed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <Clock className="w-5 h-5 text-[#1C356B]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Event Date
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <MapPin className="w-5 h-5 text-[#1C356B]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900">
                        {event.location || "TBA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <DollarSign className="w-5 h-5 text-[#1C356B]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Investment
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedPricing
                          ? `${selectedPricing.currency} ${selectedPricing.price}`
                          : `${event.price}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-[#1C356B]" />
                    <h4 className="font-semibold text-gray-900">
                      Payment Method
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.paymentMethod === "mobile" && (
                      <>
                        <Smartphone className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Mobile Money
                        </span>
                      </>
                    )}
                    {formData.paymentMethod === "bank" && (
                      <>
                        <Banknote className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">
                          Bank Transfer
                        </span>
                      </>
                    )}
                    {formData.paymentMethod === "cash" && (
                      <>
                        <Wallet className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 font-medium">
                          Pay on Entry
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">
                        What's Next?
                      </p>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>
                          • Check your email for detailed payment instructions
                        </li>
                        <li>• Complete payment using your selected method</li>
                        <li>
                          • You've been subscribed to our newsletter for updates
                        </li>
                        <li>• Add the event to your calendar</li>
                        {formData.paymentMethod === "cash" && (
                          <li>
                            • Arrive 30 minutes early for payment and check-in
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-200 shrink-0">
              <div className="w-full flex justify-center">
                <Button
                  onClick={close}
                  className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 sm:px-12 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Done
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
