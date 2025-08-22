import { useQuery } from "@tanstack/react-query";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@shared/schema";

export function UpcomingEventsSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to register for events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, userId: user.id }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the event.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-20" style={{ backgroundColor: '#F8FBFF' }}>
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse text-xl font-medium" style={{ color: '#1C356B' }}>
              Loading events...
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredEvent = events?.find(event => event.featured);
  const otherEvents = events?.filter(event => !event.featured);
  return (
    <section id="events" className="py-6" style={{ backgroundColor: '#F8FBFF' }}>
      <div className="container mx-auto px-6">

        {/* Three Header Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">

          <div className="rounded-xl p-4 text-center transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-blue-900 uppercase tracking-wider" data-testid="upcoming-events-title">
              UPCOMING EVENTS
            </h3>
            <button
              className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider text-lg"
              style={{ backgroundColor: '#1C356B', color: '#FDC123' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f1e3d';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1C356B';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              data-testid="events-read-more"
            >
              SEE UPCOMING EVENTS →
            </button>
          </div>

          {/* Current Projects Card */}
          <div className="rounded-xl p-4 text-center transition-all duration-300">
            <h3 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wider" data-testid="current-projects-title">
              CURRENT PROJECTS
            </h3>
            <button
              className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider text-lg"
              style={{ backgroundColor: '#FDC123', color: '#1C356B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e6ae1f';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FDC123';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              data-testid="projects-read-more"
            >
              READ MORE →
            </button>
          </div>

          {/* About Indaba Card */}
          <div className="rounded-xl p-4 text-center transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 text-blue-900 uppercase tracking-wider" data-testid="about-indaba-title">
              INTERNATIONAL INDABA
            </h3>
            <button
              className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider text-lg"
              style={{ backgroundColor: '#1C356B', color: '#FDC123' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f1e3d';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1C356B';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              data-testid="indaba-read-more"
            >
              LEARN MORE →
            </button>
          </div>
        </div>

        {/* Events Display Section */}
        {events && events.length > 0 ? (
          <div className="space-y-8">
            {/* Featured Event */}
            {featuredEvent && (
              <div className="mb-12">
                <EventCard
                  event={featuredEvent}
                  onRegister={handleRegister}
                  featured={true}
                />
              </div>
            )}

            {/* Other Events */}
            {otherEvents && otherEvents.length > 0 && (
              <div className="space-y-8">
                {otherEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-16">
              <Button
                className="font-bold py-4 px-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 uppercase tracking-wider"
                style={{ backgroundColor: '#1C356B', color: '#FDC123' }}
                data-testid="view-all-events"
              >
                View All Events →
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: '#F0F4FF' }}>
              <svg className="w-12 h-12" style={{ color: '#1C356B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#1C356B' }}>
              No Events Scheduled
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed" data-testid="no-events">
              Stay tuned! We're working on some exciting events that will be announced soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}