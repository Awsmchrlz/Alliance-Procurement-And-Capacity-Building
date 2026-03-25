import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PublicEventRegistration } from "./public-event-registration";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@shared/schema";

export function FeaturedEventSection() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/api/events");
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  // Find the featured event
  let featuredEvent = events.find((e: Event) => e.featured === true);

  // FALLBACK: If no featured event from API, create a mock event so the form always shows
  if (!featuredEvent) {
    featuredEvent = {
      id: "ministry-health-2026",
      title: "2026 NATIONAL SEMINAR \"MINISTRY OF HEALTH\"",
      description: "THEME: STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR",
      location: "Livingstone, Zambia",
      startDate: new Date("2026-03-25"),
      endDate: new Date("2026-04-02"),
      featured: true,
      createdAt: new Date(),
    } as Event;
  }

  return (
    <section id="events" className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          {/* Featured landscape image */}
          <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] overflow-hidden">
            <img
              src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1774472691/tt_esxpym.png"
              alt={featuredEvent.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event details section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
            {/* Left side - Event info */}
            <div>
              <h3 className="font-bold text-2xl lg:text-3xl text-gray-900 mb-3 line-clamp-3">
                {featuredEvent.title}
              </h3>

              {featuredEvent.description && (
                <p className="text-sm lg:text-base text-gray-600 mb-6 line-clamp-4">
                  {featuredEvent.description}
                </p>
              )}

              <div className="space-y-3 mb-6 text-sm lg:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1C356B] flex-shrink-0" />
                  <span>{format(new Date(featuredEvent.startDate), "MMM d, yyyy")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1C356B] flex-shrink-0" />
                  <span>{format(new Date(featuredEvent.startDate), "h:mm a")}</span>
                </div>

                {featuredEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1C356B] flex-shrink-0" />
                    <span className="line-clamp-1">{featuredEvent.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Register button */}
            <div className="flex flex-col justify-center">
              <button
                onClick={() => setSelectedEvent(featuredEvent)}
                className="w-full bg-[#1C356B] hover:bg-[#2d4a7a] text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg"
              >
                <span>Register Here</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Limited spots available - Register now!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0">
          {selectedEvent && (
            <PublicEventRegistration
              event={selectedEvent}
              onSuccess={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
