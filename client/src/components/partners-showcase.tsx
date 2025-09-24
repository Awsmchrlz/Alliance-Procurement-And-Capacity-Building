import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Award, Medal, Star, Store, ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  companyName: string;
  website?: string;
  sponsorshipLevel?: 'platinum' | 'gold' | 'silver' | 'bronze';
  boothSize?: 'standard' | 'premium' | 'custom';
  status: 'approved';
}

const SPONSORSHIP_ICONS = {
  platinum: Crown,
  gold: Award,
  silver: Medal,
  bronze: Star,
};

const SPONSORSHIP_COLORS = {
  platinum: 'from-slate-300 via-slate-400 to-slate-500',
  gold: 'from-yellow-400 via-yellow-500 to-yellow-600',
  silver: 'from-gray-300 via-gray-400 to-gray-500',
  bronze: 'from-amber-600 via-amber-700 to-amber-800',
};

export function PartnersShowcase() {
  // Fetch approved sponsors
  const { data: sponsors = [] } = useQuery({
    queryKey: ["/api/showcase/sponsorships"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/showcase/sponsorships");
      return Array.isArray(response)
        ? response.filter((s: any) => s.status === 'approved' || s.status === 'Approved')
        : [];
    },
  });

  // Fetch approved exhibitors
  const { data: exhibitors = [] } = useQuery({
    queryKey: ["/api/showcase/exhibitions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/showcase/exhibitions");
      return Array.isArray(response)
        ? response.filter((e: any) => e.status === 'approved' || e.status === 'Approved')
        : [];
    },
  });

  const sponsorsArray = Array.isArray(sponsors) ? sponsors : [];
  const exhibitorsArray = Array.isArray(exhibitors) ? exhibitors : [];

  // Don't render if no partners
  if (sponsorsArray.length === 0 && exhibitorsArray.length === 0) {
    return null;
  }

  const handlePartnerClick = (website?: string) => {
    if (website) {
      // Ensure the URL has a protocol
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#1C356B]">Partners</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're proud to partner with leading organizations that share our commitment to excellence in procurement and capacity building.
          </p>
        </div>

        {/* Sponsors Section */}
        {sponsorsArray.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Sponsors</h3>
              <p className="text-gray-600">Supporting our mission to advance procurement excellence</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sponsorsArray.map((sponsor: Partner) => {
                const Icon = SPONSORSHIP_ICONS[sponsor.sponsorshipLevel!];
                const colorClass = SPONSORSHIP_COLORS[sponsor.sponsorshipLevel!];
                
                return (
                  <Card 
                    key={sponsor.id} 
                    className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${
                      sponsor.website ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => handlePartnerClick(sponsor.website)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 p-2 rounded-lg bg-gradient-to-r ${colorClass} text-white flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1C356B] transition-colors">
                        {sponsor.companyName}
                      </h4>
                      
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span className="capitalize">{sponsor.sponsorshipLevel} Sponsor</span>
                        {sponsor.website && (
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Exhibitors Section */}
        {exhibitorsArray.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exhibition Partners</h3>
              <p className="text-gray-600">Showcasing innovative solutions and services</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {exhibitorsArray.map((exhibitor: Partner) => (
                <Card 
                  key={exhibitor.id} 
                  className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${
                    exhibitor.website ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handlePartnerClick(exhibitor.website)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 p-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-center">
                      <Store className="w-6 h-6" />
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {exhibitor.companyName}
                    </h4>
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <span className="capitalize">{exhibitor.boothSize} Booth</span>
                      {exhibitor.website && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Interested in Partnering with Us?
          </h3>
          <p className="text-gray-600 mb-6">
            Join our community of forward-thinking organizations and showcase your commitment to procurement excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/events"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#1C356B] to-[#2563eb] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Crown className="w-4 h-4 mr-2" />
              Become a Sponsor
            </a>
            <a
              href="/events"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Store className="w-4 h-4 mr-2" />
              Become an Exhibitor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}