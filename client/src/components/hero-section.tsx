import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function HeroSection() {
  // Background images array - replace with your actual image URLs
  const backgroundImages = [
      "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg",
      "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858602/groupPhoto7_bjfam9.jpg",
      "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858601/groupPhoto3_vvwwcr.jpg",
      "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858600/groupPhoto5_ule4va.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch events to get the latest featured event
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const latestEvent = events?.find(event => event.featured) || events?.[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsVisible(true);
      }, 400); // Half second fade out before changing image

    }, 4000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section className="relative text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Background Gradient Overlay */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
      />

      {/* Dynamic Background Images */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex && isVisible ? 'opacity-40' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ))}
      </div>

      {/* Additional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Logo Section - Left on desktop, top on mobile */}
          <div className="w-full lg:w-1/2 order-1 lg:order-1">
            <div className="relative w-full h-48 sm:h-64 lg:h-80 xl:h-96">
              <img
                src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
                alt="Alliance Procurement & Capacity Building Logo"
                className="w-full h-full object-contain lg:object-cover rounded-lg"
                onError={(e) => {
                  // Fallback styling if image fails to load
                  e.currentTarget.className = "w-full h-full bg-white/10 rounded-lg flex items-center justify-center";
                  e.currentTarget.innerHTML = '<span class="text-[#FDC123] text-2xl font-bold">APCB</span>';
                }}
              />
            </div>
          </div>

          {/* Content Section - Right on desktop, bottom on mobile */}
          <div className="w-full lg:w-1/2 order-2 lg:order-2 text-center lg:text-left">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight drop-shadow-lg"
              data-testid="hero-title"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              WELCOME TO <br />
              <span style={{ color: '#FDC123' }}>ALLIANCE</span><br />
              PROCUREMENT &<br />
              CAPACITY BUILDING
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#FDC123' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6ae1f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDC123'}
                data-testid="hero-events-button"
                onClick={() => {
                  if (latestEvent) {
                    // Scroll to events section and trigger registration
                    const eventsSection = document.getElementById('events');
                    if (eventsSection) {
                      eventsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    // If no events, scroll to events section anyway
                    const eventsSection = document.getElementById('events');
                    if (eventsSection) {
                      eventsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {latestEvent ? 'REGISTER FOR INDABA' : 'VIEW EVENTS'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-white hover:text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform shadow-lg hover:shadow-xl backdrop-blur-sm"
                style={{ borderColor: '#FDC123', backgroundColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDC123';
                  e.currentTarget.style.color = '#1C356B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                data-testid="hero-learn-more-button"
                onClick={() => {
                  // Scroll to contact section or open contact modal
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // If no contact section, scroll to footer
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
              >
                CONTACT US
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Events and Projects Section */}
            <div className="mt-8 lg:mt-12">
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <p className="text-[#FDC123] text-sm sm:text-base font-medium mb-2">Upcoming</p>
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Events
                  </h2>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[#FDC123] text-sm sm:text-base font-medium mb-2">Current</p>
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Projects
                  </h2>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Image Indicators (optional) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                setCurrentImageIndex(index);
                setIsVisible(true);
              }, 250);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-[#FDC123] shadow-lg'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`View background image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}