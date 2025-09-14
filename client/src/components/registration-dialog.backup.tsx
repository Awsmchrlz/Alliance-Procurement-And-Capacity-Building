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

import { useToast } from "@/hooks/use-toast";
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
  X,
  CheckCircle,
  Copy,
  Smartphone,
  Info,
  Upload,
  FileText,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Landmark,
  User,
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Banknote,
  Wallet,
  Phone,
  CreditCard,
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

const bankAccounts = {
  'SME (ZMK)': {
    bankName: 'FNB',
    accountName: 'Alliance Procurement and Capacity Building Foundation',
    accountNumber: '63136716785',
    branch: 'Makeni Junction',
    swiftCode: 'FIRNZMLX',
    sortCode: '260016',
    currency: 'ZMW',
    type: 'SME Account (ZMK)'
  },
  'CALL (USD)': {
    bankName: 'FNB',
    accountName: 'Alliance Procurement and Capacity Building Foundation',
    accountNumber: '63136717006',
    branch: 'Makeni Junction',
    swiftCode: 'FIRNZMLX',
    sortCode: '260016',
    currency: 'USD',
    type: 'Call Account (USD)'
  }
};

const [selectedAccount, setSelectedAccount] = useState<'SME (ZMK)' | 'CALL (USD)'>('SME (ZMK)');
const bankDetails = bankAccounts[selectedAccount];

const instructions = "Please use your full name and event title as payment reference";

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
      paymentMethod: "",
      delegateType: "private",
    });
    setCurrentStep(1);
    setSuccess(false);
    setSubmitting(false);
    setError("");
    setEvidenceFile(null);
  };

  const { toast } = useToast();

  const validateStep = (step: number): { isValid: boolean; message?: string; field?: string } => {
    switch (step) {
      case 1: {
        const required: (keyof FormDataType)[] = ["firstName", "lastName", "email", "country"];
        for (const field of required) {
          if (!formData[field]) {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");
            return { 
              isValid: false, 
              message: `${fieldName} is required`,
              field
            };
          }
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          return { 
            isValid: false, 
            message: "Please enter a valid email address",
            field: "email"
          };
        }
        break;
      }
      case 2: {
        if (!formData.organization) {
          return { 
            isValid: false, 
            message: "Organization is required",
            field: "organization"
          };
        }
        if (!formData.position) {
          return { 
            isValid: false, 
            message: "Position is required",
            field: "position"
          };
        }
        break;
      }
      case 3: {
        if (!formData.paymentMethod) {
          return { 
            isValid: false, 
            message: "Please select a payment method",
            field: "paymentMethod"
          };
        }
        break;
      }
    }
    return { isValid: true };
  };

  const nextStep = () => {
    const { isValid, message, field } = validateStep(currentStep);
    if (!isValid && message) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: message,
      });
      
      // Optionally focus the field with error if it exists in the DOM
      if (field) {
        const element = document.querySelector(`[name="${field}"]`);
        if (element) {
          (element as HTMLElement).focus();
        }
      }
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
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in again to continue.",
      });
      return;
    }

    const { isValid, message } = validateStep(3);
    if (!isValid && message) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: message,
      });
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
        // Sanitize filename by removing spaces and special characters
        const sanitizedFileName = evidenceFile.name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '');
        const fileName = `payment-evidence/${userId}/${Date.now()}-${sanitizedFileName}`;
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
        notes: "",
        paymentMethod: formData.paymentMethod,
        delegateType: formData.delegateType,
        hasPaid: false,
        paymentEvidence: evidencePath,
        paymentStatus: "pending",
      };

      console.log("Sending registration payload:", registrationPayload);

      await apiRequest("POST", "/api/events/register", registrationPayload);

      console.log("✅ Registration completed successfully");

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
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl rounded-xl sm:rounded-2xl flex flex-col p-0">
        {!success ? (
          <div className="flex flex-col h-full">
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep === step
                          ? "bg-white text-[#1C356B]"
                          : currentStep > step
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`h-0.5 w-8 ${
                          currentStep > step ? "bg-green-400" : "bg-slate-200"
                        }`}
                    className={
                      currentStep >= 3 ? "text-sky-400 font-medium" : ""
                    }
                  >
                    Payment
                  </span>
                </div>

                {/* Event Info Cards - Hidden on mobile */}
                <div className="hidden sm:flex flex-wrap justify-center gap-2 sm:gap-4 mt-6">
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

                </div>
              )}

              {/* Step 3: Pricing & Payment */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-8 h-8 bg-[#1C356B] rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-sky-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Choose Your Package & Payment
                    </h3>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">
                      Select Your Category <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-2">
                      {pricingTiers.map((tier) => (
                        <div
                          key={tier.type}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.delegateType === tier.type
                              ? "border-[#1C356B] bg-[#1C356B]/5"
                              : "border-slate-200"
                          }`}
                          onClick={() => updateField("delegateType", tier.type)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
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
                              <div className="flex flex-col">
                                <div>
                                  <h4 className="font-bold text-gray-900">
                                    {tier.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-0.5">
                                    {tier.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Registration Successful!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for registering. You will receive a confirmation email shortly.
            </p>
            <div className="mt-6">
              <Button
                type="button"
                className="inline-flex items-center rounded-md bg-[#1C356B] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2d4a7a] focus:outline-none focus:ring-2 focus:ring-[#1C356B] focus:ring-offset-2"
                onClick={close}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
