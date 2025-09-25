import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Building,
  Briefcase,
  Users,
  ExternalLink,
  Globe,
  MapPin,
  Zap,
  Wifi,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Exhibition {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  website?: string;
  companyAddress?: string;
  boothSize: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentEvidence?: string;
  productsServices?: string;
  boothRequirements?: string;
  electricalRequirements: boolean;
  internetRequirements: boolean;
  notes?: string;
  submittedAt: string;
  updatedAt: string;
}

const EXHIBITION_MEDAL_STYLE = {
  gradient: "from-red-500 via-red-600 to-red-700",
  shadow: "shadow-red-500/60",
  ring: "ring-red-400",
  text: "text-red-900",
  bg: "bg-gradient-to-br from-red-100 via-red-50 to-red-200",
};

export function ExhibitionsShowcase() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedExhibitions();
  }, []);

  const fetchApprovedExhibitions = async () => {
    try {
      setLoading(true);

      // Use new public showcase endpoint
      const response = await apiRequest("GET", "/api/showcase/exhibitions");

      // Ensure we have an array before filtering
      const exhibitionsArray = Array.isArray(response) ? response : [];

      // Filter only approved ones
      const approvedExhibitions = exhibitionsArray.filter(
        (e: any) => e.status === "approved" || e.status === "Approved",
      );

      setExhibitions(approvedExhibitions);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching exhibitions:", err);
      const errorMessage = err?.message || "Failed to load exhibitions";
      setError(errorMessage);
      setExhibitions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const exhibitionsArray = exhibitions;

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Our <span className="text-red-600">Exhibitors</span>
            </h2>
            <p className="text-gray-600 mb-6">
              Discover innovative solutions and services
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Exhibitors
            </h2>
            <p className="text-red-600">Error loading exhibitions: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  const showEmptyState = exhibitions.length === 0;

  const handleExhibitorClick = (website?: string) => {
    if (website) {
      // Ensure the URL has a protocol
      const url = website.startsWith("http") ? website : `https://${website}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/70 text-red-700 border border-red-200 mb-4">
            Featured Exhibitors
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Our <span className="text-red-600">Exhibitors</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Discover solutions and services from leading companies showcasing at
            our events.
          </p>
        </div>

        {/* Continuous Scrolling Exhibitions */}
        {exhibitionsArray.length >= 4 && (
          <div className="mb-16">
            <div className="relative overflow-hidden group">
              <div className="flex animate-scroll-reverse group-hover:[animation-play-state:paused] space-x-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                {[...exhibitionsArray, ...exhibitionsArray].map(
                  (exhibition: Exhibition, index) => {
                    return (
                      <div
                        key={`${exhibition.id}-${index}`}
                        className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden transform hover:-translate-y-1"
                        onClick={() => handleExhibitorClick(exhibition.website)}
                      >
                        <div
                          className={`h-24 ${EXHIBITION_MEDAL_STYLE.bg} flex items-center justify-center p-4 border-b-2 border-red-100`}
                        >
                          <div
                            className={`w-18 h-18 rounded-full ${EXHIBITION_MEDAL_STYLE.bg} border-3 ${EXHIBITION_MEDAL_STYLE.ring} ${EXHIBITION_MEDAL_STYLE.shadow} shadow-xl flex items-center justify-center relative overflow-hidden transform hover:scale-110 transition-all duration-300`}
                          >
                            {/* Metallic shine effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-transparent to-black/10"></div>

                            {/* Medal content */}
                            <div
                              className={`relative z-10 w-14 h-14 rounded-full bg-gradient-to-r ${EXHIBITION_MEDAL_STYLE.gradient} shadow-lg flex flex-col items-center justify-center border-2 border-white/30`}
                            >
                              {/* Inner shine */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                              <Store className="w-5 h-5 text-white mb-0.5 relative z-10 drop-shadow-sm" />
                              <div className="text-[10px] font-bold text-white relative z-10 drop-shadow-sm">
                                {exhibition.companyName
                                  .split(" ")
                                  .map((word) => word.charAt(0))
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                            </div>

                            {/* Medal ribbon effect */}
                            <div
                              className={`absolute -bottom-1 w-6 h-3 bg-gradient-to-r ${EXHIBITION_MEDAL_STYLE.gradient} rounded-b-full opacity-80`}
                            ></div>
                          </div>
                        </div>
                        <div className="p-5 border-t-4 bg-gradient-to-r from-red-500 to-red-600">
                          <h3 className="font-bold text-lg text-white truncate">
                            {exhibition.companyName}
                          </h3>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}

        {/* Static Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {exhibitionsArray.map((exhibition: Exhibition) => (
            <div
              key={exhibition.id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-red-100 overflow-hidden cursor-pointer hover:-translate-y-1"
              onClick={() => handleExhibitorClick(exhibition.website)}
            >
              <div
                className={`h-32 ${EXHIBITION_MEDAL_STYLE.bg} flex items-center justify-center p-4`}
              >
                <div
                  className={`w-24 h-24 rounded-full ${EXHIBITION_MEDAL_STYLE.bg} border-3 ${EXHIBITION_MEDAL_STYLE.ring} ${EXHIBITION_MEDAL_STYLE.shadow} shadow-2xl flex items-center justify-center relative overflow-hidden transform hover:scale-110 transition-all duration-300`}
                >
                  {/* Metallic shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-transparent to-black/10"></div>

                  {/* Medal content */}
                  <div
                    className={`relative z-10 w-18 h-18 rounded-full bg-gradient-to-r ${EXHIBITION_MEDAL_STYLE.gradient} shadow-xl flex flex-col items-center justify-center border-2 border-white/30`}
                  >
                    {/* Inner shine */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                    <Store className="w-6 h-6 text-white mb-1 relative z-10 drop-shadow-sm" />
                    <div className="text-xs font-bold text-white relative z-10 drop-shadow-sm">
                      {exhibition.companyName
                        .split(" ")
                        .map((word) => word.charAt(0))
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  </div>

                  {/* Medal ribbon effect */}
                  <div
                    className={`absolute -bottom-1 w-8 h-4 bg-gradient-to-r ${EXHIBITION_MEDAL_STYLE.gradient} rounded-b-full opacity-80`}
                  ></div>
                </div>
              </div>
              <div className="p-5 border-t-4 bg-gradient-to-r from-red-500 to-red-600">
                <h3 className="font-bold text-lg text-white truncate">
                  {exhibition.companyName}
                </h3>
                <div className="flex items-center justify-between text-white/80">
                  {exhibition.website && (
                    <a
                      href={
                        exhibition.website.startsWith("http")
                          ? exhibition.website
                          : `https://${exhibition.website}`
                      }
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 text-sm text-white hover:text-white/80 font-medium"
                    >
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
            Join our exhibition space to connect with potential clients,
            showcase your products and services, and expand your business
            network.
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
