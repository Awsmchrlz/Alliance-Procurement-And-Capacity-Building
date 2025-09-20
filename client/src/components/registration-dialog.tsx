import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Upload, FileText, Copy, X, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Event } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSuccess?: () => void;
}

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  organization: string;
  position: string;
  paymentMethod: "mobile" | "bank" | "cash" | "group_payment" | "org_paid" | "";
  delegateType: "private" | "public" | "international" | "";
  bankCurrency?: "ZMW" | "USD";
  // Group payment fields
  groupSize?: number;
  groupPaymentAmount?: number;
  groupPaymentCurrency?: "ZMW" | "USD";
  organizationReference?: string;
}

interface PricingTier {
  type: "private" | "public" | "international";
  label: string;
  price: string;
  currency: string;
  description: string;
}

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

export function RegistrationDialog({ event, open, onOpenChange, onSuccess }: RegistrationDialogProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    country: '',
    organization: '',
    position: '',
    delegateType: 'private',
    paymentMethod: '',
    bankCurrency: 'ZMW',
    // Group payment defaults
    groupSize: 1,
    groupPaymentAmount: 0,
    groupPaymentCurrency: 'ZMW',
    organizationReference: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Simple country detection using browser timezone
  const getCountryFromTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Map common timezones to countries (focusing on African countries for this platform)
      const timezoneCountryMap: { [key: string]: string } = {
        'Africa/Lusaka': 'Zambia',
        'Africa/Harare': 'Zimbabwe', 
        'Africa/Johannesburg': 'South Africa',
        'Africa/Nairobi': 'Kenya',
        'Africa/Lagos': 'Nigeria',
        'Africa/Cairo': 'Egypt',
        'Africa/Casablanca': 'Morocco',
        'Africa/Algiers': 'Algeria',
        'Africa/Tunis': 'Tunisia',
        'Africa/Accra': 'Ghana',
        'Africa/Dar_es_Salaam': 'Tanzania',
        'Africa/Kampala': 'Uganda',
        'Africa/Kigali': 'Rwanda',
        'Africa/Maputo': 'Mozambique',
        'Africa/Windhoek': 'Namibia',
        'Africa/Gaborone': 'Botswana',
        'Africa/Maseru': 'Lesotho',
        'Africa/Mbabane': 'Eswatini',
        'Africa/Blantyre': 'Malawi',
        'Africa/Bujumbura': 'Burundi',
        'Africa/Khartoum': 'Sudan',
        'Africa/Addis_Ababa': 'Ethiopia',
        'Africa/Asmara': 'Eritrea',
        'Africa/Djibouti': 'Djibouti',
        'Africa/Mogadishu': 'Somalia',
        'Africa/Libreville': 'Gabon',
        'Africa/Malabo': 'Equatorial Guinea',
        'Africa/Bangui': 'Central African Republic',
        'Africa/Ndjamena': 'Chad',
        'Africa/Douala': 'Cameroon',
        'Africa/Porto-Novo': 'Benin',
        'Africa/Ouagadougou': 'Burkina Faso',
        'Africa/Abidjan': 'Ivory Coast',
        'Africa/Bamako': 'Mali',
        'Africa/Niamey': 'Niger',
        'Africa/Dakar': 'Senegal',
        'Africa/Conakry': 'Guinea',
        'Africa/Bissau': 'Guinea-Bissau',
        'Africa/Monrovia': 'Liberia',
        'Africa/Freetown': 'Sierra Leone',
        'Africa/Lome': 'Togo',
        'Africa/Kinshasa': 'Democratic Republic of Congo',
        'Africa/Brazzaville': 'Republic of Congo',
        'Africa/Luanda': 'Angola',
        'Africa/Sao_Tome': 'Sao Tome and Principe'
      };
      
      return timezoneCountryMap[timezone] || 'Zambia'; // Default to Zambia for this platform
    } catch (error) {
      console.error('Failed to get country from timezone:', error);
      return 'Zambia'; // Default fallback
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setSuccess(false);
      setEvidenceFile(null);
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        country: '',
        organization: '',
        position: '',
        delegateType: 'private',
        paymentMethod: '',
        bankCurrency: 'ZMW',
        // Group payment defaults
        groupSize: 1,
        groupPaymentAmount: 0,
        groupPaymentCurrency: 'ZMW',
        organizationReference: '',
      });
      
      // Auto-populate country from timezone
      const detectedCountry = getCountryFromTimezone();
      setFormData(prev => ({ ...prev, country: detectedCountry }));
    }
  }, [open, user]);

  // Remove the conflicting useEffect that sets default country
  // This was overriding the IP geolocation result

  const selectedPricing = pricingTiers.find(
    (tier) => tier.type === formData.delegateType
  );

  const updateField = (field: keyof FormDataType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const reset = () => {
    setCurrentStep(1);
    setSuccess(false);
    setEvidenceFile(null);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      country: '',
      organization: '',
      position: '',
      delegateType: 'private',
      paymentMethod: '',
      bankCurrency: 'ZMW',
      // Group payment defaults
      groupSize: 1,
      groupPaymentAmount: 0,
      groupPaymentCurrency: 'ZMW',
      organizationReference: '',
    });
  };

  const validateStep = (step: number) => {
    // Common validation for all steps
    if (!formData.country?.trim()) {
      return { 
        isValid: false, 
        message: 'Country is required',
        field: 'country'
      };
    }

    // Step-specific validation
    if (step === 1) {
      if (!formData.firstName?.trim()) {
        return { 
          isValid: false, 
          message: 'First name is required',
          field: 'firstName'
        };
      }
      if (!formData.lastName?.trim()) {
        return { 
          isValid: false, 
          message: 'Last name is required',
          field: 'lastName'
        };
      }
      if (!formData.email?.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        return { 
          isValid: false, 
          message: 'Valid email is required',
          field: 'email'
        };
      }
      if (!formData.phoneNumber?.trim()) {
        return { 
          isValid: false, 
          message: 'Phone number is required',
          field: 'phoneNumber'
        };
      }
    }
    
    if (step === 2) {
      if (!formData.organization?.trim()) {
        return { 
          isValid: false, 
          message: 'Organization is required',
          field: 'organization'
        };
      }
      if (!formData.position?.trim()) {
        return { 
          isValid: false, 
          message: 'Position is required',
          field: 'position'
        };
      }
    }
    
    if (step === 3) {
      if (!formData.paymentMethod) {
        return { 
          isValid: false, 
          message: 'Please select a payment method',
          field: 'paymentMethod'
        };
      }
      
      // Validation for group payment
      if (formData.paymentMethod === 'group_payment') {
        if (!formData.groupSize || formData.groupSize < 1) {
          return { 
            isValid: false, 
            message: 'Please specify the number of people you are registering for',
            field: 'groupSize'
          };
        }
        // For group payment, evidence is optional at registration - can be uploaded later
        // This allows organizations to register first, then handle payment separately
      }
      
      // Validation for organization already paid
      if (formData.paymentMethod === 'org_paid') {
        if (!formData.organizationReference?.trim()) {
          return { 
            isValid: false, 
            message: 'Please provide an organization reference to verify payment',
            field: 'organizationReference'
          };
        }
      }
      
      // If payment method is mobile or bank, require evidence
      if ((formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank') && !evidenceFile) {
        return { 
          isValid: false, 
          message: 'Please upload payment evidence',
          field: 'evidenceFile'
        };
      }
    }
    
    return { isValid: true };
  };

  const nextStep = () => {
    const { isValid, message } = validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else if (message) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: message,
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRegister = async () => {
    if (!user || !isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Create Account Required",
        description: "Please create an account to register for events.",
      });
      onOpenChange(false);
      window.location.href = "/register";
      return;
    }

    const { isValid, message } = validateStep(3);
    if (!isValid && message) {
      toast({
        title: "Validation Error",
        description: message,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let evidenceUrl = null;
      if (evidenceFile && (formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank' || formData.paymentMethod === 'group_payment')) {
        try {
          const fileName = `evidence_${Date.now()}_${evidenceFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${user.id}/${event.id}/${fileName}`;
          const { data, error } = await supabase.storage
            .from('payment-evidence')
            .upload(filePath, evidenceFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: evidenceFile.type || 'application/octet-stream',
            });
          
          if (error) throw error;
          
          evidenceUrl = filePath;
        } catch (error) {
          console.error('File upload error:', error);
          // For group payments, don't block registration if file upload fails
          if (formData.paymentMethod === 'group_payment') {
            toast({
              title: "File upload failed",
              description: "Registration will continue. You can upload payment evidence later from your dashboard.",
              variant: "default",
            });
          } else {
            toast({
              title: "File upload failed",
              description: "Failed to upload payment evidence. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Prepare registration payload
      const registrationPayload = {
        eventId: event.id,
        userId: user.id,
        country: formData.country.trim(),
        organization: formData.organization.trim(),
        position: formData.position.trim(),
        notes: formData.organizationReference ? `Organization Reference: ${formData.organizationReference}` : "",
        paymentMethod: formData.paymentMethod,
        delegateType: formData.delegateType,
        hasPaid: formData.paymentMethod === 'org_paid', // Mark as paid if organization already paid
        paymentEvidence: evidenceUrl,
        paymentStatus: formData.paymentMethod === 'org_paid' ? "paid" : "pending",
        // Group payment specific fields
        groupSize: formData.groupSize || 1,
        groupPaymentAmount: formData.groupPaymentAmount,
        groupPaymentCurrency: formData.groupPaymentCurrency,
      };

      console.log("Sending registration payload:", registrationPayload);

      const registration = await apiRequest("POST", "/api/events/register", registrationPayload);

      console.log("✅ Registration completed successfully");
      setRegistrationData(registration);
      setSuccess(true);

      // Invalidate relevant queries to refresh dashboard data
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user?.id, "registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/events"],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Registration error:", err);
      
      if (err.message?.includes("Already registered")) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event. Check your dashboard to view your registration details.",
          variant: "destructive",
        });
      } else if (err.message?.includes("Event is full")) {
        toast({
          title: "Event Full",
          description: "Sorry, this event is now full. Please check other available events.",
          variant: "destructive",
        });
      } else if (err.message?.includes("Storage bucket") || err.message?.includes("bucket")) {
        toast({
          title: "Registration Completed",
          description: "File upload system temporarily unavailable. You can upload payment evidence later from your dashboard.",
          variant: "default",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: err.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setEvidenceFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden bg-white border-0 shadow-2xl rounded-lg sm:rounded-xl flex flex-col p-0">
        {!success ? (
          <div className="flex flex-col h-full">
            <DialogHeader className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] to-[#2563eb]" />
              <div className="relative px-4 sm:px-6 py-4 sm:py-6 text-center text-white">
                <div className="w-12 h-12 mx-auto mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">APCB</span>
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">Event Registration</h2>
                <p className="text-white/90 text-sm font-medium">{event?.title}</p>
                <p className="text-white/70 text-xs mt-1">
                  {format(new Date(event.startDate), 'MMM d, yyyy')} • {event.location}
                </p>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0 bg-gray-50/50">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal Information</h3>
                    <p className="text-sm text-gray-600">Tell us about yourself</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className="w-full h-11 px-4 text-sm border border-[#87CEEB]/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50 bg-white"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className="w-full h-11 px-4 text-sm border border-[#87CEEB]/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50 bg-white"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Organization Information */}
              {currentStep === 2 && (
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <Label htmlFor="organization" className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => updateField('organization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Position/Title</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => updateField('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1 block">Delegate Type</Label>
                    <Select
                      value={formData.delegateType}
                      onValueChange={(value) => updateField('delegateType', value as any)}
                    >
                      <SelectTrigger className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50">
                        <SelectValue placeholder="Choose delegate type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingTiers.map((tier) => (
                          <SelectItem key={tier.type} value={tier.type}>
                            {tier.label} - {tier.currency} {tier.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-[#87CEEB]/10 to-blue-50 border border-[#87CEEB]/20 rounded-lg">
                    <h3 className="font-medium mb-2 text-sm text-[#1C356B]">Registration Fee</h3>
                    {selectedPricing && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{selectedPricing.label}</span>
                        <span className="font-bold text-sm text-[#1C356B] bg-white px-2 py-1 rounded shadow-sm">
                          {selectedPricing.currency} {selectedPricing.price}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {/* Individual Payment Options */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Individual Payment</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => updateField('paymentMethod', 'mobile')}
                            className={`relative px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                              formData.paymentMethod === 'mobile'
                                ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
                            }`}
                          >
                            Mobile Money
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField('paymentMethod', 'bank')}
                            className={`relative px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                              formData.paymentMethod === 'bank'
                                ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
                            }`}
                          >
                            Bank Transfer
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField('paymentMethod', 'cash')}
                            className={`relative px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                              formData.paymentMethod === 'cash'
                                ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
                            }`}
                          >
                            Cash at Event
                          </button>
                        </div>
                      </div>

                      {/* Group Payment Options */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Organization Payment</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => updateField('paymentMethod', 'group_payment')}
                            className={`relative px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                              formData.paymentMethod === 'group_payment'
                                ? 'bg-green-500 text-white border-green-500 shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700 hover:bg-green-50'
                            }`}
                          >
                            🏢 Group Payment
                            <div className="text-xs opacity-80 mt-0.5">Pay for multiple people</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateField('paymentMethod', 'org_paid')}
                            className={`relative px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                              formData.paymentMethod === 'org_paid'
                                ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            ✅ Already Paid
                            <div className="text-xs opacity-80 mt-0.5">My organization paid</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Payment Configuration */}
                  {formData.paymentMethod === 'group_payment' && (
                    <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-xs text-green-800 mb-2 flex items-center gap-1">
                        🏢 Group Payment Setup
                      </h4>
                      
                      <div className="space-y-2">
                        {/* Group Size & Total in one row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs font-medium text-green-700 mb-1 block">
                              Group Size
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={formData.groupSize || 1}
                              onChange={(e) => {
                                const size = parseInt(e.target.value) || 1;
                                const amount = selectedPricing ? parseFloat(selectedPricing.price.replace(',', '')) * size : 0;
                                updateField('groupSize', size);
                                updateField('groupPaymentAmount', amount);
                                updateField('groupPaymentCurrency', selectedPricing?.currency === 'USD' ? 'USD' : 'ZMW');
                              }}
                              className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:ring-1 focus:ring-green-500"
                              placeholder="# people"
                            />
                          </div>

                          {/* Calculated Total */}
                          {formData.groupSize && selectedPricing && (
                            <div>
                              <Label className="text-xs font-medium text-green-700 mb-1 block">Total Amount</Label>
                              <div className="px-2 py-1 bg-white border border-green-200 rounded text-xs">
                                <div className="font-bold text-green-800">
                                  {selectedPricing.currency} {(parseFloat(selectedPricing.price.replace(',', '')) * (formData.groupSize || 1)).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Organization Reference */}
                        <div>
                          <Label className="text-xs font-medium text-green-700 mb-1 block">
                            Reference (Optional)
                          </Label>
                          <Input
                            value={formData.organizationReference || ''}
                            onChange={(e) => updateField('organizationReference', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:ring-1 focus:ring-green-500"
                            placeholder="PO #, Department, etc."
                          />
                        </div>

                        {/* Compact Instructions */}
                        <div className="p-1.5 bg-green-100 border border-green-300 rounded text-xs text-green-800">
                          <strong>Next Steps:</strong> Complete registration → Make payment → Upload evidence from dashboard → Share with team
                        </div>
                        
                        {/* Optional Evidence Note */}
                        <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          💡 <strong>Payment Evidence:</strong> You can upload payment proof now or later from your dashboard after making the payment.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Organization Already Paid */}
                  {formData.paymentMethod === 'org_paid' && (
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-xs text-blue-800 mb-2 flex items-center gap-1">
                        ✅ Organization Already Paid
                      </h4>
                      
                      <div className="space-y-2">
                        {/* Organization Reference */}
                        <div>
                          <Label className="text-xs font-medium text-blue-700 mb-1 block">
                            Organization Reference (Required)
                          </Label>
                          <Input
                            value={formData.organizationReference || ''}
                            onChange={(e) => updateField('organizationReference', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Coordinator name, PO number, etc."
                            required
                          />
                        </div>

                        {/* Compact Confirmation Notice */}
                        <div className="p-1.5 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
                          <strong>Note:</strong> Confirming your organization already paid. Finance team will verify.
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'mobile' && (
                    <div className="p-2 bg-gradient-to-r from-[#87CEEB]/10 to-blue-50 border border-[#87CEEB]/30 rounded-lg shadow-sm">
                      <h4 className="font-medium text-xs text-[#1C356B] mb-2">Mobile Money Payment</h4>
                      <div className="space-y-1">
                       
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-[#87CEEB]/20 shadow-sm">
                          <span className="text-xs font-medium text-[#1C356B]">Airtel - Chipo Buumba</span>
                          <Button variant="ghost" size="sm" className="gap-1 h-6 px-2 hover:bg-[#87CEEB]/10">
                            <span className="text-xs font-mono">0773 484 004
                            </span>
                            <Copy className="h-3 w-3 text-[#1C356B]" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-[#87CEEB]/20 shadow-sm">
                          <span className="text-xs font-medium text-[#1C356B]">MTN - Chipo Buumba</span>
                          <Button variant="ghost" size="sm" className="gap-1 h-6 px-2 hover:bg-[#87CEEB]/10">
                            <span className="text-xs font-mono">096 4024532
                            </span>
                            <Copy className="h-3 w-3 text-[#1C356B]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'bank' && (
                    <div className="p-2 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-lg">
                      <h4 className="font-medium text-xs text-[#1C356B] mb-2">Bank Transfer</h4>
                      
                      {/* Currency Selection */}
                      <div className="mb-2">
                        <Select
                          value={formData.bankCurrency || ''}
                          onValueChange={(value) => updateField('bankCurrency', value)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Choose currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ZMW">Kwacha (K)</SelectItem>
                            <SelectItem value="USD">Dollar ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ultra Compact Account Details - Always show with default ZMK */}
                      <div className="space-y-1">
                        {/* Ultra-Compact Bank Card */}
                        <div className="bg-white rounded border border-gray-200 p-1.5">
                          <div className="text-xs">
                            <div className="font-semibold text-center text-[#1C356B] mb-1">
                              {formData.bankCurrency === 'ZMW' ? 'SME Account (ZMW)' : 'Call Global Account (USD)'}
                            </div>
                            
                            {/* Bank Info with Labels */}
                            <div className="text-center text-gray-600 mb-1 space-y-0.5">
                              <div>Bank: FNB Makeni Junction</div>
                              <div>Sort Code: 260016 | Swift: FIRNZMLX</div>
                            </div>
                            
                            {/* Account Details */}
                            <div className="text-center mb-1">
                              <div className="text-xs text-gray-500 mb-0.5">Account Name:</div>
                              <div className="text-xs font-medium text-gray-700">Alliance Procurement & Capacity Building Foundation</div>
                            </div>
                            
                            {/* Account Number with Copy */}
                            <div className="text-center mb-1">
                              <div className="text-xs text-gray-500 mb-0.5">Account Number:</div>
                              <div className="flex items-center justify-center bg-[#87CEEB]/8 p-1 rounded">
                                <span className="font-mono text-xs font-bold text-[#1C356B] mr-1">
                                  {formData.bankCurrency === 'ZMW' ? '63136716785' : '63136717006'}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-3 w-3 p-0 hover:bg-[#87CEEB]/20"
                                  onClick={() => navigator.clipboard.writeText(formData.bankCurrency === 'ZMW' ? '63136716785' : '63136717006')}
                                >
                                  <Copy className="h-2 w-2 text-[#1C356B]" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Minimal Note */}
                        <div className="bg-[#87CEEB]/10 rounded px-2 py-0.5">
                          <p className="text-xs text-[#1C356B] text-center">
                            💡 Add your name + event title to payment reference
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'cash' && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="font-bold text-green-800 mb-2">Cash Payment</h4>
                        <p className="text-sm text-green-700 mb-3">
                          You have selected to pay with cash at the event venue.
                        </p>
                        <div className="bg-white rounded-lg border border-green-200 p-3">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            📍 Important Instructions:
                          </p>
                          <ul className="text-xs text-green-700 space-y-1 text-left">
                            <li>• Please arrive 30 minutes early for registration</li>
                            <li>• Bring exact change if possible</li>
                            <li>• Payment will be collected at the registration desk</li>
                            <li>• Official receipt will be provided upon payment</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {(formData.paymentMethod === 'mobile' || (formData.paymentMethod === 'bank' && formData.bankCurrency) || formData.paymentMethod === 'group_payment') && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {formData.paymentMethod === 'group_payment' ? 'Group Payment Evidence (Optional)' : 'Proof of Payment'}
                        </Label>
                        {evidenceFile && (
                          <button
                            type="button"
                            onClick={() => setEvidenceFile(null)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {!evidenceFile ? (
                        <div className="mt-1 flex justify-center px-2 pt-2 pb-2 border-2 border-dashed border-[#87CEEB]/40 rounded-lg bg-[#87CEEB]/5 hover:bg-[#87CEEB]/10 transition-colors">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-5 w-5 text-[#87CEEB]" />
                            <div className="text-xs text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded font-medium text-[#1C356B] hover:text-[#87CEEB] focus-within:outline-none">
                                <span>Upload file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={handleFileChange}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-[#1C356B]/70">
                              JPG, PNG, PDF (5MB max)
                            </p>
                            {formData.paymentMethod === 'group_payment' && (
                              <p className="text-xs text-green-600 font-medium">
                                Optional: Upload now or later from dashboard
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 p-2 border border-[#87CEEB]/20 rounded-lg bg-gradient-to-r from-[#87CEEB]/5 to-blue-50 shadow-sm">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-[#1C356B]" />
                            <div className="ml-2 flex-1">
                              <p className="text-xs font-medium text-[#1C356B] truncate">
                                {evidenceFile.name}
                              </p>
                              <p className="text-xs text-[#1C356B]/70">
                                {formatFileSize(evidenceFile.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEvidenceFile(null)}
                              className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Back
                </Button>
                {currentStep < 3 ? (
                  <Button 
                    onClick={nextStep}
                    className="bg-[#87CEEB] hover:bg-[#1C356B] text-white border-2 border-[#87CEEB] hover:border-[#1C356B] shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold border border-sky-300 hover:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">🎉 Registration Successful!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for registering. We've sent a confirmation email with event details.
            </p>
            
            {/* Registration Number Display */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-2xl">🎫</span>
                  <h4 className="text-xl font-bold text-amber-800">Your Registration Number</h4>
                </div>
                
                <div className="bg-white rounded-lg border-2 border-amber-200 p-4 mb-4">
                  <div className="text-4xl font-mono font-black text-gray-900 tracking-wider">
                    {registrationData?.registrationNumber || 'Loading...'}
                  </div>
                </div>
                
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold text-red-800 text-lg">IMPORTANT - KEEP THIS SAFE!</span>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>• <strong>Write down</strong> or <strong>screenshot</strong> this registration number</p>
                    <p>• You'll need it for event check-in and payment verification</p>
                    <p>• This number is also in your confirmation email</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 justify-center">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Check your dashboard to track your registration status
                  </span>
                </div>
              </div>
              <Button
                type="button"
                onClick={close}
                className="w-full sm:w-auto bg-[#87CEEB] hover:bg-[#1C356B] text-black font-bold border-2 border-[#87CEEB] hover:border-[#1C356B] shadow-lg hover:shadow-xl transition-all duration-200"
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
