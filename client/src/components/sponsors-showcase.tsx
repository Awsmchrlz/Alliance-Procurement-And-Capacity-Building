import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Crown, Award, Medal, Star, ExternalLink } from "lucide-react";

interface Sponsor {
  id: string;
  companyName: string;
  website?: string;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  status: 'approved';
  companyLogo?: string;
  contactPerson?: string;
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

const SPONSORSHIP_LABELS = {
  platinum: 'Platinum Partner',
  gold: 'Gold Partner',
  silver: 'Silver Partner',
  bronze: 'Bronze Partner',
};

export function SponsorsShowcase() {
  // Fetch approved sponsors
  const { data: sponsors = [] } = useQuery({
    queryKey: ["/api/sponsorships/approved"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sponsorships/approved");
      return response;
    },
  });

  const sponsorsArray = Array.isArray(sponsors) ? sponsors : [];

  // Don't render if no sponsors
  if (sponsorsArray.length === 0) {
    return null;
  }

  const handleSponsorClick = (website?: string) => {
    if (website) {
      // Ensure the URL has a protocol
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Group sponsors by level for better display
  const sponsorsByLevel = sponsorsArray.reduce((acc: any, sponsor: Sponsor) => {
    if (!acc[sponsor.sponsorshipLevel]) {
      acc[sponsor.sponsorshipLevel] = [];
    }
    acc[sponsor.sponsorshipLevel].push(sponsor);
    return acc;
  }, {});

  const levelOrder = ['platinum', 'gold', 'silver', 'bronze'];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#1C356B]">Sponsors</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're proud to partner with industry leaders who share our commitment to excellence in procurement and capacity building.
          </p>
        </div>

        {/* Continuous Scrolling Sponsors */}
        <div className="mb-16">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {/* Duplicate sponsors for seamless loop */}
              {[...sponsorsArray, ...sponsorsArray].map((sponsor: Sponsor, index) => {
                const Icon = SPONSORSHIP_ICONS[sponsor.sponsorshipLevel as keyof typeof SPONSORSHIP_ICONS];
                const colorClass = SPONSORSHIP_COLORS[sponsor.sponsorshipLevel as keyof typeof SPONSORSHIP_COLORS];
                
                return (
                  <div
                    key={`${sponsor.id}-${index}`}
                    className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group cursor-pointer"
                    onClick={() => handleSponsorClick(sponsor.website)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
                    <div className="p-6 text-center">
                      {sponsor.companyLogo ? (
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={sponsor.companyLogo} 
                            alt={`${sponsor.companyName} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to icon if logo fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-16 h-16 p-3 rounded-full bg-gradient-to-r ${colorClass} text-white flex items-center justify-center shadow-lg"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/></svg></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${colorClass} text-white flex items-center justify-center shadow-lg`}>
                          <Icon className="w-8 h-8" />
                        </div>
                      )}
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#1C356B] transition-colors">
                        {sponsor.companyName}
                      </h3>
                      
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <span className="capitalize">{sponsor.sponsorshipLevel} Sponsor</span>
                        {sponsor.website && (
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

        <div className="space-y-12">
          {levelOrder.map((level) => {
            const levelSponsors = sponsorsByLevel[level];
            if (!levelSponsors || levelSponsors.length === 0) return null;

            const Icon = SPONSORSHIP_ICONS[level as keyof typeof SPONSORSHIP_ICONS];
            const colorClass = SPONSORSHIP_COLORS[level as keyof typeof SPONSORSHIP_COLORS];
            const label = SPONSORSHIP_LABELS[level as keyof typeof SPONSORSHIP_LABELS];

            return (
              <div key={level} className="space-y-6">
                {/* Level Header */}
                <div className="text-center">
                  <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">{label}</span>
                  </div>
                </div>

                {/* Sponsors Grid */}
                <div className={`grid ${
                  levelSponsors.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                  levelSponsors.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
                  levelSponsors.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                } gap-6`}>
                  {levelSponsors.map((sponsor: Sponsor) => (
                    <div
                      key={sponsor.id}
                      className={`group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden transform hover:scale-105 ${
                        sponsor.website ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => handleSponsorClick(sponsor.website)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
                      <div className="p-6 text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${colorClass} text-white flex items-center justify-center shadow-lg`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#1C356B] transition-colors">
                          {sponsor.companyName}
                        </h3>
                        
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <span className="capitalize">{level} Sponsor</span>
                          {sponsor.website && (
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join Our Community of Partners
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Partner with us to showcase your commitment to procurement excellence and connect with industry professionals across the region.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/events"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#1C356B] to-[#2563eb] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Crown className="w-5 h-5 mr-2" />
              Become a Sponsor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}