import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, ArrowLeft, Users, Globe, Award, Calendar, MapPin } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WomenLeadershipRegistrationProps {
  event: Event;
  onSuccess?: () => void;
}

type RegistrationType = "local" | "international" | "sponsorship" | null;

// Validation helper
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string): boolean => phone.trim().length >= 7;
const validateRequired = (value: string, minLength = 2): boolean => value.trim().length >= minLength;

export function WomenLeadershipRegistration({ event, onSuccess }: WomenLeadershipRegistrationProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [successData, setSuccessData] = useState<any>(null);
  const [paymentEvidenceFile, setPaymentEvidenceFile] = useState<File | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  // Price calculations
  const calculateLocalPrice = (includeGala: boolean, includeAccommodation: boolean, includeBoatCruise: boolean) => {
    let price = 8500;
    if (includeGala) price += 2000;
    if (includeAccommodation) price += 14000;
    if (includeBoatCruise) price += 1800;
    return price;
  };

  const calculateInternationalPrice = (includeAccommodation: boolean) => {
    return includeAccommodation ? 1750 : 985;
  };

  const getSponsorshipPrice = (level: string): number => {
    const prices: Record<string, number> = { platinum: 250000, gold: 100000, silver: 50000, bronze: 30000 };
    return prices[level] || 0;
  };

  // Validation & Submission
  const validateAndSubmit = async () => {
    // Common validation
    const email = formData.email?.trim().toLowerCase();
    const phoneNumber = formData.phoneNumber?.trim();

    if (!validateEmail(email || "")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (!validatePhone(phoneNumber || "")) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number (at least 7 digits)", variant: "destructive" });
      return;
    }

    // Type-specific validation
    if (registrationType === "local") {
      if (!validateRequired(formData.fullName)) return toast({ title: "Full name is required", variant: "destructive" });
      if (!validateRequired(formData.institution)) return toast({ title: "Institution is required", variant: "destructive" });
      if (!formData.gender) return toast({ title: "Please select your gender", variant: "destructive" });
      if (!formData.title) return toast({ title: "Please select your title", variant: "destructive" });
      if (!validateRequired(formData.position)) return toast({ title: "Position is required", variant: "destructive" });
      if (!validateRequired(formData.province)) return toast({ title: "Province is required", variant: "destructive" });
      if (!validateRequired(formData.district)) return toast({ title: "District is required", variant: "destructive" });
      if (!formData.paymentMethod) return toast({ title: "Please select a payment method", variant: "destructive" });
    }

    if (registrationType === "international") {
      if (!validateRequired(formData.fullName)) return toast({ title: "Full name is required", variant: "destructive" });
      if (!validateRequired(formData.institution)) return toast({ title: "Institution is required", variant: "destructive" });
      if (!formData.gender) return toast({ title: "Please select your gender", variant: "destructive" });
      if (!formData.title) return toast({ title: "Please select your title", variant: "destructive" });
      if (!validateRequired(formData.position)) return toast({ title: "Position is required", variant: "destructive" });
      if (!validateRequired(formData.country)) return toast({ title: "Country is required", variant: "destructive" });
      if (!formData.paymentMethod) return toast({ title: "Please select a payment method", variant: "destructive" });
    }

    if (registrationType === "sponsorship") {
      if (!validateRequired(formData.companyName)) return toast({ title: "Company name is required", variant: "destructive" });
      if (!validateRequired(formData.contactPerson)) return toast({ title: "Contact person is required", variant: "destructive" });
      if (!formData.sponsorshipLevel) return toast({ title: "Please select a sponsorship level", variant: "destructive" });
    }

    setIsSubmitting(true);

    try {
      let payload: any = { eventId: event.id };
      let endpoint = "";

      // Upload proof of payment if provided
      let paymentEvidenceUrl: string | null = null;
      if (paymentEvidenceFile) {
        setIsUploadingEvidence(true);
        const uploadForm = new FormData();
        uploadForm.append("file", paymentEvidenceFile);
        try {
          const uploadRes = await fetch("/api/events/upload-payment-evidence", {
            method: "POST",
            body: uploadForm,
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");
          paymentEvidenceUrl = uploadData.url;
        } finally {
          setIsUploadingEvidence(false);
        }
      }

      if (registrationType === "local") {
        const totalPrice = calculateLocalPrice(
          formData.includeGala ?? true,
          formData.includeAccommodation ?? false,
          formData.includeBoatCruise ?? false
        );
        payload = {
          ...payload,
          delegateType: "local",
          fullName: formData.fullName.trim(),
          institution: formData.institution.trim(),
          gender: formData.gender,
          email,
          phoneNumber,
          title: formData.title,
          position: formData.position.trim(),
          province: formData.province.trim(),
          district: formData.district.trim(),
          includeGala: formData.includeGala ?? true,
          includeAccommodation: formData.includeAccommodation ?? false,
          includeBoatCruise: formData.includeBoatCruise ?? false,
          paymentMethod: formData.paymentMethod,
          totalPrice,
          currency: "ZMW",
        };
        endpoint = "/api/events/women-leadership-register";
      } else if (registrationType === "international") {
        const totalPrice = calculateInternationalPrice(formData.includeAccommodation ?? true);
        payload = {
          ...payload,
          delegateType: "international",
          fullName: formData.fullName.trim(),
          institution: formData.institution.trim(),
          gender: formData.gender,
          email,
          phoneNumber,
          title: formData.title,
          position: formData.position.trim(),
          country: formData.country.trim(),
          includeAccommodation: formData.includeAccommodation ?? true,
          paymentMethod: formData.paymentMethod,
          totalPrice,
          currency: "USD",
        };
        endpoint = "/api/events/women-leadership-register";
      } else if (registrationType === "sponsorship") {
        const amount = getSponsorshipPrice(formData.sponsorshipLevel);
        payload = {
          ...payload,
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
          email,
          phoneNumber,
          website: formData.website?.trim() || null,
          companyAddress: formData.companyAddress?.trim() || null,
          sponsorshipLevel: formData.sponsorshipLevel,
          amount,
          currency: "ZMW",
          specialRequirements: formData.specialRequirements?.trim() || null,
          marketingMaterials: formData.marketingMaterials?.trim() || null,
        };
        endpoint = "/api/sponsorships/register";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setSuccessData(data);
      setStep("success");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("select");
    setRegistrationType(null);
    setFormData({});
    setSuccessData(null);
    setPaymentEvidenceFile(null);
  };

  const handleRegistrationTypeSelect = (type: RegistrationType) => {
    setRegistrationType(type);
    setFormData(type === "local" ? { includeGala: true, includeAccommodation: false, includeBoatCruise: false } : 
                 type === "international" ? { includeAccommodation: true } : {});
    setStep("form");
  };

  // Render Success Screen
  if (step === "success") {
    return (
      <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50"></div>
              <CheckCircle className="w-20 h-20 text-green-600 relative" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {registrationType === "sponsorship" ? "Application Submitted!" : "Registration Successful!"}
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            {registrationType === "sponsorship" 
              ? "We will review your application and contact you soon" 
              : "Your registration has been confirmed"}
          </p>

          {successData?.registrationNumber && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-8 mb-8">
              <p className="text-gray-600 text-sm font-semibold uppercase mb-2">Registration Number</p>
              <div className="text-5xl font-bold text-green-600 font-mono">{successData.registrationNumber}</div>
              <p className="text-gray-500 text-sm mt-3">Save this for your records</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md border p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b">Confirmation Details</h3>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase mb-1">
                  {registrationType === "sponsorship" ? "Company" : "Name"}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.companyName || formData.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{formData.email}</p>
              </div>
              {registrationType !== "sponsorship" && successData?.registrationNumber && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {registrationType === "local" ? "ZMW" : "$"} {
                      registrationType === "local" 
                        ? calculateLocalPrice(formData.includeGala, formData.includeAccommodation, formData.includeBoatCruise).toLocaleString()
                        : calculateInternationalPrice(formData.includeAccommodation).toLocaleString()
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-900">
              A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={resetForm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3">
              {registrationType === "sponsorship" ? "Submit Another Application" : "Register Another Person"}
            </Button>
            <Button 
              onClick={() => { if (onSuccess) onSuccess(); window.location.href = "/"; }} 
              variant="outline"
              className="flex-1 py-3"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Selection Screen
  if (step === "select") {
    return (
      <div className="w-full bg-gradient-to-br from-[#1C356B] via-purple-900 to-pink-900 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Women in Leadership and Governance Seminar
            </h1>
            <p className="text-xl text-blue-100 mb-4">Empowering Women for Sustainable Leadership</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>28-30 October 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Avani Victoria Falls Resort, Zambia</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 text-center">Choose Your Registration Type</h2>
          <p className="text-blue-100 text-center mb-8">Select the option that best fits your needs</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
            {/* Local Delegate */}
            <button
              onClick={() => handleRegistrationTypeSelect("local")}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-white/60 hover:bg-white/20 p-4 md:p-5 rounded-xl transition-all text-left group flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-tight">Local Delegate</h3>
              </div>
              <div className="space-y-1 text-blue-100 text-xs mb-3 flex-grow">
                <p>✓ All sessions & materials</p>
                <p>✓ Meals & refreshments</p>
                <p>✓ Certificate</p>
                <p>✓ Optional add-ons</p>
              </div>
              <div className="border-t border-white/20 pt-3 mt-auto w-full">
                <p className="text-xs text-blue-200 mb-0.5">Starting from</p>
                <p className="text-xl md:text-2xl font-bold text-white">ZMW 8,500</p>
                <p className="text-xs text-blue-200">+ optional packages</p>
              </div>
            </button>

            {/* International Delegate */}
            <button
              onClick={() => handleRegistrationTypeSelect("international")}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-white/60 hover:bg-white/20 p-4 md:p-5 rounded-xl transition-all text-left group flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-tight">International Delegate</h3>
              </div>
              <div className="space-y-1 text-blue-100 text-xs mb-3 flex-grow">
                <p>✓ All local benefits</p>
                <p>✓ 4 nights accommodation</p>
                <p>✓ Airport transfers</p>
                <p>✓ Gala & boat cruise</p>
              </div>
              <div className="border-t border-white/20 pt-3 mt-auto w-full">
                <p className="text-xs text-blue-200 mb-0.5">Full package</p>
                <p className="text-xl md:text-2xl font-bold text-white">$1,750</p>
                <p className="text-xs text-blue-200">or $985 w/o accommodation</p>
              </div>
            </button>

            {/* Sponsorship */}
            <button
              onClick={() => handleRegistrationTypeSelect("sponsorship")}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-white/60 hover:bg-white/20 p-4 md:p-5 rounded-xl transition-all text-left group flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/30 transition-colors shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-tight">Sponsorship</h3>
              </div>
              <div className="space-y-1 text-blue-100 text-xs mb-3 flex-grow">
                <p>✓ Brand visibility</p>
                <p>✓ Speaking opportunities</p>
                <p>✓ Exhibition booth</p>
                <p>✓ Networking</p>
              </div>
              <div className="border-t border-white/20 pt-3 mt-auto w-full">
                <p className="text-xs text-blue-200 mb-0.5">Packages from</p>
                <p className="text-xl md:text-2xl font-bold text-white">ZMW 30K</p>
                <p className="text-xs text-blue-200">Bronze to Platinum</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Form Screen
  const FormField = ({ label, required = false, children }: any) => (
    <div>
      <Label className="text-sm font-semibold text-gray-900 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <div className="w-full bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setStep("select")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1C356B]" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#1C356B]">
              {registrationType === "local" ? "Local Delegate Registration" :
               registrationType === "international" ? "International Delegate Registration" :
               "Sponsorship Application"}
            </h2>
            <p className="text-sm text-gray-600">Complete the form below</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Common Fields for Delegates */}
          {(registrationType === "local" || registrationType === "international") && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <Input
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                </FormField>
                <FormField label="Email" required>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                </FormField>
                <FormField label="Phone Number" required>
                  <Input
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Phone number"
                    className="h-11"
                  />
                </FormField>
                <FormField label="Gender" required>
                  <Select value={formData.gender || ""} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Title" required>
                  <Select value={formData.title || ""} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select title" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Institution" required>
                  <Input
                    value={formData.institution || ""}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Your institution"
                    className="h-11"
                  />
                </FormField>
                <FormField label="Position" required>
                  <Input
                    value={formData.position || ""}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Your position/title"
                    className="h-11"
                  />
                </FormField>
                {registrationType === "local" && (
                  <>
                    <FormField label="Province" required>
                      <Input
                        value={formData.province || ""}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="Province"
                        className="h-11"
                      />
                    </FormField>
                    <FormField label="District" required>
                      <Input
                        value={formData.district || ""}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="District"
                        className="h-11"
                      />
                    </FormField>
                  </>
                )}
                {registrationType === "international" && (
                  <FormField label="Country" required>
                    <Input
                      value={formData.country || ""}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Your country"
                      className="h-11"
                    />
                  </FormField>
                )}
              </div>
            </div>
          )}

          {/* Local Delegate Packages */}
          {registrationType === "local" && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Package Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="gala"
                    checked={formData.includeGala ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeGala: !!checked })}
                  />
                  <label htmlFor="gala" className="text-sm font-medium cursor-pointer">
                    Gala Dinner (+ZMW 2,000)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="accommodation"
                    checked={formData.includeAccommodation ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeAccommodation: !!checked })}
                  />
                  <label htmlFor="accommodation" className="text-sm font-medium cursor-pointer">
                    3 Days Accommodation at Avani (+ZMW 14,000)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="boatCruise"
                    checked={formData.includeBoatCruise ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeBoatCruise: !!checked })}
                  />
                  <label htmlFor="boatCruise" className="text-sm font-medium cursor-pointer">
                    Boat Cruise (+ZMW 1,800)
                  </label>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-300 flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-[#1C356B]">
                  ZMW {calculateLocalPrice(formData.includeGala ?? true, formData.includeAccommodation ?? false, formData.includeBoatCruise ?? false).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* International Delegate Packages */}
          {registrationType === "international" && (
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Package Selection</h3>
              <RadioGroup
                value={formData.includeAccommodation ? "full" : "basic"}
                onValueChange={(value) => setFormData({ ...formData, includeAccommodation: value === "full" })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 hover:border-purple-300 cursor-pointer">
                    <RadioGroupItem value="full" id="full" />
                    <div className="flex-1">
                      <label htmlFor="full" className="font-bold cursor-pointer block">Full Package - $1,750</label>
                      <p className="text-xs text-gray-600">Includes 4 nights accommodation, airport transfers, gala & boat cruise</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 hover:border-purple-300 cursor-pointer">
                    <RadioGroupItem value="basic" id="basic" />
                    <div className="flex-1">
                      <label htmlFor="basic" className="font-bold cursor-pointer block">Basic Package - $985</label>
                      <p className="text-xs text-gray-600">Includes all sessions, gala & boat cruise (no accommodation)</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              <div className="mt-6 pt-6 border-t border-purple-300 flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-[#1C356B]">
                  ${calculateInternationalPrice(formData.includeAccommodation ?? true).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Sponsorship Fields */}
          {registrationType === "sponsorship" && (
            <>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Company Name" required>
                      <Input
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Company name"
                        className="h-11"
                      />
                    </FormField>
                  </div>
                  <FormField label="Contact Person" required>
                    <Input
                      value={formData.contactPerson || ""}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Contact person"
                      className="h-11"
                    />
                  </FormField>
                  <FormField label="Email" required>
                    <Input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                      className="h-11"
                    />
                  </FormField>
                  <FormField label="Phone Number" required>
                    <Input
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Phone number"
                      className="h-11"
                    />
                  </FormField>
                  <FormField label="Website">
                    <Input
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://company.com"
                      className="h-11"
                    />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="Company Address">
                      <Input
                        value={formData.companyAddress || ""}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        placeholder="Company address"
                        className="h-11"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Sponsorship Level <span className="text-red-500">*</span></h3>
                <RadioGroup
                  value={formData.sponsorshipLevel || ""}
                  onValueChange={(value) => setFormData({ ...formData, sponsorshipLevel: value })}
                >
                  <div className="space-y-3">
                    {[
                      { id: "platinum", label: "Platinum", price: 250000, benefits: ["15 min speaking slot daily", "Prime booth", "Full branding"] },
                      { id: "gold", label: "Gold", price: 100000, benefits: ["9 min speaking slot", "Exhibition booth", "Featured logo"] },
                      { id: "silver", label: "Silver", price: 50000, benefits: ["Logo on materials", "Exhibition booth", "Host workshop"] },
                      { id: "bronze", label: "Bronze", price: 30000, benefits: ["Logo on program", "Shared booth", "Literature in packs"] },
                    ].map(({ id, label, price, benefits }) => (
                      <div key={id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border-2 hover:border-pink-300 cursor-pointer">
                        <RadioGroupItem value={id} id={id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <label htmlFor={id} className="font-bold cursor-pointer">{label} Sponsor</label>
                            <span className="text-lg font-bold text-[#1C356B]">ZMW {price.toLocaleString()}</span>
                          </div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {benefits.map((benefit, idx) => <li key={idx}>✓ {benefit}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Additional Information</h3>
                <FormField label="Special Requirements">
                  <Input
                    value={formData.specialRequirements || ""}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                    placeholder="Any special requirements"
                    className="h-11"
                  />
                </FormField>
                <FormField label="Marketing Materials">
                  <Input
                    value={formData.marketingMaterials || ""}
                    onChange={(e) => setFormData({ ...formData, marketingMaterials: e.target.value })}
                    placeholder="Details about materials to distribute"
                    className="h-11"
                  />
                </FormField>
              </div>
            </>
          )}

          {/* Payment Method - for delegates only */}
          {(registrationType === "local" || registrationType === "international") && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <Label className="text-sm font-semibold text-gray-900 mb-4 block">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.paymentMethod || ""}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <div className="space-y-3">
                  {[
                    { id: "bankTransfer", label: "Bank Transfer" },
                    { id: "mobileMoney", label: "Mobile Money" },
                    { id: "cash", label: "Cash" },
                  ].map(({ id, label }) => (
                    <div key={id} className="flex items-center space-x-3">
                      <RadioGroupItem value={id} id={id} />
                      <label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Proof of Payment Upload */}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-900 mb-1 block">
                  Proof of Payment <span className="text-gray-400 font-normal">(Optional)</span>
                </Label>
                <p className="text-xs text-gray-500 mb-3">Attach a bank receipt, screenshot, or PDF. Max 5MB.</p>
                <label
                  htmlFor="payment-evidence"
                  className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    paymentEvidenceFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {paymentEvidenceFile ? (
                    <div className="flex flex-col items-center gap-1 px-3 text-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium text-green-700 truncate max-w-xs">{paymentEvidenceFile.name}</span>
                      <span className="text-xs text-gray-500">{(paymentEvidenceFile.size / 1024).toFixed(0)} KB · Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="text-sm text-gray-600">Click to upload or drag & drop</span>
                      <span className="text-xs text-gray-400">JPEG, PNG, WebP, PDF</span>
                    </div>
                  )}
                  <input
                    id="payment-evidence"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) {
                        toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
                        return;
                      }
                      setPaymentEvidenceFile(f);
                    }}
                  />
                </label>
                {paymentEvidenceFile && (
                  <button
                    type="button"
                    onClick={() => setPaymentEvidenceFile(null)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={validateAndSubmit}
              disabled={isSubmitting || isUploadingEvidence}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
            >
              {isUploadingEvidence ? "Uploading evidence..." : isSubmitting ? "Submitting..." : registrationType === "sponsorship" ? "Submit Application" : "Submit Registration"}
            </Button>
            <Button
              onClick={() => setStep("select")}
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 py-3 text-base font-semibold"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
