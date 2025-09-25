import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Award,
  Building2,
  Globe,
  Users,
  Crown,
  Medal,
  Trophy,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Sponsorship {
  id: string;
  companyName: string;
  website?: string;
  sponsorshipLevel: "platinum" | "gold" | "silver" | "bronze";
  status: string;
}

const SPONSORSHIP_LEVELS = {
  platinum: {
    icon: Crown,
    gradient: "from-slate-300 via-gray-200 to-slate-400",
    medalGradient: "#e2e8f0, #f1f5f9, #cbd5e1",
    shadow: "shadow-slate-400/60",
    ring: "ring-slate-400",
    text: "text-slate-900",
    bg: "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100",
    borderColor: "border-slate-400",
    priority: 1,
    label: "Platinum Partner",
  },
  gold: {
    icon: Trophy,
    gradient: "from-yellow-400 via-amber-400 to-yellow-600",
    medalGradient: "#fbbf24, #f59e0b, #d97706",
    shadow: "shadow-yellow-400/60",
    ring: "ring-yellow-400",
    text: "text-yellow-900",
    bg: "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100",
    borderColor: "border-yellow-400",
    priority: 2,
    label: "Gold Partner",
  },
  silver: {
    icon: Medal,
    gradient: "from-gray-400 via-slate-400 to-gray-500",
    medalGradient: "#94a3b8, #64748b, #475569",
    shadow: "shadow-gray-400/50",
    ring: "ring-gray-400",
    text: "text-gray-800",
    bg: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100",
    borderColor: "border-gray-400",
    priority: 3,
    label: "Silver Partner",
  },
  bronze: {
    icon: Star,
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    medalGradient: "#d97706, #ea580c, #92400e",
    shadow: "shadow-amber-500/60",
    ring: "ring-amber-500",
    text: "text-amber-900",
    bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
    borderColor: "border-amber-500",
    priority: 4,
    label: "Bronze Partner",
  },
};

export function SponsorshipsShowcase() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedSponsorships();
  }, []);

  const fetchApprovedSponsorships = async () => {
    try {
      setLoading(true);

      // Use new public showcase endpoint
      const response = await apiRequest("GET", "/api/showcase/sponsorships");
      // Ensure we have an array before filtering
      const sponsorshipsArray = Array.isArray(response) ? response : [];

      // Filter only approved ones
      const approvedSponsors = sponsorshipsArray.filter(
        (s: any) => s.status === "approved" || s.status === "Approved",
      );
      setSponsorships(approvedSponsors);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load sponsorships";
      setError(errorMessage);
      setSponsorships([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith("http") ? website : `https://${website}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Valued Partners
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Valued Partners
            </h2>
            <p className="text-red-600">Error loading sponsorships: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Temporarily show section even if empty to debug
  const showEmptyState = sponsorships.length === 0;

  // Sort sponsorships by level priority
  const sortedSponsorships = [...sponsorships].sort((a, b) => {
    const pa = SPONSORSHIP_LEVELS[a.sponsorshipLevel]?.priority || 99;
    const pb = SPONSORSHIP_LEVELS[b.sponsorshipLevel]?.priority || 99;
    return pa - pb;
  });

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/70 text-blue-700 border border-blue-200 mb-4">
            Trusted Partners
          </div>
          <div className="flex items-center justify-center mb-2">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Valued Partners
            </h2>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            We're proud to partner with industry leaders who share our vision
            for procurement excellence across Africa.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {sponsorships.length} Partner
              {sponsorships.length !== 1 ? "s" : ""} Supporting Our Mission
            </span>
          </div>
        </div>

        {/* Sponsorships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedSponsorships.map((sponsor) => {
            const levelConfig =
              SPONSORSHIP_LEVELS[sponsor.sponsorshipLevel] ||
              SPONSORSHIP_LEVELS.bronze; // Fallback to bronze
            const IconComponent = levelConfig.icon;

            return (
              <Card
                key={sponsor.id}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${levelConfig.borderColor} bg-white overflow-hidden rounded-2xl`}
              >
                <CardContent className="p-0">
                  {/* Level Badge */}
                  <div
                    className={`bg-gradient-to-r ${levelConfig.gradient} px-4 py-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-white" />
                      <span className="text-sm font-bold text-white">
                        {levelConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Medal Section */}
                  <div className="p-6 flex flex-col items-center">
                    <div
                      className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center relative overflow-hidden transform hover:scale-110 transition-all duration-300 shadow-lg`}
                      style={{
                        background: `linear-gradient(135deg, ${levelConfig.medalGradient})`,
                        boxShadow: `0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }}
                    >
                      {/* Metallic shine effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-transparent to-black/10"></div>

                      {/* Medal content */}
                      <div className="relative z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white mb-1 relative z-10 drop-shadow-lg" />
                        <div className="text-xs font-bold text-white relative z-10 drop-shadow-lg">
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
                          background: `linear-gradient(to right, ${levelConfig.medalGradient.split(", ")[0]}, ${levelConfig.medalGradient.split(", ")[2]})`,
                        }}
                      ></div>
                    </div>

                    {/* Company Name */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3 group-hover:text-blue-600 transition-colors">
                      {sponsor.companyName}
                    </h3>

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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisitWebsite(sponsor.website!)}
                        className="w-full flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Become a Partner
            </h3>
            <p className="text-gray-600 mb-6">
              Join our growing network of partners and help shape the future of
              procurement and capacity building in Africa.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Partner With Us
            </Button>
          </div>
        </div>
      )}
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
      `}</style>
    </>
  );
}
