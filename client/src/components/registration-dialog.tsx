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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase"; // Assuming you have a Supabase client exported from lib/supabase.ts
import { apiRequest } from "@/lib/queryClient";
import { Event } from "@shared/schema";
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
} from "lucide-react";
import { useEmailService } from "@/hooks/useEmailService";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSuccess?: () => void;
}

type FormDataType = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  organization: string;
  organizationType: string;
  position: string;
  notes: string;
  paymentMethod: string;
  currency: "ZMW" | "USD";
  hasPaid: boolean;
  evidenceFileName: string;
  evidenceFile: File | null;
};

export function RegistrationDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: RegistrationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { sendRegistrationConfirmation } = useEmailService();

  const [formData, setFormData] = useState<FormDataType>({
    title: "mr",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: "male",
    country: "",
    organization: "",
    organizationType: "government",
    position: "",
    notes: "",
    paymentMethod: "cash_on_entry",
    currency: "ZMW",
    hasPaid: false,
    evidenceFileName: "",
    evidenceFile: null,
  });

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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateField = (
    field: keyof FormDataType,
    value: FormDataType[typeof field],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const reset = () => {
    setFormData({
      title: "mr",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      gender: "male",
      country: "",
      organization: "",
      organizationType: "government",
      position: "",
      notes: "",
      paymentMethod: "cash_on_entry",
      currency: "ZMW",
      hasPaid: false,
      evidenceFileName: "",
      evidenceFile: null,
    });
    setSubmitting(false);
    setSubmitted(false);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        evidenceFile: file,
        evidenceFileName: file.name,
      }));
    }
  };

  const validateForm = () => {
    const required: (keyof FormDataType)[] = [
      "firstName",
      "lastName",
      "email",
      "country",
      "organization",
      "position",
    ];
    for (const field of required) {
      if (!formData[field]) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
    if (!formData.email.includes("@")) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleRegister = async () => {
    if (!user || !isAuthenticated) {
      setError("Authentication required. Please log in again.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    let evidencePath = "";

    try {
      // Upload payment evidence if provided
      if (formData.hasPaid && formData.evidenceFile) {
        // Sanitize filename to prevent "Invalid key" errors
        const fileExtension = formData.evidenceFile.name.split(".").pop();
        const sanitizedFileName = `evidence_${Date.now()}.${fileExtension}`;
        const filePath = `evidence/${user.id}/${event.id}/${sanitizedFileName}`;
        const bucket =
          import.meta.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, formData.evidenceFile, {
            cacheControl: "3600",
            upsert: false,
            contentType:
              formData.evidenceFile.type || "application/octet-stream",
          });

        if (uploadError) {
          if ((uploadError as any)?.message?.toLowerCase().includes("bucket")) {
            throw new Error(
              'Payment evidence bucket not found. Please create a Storage bucket named "' +
                bucket +
                '" or set VITE_SUPABASE_EVIDENCE_BUCKET to an existing bucket.',
            );
          }
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        evidencePath = filePath;
      }

      // Prepare registration payload - match backend expectations exactly
      const registrationPayload = {
        eventId: event.id,
        userId: user.id,
        title: formData.title,
        gender: formData.gender,
        country: formData.country.trim(), // Ensure country is not empty
        organization: formData.organization.trim(),
        organizationType: formData.organizationType,
        position: formData.position.trim(),
        notes: formData.notes || null,
        hasPaid: formData.hasPaid,
        paymentEvidence: evidencePath || null,
        paymentStatus: formData.hasPaid ? "paid" : "pending",
        paymentMethod: formData.paymentMethod,
        currency: formData.currency,
      };

      console.log("Sending registration payload:", registrationPayload);

      const registrationResult = await apiRequest(
        "POST",
        "/api/events/register",
        registrationPayload,
      );

      // Automatically subscribe to newsletter (fire-and-forget)
      await apiRequest("POST", "/api/newsletter/subscribe", {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      }).catch((newsletterError) => {
        console.error("Newsletter subscription failed:", newsletterError);
        // Don't fail the registration if newsletter subscription fails
      });

      // Send confirmation email using new email service (fire-and-forget)
      try {
        await sendRegistrationConfirmation({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          eventTitle: event.title,
          eventDate: event.startDate,
          eventLocation: event.location,
          eventPrice: event.price,
          registrationNumber:
            registrationResult.registration?.registrationNumber || "TBA",
        });
        console.log("Confirmation email sent successfully");
      } catch (emailError) {
        console.error("Email confirmation failed:", emailError);
        // Don't fail the registration if email fails
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle specific error cases
      if (err.message?.includes("null value in column")) {
        const match = err.message.match(/column "([^"]+)"/);
        const columnName = match ? match[1] : "required field";
        setError(`Missing required field: ${columnName}`);
      } else if (err.message?.includes("Already registered")) {
        setError("You are already registered for this event.");
      } else if (err.message?.includes("Event is full")) {
        setError("Sorry, this event is now full.");
      } else if (err.message?.includes("Event not found")) {
        setError("The selected event could not be found.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-white border-0 shadow-2xl rounded-2xl flex flex-col">
        {!submitted ? (
          <>
            <DialogHeader className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a] opacity-95" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />

              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white text-xl font-bold">×</span>
              </button>

              <div className="relative px-4 sm:px-8 py-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <Calendar className="w-8 h-8 text-[#FDC123]" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Register for {event.title}
                </DialogTitle>

                {/* Event Info Cards */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-[#FDC123]" />
                    <span className="text-white text-sm font-medium">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <MapPin className="w-4 h-4 text-[#FDC123]" />
                    <span className="text-white text-sm font-medium">
                      {event.location || "Location TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <DollarSign className="w-4 h-4 text-[#FDC123]" />
                    <span className="text-white text-sm font-medium">
                      K{event.price}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Title
                      </Label>
                      <Select
                        value={formData.title}
                        onValueChange={(value) => updateField("title", value)}
                      >
                        <SelectTrigger className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr">Dr</SelectItem>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="prof">Prof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Gender
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => updateField("gender", value)}
                      >
                        <SelectTrigger className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                      {!formData.country.trim() && (
                        <p className="text-xs text-red-600 mt-1">
                          Country is required
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Professional Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Organization Type
                      </Label>
                      <Select
                        value={formData.organizationType}
                        onValueChange={(value) =>
                          updateField("organizationType", value)
                        }
                      >
                        <SelectTrigger className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="private">
                            Private Sector
                          </SelectItem>
                          <SelectItem value="non-profit">Non-Profit</SelectItem>
                          <SelectItem value="academic">
                            Academic Institution
                          </SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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

                {/* Additional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Additional Information
                    </h3>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        updateField("paymentMethod", value)
                      }
                    >
                      <SelectTrigger className="h-14 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] hover:border-slate-400 transition-colors">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem
                          value="cash_on_entry"
                          className="h-16 p-3 cursor-pointer hover:bg-amber-50"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <span className="text-amber-600 text-lg">💵</span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-gray-900">
                                Cash on Entry
                              </span>
                              <span className="text-xs text-gray-500">
                                Pay at venue reception
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="mobile_money"
                          className="h-16 p-3 cursor-pointer hover:bg-emerald-50"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-600 text-lg">
                                📱
                              </span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-gray-900">
                                Mobile Money
                              </span>
                              <span className="text-xs text-gray-500">
                                MTN, Airtel, Zamtel
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="bank_transfer"
                          className="h-16 p-3 cursor-pointer hover:bg-blue-50"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 text-lg">🏦</span>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-gray-900">
                                Bank Transfer
                              </span>
                              <span className="text-xs text-gray-500">
                                Direct bank payment
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Currency
                    </Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value: "ZMW" | "USD") =>
                        updateField("currency", value)
                      }
                    >
                      <SelectTrigger className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZMW">
                          ZMW (Zambian Kwacha)
                        </SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Payment Instructions */}
                  {formData.paymentMethod === "mobile_money" && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                      <p className="text-sm font-semibold text-emerald-900 mb-2">
                        Pay with Mobile Money
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                          <p className="text-emerald-700 font-medium">MTN</p>
                          <p className="text-emerald-900 font-semibold">
                            0966 000 000
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                          <p className="text-emerald-700 font-medium">Airtel</p>
                          <p className="text-emerald-900 font-semibold">
                            0977 000 000
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-emerald-200">
                          <p className="text-emerald-700 font-medium">Zamtel</p>
                          <p className="text-emerald-900 font-semibold">
                            0955 000 000
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-800 mt-3">
                        Use your full name as reference. Keep your SMS
                        confirmation as proof.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === "bank_transfer" && (
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Bank Transfer Details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-blue-700 font-medium">Bank</p>
                          <p className="text-blue-900 font-semibold">Zanaco</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-blue-700 font-medium">
                            Account Name
                          </p>
                          <p className="text-blue-900 font-semibold">
                            Alliance Procurement & Capacity Building
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-blue-700 font-medium">
                            Account Number
                          </p>
                          <p className="text-blue-900 font-semibold">
                            0123456789012
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-blue-700 font-medium">Branch</p>
                          <p className="text-blue-900 font-semibold">
                            Cairo Road
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-800 mt-3">
                        Use your full name as reference. Upload proof if
                        available; finance will verify.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === "cash_on_entry" && (
                    <div className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">💵</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-amber-900 mb-2">
                            Cash Payment at Venue
                          </h4>
                          <p className="text-sm text-amber-800 mb-3">
                            You can pay with cash when you arrive at the venue
                            reception. Our team will process your payment during
                            check-in.
                          </p>
                          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-amber-600">💡</span>
                              <span className="text-sm font-semibold text-amber-900">
                                Pro Tips:
                              </span>
                            </div>
                            <ul className="text-xs text-amber-800 space-y-1">
                              <li>
                                • Bring exact change if possible to speed up
                                check-in
                              </li>
                              <li>
                                • Arrive 15 minutes early for payment processing
                              </li>
                              <li>
                                • Keep your registration confirmation handy
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        id="hasPaid"
                        type="checkbox"
                        checked={formData.hasPaid}
                        onChange={(e) =>
                          updateField("hasPaid", e.target.checked)
                        }
                        disabled={formData.paymentMethod === "cash_on_entry"}
                        className="w-5 h-5 text-[#1C356B] bg-white border-slate-300 rounded focus:ring-[#1C356B] focus:ring-2"
                      />
                      <Label
                        htmlFor="hasPaid"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />I have already paid
                        for this event
                        {formData.paymentMethod === "cash_on_entry" && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Disabled for Cash on Entry)
                          </span>
                        )}
                      </Label>
                    </div>

                    {/* Newsletter Subscription Notice */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">
                          Newsletter Subscription
                        </p>
                        <p>
                          By registering for this event, you'll automatically be
                          subscribed to our newsletter for future updates,
                          training opportunities, and industry insights.
                        </p>
                      </div>
                    </div>

                    {formData.hasPaid && (
                      <div className="space-y-2 pl-4 border-l-4 border-[#1C356B] bg-blue-50 p-4 rounded-r-xl">
                        <Label className="text-sm font-semibold text-gray-700">
                          Payment Evidence (optional)
                        </Label>
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="h-12 border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        {formData.evidenceFileName && (
                          <div className="flex items-center gap-2 text-sm text-[#1C356B] font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Attached: {formData.evidenceFileName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-200 shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={close}
                    disabled={submitting}
                    className="px-6 sm:px-8 py-3 border-slate-300 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-6 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
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
                  {formData.email} and subscribed you to our newsletter for
                  updates.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#1C356B] rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#FDC123]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-gray-600">Your registration details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <Clock className="w-5 h-5 text-[#1C356B]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date</p>
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
                        K{event.price}
                      </p>
                    </div>
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
                          • Check your email for detailed event information
                        </li>
                        <li>
                          • You've been subscribed to our newsletter for future
                          updates
                        </li>
                        <li>• Add the event to your calendar</li>
                        <li>
                          • Prepare any required materials mentioned in the
                          confirmation
                        </li>
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
