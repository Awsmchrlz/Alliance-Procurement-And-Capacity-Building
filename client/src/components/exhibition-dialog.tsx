import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { CheckCircle, Store, Zap, Wifi, Upload } from 'lucide-react';
import { Event } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ExhibitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSuccess?: () => void;
}

interface FormDataType {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  website: string;
  productsServices: string;
  additionalInfo: string;
  paymentMethod: 'mobile' | 'bank' | 'cash' | '';
}

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const EXHIBITION_PACKAGE = {
  name: 'Exhibition Package',
  price: 7000,
  currency: 'USD',
  benefits: [
    'Professional exhibition booth space',
    '1 complimentary conference pass',
    'Logo placement in conference program',
    'Logo on exhibitor page online',
    'Networking opportunities with delegates',
    'Product/service showcase platform'
  ]
};

const INITIAL_FORM_DATA: FormDataType = {
  companyName: '',
  contactPerson: '',
  email: '',
  phoneNumber: '',
  website: '',
  productsServices: '',
  additionalInfo: '',
  paymentMethod: '',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExhibitionDialog({ event, open, onOpenChange, onSuccess }: ExhibitionDialogProps) {
  // State Management
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(INITIAL_FORM_DATA);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetForm = () => {
    setCurrentStep(1);
    setSuccess(false);
    setFormData(INITIAL_FORM_DATA);
    setEvidenceFile(null);
  };

  const updateField = (field: keyof FormDataType, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'paymentMethod') {
      // Allow UI to expand first, then scroll
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
      toast({
        title: "File selected",
        description: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        variant: "default",
      });
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.companyName.trim()) return { isValid: false, message: 'Company name is required' };
      if (!formData.contactPerson.trim()) return { isValid: false, message: 'Contact person is required' };
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return { isValid: false, message: 'Valid email is required' };
      if (!formData.phoneNumber.trim()) return { isValid: false, message: 'Phone number is required' };
      if (!formData.productsServices.trim()) return { isValid: false, message: 'Products/Services description is required' };
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
      
      if (evidenceFile && (formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank')) {
        try {
          const fileName = `exhibition_evidence_${Date.now()}_${evidenceFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `exhibitions/${event.id}/${fileName}`;
          
          const bucketName = "registrations"; // Private bucket for payment evidence
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, evidenceFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: evidenceFile.type || 'application/octet-stream',
            });
          
          if (error) {
            throw error;
          }
          
          evidenceUrl = filePath;
          toast({
            title: "Evidence uploaded",
            description: "Payment evidence uploaded successfully!",
            variant: "default",
          });
        } catch (error) {
          console.error('File upload error:', error);
          toast({
            title: "File upload failed",
            description: "Registration will continue. You can upload payment evidence later.",
            variant: "destructive",
          });
        }
      }

      const exhibitionData = {
        eventId: event.id,
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        website: formData.website.trim() || null,
        boothSize: 'standard',
        amount: EXHIBITION_PACKAGE.price,
        currency: 'USD',
        paymentMethod: formData.paymentMethod,
        paymentEvidence: evidenceUrl,
        productsServices: formData.productsServices.trim() || null,
        notes: formData.additionalInfo.trim() || null,
      };

      await apiRequest("POST", "/api/exhibitions/register", exhibitionData);

      setSuccess(true);
      toast({
        title: "Exhibition Application Submitted!",
        description: "We'll review your application and contact you within 2 business days.",
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit exhibition application. Please try again.",
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
        Thank you for your interest in exhibiting at <span className="font-semibold text-red-600">{event.title}</span>.
        Our team will review your application and contact you within 2 business days.
      </p>
      <Button
        onClick={handleClose}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg transform hover:scale-[1.02] active:scale-[0.98]"
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
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700" />
      <div className="relative px-6 py-6 text-center text-white">
        <div className="w-12 h-12 mx-auto mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
          <Store className="w-full h-full text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">Become an Exhibitor</h2>
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
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${step <= currentStep ? 'bg-red-600' : 'bg-gray-300'
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
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-12 sm:h-11 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Next Step
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white h-12 sm:h-11 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Submitting Application...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Submit Exhibition Application</span>
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
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            placeholder="Your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">Contact Person *</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
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
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            placeholder="contact@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            placeholder="+260 977 123 456"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          className="w-full h-12 sm:h-11 px-4 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
          placeholder="https://www.company.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productsServices" className="text-sm font-medium text-gray-700">Products/Services *</Label>
        <Textarea
          id="productsServices"
          value={formData.productsServices}
          onChange={(e) => updateField('productsServices', e.target.value)}
          className="w-full px-4 py-3 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
          placeholder="Describe the products or services you'll be showcasing"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          className="w-full px-4 py-3 text-base sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
          placeholder="Any special booth requirements, electrical needs, internet requirements, or other notes..."
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Include any booth requirements, electrical needs, internet requirements, or other special requests
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exhibition Package</h3>
        <p className="text-sm text-gray-600">Professional exhibition space for your business</p>
      </div>

      <div className="p-4 sm:p-6 border-2 border-red-200 bg-red-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{EXHIBITION_PACKAGE.name}</h4>
              <p className="text-2xl font-bold text-red-600">
                ${EXHIBITION_PACKAGE.price.toLocaleString()} {EXHIBITION_PACKAGE.currency}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-medium text-gray-700 text-sm">Package Includes:</h5>
          <div className="space-y-2">
            {EXHIBITION_PACKAGE.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Ready to Submit</h4>
        <p className="text-sm text-green-700">
          You've selected the <strong>{EXHIBITION_PACKAGE.name}</strong> for <strong>${EXHIBITION_PACKAGE.price.toLocaleString()} USD</strong>. 
          Click "Next Step" to proceed with payment information.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Information</h3>
        <p className="text-sm text-gray-600">Choose your payment method and complete your exhibition booking</p>
      </div>

      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg mb-6">
        <h3 className="font-medium mb-2 text-sm text-red-800">Exhibition Investment</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">{EXHIBITION_PACKAGE.name}</span>
          <span className="font-bold text-lg text-red-700 bg-white px-3 py-1 rounded shadow-sm">
            ${EXHIBITION_PACKAGE.price.toLocaleString()} USD
          </span>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Payment Method</Label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'mobile')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
              formData.paymentMethod === 'mobile'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            📱 Mobile Money Payment
          </button>
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'bank')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
              formData.paymentMethod === 'bank'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            🏦 Bank Transfer
          </button>
          <button
            type="button"
            onClick={() => updateField('paymentMethod', 'cash')}
            className={`relative px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
              formData.paymentMethod === 'cash'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            💵 Cash Payment at Event
          </button>
        </div>
      </div>

      {/* Mobile Money Payment Details */}
      {formData.paymentMethod === 'mobile' && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-lg shadow-sm">
          <h4 className="font-medium text-sm text-red-800 mb-3">Mobile Money Payment Details</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200 shadow-sm">
              <span className="text-sm font-medium text-red-700">Airtel - Chipo Buumba</span>
              <div className="text-sm font-mono text-gray-600">0773 484 004</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200 shadow-sm">
              <span className="text-sm font-medium text-red-700">MTN - Chipo Buumba</span>
              <div className="text-sm font-mono text-gray-600">096 4024532</div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {formData.paymentMethod === 'bank' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-sm text-red-800 mb-3">Bank Transfer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USD Account */}
            <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-500 mb-1">Call (Global) Account Dollar (USD)</div>
                <div className="flex items-center justify-center bg-red-100 p-2 rounded">
                  <span className="text-sm font-mono font-bold text-red-800">63136717006</span>
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
            <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
              <div className="text-center mb-3">
                <div className="text-sm text-gray-500 mb-1">SME Account Kwacha (ZMW)</div>
                <div className="flex items-center justify-center bg-red-100 p-2 rounded">
                  <span className="text-sm font-mono font-bold text-red-800">63136716785</span>
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

      {/* Payment Evidence Upload */}
      {(formData.paymentMethod === 'mobile' || formData.paymentMethod === 'bank') && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Payment Evidence</Label>
          <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
            <input
              type="file"
              id="exhibitionEvidenceUpload"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="exhibitionEvidenceUpload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-red-700">Click to upload</span> payment receipt
                </div>
                <div className="text-xs text-gray-500">PNG, JPG or PDF (max 5MB)</div>
              </div>
            </label>
          </div>

          {evidenceFile && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">{evidenceFile.name}</span>
                <span className="text-xs text-green-600">({formatFileSize(evidenceFile.size)})</span>
              </div>
              <button
                onClick={() => setEvidenceFile(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            💡 <strong>Payment Evidence:</strong> Upload your payment receipt or screenshot after making the payment. This helps us process your exhibition booking faster.
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