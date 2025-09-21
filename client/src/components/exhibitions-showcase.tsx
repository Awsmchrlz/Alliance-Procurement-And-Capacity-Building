import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Store, Building, Briefcase, Users, ExternalLink } from "lucide-react";

interface Exhibition {
  id: string;
  companyName: string;
  website?: string;
  status: 'approved';
  companyLogo?: string;
  contactPerson?: string;
  industry?: string;
}

export function ExhibitionsShowcase() {
  // Fetch approved exhibitions
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions/approved"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/exhibitions/approved");
      return response;
    },
  });

  const exhibitionsArray = Array.isArray(exhibitions) ? exhibitions : [];

  // Don't render if no exhibitions
  if (exhibitionsArray.length === 0) {
    return null;
  }

  const handleExhibitorClick = (website?: string) => {
    if (website) {
      // Ensure the URL has a protocol
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-red-600">Exhibitors</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover innovative solutions and services from leading companies showcasing at our events.
          </p>
        </div>

        {/* Continuous Scrolling Exhibitions */}
        <div className="mb-16">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {/* Duplicate exhibitions for seamless loop */}
              {[...exhibitionsArray, ...exhibitionsArray].map((exhibition: Exhibition, index) => {
                return (
                  <div
                    key={`${exhibition.id}-${index}`}
                    className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group cursor-pointer"
                    onClick={() => handleExhibitorClick(exhibition.website)}
                  >
                    <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                    <div className="p-6 text-center">
                      {exhibition.companyLogo ? (
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={exhibition.companyLogo} 
                            alt={`${exhibition.companyName} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to icon if logo fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-16 h-16 p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/></svg></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                          <Store className="w-8 h-8" />
                        </div>
                      )}
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {exhibition.companyName}
                      </h3>
                      
                      {exhibition.industry && (
                        <p className="text-sm text-gray-500 mb-2">{exhibition.industry}</p>
                      )}
                      
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span>Exhibitor</span>
                        {exhibition.website && (
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Static Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {exhibitionsArray.map((exhibition: Exhibition) => (
            <div
              key={exhibition.id}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden transform hover:scale-105 cursor-pointer"
              onClick={() => handleExhibitorClick(exhibition.website)}
            >
              <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
              <div className="p-6 text-center">
                {exhibition.companyLogo ? (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      src={exhibition.companyLogo} 
                      alt={`${exhibition.companyName} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-16 h-16 p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/></svg></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg">
                    <Store className="w-8 h-8" />
                  </div>
                )}
                
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {exhibition.companyName}
                </h3>
                
                {exhibition.industry && (
                  <p className="text-sm text-gray-500 mb-2">{exhibition.industry}</p>
                )}
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span>Exhibitor</span>
                  {exhibition.website && (
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Showcase Your Business
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our exhibition space to connect with potential clients, showcase your products and services, and expand your business network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/events"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Store className="w-5 h-5 mr-2" />
              Book Exhibition Space
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
