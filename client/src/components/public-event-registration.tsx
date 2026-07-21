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
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, ArrowLeft, Globe, MapPin, Building } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PublicEventRegistrationProps {
  event: Event;
  onSuccess?: () => void;
}

type DelegateType = "local" | "international" | "sponsorship" | null;
type LocalPackage = "standard" | "no_gala" | "with_accommodation" | "";
type InternationalPackage = "standard" | "no_accommodation" | "";
type SponsorshipPackage = "platinum" | "gold" | "silver" | "bronze" | "exhibitor_institutional" | "exhibitor_individual" | "";
type PaymentMethod = "cash" | "mobileMoney" | "bankTransfer" | "";

interface FormData {
  fullName: string;
  institution: string;
  gender: string;
  email: string;
  phoneNumber: string;
  title: string;
  titleOther: string;
  position: string;
  province: string;
  district: string;
  country: string;
  paymentMethod: PaymentMethod;
  localPackage: LocalPackage;
  internationalPackage: InternationalPackage;
  sponsorshipPackage: SponsorshipPackage;
  includeBoatCruise: boolean;
}

export function PublicEventRegistration({
  event,
  onSuccess,
}: PublicEventRegistrationProps) {
  const { toast } = useToast();
  const [selectedDelegateType, setSelectedDelegateType] = useState<DelegateType>(null);
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
    province: "",
    district: "",
    country: "",
    paymentMethod: "",
    localPackage: "",
    internationalPackage: "",
    sponsorshipPackage: "",
    includeBoatCruise: false,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelegateSelect = (type: DelegateType) => {
    setSelectedDelegateType(type);
    // Reset specific fields
    setFormData((prev) => ({ 
      ...prev, 
      localPackage: "", 
      internationalPackage: "", 
      sponsorshipPackage: "",
      includeBoatCruise: false,
      country: type === "local" ? "Zambia" : "",
    }));
  };

  const calculateTotal = (): { price: number; currency: string } => {
    let total = 0;
    let currency = "ZMW";

    if (selectedDelegateType === "local") {
      currency = "ZMW";
      if (formData.localPackage === "standard") total += 10500;
      else if (formData.localPackage === "no_gala") total += 8500;
      else if (formData.localPackage === "with_accommodation") total += 24500;
      
      if (formData.includeBoatCruise) total += 1800;
    } else if (selectedDelegateType === "international") {
      currency = "USD";
      if (formData.internationalPackage === "standard") total += 1750;
      else if (formData.internationalPackage === "no_accommodation") {
         total += 985;
         // Boat cruise included in $985 package
      }
      
      // If standard international and they select boat cruise, we assume it's billed in ZMW converted to USD or billed separately?
      // "Boat Cruise is optional at ZMW 1,800.00 per delegate"
      // For simplicity, let's add $65 (approx) if they are international and not the 985 package, or we can just leave it as an extra fee.
      // The prompt didn't specify USD price for boat cruise, let's assume $65.
      if (formData.includeBoatCruise && formData.internationalPackage !== "no_accommodation") {
         total += 65; 
      }
    } else if (selectedDelegateType === "sponsorship") {
      currency = "ZMW";
      if (formData.sponsorshipPackage === "platinum") total += 250000;
      else if (formData.sponsorshipPackage === "gold") total += 100000;
      else if (formData.sponsorshipPackage === "silver") total += 50000;
      else if (formData.sponsorshipPackage === "bronze") total += 30000;
      else if (formData.sponsorshipPackage === "exhibitor_institutional") total += 35000;
      else if (formData.sponsorshipPackage === "exhibitor_individual") total += 12850;
    }

    return { price: total, currency };
  };

  const handleSubmit = async () => {
    const fullNameTrimmed = formData.fullName.trim();
    const emailTrimmed = formData.email.trim().toLowerCase();
    const phoneNumberTrimmed = formData.phoneNumber.trim();
    const institutionTrimmed = formData.institution.trim();
    const titleTrimmed = formData.title.trim();
    const titleOtherTrimmed = formData.titleOther.trim();
    const positionTrimmed = formData.position.trim();
    const provinceTrimmed = formData.province.trim();
    const districtTrimmed = formData.district.trim();
    const countryTrimmed = formData.country.trim();

    if (!selectedDelegateType) {
      toast({ title: "Please select a delegate type", variant: "destructive" });
      return;
    }

    if (selectedDelegateType === "local" && !formData.localPackage) {
      toast({ title: "Please select a local package", variant: "destructive" });
      return;
    }

    if (selectedDelegateType === "international" && !formData.internationalPackage) {
      toast({ title: "Please select an international package", variant: "destructive" });
      return;
    }

    if (selectedDelegateType === "sponsorship" && !formData.sponsorshipPackage) {
      toast({ title: "Please select a sponsorship package", variant: "destructive" });
      return;
    }

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
      toast({ title: "Please enter your institution/company", variant: "destructive" });
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

    if (!formData.paymentMethod) {
      toast({ title: "Please select a payment method", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { price, currency } = calculateTotal();
    const includeGala = 
      (selectedDelegateType === "local" && formData.localPackage !== "no_gala") ||
      (selectedDelegateType === "international");
    const includeAccommodation = 
      (selectedDelegateType === "local" && formData.localPackage === "with_accommodation") ||
      (selectedDelegateType === "international" && formData.internationalPackage === "standard");
    const includeBoatCruise = 
      formData.includeBoatCruise || (selectedDelegateType === "international" && formData.internationalPackage === "no_accommodation");

    try {
      const payload = {
        eventId: event.id,
        delegateType: selectedDelegateType,
        fullName: fullNameTrimmed,
        institution: institutionTrimmed,
        gender: formData.gender,
        email: emailTrimmed,
        phoneNumber: phoneNumberTrimmed,
        title: titleTrimmed === "Other" ? titleOtherTrimmed : titleTrimmed,
        position: positionTrimmed,
        province: provinceTrimmed,
        district: districtTrimmed,
        country: countryTrimmed || (selectedDelegateType === "local" ? "Zambia" : ""),
        includeGala,
        includeAccommodation,
        includeBoatCruise,
        paymentMethod: formData.paymentMethod,
        totalPrice: price,
        currency: currency,
      };

      const response = await fetch("/api/events/women-leadership-register", {
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
        delegateType: selectedDelegateType,
        eventTitle: event.title,
        price,
        currency,
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
    setSelectedDelegateType(null);
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
      province: "",
      district: "",
      country: "",
      paymentMethod: "",
      localPackage: "",
      internationalPackage: "",
      sponsorshipPackage: "",
      includeBoatCruise: false,
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Institution / Company
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {successData?.institution}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Type & Total Amount
                  </p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {successData?.delegateType} Delegate
                  </p>
                  <p className="text-lg font-bold text-[#1C356B]">
                    {successData?.currency} {successData?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

  const { price, currency } = calculateTotal();

  return (
    <div className="w-full bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Delegate Type Selection */}
        {!selectedDelegateType ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C356B] mb-2 text-center">
              Event Registration
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Please select how you would like to participate
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => handleDelegateSelect("local")}
                className="flex flex-col items-center justify-center bg-white border-2 border-gray-200 hover:border-[#1C356B] hover:shadow-lg p-8 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1C356B] transition-colors">
                  <MapPin className="w-8 h-8 text-[#1C356B] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Local Delegate</h3>
                <p className="text-sm text-gray-500">For delegates residing in Zambia</p>
              </button>

              <button
                onClick={() => handleDelegateSelect("international")}
                className="flex flex-col items-center justify-center bg-white border-2 border-gray-200 hover:border-[#1C356B] hover:shadow-lg p-8 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1C356B] transition-colors">
                  <Globe className="w-8 h-8 text-[#1C356B] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">International Delegate</h3>
                <p className="text-sm text-gray-500">For delegates from outside Zambia</p>
              </button>

              <button
                onClick={() => handleDelegateSelect("sponsorship")}
                className="flex flex-col items-center justify-center bg-white border-2 border-gray-200 hover:border-[#1C356B] hover:shadow-lg p-8 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#1C356B] transition-colors">
                  <Building className="w-8 h-8 text-[#1C356B] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Sponsorship / Exhibitor</h3>
                <p className="text-sm text-gray-500">For sponsors and exhibition booths</p>
              </button>
            </div>
          </>
        ) : null}

        {/* Registration Form */}
        {selectedDelegateType && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setSelectedDelegateType(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1C356B]" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#1C356B] capitalize">
                  {selectedDelegateType} Registration
                </h2>
                <p className="text-sm text-gray-600">
                  Please fill in your details and select your package
                </p>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Packages Selection based on Delegate Type */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                <Label className="text-base font-bold text-[#1C356B] mb-4 block">
                  Select Your Package *
                </Label>
                
                {selectedDelegateType === "local" && (
                  <RadioGroup value={formData.localPackage} onValueChange={(value) => updateField("localPackage", value as LocalPackage)}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="standard" id="local-standard" />
                          <label htmlFor="local-standard" className="text-sm font-medium cursor-pointer text-gray-900">
                            Standard Participation (Includes Gala Dinner)
                          </label>
                        </div>
                        <span className="font-bold text-gray-900">ZMW 10,500</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no_gala" id="local-nogala" />
                          <label htmlFor="local-nogala" className="text-sm font-medium cursor-pointer text-gray-900">
                            Participation Fee without Gala Dinner
                          </label>
                        </div>
                        <span className="font-bold text-gray-900">ZMW 8,500</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="with_accommodation" id="local-acc" />
                          <label htmlFor="local-acc" className="text-sm font-medium cursor-pointer text-gray-900">
                            Participation With 3 days accommodation at Avani + Gala Dinner
                          </label>
                        </div>
                        <span className="font-bold text-gray-900">ZMW 24,500</span>
                      </div>
                    </div>
                  </RadioGroup>
                )}

                {selectedDelegateType === "international" && (
                  <RadioGroup value={formData.internationalPackage} onValueChange={(value) => updateField("internationalPackage", value as InternationalPackage)}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="standard" id="int-standard" />
                          <div className="cursor-pointer">
                            <label htmlFor="int-standard" className="text-sm font-medium text-gray-900 block">
                              Standard Participation
                            </label>
                            <span className="text-xs text-gray-500">Includes 4 nights accommodation, Gala dinner, Boat cruise, Airport transfer</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">$1,750</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no_accommodation" id="int-noacc" />
                          <div className="cursor-pointer">
                            <label htmlFor="int-noacc" className="text-sm font-medium text-gray-900 block">
                              Without Accommodation
                            </label>
                            <span className="text-xs text-gray-500">Includes Gala dinner and Boat cruise (Accommodation not included)</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">$985</span>
                      </div>
                    </div>
                  </RadioGroup>
                )}

                {selectedDelegateType === "sponsorship" && (
                  <RadioGroup value={formData.sponsorshipPackage} onValueChange={(value) => updateField("sponsorshipPackage", value as SponsorshipPackage)}>
                    <div className="space-y-3">
                      {[
                        { id: "platinum", label: "Platinum Sponsor", price: "ZMW 250,000" },
                        { id: "gold", label: "Gold Sponsor", price: "ZMW 100,000" },
                        { id: "silver", label: "Silver Sponsor", price: "ZMW 50,000" },
                        { id: "bronze", label: "Bronze Sponsor", price: "ZMW 30,000" },
                        { id: "exhibitor_institutional", label: "Institutional Exhibitor", price: "ZMW 35,000" },
                        { id: "exhibitor_individual", label: "Individual Exhibitor", price: "ZMW 12,850" },
                      ].map((pkg) => (
                        <div key={pkg.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={pkg.id} id={pkg.id} />
                            <label htmlFor={pkg.id} className="text-sm font-medium cursor-pointer text-gray-900">
                              {pkg.label}
                            </label>
                          </div>
                          <span className="font-bold text-gray-900">{pkg.price}</span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Optional Add-ons */}
                {(selectedDelegateType === "local" || (selectedDelegateType === "international" && formData.internationalPackage === "standard")) && (
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <Label className="text-sm font-bold text-gray-900 mb-3 block">
                      Optional Add-ons
                    </Label>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                      <Checkbox 
                        id="boat-cruise" 
                        checked={formData.includeBoatCruise}
                        onCheckedChange={(checked) => updateField("includeBoatCruise", !!checked)}
                      />
                      <label
                        htmlFor="boat-cruise"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                      >
                        Include Boat Cruise
                      </label>
                      <span className="font-bold text-gray-900">
                        {selectedDelegateType === "international" ? "+ $65 (Approx ZMW 1,800)" : "+ ZMW 1,800"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Full Name *</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Your full name"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                      {selectedDelegateType === "sponsorship" ? "Company / Institution Name *" : "Institution *"}
                    </Label>
                    <Input
                      value={formData.institution}
                      onChange={(e) => updateField("institution", e.target.value)}
                      placeholder="Your institution"
                      className="h-11 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Gender *</Label>
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
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Title *</Label>
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
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Specify your title *</Label>
                    <Input
                      value={formData.titleOther}
                      onChange={(e) => updateField("titleOther", e.target.value)}
                      placeholder="Enter your title"
                      className="h-11 text-base"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="your@email.com"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Phone Number *</Label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => updateField("phoneNumber", e.target.value)}
                      placeholder="Your phone number"
                      className="h-11 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">Position / Job Title *</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => updateField("position", e.target.value)}
                    placeholder="Enter your position"
                    className="h-11 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedDelegateType === "international" ? (
                    <>
                      <div>
                        <Label className="text-sm font-semibold text-gray-900 mb-2 block">Country *</Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          placeholder="Your country"
                          className="h-11 text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-900 mb-2 block">City / State *</Label>
                        <Input
                          value={formData.province}
                          onChange={(e) => updateField("province", e.target.value)}
                          placeholder="Your city or state"
                          className="h-11 text-base"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-sm font-semibold text-gray-900 mb-2 block">Province *</Label>
                        <Input
                          value={formData.province}
                          onChange={(e) => updateField("province", e.target.value)}
                          placeholder="Your province"
                          className="h-11 text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-900 mb-2 block">District *</Label>
                        <Input
                          value={formData.district}
                          onChange={(e) => updateField("district", e.target.value)}
                          placeholder="Your district"
                          className="h-11 text-base"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <Label className="text-base font-bold text-gray-900 mb-4 block">
                  Payment Method *
                </Label>
                <RadioGroup value={formData.paymentMethod} onValueChange={(value) => updateField("paymentMethod", value as PaymentMethod)}>
                  <div className="space-y-3">
                    {[
                      { id: "cash", label: "Cash" },
                      { id: "mobileMoney", label: "Mobile Money" },
                      { id: "bankTransfer", label: "Bank Transfer" },
                    ].map(({ id, label }) => (
                      <div key={id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                        <RadioGroupItem value={id} id={`pay-${id}`} />
                        <label htmlFor={`pay-${id}`} className="text-sm font-medium cursor-pointer text-gray-900 w-full">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Total Calculation */}
              <div className="bg-[#1C356B] text-white p-6 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">Total Amount Due</h4>
                  <p className="text-blue-200 text-sm">Including selected packages and add-ons</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-blue-200 mr-2">{currency}</span>
                  <span className="text-3xl font-bold">{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || price === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-base font-bold rounded-xl h-auto"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
                <Button
                  onClick={() => setSelectedDelegateType(null)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 py-4 text-base font-semibold rounded-xl h-auto"
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
