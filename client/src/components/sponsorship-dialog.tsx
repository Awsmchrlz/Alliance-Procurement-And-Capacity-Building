import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { CheckCircle, Crown, Award, Medal, Star, Upload, Copy, Globe, MapPin } from 'lucide-react';
import { Event } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Textarea } from './ui/textarea';
import { supabase } from '@/lib/supabase';
import { useGeolocation, getPreferredCurrency } from '@/hooks/use-geolocation';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SponsorshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSuccess?: () => void;
}

interface SponsorshipLevel {
  id: 'platinum' | 'gold' | 'silver' | 'bronze';
  name: string;
  priceUSD: number;
  priceZMW: number;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
}

interface FormDataType {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  website: string;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze' | '';
  paymentMethod: 'mobile' | 'bank' | 'cash' | '';
  paymentCurrency: 'USD' | 'ZMW';
  additionalInfo: string;
}

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const SPONSORSHIP_LEVELS: SponsorshipLevel[] = [
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    priceUSD: 15000,
    priceZMW: 300000,
    icon: <Crown className="w-5 h-5" />,
    color: 'from-slate-300 via-slate-400 to-slate-500',
    benefits: [
      'Prime logo placement on all conference materials and media',
      'Speaking slot (15 minutes) at the Opening Ceremony',
      'Branded keynote session (optional co-hosting)',
      'Booth in prime location at exhibition space',
      'Branding on conference bags, lanyards, and banners',
      '10 complimentary full conference passes',
      'Company promotional materials in all delegate packs',
      'One exclusive sponsored side event',
      'Recognition in all press releases, newsletters, and social media',
      'Meet-and-greet with the Guest of honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    priceUSD: 13000,
    priceZMW: 250000,
    icon: <Award className="w-5 h-5" />,
    color: 'from-yellow-400 via-yellow-500 to-yellow-600',
    benefits: [
      'Featured logo on banners, Facebook, and social media',
      '10-minute speaking slot in plenary session',
      'Booth at exhibition space',
      'Branding during one key session',
      '6 complimentary full conference passes',
      'Company materials in delegate packs',
      'Social media mentions and interview opportunities',
      'Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    priceUSD: 11000,
    priceZMW: 200000,
    icon: <Medal className="w-5 h-5" />,
    color: 'from-gray-300 via-gray-400 to-gray-500',
    benefits: [
      'Logo placement on Facebook, and printed programs',
      'Exhibition booth',
      '4 complimentary passes',
      'Opportunity to host a breakout session or technical workshop',
      'Inclusion in media and social media coverage',
      'Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'bronze',
    name: 'Bronze Sponsor',
    priceUSD: 9000,
    priceZMW: 150000,
    icon: <Star className="w-5 h-5" />,
    color: 'from-amber-600 via-amber-700 to-amber-800',
    benefits: [
      'Logo on Facebook page and printed program',
      '2 complimentary passes',
      'Shared booth space',
      'Company literature in delegate packs'
    ]
  }
];

const INITIAL_FORM_DATA: FormDataType = {
  companyName: '',
  contactPerson: '',
  email: '',
  phoneNumber: '',
  website: '',
  sponsorshipLevel: '',
  paymentMethod: '',
  paymentCurrency: 'USD',
  additionalInfo: '',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SponsorshipDialog({ event, open, onOpenChange, onSuccess }: SponsorshipDialogProps) {
  // State Management
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(INITIAL_FORM_DATA);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [expandedBenefits, setExpandedBenefits] = useState<{ [key: string]: boolean }>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get user's location for automatic currency detection
  const locationData = useGeolocation();

  // Computed Values
  const selectedLevel = SPONSORSHIP_LEVELS.find(level => level.id === formData.sponsorshipLevel);

  // Automatically set currency based on location
  useEffect(() => {
    if (!locationData.isLoading && !locationData.error) {
      const preferredCurrency = getPreferredCurrency(locationData.isZambia);
      setFormData(prev => ({ ...prev, paymentCurrency: preferredCurrency }));
      
      console.log('🌍 Auto-detected currency for sponsorship:', {
        country: locationData.country,
        isZambia: locationData.isZambia,
        currency: preferredCurrency
      });
    }
  }, [locationData.isLoading, locationData.error, locationData.isZambia]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetForm = () => {
    setCurrentStep(1);
    setSuccess(false);
    setFormData(INITIAL_FORM_DATA);
    setEvidenceFile(null);
    setExpandedBenefits({});
  };

  const updateField = (field: keyof FormDataType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'paymentMethod') {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 50);
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

  const toggleBenefitsExpansion = (levelId: string) => {
    setExpandedBenefits(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.companyName.trim()) return { isValid: false, message: 'Company name is required' };
      if (!formData.contactPerson.trim()) return { isValid: false, message: 'Contact person is required' };
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return { isValid: false, message: 'Valid email is required' };
      if (!formData.phoneNumber.trim()) return { isValid: false, message: 'Phone number is required' };
    }

    if (step === 2) {
      if (!formData.sponsorshipLevel) return { isValid: false, message: 'Please select a sponsorship level' };
    }

    if (step === 3) {
      if (!formData.paymentMethod) return { isValid: false, message: 'Please select a payment method' };

      // If payment method is mobile or bank, require evidence
      if ((formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank') && !evidenceFile) {
        return { isValid: false, message: 'Please upload payment evidence' };
      }
    }

    return { isValid: true };
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNext = () => {
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

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
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

      // Upload payment evidence if provided
      if (evidenceFile && (formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank')) {
        try {
          const fileName = `sponsorship_evidence_${Date.now()}_${evidenceFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `sponsorships/${event.id}/${fileName}`;
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
          toast({
            title: "File upload failed",
            description: "Registration will continue. You can upload payment evidence later.",
            variant: "default",
          });
        }
      }

      const sponsorshipData = {
        eventId: event.id,
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        website: formData.website.trim() || null,
        sponsorshipLevel: formData.sponsorshipLevel,
        amount: formData.paymentCurrency === 'ZMW' ? (selectedLevel?.priceZMW || 0) : (selectedLevel?.priceUSD || 0),
        currency: formData.paymentCurrency,
        paymentMethod: formData.paymentMethod,
        paymentEvidence: evidenceUrl,
        notes: formData.additionalInfo.trim() || null,
      };

      await apiRequest("POST", "/api/sponsorships/register", sponsorshipData);

      setSuccess(true);
      toast({
        title: "Sponsorship Application Submitted!",
        description: "We'll review your application and contact you within 2 business days.",
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit sponsorship application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSuccessScreen = () => (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[400px]">
      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted Successfully!</h3>
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        Thank you for your interest in sponsoring <span className="font-semibold text-[#1C356B]">{event.title}</span>.
        Our team will review your application and contact you within 2 business days.
      </p>
      <Button
        onClick={handleClose}
        className="bg-gradient-to-r from-[#1C356B] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1C356B] text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center space-x-2">
          <span>Close</span>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm">✓</span>
          </div>
        </div>
      </Button>
    </div>
  );

  const renderHeader = () => (
    <DialogHeader className="relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] to-[#2563eb]" />
      <div className="relative px-6 py-6 text-center text-white">
        <div className="w-12 h-12 mx-auto mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
          <Crown className="w-full h-full text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">Become a Sponsor</h2>
        <p className="text-white/90 text-sm font-medium">{event?.title}</p>
        <p className="text-white/70 text-xs mt-1">
          {format(new Date(event.startDate), 'MMM d, yyyy')} • {event.location}
        </p>
      </div>
    </DialogHeader>
  );

  const renderStepIndicator = () => (
    <div className="flex space-x-1">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${step <= currentStep ? 'bg-[#1C356B]' : 'bg-gray-300'
            }`}
        />
      ))}
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {currentStep > 1 && (
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-12 sm:h-11 px-6 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Previous
        </Button>
      )}

      {currentStep < 3 ? (
        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-[#1C356B] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1C356B] text-white h-12 sm:h-11 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Next Step
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#1C356B] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1C356B] disabled:from-gray-400 disabled:to-gray-500 text-white h-12 sm:h-11 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Submitting Application...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Submit Sponsorship Application</span>
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>
          )}
        </Button>
      )}
    </div>
  );

  // ============================================================================
  // STEP COMPONENTS
  // ============================================================================

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Company Information</h3>
        <p className="text-sm text-gray-600">Tell us about your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
            placeholder="Your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">Contact Person *</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
            placeholder="Primary contact name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
            placeholder="contact@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
            placeholder="+260 977 123 456"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium text-gray-700">Company Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200 hover:border-[#87CEEB]/50"
          placeholder="https://www.company.com"
        />
      </div>

    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose Your Sponsorship Level</h3>
        <p className="text-sm text-gray-600">Select the package that best fits your marketing goals</p>
      </div>

      {/* Currency Toggle with Location Detection */}
      <div className="flex flex-col items-center justify-center mb-6">
        {/* Location Detection Status */}
        {locationData.isLoading ? (
          <div className="mb-3 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 border-2 border-primary-yellow border-t-transparent rounded-full animate-spin"></div>
              Detecting location...
            </div>
          </div>
        ) : (
          <div className="mb-3 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3 text-primary-yellow" />
              {locationData.error ? (
                <span>Location unknown</span>
              ) : (
                <span>
                  <strong>{locationData.country}</strong>
                  {locationData.isZambia && <span className="text-primary-yellow ml-1">🇿🇲</span>}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Currency Toggle */}
        <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => updateField('paymentCurrency', 'ZMW')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                formData.paymentCurrency === 'ZMW'
                  ? 'bg-primary-yellow text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-blue'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Local (ZMW)
              {locationData.isZambia && !locationData.isLoading && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                  Auto
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => updateField('paymentCurrency', 'USD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                formData.paymentCurrency === 'USD'
                  ? 'bg-primary-yellow text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-blue'
              }`}
            >
              <Globe className="w-4 h-4" />
              International (USD)
              {!locationData.isZambia && !locationData.isLoading && !locationData.error && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-1">
                  Auto
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SPONSORSHIP_LEVELS.map((level) => (
          <div
            key={level.id}
            onClick={() => updateField('sponsorshipLevel', level.id)}
            className={`relative p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 touch-manipulation transform hover:scale-[1.02] active:scale-[0.98] ${formData.sponsorshipLevel === level.id
              ? 'border-[#1C356B] bg-gradient-to-br from-[#1C356B]/5 to-[#2563eb]/5 shadow-xl ring-2 ring-[#1C356B]/20'
              : 'border-gray-200 hover:border-[#87CEEB] hover:shadow-lg hover:bg-gradient-to-br hover:from-[#87CEEB]/5 hover:to-blue-50 active:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${level.color} text-white`}>
                  {level.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{level.name}</h4>
                  <p className="text-2xl font-bold text-[#1C356B]">
                    {formData.paymentCurrency === 'ZMW' 
                      ? `ZMW ${level.priceZMW.toLocaleString()}` 
                      : `USD ${level.priceUSD.toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
              {formData.sponsorshipLevel === level.id && (
                <CheckCircle className="w-6 h-6 text-[#1C356B]" />
              )}
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 text-sm">Benefits Include:</h5>
              <ul className="space-y-1">
                {(expandedBenefits[level.id] ? level.benefits : level.benefits.slice(0, 4)).map((benefit, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="w-1 h-1 bg-[#87CEEB] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
                {level.benefits.length > 4 && (
                  <li className="text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBenefitsExpansion(level.id);
                      }}
                      className="text-[#1C356B] font-medium hover:text-[#2563eb] transition-colors duration-200 flex items-center gap-1"
                    >
                      {expandedBenefits[level.id] ? (
                        <>
                          <span>Show less</span>
                          <span className="text-xs">▲</span>
                        </>
                      ) : (
                        <>
                          <span>+{level.benefits.length - 4} more benefits</span>
                          <span className="text-xs">▼</span>
                        </>
                      )}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedLevel && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gradient-to-r from-[#87CEEB]/10 to-blue-50 border border-[#87CEEB]/20 rounded-lg">
            <h4 className="font-semibold text-[#1C356B] mb-2">Complete Benefits Package</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedLevel.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Ready to Submit</h4>
            <p className="text-sm text-green-700">
              You've selected the <strong>{selectedLevel.name}</strong> package for <strong>
              {formData.paymentCurrency === 'ZMW' 
                ? `ZMW ${selectedLevel.priceZMW.toLocaleString()}` 
                : `USD ${selectedLevel.priceUSD.toLocaleString()}`
              }</strong>.
              Click "Submit Application" to send your sponsorship request to our team.
            </p>
          </div>
        </div>
      )}
    </div>
  );



  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Information</h3>
        <p className="text-sm text-gray-600">Choose your payment method and complete your sponsorship</p>
      </div>

      {selectedLevel && (
        <div className="p-4 bg-gradient-to-r from-[#87CEEB]/10 to-blue-50 border border-[#87CEEB]/20 rounded-lg mb-6">
          <h3 className="font-medium mb-2 text-sm text-[#1C356B]">Sponsorship Investment</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{selectedLevel.name}</span>
            <span className="font-bold text-lg text-[#1C356B] bg-white px-3 py-1 rounded shadow-sm">
              {formData.paymentCurrency === 'ZMW' 
                ? `ZMW ${selectedLevel.priceZMW.toLocaleString()}` 
                : `USD ${selectedLevel.priceUSD.toLocaleString()}`
              }
            </span>
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Payment Method</Label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'mobile')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${formData.paymentMethod === 'mobile'
              ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
              }`}
          >
            📱 Mobile Money Payment
          </button>
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'bank')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${formData.paymentMethod === 'bank'
              ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
              }`}
          >
            🏦 Bank Transfer
          </button>
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'cash')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${formData.paymentMethod === 'cash'
              ? 'bg-[#87CEEB] text-white border-[#87CEEB] shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#87CEEB] hover:text-[#1C356B] hover:bg-[#87CEEB]/5'
              }`}
          >
            💵 Cash Payment at Event
          </button>
        </div>
      </div>

      {/* Mobile Money Payment Details */}
      {formData.paymentMethod === 'mobile' && (
        <div className="p-4 bg-gradient-to-r from-[#87CEEB]/10 to-blue-50 border border-[#87CEEB]/30 rounded-lg shadow-sm">
          <h4 className="font-medium text-sm text-[#1C356B] mb-3">Mobile Money Payment Details</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-[#87CEEB]/20 shadow-sm">
              <span className="text-sm font-medium text-[#1C356B]">Airtel - Chipo Buumba</span>
              <div className="text-sm font-mono text-gray-600">0773 484 004</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-[#87CEEB]/20 shadow-sm">
              <span className="text-sm font-medium text-[#1C356B]">MTN - Chipo Buumba</span>
              <div className="text-sm font-mono text-gray-600">096 4024532</div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {formData.paymentMethod === 'bank' && (
        <div className="p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-lg">
          <h4 className="font-medium text-sm text-[#1C356B] mb-3">Bank Transfer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USD Account */}
            <div className="bg-white p-4 rounded-lg border border-[#87CEEB]/20 shadow-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-500 mb-1">Call (Global) Account Dollar (USD)</div>
                <div className="flex items-center justify-center bg-[#87CEEB]/8 p-2 rounded">
                  <span className="text-sm font-mono font-bold text-[#1C356B]">63136717006</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="font-medium">Bank:</span> FNB</div>
                <div><span className="font-medium">Branch:</span> Makeni Junction</div>
                <div><span className="font-medium">Swift:</span> FIRNZMLX</div>
                <div><span className="font-medium">Sort Code:</span> 260016</div>
                <div><span className="font-medium">Name:</span> Alliance Procurement and Capacity Building Foundation</div>
              </div>
            </div>

            {/* ZMW Account */}
            <div className="bg-white p-4 rounded-lg border border-[#87CEEB]/20 shadow-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-500 mb-1">SME Account Kwacha (ZMW)</div>
                <div className="flex items-center justify-center bg-[#87CEEB]/8 p-2 rounded">
                  <span className="text-sm font-mono font-bold text-[#1C356B]">63136716785</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="font-medium">Bank:</span> FNB</div>
                <div><span className="font-medium">Branch:</span> Makeni Junction</div>
                <div><span className="font-medium">Swift:</span> FIRNZMLX</div>
                <div><span className="font-medium">Sort Code:</span> 260016</div>
                <div><span className="font-medium">Name:</span> Alliance Procurement and Capacity Building Foundation</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Info */}
      {formData.paymentMethod === 'cash' && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-sm text-green-800 mb-2">Cash Payment</h4>
          <p className="text-sm text-green-700">
            You can pay in cash at the event registration desk. Please bring the exact amount or be prepared for change.
          </p>
        </div>
      )}

      {/* Additional Requirements Section */}
      <div className="space-y-2">
        <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
          Additional Information <span className="text-gray-400">(Optional)</span>
        </Label>
        <Textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all duration-200"
          placeholder="Any special requirements, marketing materials, booth needs, or other requests..."
          rows={4}
        />
      </div>

      {/* Payment Evidence Upload */}
      {(formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank') && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Payment Evidence <span className="text-red-500">*</span>
          </Label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
            evidenceFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-[#87CEEB]/30 hover:border-[#87CEEB]/50 hover:bg-[#87CEEB]/5'
          }`}>
            <input
              type="file"
              id="sponsorshipEvidenceUpload"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="sponsorshipEvidenceUpload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  evidenceFile ? 'bg-green-100' : 'bg-[#87CEEB]/10'
                }`}>
                  {evidenceFile ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#87CEEB]" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {evidenceFile ? 'File uploaded successfully!' : 'Upload Payment Receipt'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {evidenceFile ? 'Click to change file' : 'PNG, JPG or PDF (max 5MB)'}
                  </div>
                </div>
              </div>
            </label>
          </div>

          {evidenceFile && (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-800">{evidenceFile.name}</div>
                  <div className="text-xs text-green-600">{formatFileSize(evidenceFile.size)}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceFile(null)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-blue-700">
                <strong>Important:</strong> Please upload your payment receipt or screenshot after making the payment. 
                This helps us verify and process your sponsorship application quickly. Accepted formats: PNG, JPG, PDF.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl h-[95vh] sm:max-h-[90vh] bg-white border-0 shadow-2xl rounded-lg sm:rounded-xl flex flex-col p-0 overflow-hidden">
        {success ? (
          renderSuccessScreen()
        ) : (
          <div className="flex flex-col h-full">
            {renderHeader()}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
              <div className="flex items-center justify-between">
                {renderStepIndicator()}
                {renderNavigationButtons()}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}