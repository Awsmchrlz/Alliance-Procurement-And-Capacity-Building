import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="text-white py-12 sm:py-16 lg:py-20 transition-colors duration-300"
      style={{ background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)` }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Logo Section - Left on desktop, top on mobile */}
          <div className="w-full lg:w-1/2 order-1 lg:order-1">
            <div className="relative w-full h-48 sm:h-64 lg:h-80 xl:h-96">
              <img
                src="/src/assets/APCB_logo.png"
                alt="Alliance Procurement & Capacity Building Logo"
                className="w-full h-full object-contain lg:object-cover rounded-lg"
                onError={(e) => {
                  // Fallback styling if image fails to load
                  e.currentTarget.className = "w-full h-full bg-white/10 rounded-lg  flex items-center justify-center";
                  e.currentTarget.innerHTML = '<span class="text-[#FDC123] text-2xl font-bold">APCB</span>';
                }}
              />
            </div>
          </div>

          {/* Content Section - Right on desktop, bottom on mobile */}
          <div className="w-full lg:w-1/2 order-2 lg:order-2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
              WELCOME TO <br />
              <span style={{ color: '#FDC123' }}>ALLIANCE</span><br />
              PROCUREMENT &<br />
              CAPACITY BUILDING
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform"
                style={{ backgroundColor: '#FDC123' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6ae1f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FDC123'}
                data-testid="hero-events-button"
              >
                <Calendar className="w-5 h-5 mr-2" />
                DISCOVER MORE
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 text-white hover:text-[#1C356B] transition-all duration-300 font-semibold hover:scale-105 transform"
                style={{ borderColor: '#FDC123', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDC123';
                  e.currentTarget.style.color = '#1C356B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
                data-testid="hero-learn-more-button"
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
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Events</h2>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[#FDC123] text-sm sm:text-base font-medium mb-2">Current</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Projects</h2>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}