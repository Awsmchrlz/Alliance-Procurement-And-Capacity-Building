import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  MapPin,
  Calendar,
  User,
  Building2,
  Globe,
  Navigation,
  X,
  FileText,
  Star,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Event, EventRegistration } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { generateInvoice, formatRegistrationForInvoice } from "@/lib/invoice-generator";

interface RegistrationSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: EventRegistration & { event: Event };
  onDownloadInvoice?: () => void;
}

export function RegistrationSuccessModal({
  open,
  onOpenChange,
  registration,
  onDownloadInvoice,
}: RegistrationSuccessModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      // Merge user data with registration data
      const registrationWithUser = {
        ...registration,
        firstName: user?.firstName || 'N/A',
        lastName: user?.lastName || 'N/A',
        email: user?.email || 'N/A',
        phoneNumber: user?.phoneNumber || 'N/A',
      };
      const invoiceData = formatRegistrationForInvoice(registrationWithUser);
      await generateInvoice(invoiceData);
      toast({
        title: "Receipt Downloaded! 📄",
        description: "Your registration receipt has been downloaded successfully.",
      });
      if (onDownloadInvoice) onDownloadInvoice();
    } catch (error: any) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Download Failed",
        description: "Unable to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyRegistrationNumber = () => {
    if (registration.registrationNumber) {
      navigator.clipboard.writeText(registration.registrationNumber);
      toast({
        title: "Copied!",
        description: "Registration number copied to clipboard.",
      });
    }
  };

  const handleOpenInMaps = () => {
    // Use the event location URL or default to a general Lusaka location
    const mapUrl = "https://maps.app.goo.gl/qPRVWi3AbsFMHTR8A";
    window.open(mapUrl, '_blank');
  };

  const locationData = {
    name: registration.event.title,
    address: registration.event.location || "Lusaka, Zambia",
    description: `Join us for this exciting event at ${registration.event.location || "Lusaka, Zambia"}. This training session will provide valuable insights and networking opportunities in procurement and capacity building.`,
    mapUrl: "https://maps.app.goo.gl/qPRVWi3AbsFMHTR8A",
    imageUrl: registration.event.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center",
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open && !showLocationModal} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] overflow-hidden bg-white border-0 shadow-2xl rounded-2xl p-0">
          {/* Success Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            
            <div className="relative px-4 py-4 text-center text-white">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-1">
                Registration Successful! 🎉
              </h2>
              <p className="text-white/90 text-xs">
                Welcome to {registration.event.title}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 160px)' }}>
            {/* Registration Details Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-blue-800">
                  Registration Details
                </h3>
                {registration.event.featured && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Registration Number - Prominent Display */}
              {registration.registrationNumber && (
                <div className="mb-4">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
                    <div>
                      <span className="text-blue-100 text-xs font-medium">Registration Number</span>
                      <div className="font-mono font-bold text-white text-lg">
                        {registration.registrationNumber}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyRegistrationNumber}
                      className="border-blue-200 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-gray-600 text-xs">Event Date</div>
                    <div className="font-medium text-gray-900 text-xs">
                      {format(new Date(registration.event.startDate), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                {registration.delegateType && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-gray-600 text-xs">Delegate Type</div>
                      <div className="font-medium text-gray-900 text-xs">
                        {registration.delegateType === 'private' ? 'Private Sector' :
                         registration.delegateType === 'public' ? 'Public Sector' :
                         registration.delegateType === 'international' ? 'International' :
                         registration.delegateType}
                      </div>
                    </div>
                  </div>
                )}

                {registration.organization && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <div className="text-gray-600 text-xs">Organization</div>
                      <div className="font-medium text-gray-900 text-xs truncate">
                        {registration.organization}
                      </div>
                    </div>
                  </div>
                )}

                {registration.country && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-gray-600 text-xs">Country</div>
                      <div className="font-medium text-gray-900 text-xs">
                        {registration.country}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-gray-600 text-xs">Amount</div>
                    <div className="font-bold text-sm text-gray-900">
                      {registration.currency} {registration.pricePaid?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-600 text-xs">Payment Status</div>
                    <Badge
                      className={
                        registration.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }
                    >
                      {registration.paymentStatus === "paid" ? "PAID" : "PENDING"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Location Card */}
            {registration.event.location && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Event Location
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowLocationModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm">
                        {registration.event.title}
                      </h4>
                      <p className="text-gray-600 text-xs break-words">
                        {registration.event.location}
                      </p>
                      <button
                        onClick={handleOpenInMaps}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <h3 className="text-base font-bold text-green-800 mb-3">What's Next?</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Check Your Email</div>
                    <div className="text-gray-600">
                      Confirmation email sent to your registered address.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Download Your Receipt</div>
                    <div className="text-gray-600">
                      Keep your registration receipt for records.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Prepare for the Event</div>
                    <div className="text-gray-600">
                      Mark your calendar and prepare materials.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDownloadInvoice}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
            >
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Details Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLocationModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-[#1C356B] to-[#87CEEB] relative overflow-hidden">
                <img
                  src={locationData.imageUrl}
                  alt="Event Location"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-70' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#1C356B] mb-2">
                  {locationData.name}
                </h3>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#87CEEB]" />
                  {locationData.address}
                </p>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {locationData.description}
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleOpenInMaps}
                  className="flex-1 bg-[#87CEEB] hover:bg-[#6BB6D6] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
                
                <Button
                  onClick={() => setShowLocationModal(false)}
                  variant="outline"
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  Close
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Opens in your default maps application
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}