import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Star,
  Crown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { RegistrationDialog } from "./registration-dialog";
import { useState } from "react";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  featured?: boolean;
}

export function EventCard({
  event,
  onRegister,
  featured = false,
}: EventCardProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const handleRegister = () => {
    if (user) {
      setOpen(true);
      return;
    }
    if (onRegister) onRegister(event.id);
  };

  return (
    <Card
      className={`overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border-0 ${featured ? "ring-2 ring-primary-yellow ring-opacity-50" : ""}`}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Image */}
        {event.imageUrl && (
          <div className="relative h-48 overflow-hidden rounded-t-3xl">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              data-testid={`event-image-${event.id}`}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 left-4 bg-primary-yellow text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-4 h-4" />
                MAIN EVENT
              </div>
            )}
          </div>
        )}

        {/* Mobile Content */}
        <div className="p-6">
          {/* Header Section */}
          <div>
            {/* About Badge and Title */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${featured ? "bg-primary-yellow text-white" : "bg-primary-yellow/20 text-primary-blue"}`}
                >
                  {featured ? "FEATURED EVENT" : "ABOUT EVENT"}
                </div>
                <div
                  className={`ml-3 h-0.5 flex-1 ${featured ? "bg-primary-yellow" : "bg-primary-yellow/30"}`}
                ></div>
              </div>

              <h3
                className={`font-bold text-primary-blue leading-tight ${featured ? "text-2xl mb-3" : "text-xl mb-3"}`}
                data-testid={`event-title-${event.id}`}
              >
                {event.title}
                {featured && (
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-primary-yellow fill-current" />
                    <span className="text-sm text-primary-yellow font-semibold">
                      Premium Event
                    </span>
                  </div>
                )}
              </h3>
            </div>

            {/* Description */}
            <p
              className="text-gray-700 mb-4 leading-relaxed text-sm"
              data-testid={`event-description-${event.id}`}
            >
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              <div
                className="flex items-center text-gray-600 text-xs"
                data-testid={`event-date-${event.id}`}
              >
                <Calendar className="w-3 h-3 mr-2 text-primary-yellow" />
                <span className="font-medium">
                  {format(new Date(event.startDate), "MMMM d, yyyy")}
                </span>
              </div>

              {event.location && (
                <div
                  className="flex items-center text-gray-600 text-xs"
                  data-testid={`event-location-${event.id}`}
                >
                  <MapPin className="w-3 h-3 mr-2 text-primary-yellow" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}

              {/* Pricing for featured events */}
              {featured && (
                <div className="space-y-1 mb-2">
                  <div className="flex items-center text-gray-600 text-xs">
                    <DollarSign className="w-3 h-3 mr-2 text-green-600" />
                    <span className="font-medium text-green-700">
                      Registration Fees:
                    </span>
                  </div>
                  <div className="ml-5 space-y-0.5 text-xs">
                    <div className="text-gray-600">
                      <span className="font-medium">Private Sector:</span> ZMW
                      7,000
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Public Sector:</span> ZMW
                      6,500
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">International:</span> USD
                      650
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${featured ? "bg-primary-yellow/20 text-primary-blue" : "bg-primary-yellow/20 text-primary-blue"}`}
                    data-testid={`event-tag-${event.id}-${index}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="pt-3">
            {featured ? (
              <div className="space-y-3">
                {/* Special call-to-action for main event */}
                <div className="bg-primary-yellow/10 p-3 rounded-lg border border-primary-yellow/30">
                  <div className="text-center">
                    <h4 className="font-bold text-primary-blue mb-1 text-sm">
                      Ready to Join?
                    </h4>
                    <p className="text-primary-blue text-xs mb-2">
                      Secure your spot at our premier event
                    </p>
                    <Button
                      onClick={handleRegister}
                      className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider flex items-center gap-2 mx-auto"
                      data-testid={`event-register-${event.id}`}
                    >
                      {user ? (
                        <>
                          Register Now
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional info for featured events */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Limited Seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Premium Experience</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  disabled
                  className="bg-gray-100 text-gray-500 font-medium py-2 px-4 rounded-lg text-sm cursor-not-allowed border border-gray-200"
                  data-testid={`event-view-only-${event.id}`}
                >
                  View Details
                </Button>
                <p className="text-gray-400 text-xs mt-1">
                  Registration available for main event only
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-[320px]">
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

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 left-4 bg-primary-yellow text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-4 h-4" />
                MAIN EVENT
              </div>
            )}
          </div>
        )}

        {/* Content on Right */}
        <div
          className={`flex-1 p-8 flex flex-col justify-between ${!event.imageUrl ? "w-full" : ""}`}
        >
          {/* Header Section */}
          <div>
            {/* About Badge and Title */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div
                  className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${featured ? "bg-primary-yellow text-white" : "bg-primary-yellow/20 text-primary-blue"}`}
                >
                  {featured ? "FEATURED EVENT" : "ABOUT EVENT"}
                </div>
                <div
                  className={`ml-4 h-0.5 flex-1 ${featured ? "bg-primary-yellow" : "bg-primary-yellow/30"}`}
                ></div>
              </div>

              <h3
                className={`font-bold text-primary-blue leading-tight ${featured ? "text-3xl mb-6" : "text-2xl mb-4"}`}
                data-testid={`event-title-${event.id}`}
              >
                {event.title}
                {featured && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-5 h-5 text-primary-yellow fill-current" />
                    <span className="text-lg text-primary-yellow font-semibold">
                      Premium Event
                    </span>
                  </div>
                )}
              </h3>
            </div>

            {/* Description */}
            <p
              className="text-gray-700 mb-6 leading-relaxed text-lg"
              data-testid={`event-description-${event.id}`}
            >
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-3 mb-6">
              <div
                className="flex items-center text-gray-600 text-sm"
                data-testid={`event-date-${event.id}`}
              >
                <Calendar className="w-4 h-4 mr-2 text-primary-yellow" />
                <span className="font-medium">
                  {format(new Date(event.startDate), "MMMM d, yyyy")}
                </span>
              </div>

              {event.location && (
                <div
                  className="flex items-center text-gray-600 text-sm"
                  data-testid={`event-location-${event.id}`}
                >
                  <MapPin className="w-4 h-4 mr-2 text-primary-yellow" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}

              {/* Pricing for featured events */}
              {featured && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium text-green-700">
                      Registration Fees:
                    </span>
                  </div>
                  <div className="ml-6 space-y-1 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">Private Sector:</span> ZMW
                      7,000
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Public Sector:</span> ZMW
                      6,500
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">
                        International Delegates:
                      </span>{" "}
                      USD 650
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${featured ? "bg-primary-yellow/20 text-primary-blue hover:bg-primary-yellow/30" : "bg-primary-yellow/20 text-primary-blue hover:bg-primary-yellow/30"}`}
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
            {featured ? (
              <div className="space-y-4">
                {/* Special call-to-action for main event */}
                <div className="bg-primary-yellow/10 p-4 rounded-xl border border-primary-yellow/30">
                  <div className="text-center">
                    <h4 className="font-bold text-primary-blue mb-2">
                      Ready to Join?
                    </h4>
                    <p className="text-primary-blue text-sm mb-3">
                      Secure your spot at our premier event
                    </p>
                    <Button
                      onClick={handleRegister}
                      className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl uppercase tracking-wider flex items-center gap-2 mx-auto"
                      data-testid={`event-register-${event.id}`}
                    >
                      {user ? (
                        <>
                          Register Now
                          <ArrowRight className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Register Now
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional info for featured events */}
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Limited Seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Premium Experience</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  disabled
                  className="bg-gray-100 text-gray-500 font-medium py-3 px-6 rounded-lg text-base cursor-not-allowed border border-gray-200"
                  data-testid={`event-view-only-${event.id}`}
                >
                  View Details
                </Button>
                <p className="text-gray-400 text-xs mt-2">
                  Registration available for main event only
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {user && featured && (
        <RegistrationDialog open={open} onOpenChange={setOpen} event={event} />
      )}
    </Card>
  );
}
