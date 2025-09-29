import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { RegistrationDialog } from "@/components/registration-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Event } from "@shared/schema";

const EventsPage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const [autoOpenDialog, setAutoOpenDialog] = useState(false);

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
  const {
    data: userRegistrations = [],
    isLoading: isLoadingRegistrations,
    refetch: refetchRegistrations,
  } = useQuery({
    queryKey: ["/api/users", user?.id, "registrations"],
    queryFn: async () => {
      if (!user?.id) {
        console.log("❌ No user ID available for registration fetch");
        return [];
      }
      console.log("🔍 Fetching registrations for user:", user.id);
      const data = await apiRequest(
        "GET",
        `/api/users/${user?.id}/registrations`,
      );
      console.log(
        "📋 User registrations fetched:",
        data?.length || 0,
        "registrations",
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id && !!isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache results
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Type guard to ensure events is an array
  const eventsArray = Array.isArray(events) ? events : [];
  const registrationsArray = Array.isArray(userRegistrations)
    ? userRegistrations
    : [];

  // Auto-open registration dialog when component mounts
  useEffect(() => {
    setAutoOpenDialog(true);
    window.history.replaceState({}, "", "/events");

    return () => setAutoOpenDialog(false);
  }, []);

  // Handle auto-open when events and authentication state are loaded
  useEffect(() => {
    if (autoOpenDialog && eventsArray.length > 0 && isAuthenticated) {
      // Find the main event (first upcoming event or most recent)
      const upcomingEvents = eventsArray.filter(
        (event: Event) => new Date(event.startDate) >= new Date(),
      );
      const mainEvent =
        upcomingEvents.length > 0 ? upcomingEvents[0] : eventsArray[0];

      if (mainEvent) {
        // Check if user is already registered for this event
        const isAlreadyRegistered = registrationsArray.some(
          (reg: any) => reg.eventId === mainEvent.id,
        );

        // Small delay to ensure everything is loaded
        const timer = setTimeout(() => {
          if (isAlreadyRegistered) {
            // Show already registered message instead of opening modal
            toast({
              title: "Already Registered! ✅",
              description: `You're already registered for "${mainEvent.title}". Check your dashboard for details.`,
            });
          } else {
            // Open registration modal for unregistered users
            setSelectedEvent(mainEvent);
            setShowRegistrationDialog(true);

            toast({
              title: "Welcome! 🎉",
              description: "Ready to register for our upcoming event?",
            });
          }
          setAutoOpenDialog(false);
        }, 1000); // Increased delay to ensure everything is loaded

        return () => clearTimeout(timer);
      }
    }
  }, [autoOpenDialog, eventsArray, registrationsArray, isAuthenticated, toast]);

  const handleRegisterClick = (event: Event) => {
    if (!isAuthenticated) {
      // Redirect to registration page with a return URL
      navigate(`/register?returnTo=/events/${event.id}`);
      return;
    }
    setSelectedEvent(event);
    setShowRegistrationDialog(true);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-100 text-green-800">Upcoming</Badge>;
      case "ongoing":
        return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      case "past":
        return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
      default:
        return null;
    }
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
            Upcoming <span className="text-[#87CEEB]">Event</span>
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
      <section className="py-4 bg-gray-50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventsArray.map((event: Event) => {
                const status = getEventStatus(event);
                const isRegistered = isUserRegistered(event.id);

                return (
                  <Card
                    key={event.id}
                    className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                  >
                    <div className="relative">
                      {event.imageUrl && (
                        <div className="h-48 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] relative overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        {getStatusBadge(status)}
                      </div>

                      {isRegistered && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-[#87CEEB] text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Registered
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#1C356B] transition-colors">
                        {event.title}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="text-gray-600 line-clamp-2">
                          {event.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-[#1C356B]" />
                          <span>
                            {format(new Date(event.startDate), "MMM d, yyyy")}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-[#1C356B]" />
                          <span>
                            {format(new Date(event.startDate), "h:mm a")}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-[#1C356B]" />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        )}

                        {event.maxAttendees && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-[#1C356B]" />
                            <span>Max {event.maxAttendees} participants</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        {status === "upcoming" && !isRegistered ? (
                          <button
                            onClick={() => handleRegisterClick(event)}
                            className="w-full bg-[#1C356B] hover:bg-[#2d4a7a] active:bg-[#1a2f5a] text-white font-bold py-5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 min-h-[64px] text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>Register for Event</span>
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        ) : isRegistered ? (
                          <div className="w-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold py-5 px-4 rounded-xl flex items-center justify-center gap-3 min-h-[64px] text-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span>Already Registered</span>
                          </div>
                        ) : (
                          <div className="w-full bg-gray-50 border-2 border-gray-200 text-gray-500 font-bold py-5 px-4 rounded-xl flex items-center justify-center min-h-[64px] text-lg">
                            <span>
                              {status === "ongoing" ? "Event in Progress" : "Event Completed"}
                            </span>
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
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

      {/* Registration Dialogs */}
      {selectedEvent && (
        <>
          <RegistrationDialog
            open={showRegistrationDialog}
            onOpenChange={(open) => {
              setShowRegistrationDialog(open);
              // Clear auto-open flag when modal is closed
              if (!open) {
                localStorage.removeItem("autoOpenEventModal");
              }
            }}
            event={selectedEvent}
            skipSuccessModal={true}
            onSuccess={() => {
              setShowRegistrationDialog(false);
              // Clear auto-open flag after successful registration
              localStorage.removeItem("autoOpenEventModal");
              // Set flag to show success modal only on dashboard
              sessionStorage.setItem("showRegistrationSuccess", "true");
              // Navigate immediately to dashboard to show success modal there
              navigate("/dashboard");
            }}
          />
        </>
      )}
    </div>
  );
};

export default EventsPage;
