import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PublicEventRegistration } from "./public-event-registration";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Crown, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@shared/schema";

export function FeaturedEventSection() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

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
  const featuredEvent = events.find((e: Event) => e.featured === true);

  // Don't render if no featured event
  if (!featuredEvent) {
    console.log("No featured event found");
    return null;
  }

  const eventDate = new Date(featuredEvent.startDate);
  const today = new Date();
  
  // Show event if it's today or in the future
  const isPast = eventDate < today && eventDate.toDateString() !== today.toDateString();
  
  if (isPast) {
    console.log("Featured event is in the past:", eventDate);
    return null;
  }

  console.log("Showing featured event:", featuredEvent.title, "Date:", eventDate);

  const handleRegisterClick = () => {
    setSelectedEvent(featuredEvent);
    setShowRegistrationDialog(true);
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-[#1C356B] via-[#1C5B7D] to-[#2d4a7a] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Featured Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FDC123] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
              <Crown className="w-5 h-5" />
              FEATURED EVENT
            </div>
          </div>

          {/* Event Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              2026 NATIONAL SEMINAR
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-[#FDC123] mb-6">
              "MINISTRY OF HEALTH"
            </h3>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                THEME: "STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR"
              </p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FDC123] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Event Dates</h4>
                    <div className="space-y-2">
                      <div className="text-blue-100 text-sm">
                        <span className="font-semibold">Group 1:</span> March 25-28, 2026
                      </div>
                      <div className="text-blue-100 text-sm">
                        <span className="font-semibold">Group 2:</span> March 30 - April 2, 2026
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FDC123] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Location</h4>
                    <p className="text-blue-100 text-sm">
                      Zambia Air Force (ZAF) Banquet Hall
                    </p>
                    <p className="text-blue-100 text-sm">
                      Livingstone, Zambia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group 1 Attendees */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#FDC123] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  Group 1: March 25-28, 2026
                </h4>
              </div>
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-semibold">Attendees:</p>
                <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
                  <li>Hospital Administrative Officers</li>
                  <li>Hospital Officer in Charges</li>
                  <li>Senior / Medical Superintendents</li>
                  <li>Planning Personnel</li>
                  <li>Accounts Personnel</li>
                  <li>District Health Directors (DHDs)</li>
                  <li>Principal Tutors</li>
                  <li>Auditors and Stores Officers</li>
                  <li>Human Resource Personnel</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Group 2 Attendees */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#FDC123] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  Group 2: March 30 - April 2, 2026
                </h4>
              </div>
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-semibold">Attendees:</p>
                <ul className="text-blue-100 text-sm space-y-1 list-disc list-inside">
                  <li>Secretaries / Executive Officers / Personnel Assistants</li>
                  <li>Administrative Personnel</li>
                  <li>Cashiers</li>
                  <li>Registry / Records Personnel</li>
                  <li>Procurement Officers</li>
                  <li>Pharmacists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guest of Honor */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-[#FDC123]/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-[#FDC123]" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wider">
                  Invited Guest of Honor
                </h4>
              </div>
              <p className="text-xl font-bold text-white mb-1">
                His Excellency Mr. Hakainde Hichilema
              </p>
              <p className="text-blue-100 text-sm">
                President of the Republic of Zambia
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#FDC123]" />
              <p className="text-blue-100 text-lg">
                Limited seats available - Register now to secure your spot
              </p>
              <Sparkles className="w-5 h-5 text-[#FDC123]" />
            </div>
            <div>
              <Button
                onClick={handleRegisterClick}
                className="bg-[#FDC123] hover:bg-[#FDC123]/90 text-[#1C356B] font-bold py-6 px-12 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                REGISTER HERE
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <p className="text-blue-100 text-sm mt-4">
                No login required • Quick and easy registration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      {selectedEvent && (
        <PublicEventRegistration
          event={selectedEvent}
        />
      )}
    </>
  );
}
