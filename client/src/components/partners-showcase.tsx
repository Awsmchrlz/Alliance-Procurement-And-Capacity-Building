import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Award, Medal, Star, Store, ExternalLink } from "lucide-react";

interface Partner {
  id: string;
  companyName: string;
  website?: string;
  sponsorshipLevel?: "platinum" | "gold" | "silver" | "bronze";
  boothSize?: "standard" | "premium" | "custom";
  status: "approved";
}

const SPONSORSHIP_ICONS = {
  platinum: Crown,
  gold: Award,
  silver: Medal,
  bronze: Star,
};

const SPONSORSHIP_COLORS = {
  platinum: {
    gradient: "from-slate-300 via-gray-200 to-slate-400",
    medalGradient: "#e2e8f0, #f1f5f9, #cbd5e1",
    shadow: "shadow-slate-400/60",
    ring: "ring-slate-400",
    text: "text-slate-900",
    bg: "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100",
    label: "Platinum Partner",
  },
  gold: {
    gradient: "from-yellow-400 via-amber-400 to-yellow-600",
    medalGradient: "#fbbf24, #f59e0b, #d97706",
    shadow: "shadow-yellow-400/60",
    ring: "ring-yellow-400",
    text: "text-yellow-900",
    bg: "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100",
    label: "Gold Partner",
  },
  silver: {
    gradient: "from-gray-400 via-slate-400 to-gray-500",
    medalGradient: "#94a3b8, #64748b, #475569",
    shadow: "shadow-gray-400/50",
    ring: "ring-gray-400",
    text: "text-gray-800",
    bg: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100",
    label: "Silver Partner",
  },
  bronze: {
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    medalGradient: "#d97706, #ea580c, #92400e",
    shadow: "shadow-amber-500/60",
    ring: "ring-amber-500",
    text: "text-amber-900",
    bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
    label: "Bronze Partner",
  },
};

const EXHIBITION_STYLE = {
  gradient: "from-red-600 via-rose-500 to-red-700",
  medalGradient: "#dc2626, #f43f5e, #b91c1c",
  shadow: "shadow-red-500/80",
  ring: "ring-red-500",
  text: "text-red-800",
  bg: "bg-gradient-to-br from-red-50 via-rose-50 to-red-100",
  label: "Exhibition Partner",
};

