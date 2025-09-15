import { useState } from "react";
import { X, MapPin, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationData {
  name: string;
  address: string;
  description: string;
  mapUrl?: string;
  imageUrl?: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationData?: LocationData;
}

export function LocationModal({ isOpen, onClose, locationData: propLocationData }: LocationModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Default HQ location data
  const defaultLocationData = {
    name: "Alliance Procurement & Capacity Building LTD",
    address: "Ben bella Road, Lusaka House 2nd floor ..alternatively near COMESA Police Post Lusaka House, 10101, Zambia",
    description: "Our headquarters in the heart of Zambia's capital city, where we deliver world-class procurement and capacity building services.",
    mapUrl: "https://maps.app.goo.gl/ixRsTxvm9ENAmF5f8",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center"
  };
  
  const locationData = propLocationData || defaultLocationData;

  const handleOpenInMaps = () => {
    window.open(locationData.mapUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="relative">
          {/* Location Image */}
          <div className="h-48 bg-gradient-to-br from-[#1C356B] to-[#87CEEB] relative overflow-hidden">
            <img
              src={locationData.imageUrl}
              alt="Lusaka, Zambia"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-70' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            {/* Location icon overlay */}
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
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {locationData.mapUrl && (
              <Button
                onClick={handleOpenInMaps}
                className="flex-1 bg-[#87CEEB] hover:bg-[#6BB6D6] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="outline"
              className={`py-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 ${!locationData.mapUrl ? 'flex-1' : 'px-6'}`}
            >
              Close
            </Button>
          </div>
          
          {/* Additional Info */}
          {locationData.mapUrl && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                Opens in your default maps application
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
