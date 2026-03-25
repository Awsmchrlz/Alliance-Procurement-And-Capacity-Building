import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PublicEventRegistration } from "@/components/public-event-registration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Event } from "@shared/schema";

const EventsPage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/api/events");
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user registrations with better error handling
  const { data: userRegistrations = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "registrations"],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const data = await apiRequest(
        "GET",
        `/api/users/${user?.id}/registrations`,
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id && !!isAuthenticated,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Type guard to ensure events is an array
  const eventsArray = Array.isArray(events) ? events : [];
  const registrationsArray = Array.isArray(userRegistrations)
    ? userRegistrations
    : [];

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const isUserRegistered = (eventId: string) => {
    return registrationsArray.some((reg: any) => reg.eventId === eventId);
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return "upcoming";
    if (now >= startDate && now <= endDate) return "ongoing";
    return "past";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1C356B]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />

        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-[#87CEEB]">Events</span>
          </h1>
          {isAuthenticated && (
            <div className="flex items-center justify-center gap-3 mb-3">
              {registrationsArray.length > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Welcome back, {user?.lastName}! You're already registered
                    for {registrationsArray.length} event
                    {registrationsArray.length > 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-[#87CEEB]" />
                  <span className="text-[#87CEEB] font-medium">
                    Welcome back, {user?.lastName}! Ready to register?
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {eventsArray.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Events Available
              </h3>
              <p className="text-gray-600">
                Check back soon for upcoming events!
              </p>
            </div>
          ) : (
            <>
              {/* Upcoming Events Section */}
              {eventsArray.filter((e: Event) => getEventStatus(e) === "upcoming" || getEventStatus(e) === "ongoing").length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-[#1C356B]" />
                    <h2 className="text-3xl font-bold text-gray-900">
                      Upcoming Events
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {eventsArray
                      .filter((e: Event) => getEventStatus(e) === "upcoming" || getEventStatus(e) === "ongoing")
                      .sort((a: Event, b: Event) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                      })
                      .map((event: Event) => {
                        const status = getEventStatus(event);
                        const isRegistered = isUserRegistered(event.id);

                        return (
                          <div
                            key={event.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                          >
                            {event.imageUrl && (
                              <div className="h-40 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] overflow-hidden">
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </div>
                            )}

                            <div className="p-5">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                {event.title}
                              </h3>

                              {event.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#1C356B] flex-shrink-0" />
                                  <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-[#1C356B] flex-shrink-0" />
                                  <span>{format(new Date(event.startDate), "h:mm a")}</span>
                                </div>

                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#1C356B] flex-shrink-0" />
                                    <span className="line-clamp-1">{event.location}</span>
                                  </div>
                                )}
                              </div>

                              {status === "upcoming" && !isRegistered ? (
                                <button
                                  onClick={() => handleRegisterClick(event)}
                                  className="w-full bg-[#1C356B] hover:bg-[#2d4a7a] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                  <span>Register Here</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              ) : isRegistered ? (
                                <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Registered</span>
                                </div>
                              ) : (
                                <div className="w-full bg-gray-100 border border-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-center text-sm">
                                  {status === "ongoing" ? "In Progress" : "Completed"}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Previous Events Section */}
              {eventsArray.filter((e: Event) => getEventStatus(e) === "past").length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-gray-600" />
                    <h2 className="text-3xl font-bold text-gray-900">
                      Previous Events
                    </h2>
                    <Badge variant="outline" className="ml-2">
                      {eventsArray.filter((e: Event) => getEventStatus(e) === "past").length} Event{eventsArray.filter((e: Event) => getEventStatus(e) === "past").length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Explore our past events and see what we've accomplished together
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {eventsArray
                      .filter((e: Event) => getEventStatus(e) === "past")
                      .sort((a: Event, b: Event) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                      .map((event: Event) => {
                        const status = getEventStatus(event);
                        const isRegistered = isUserRegistered(event.id);

                        return (
                          <div
                            key={event.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden opacity-75"
                          >
                            {event.imageUrl && (
                              <div className="h-40 bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden">
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-full h-full object-cover opacity-60 grayscale"
                                />
                              </div>
                            )}

                            <div className="p-5">
                              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                {event.title}
                              </h3>

                              {event.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <span>{format(new Date(event.startDate), "h:mm a")}</span>
                                </div>

                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="line-clamp-1">{event.location}</span>
                                  </div>
                                )}
                              </div>

                              <div className="w-full bg-gray-100 border border-gray-200 text-gray-600 font-bold py-2.5 px-4 rounded-lg text-center text-sm">
                                Event Completed
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-[#1C356B] to-[#2d4a7a]">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#87CEEB]/20 backdrop-blur-sm rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-[#87CEEB]" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create your account or sign in to register for our upcoming events
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="bg-[#87CEEB] hover:bg-[#7bb8d4] text-white font-semibold px-8 py-3"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#1C356B] px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Registration Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0">
          <div className="sr-only">
            <DialogTitle>Event Registration</DialogTitle>
          </div>
          {selectedEvent && (
            <PublicEventRegistration
              event={selectedEvent}
              onSuccess={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsPage;
