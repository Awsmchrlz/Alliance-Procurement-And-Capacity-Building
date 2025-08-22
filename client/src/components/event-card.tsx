import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  featured?: boolean;
}

export function EventCard({ event, onRegister, featured = false }: EventCardProps) {
  const handleRegister = () => {
    if (onRegister) {
      onRegister(event.id);
    }
  };

  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border-0">
      <div className="flex min-h-[320px]">
        {/* Portrait Image on Left */}
        {event.imageUrl && (
          <div className="w-2/5 relative overflow-hidden rounded-l-3xl">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              data-testid={`event-image-${event.id}`}
            />
            {/* Overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Content on Right */}
        <div className={`flex-1 p-8 flex flex-col justify-between ${!event.imageUrl ? 'w-full' : ''}`}>
          {/* Header Section */}
          <div>
            {/* About Badge and Title */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                  ABOUT EVENT
                </div>
                <div className="ml-4 h-0.5 bg-yellow-400 flex-1"></div>
              </div>

              <h3 className={`font-bold text-blue-900 leading-tight ${featured ? "text-3xl mb-6" : "text-2xl mb-4"}`} data-testid={`event-title-${event.id}`}>
                {event.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed text-lg" data-testid={`event-description-${event.id}`}>
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600 text-sm" data-testid={`event-date-${event.id}`}>
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {format(new Date(event.startDate), "MMMM d, yyyy")}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center text-gray-600 text-sm" data-testid={`event-location-${event.id}`}>
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-semibold"
                    data-testid={`event-tag-${event.id}-${index}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="pt-4">
            <Button

              onClick={handleRegister}
              className="hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider"
              data-testid={`event-register-${event.id}`}
              style={{ background: `#1C356B` }}
            >
              READ MORE →
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}