export function PartnersShowcase() {
  // Fetch approved sponsors
  const { data: sponsors = [] } = useQuery({
    queryKey: ["/api/showcase/sponsorships"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/showcase/sponsorships");
      return Array.isArray(response)
        ? response.filter(
            (s: any) => s.status === "approved" || s.status === "Approved",
          )
        : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch approved exhibitors
  const { data: exhibitors = [] } = useQuery({
    queryKey: ["/api/showcase/exhibitions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/showcase/exhibitions");
      return Array.isArray(response)
        ? response.filter(
            (e: any) => e.status === "approved" || e.status === "Approved",
          )
        : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      const url = website.startsWith("http") ? website : `https://${website}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-[#1C356B]">Partners</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're proud to partner with leading organizations that share our
              commitment to excellence in procurement and capacity building.
            </p>
          </div>

          {/* Sponsors Section */}
          {sponsorsArray.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Event Sponsors
                </h3>
                <p className="text-gray-600">
                  Supporting our mission to advance procurement excellence
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sponsorsArray.map((sponsor: Partner) => {
                  const Icon = SPONSORSHIP_ICONS[sponsor.sponsorshipLevel!];
                  const levelConfig =
                    SPONSORSHIP_COLORS[sponsor.sponsorshipLevel!];

                  return (
                    <Card
                      key={sponsor.id}
                      className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${
                        sponsor.website ? "cursor-pointer" : ""
                      }`}
                      onClick={() => handlePartnerClick(sponsor.website)}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-20 h-20 mx-auto mb-4 rounded-full medal-container ${sponsor.sponsorshipLevel}-medal medal-shine flex items-center justify-center relative overflow-hidden shadow-lg`}
                          style={{
                            background: `linear-gradient(135deg, ${levelConfig.medalGradient})`,
                            boxShadow: `0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
                          }}
                        >
                          {/* Medal content */}
                          <div className="relative z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center">
                            <Icon className="w-6 h-6 text-white mb-1 medal-text drop-shadow-lg" />
                            <div className="text-xs font-bold text-white medal-text">
                              {sponsor.companyName
                                .split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          </div>

                          {/* Medal ribbon effect */}
                          <div
                            className="absolute -bottom-1 w-6 h-3 rounded-b-full opacity-60"
                            style={{
                              background:
                                sponsor.sponsorshipLevel === "platinum"
                                  ? "linear-gradient(to right, #94a3b8, #cbd5e1)"
                                  : sponsor.sponsorshipLevel === "gold"
                                    ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                                    : sponsor.sponsorshipLevel === "silver"
                                      ? "linear-gradient(to right, #94a3b8, #cbd5e1)"
                                      : "linear-gradient(to right, #92400e, #d97706)",
                            }}
                          ></div>
                        </div>

                        <h4 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#1C356B] transition-colors">
                          {sponsor.companyName}
                        </h4>

                        {/* Custom Styled Badge */}
                        <div className="mb-4">
                          <Badge
                            className="text-white font-semibold px-4 py-2 shadow-lg text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${levelConfig.medalGradient})`,
                            }}
                          >
                            {levelConfig.label}
                          </Badge>
                        </div>

                        {/* Website Button */}
                        {sponsor.website && (
                          <button
                            onClick={() => handlePartnerClick(sponsor.website!)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Visit Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exhibitors Section */}
          {exhibitorsArray.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Exhibition Partners
                </h3>
                <p className="text-gray-600">
                  Showcasing innovative solutions and services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {exhibitorsArray.map((exhibitor: Partner) => (
                  <Card
                    key={exhibitor.id}
                    className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${
                      exhibitor.website ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handlePartnerClick(exhibitor.website)}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-20 h-20 mx-auto mb-4 rounded-full medal-container exhibition-medal medal-shine flex items-center justify-center relative overflow-hidden shadow-lg`}
                        style={{
                          background: `linear-gradient(135deg, ${EXHIBITION_STYLE.medalGradient})`,
                          boxShadow: `0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
                        }}
                      >
                        {/* Medal content */}
                        <div className="relative z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center">
                          <Store className="w-6 h-6 text-white mb-1 medal-text drop-shadow-lg" />
                          <div className="text-xs font-bold text-white medal-text">
                            {exhibitor.companyName
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        {/* Medal ribbon effect */}
                        <div
                          className="absolute -bottom-1 w-6 h-3 rounded-b-full opacity-60"
                          style={{
                            background:
                              "linear-gradient(to right, #dc2626, #ef4444)",
                          }}
                        ></div>
                      </div>

                      <h4 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                        {exhibitor.companyName}
                      </h4>

                      {/* Custom Styled Badge */}
                      <div className="mb-4">
                        <Badge
                          className="text-white font-semibold px-4 py-2 shadow-lg text-sm"
                          style={{
                            background: `linear-gradient(135deg, ${EXHIBITION_STYLE.medalGradient})`,
                          }}
                        >
                          {EXHIBITION_STYLE.label}
                        </Badge>
                      </div>

                      {/* Website Button */}
                      {exhibitor.website && (
                        <button
                          onClick={() => handlePartnerClick(exhibitor.website!)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Store className="w-4 h-4" />
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
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
              Join our community of forward-thinking organizations and showcase
              your commitment to procurement excellence.
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

      {/* CSS Styles for Medal Effects */}
      <style>{`
      .medal-container {
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .medal-container:hover {
        transform: scale(1.05) rotate(5deg);
      }

      .medal-shine {
        position: relative;
        overflow: hidden;
      }

      .medal-shine::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent 40%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 60%
        );
        transform: rotate(45deg);
        animation: shine 3s infinite;
      }

      .medal-text {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      @keyframes shine {
        0% {
          transform: translateX(-100%) translateY(-100%) rotate(45deg);
        }
        100% {
          transform: translateX(100%) translateY(100%) rotate(45deg);
        }
      }

      .platinum-medal {
        background: linear-gradient(135deg, #e2e8f0, #f1f5f9, #cbd5e1);
        box-shadow: 0 4px 12px rgba(148, 163, 184, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .gold-medal {
        background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .silver-medal {
        background: linear-gradient(135deg, #94a3b8, #64748b, #475569);
        box-shadow: 0 4px 12px rgba(148, 163, 184, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .bronze-medal {
        background: linear-gradient(135deg, #d97706, #ea580c, #92400e);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .exhibition-medal {
        background: linear-gradient(135deg, #dc2626, #f43f5e, #b91c1c);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
    `}</style>
    </>
  );
}
