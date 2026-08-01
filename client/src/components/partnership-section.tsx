import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Crown,
  Award,
  Medal,
  Star,
  Store,
  ArrowRight,
  Globe,
  MapPin,
} from "lucide-react";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { SponsorshipDialog } from "./sponsorship-dialog";
import { ExhibitionDialog } from "./exhibition-dialog";
import { useGeolocation, getPreferredCurrency } from "@/hooks/use-geolocation";

interface PartnershipSectionProps {
  event?: Event;
}

type CurrencyType = "local" | "international";

const SPONSORSHIP_PACKAGES = [
  {
    id: "platinum",
    name: "Platinum Sponsor",
    priceUSD: 12500,
    priceZMW: 250000,
    icon: Crown,
    color: "from-slate-300 via-slate-400 to-slate-500",
    textColor: "text-slate-800",
    borderColor: "border-slate-400",
    popular: false,
    featured: true,
    benefits: [
      "Speaking slot 15 minutes every day.",
      "Booth in prime location at exhibition space.",
      "Branding on conference bags, lanyards, and banners.",
      "Company promotional materials in all delegate packs.",
      "Recognition in all press releases, newsletters, and social media.",
      "Meet-and-greet with the Guest of honor, keynote speakers and dignitaries.",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    priceUSD: 5000,
    priceZMW: 100000,
    icon: Award,
    color: "from-yellow-400 via-yellow-500 to-yellow-600",
    textColor: "text-yellow-900",
    borderColor: "border-yellow-500",
    popular: false,
    featured: false,
    benefits: [
      "Featured logo on banners, Facebook, Website and social media.",
      "10-minute speaking slot in plenary session.",
      "Booth at exhibition space.",
      "Branding during one key session.",
      "Speaking slot 9 minutes every day.",
      "Company materials in delegate packs.",
      "Social media mentions and interview opportunities.",
      "Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    priceUSD: 2500,
    priceZMW: 50000,
    icon: Medal,
    color: "from-gray-300 via-gray-400 to-gray-500",
    textColor: "text-gray-800",
    borderColor: "border-gray-400",
    popular: false,
    featured: false,
    benefits: [
      "Logo placement on Facebook, Website and printed programs.",
      "Exhibition booth.",
      "Opportunity to host a breakout session workshop.",
      "Inclusion in media and social media coverage.",
      "Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries",
    ],
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    priceUSD: 1500,
    priceZMW: 30000,
    icon: Star,
    color: "from-amber-600 via-amber-700 to-amber-800",
    textColor: "text-amber-100",
    borderColor: "border-amber-600",
    popular: false,
    featured: false,
    benefits: [
      "Logo on Facebook page, Website and printed program.",
      "Shared booth space.",
      "Company literature in delegate packs.",
    ],
  },
];

const EXHIBITION_PACKAGES = [
  {
    id: "exhibitor_institutional",
    name: "Institutional Exhibitor",
    priceUSD: 1750,
    priceZMW: 35000,
    icon: Store,
    color: "from-red-600 via-red-700 to-red-800",
    textColor: "text-red-100",
    borderColor: "border-red-600",
    benefits: [
      "Booth at exhibition space.",
      "Logo on exhibitor’s page in program and online.",
    ],
  },
  {
    id: "exhibitor_individual",
    name: "Individual Exhibitor",
    priceUSD: 645,
    priceZMW: 12850,
    icon: Store,
    color: "from-blue-600 via-blue-700 to-blue-800",
    textColor: "text-blue-100",
    borderColor: "border-blue-600",
    benefits: [
      "Booth at exhibition space.",
      "Logo on exhibitor’s page in program and online.",
    ],
  }
];

export function PartnershipSection({
  event: propEvent,
}: PartnershipSectionProps) {
  const [sponsorshipDialogOpen, setSponsorshipDialogOpen] = useState(false);
  const [exhibitionDialogOpen, setExhibitionDialogOpen] = useState(false);
  const [expandedBenefits, setExpandedBenefits] = useState<{
    [key: string]: boolean;
  }>({});
  const [currencyType, setCurrencyType] =
    useState<CurrencyType>("international");

  // Get user's location for automatic currency detection
  const locationData = useGeolocation();

  // Automatically set currency based on location
  useEffect(() => {
    if (!locationData.isLoading && !locationData.error) {
      const preferredCurrency = getPreferredCurrency(locationData.isZambia);
      const newCurrencyType =
        preferredCurrency === "ZMW" ? "local" : "international";
      setCurrencyType(newCurrencyType);

      console.log("🌍 Auto-detected currency:", {
        country: locationData.country,
        isZambia: locationData.isZambia,
        currency: preferredCurrency,
        currencyType: newCurrencyType,
      });
    }
  }, [locationData.isLoading, locationData.error, locationData.isZambia]);

  // Fetch events if no event is provided
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return await response.json();
    },
    enabled: !propEvent,
  });

  let defaultEvent = Array.isArray(events) ? events.find(e => 
    e.title.toLowerCase().includes("women in action") ||
    e.title.toLowerCase().includes("women in leadership") || 
    e.title.toLowerCase().includes("women leadership")
  ) : undefined;

  if (!defaultEvent && Array.isArray(events)) {
    defaultEvent = events.find(e => e.featured === true) || (events.length > 0 ? events[0] : null);
  }

  // Use provided event or the prioritized default event
  const event = propEvent || defaultEvent;


  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Join us as a sponsor or exhibitor and showcase your brand to
            industry leaders, decision-makers, and professionals in procurement
            and capacity building.
          </p>

          {/* Currency Toggle with Location Detection */}
          <div className="flex flex-col items-center justify-center mb-8">
            {/* Location Detection Status */}
            {locationData.isLoading ? (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-primary-yellow border-t-transparent rounded-full animate-spin"></div>
                  Detecting your location...
                </div>
              </div>
            ) : (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-yellow" />
                  {locationData.error ? (
                    <span>
                      Location unknown - You can manually select currency
                    </span>
                  ) : (
                    <span>
                      Detected: <strong>{locationData.country}</strong>
                      {locationData.isZambia && (
                        <span className="text-primary-yellow ml-1">🇿🇲</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Currency Toggle */}
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrencyType("local")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    currencyType === "local"
                      ? "bg-primary-yellow text-white shadow-md"
                      : "text-gray-600 hover:text-primary-blue"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Local (ZMW)
                  {locationData.isZambia && !locationData.isLoading && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">
                      Auto
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrencyType("international")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    currencyType === "international"
                      ? "bg-primary-yellow text-white shadow-md"
                      : "text-gray-600 hover:text-primary-blue"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  International (USD)
                  {!locationData.isZambia &&
                    !locationData.isLoading &&
                    !locationData.error && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">
                        Auto
                      </span>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Packages */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Sponsorship Packages
            </h3>
            <p className="text-gray-600">
              Choose the sponsorship level that aligns with your marketing
              objectives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {SPONSORSHIP_PACKAGES.map((pkg) => {
              const IconComponent = pkg.icon;
              return (
                <Card
                  key={pkg.id}
                  className={`overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border-0 h-full flex flex-col ${
                    pkg.featured
                      ? "ring-2 ring-primary-yellow ring-opacity-50"
                      : ""
                  }`}
                >
                  {/* Header Section - Similar to Event Card */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Badge and Title */}
                    <div className="mb-4">
                      <div className="flex items-center mb-3">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            pkg.featured
                              ? "bg-primary-yellow text-white"
                              : "bg-primary-yellow/20 text-primary-blue"
                          }`}
                        >
                          {pkg.featured ? "PREMIUM" : "SPONSOR"}
                        </div>
                        <div
                          className={`ml-3 h-0.5 flex-1 ${
                            pkg.featured
                              ? "bg-primary-yellow"
                              : "bg-primary-yellow/30"
                          }`}
                        ></div>
                      </div>

                      {/* Icon and Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-12 h-12 p-2 rounded-xl bg-gradient-to-r ${pkg.color}`}
                        >
                          <IconComponent className="w-full h-full text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary-blue text-xl leading-tight">
                            {pkg.name}
                          </h3>
                          {pkg.featured && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-primary-yellow fill-current" />
                              <span className="text-xs text-primary-yellow font-semibold">
                                Premium Package
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="mb-4 flex flex-col gap-1">
                      <div className="text-2xl font-bold text-primary-blue">
                        {currencyType === "local" 
                          ? `ZMW ${pkg.priceZMW.toLocaleString()}` 
                          : `USD ${pkg.priceUSD.toLocaleString()}`}
                      </div>
                      <div className="text-sm font-semibold text-gray-500 bg-gray-100 py-1 px-2 rounded-md w-fit">
                        {currencyType === "local" 
                          ? `USD ${pkg.priceUSD.toLocaleString()}` 
                          : `ZMW ${pkg.priceZMW.toLocaleString()}`}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 flex-grow">
                      {(expandedBenefits[pkg.id]
                        ? pkg.benefits
                        : pkg.benefits.slice(0, 4)
                      ).map((benefit, index) => (
                        <div key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                      {pkg.benefits.length > 4 && (
                        <button
                          onClick={() =>
                            setExpandedBenefits((prev) => ({
                              ...prev,
                              [pkg.id]: !prev[pkg.id],
                            }))
                          }
                          className="text-xs text-primary-blue font-medium hover:text-primary-yellow transition-colors duration-200 flex items-center gap-1"
                        >
                          {expandedBenefits[pkg.id] ? (
                            <>
                              <span>Show less</span>
                              <span className="text-xs">▲</span>
                            </>
                          ) : (
                            <>
                              <span>
                                +{pkg.benefits.length - 4} more benefits
                              </span>
                              <span className="text-xs">▼</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Apply Button - Consistent with Event Card */}
                    <div className="pt-6 mt-auto">
                      {pkg.featured ? (
                        <div className="space-y-3">
                          <div className="bg-primary-yellow/10 p-3 rounded-lg border border-primary-yellow/30">
                            <div className="text-center">
                              <h4 className="font-bold text-primary-blue mb-1 text-sm">
                                Ready to Partner?
                              </h4>
                              <p className="text-primary-blue text-xs mb-2">
                                Secure your premium sponsorship package
                              </p>
                              <Button
                                onClick={() => setSponsorshipDialogOpen(true)}
                                className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg uppercase tracking-wider flex items-center gap-2 mx-auto"
                                disabled={!event}
                              >
                                Apply Now
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Button
                            onClick={() => setSponsorshipDialogOpen(true)}
                            className="w-full bg-primary-yellow hover:bg-primary-yellow/80 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:shadow-lg"
                            disabled={!event}
                          >
                            Apply Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Exhibition Package */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Exhibition Package
            </h3>
            <p className="text-gray-600">
              Showcase your products and services to conference attendees
            </p>
          </div>

          {/* Exhibition Package - Special Layout */}
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {EXHIBITION_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border-0">
                <div className="p-6">
                  {/* Badge and Title */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500 text-white">
                        EXHIBITION
                      </div>
                      <div className="ml-3 h-0.5 flex-1 bg-red-500/30"></div>
                    </div>

                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-12 h-12 p-2 rounded-xl bg-gradient-to-r ${pkg.color}`}
                      >
                        <Store className="w-full h-full text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary-blue text-xl leading-tight">
                          {pkg.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="mb-4 flex flex-col gap-1">
                    <div className="text-2xl font-bold text-primary-blue">
                      {currencyType === "local" 
                        ? `ZMW ${pkg.priceZMW.toLocaleString()}` 
                        : `USD ${pkg.priceUSD.toLocaleString()}`}
                    </div>
                    <div className="text-sm font-semibold text-gray-500 bg-gray-100 py-1 px-2 rounded-md w-fit">
                      {currencyType === "local" 
                        ? `USD ${pkg.priceUSD.toLocaleString()}` 
                        : `ZMW ${pkg.priceZMW.toLocaleString()}`}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {pkg.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <div className="pt-3">
                    <div className="text-center">
                      <Button
                        onClick={() => setExhibitionDialogOpen(true)}
                        className="w-full bg-primary-yellow hover:bg-primary-yellow/80 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:shadow-lg"
                        disabled={!event}
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Need More Information?
          </h3>
          <p className="text-gray-600 mb-6">
            Our partnership team is ready to help you find the perfect
            sponsorship or exhibition package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Phone:</span>
              <span className="ml-2">
                +260 974486945 | +260 977675449 | +260 968579172
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Email:</span>
              <span className="ml-2">globaltrainingalliance@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {event && (
        <>
          <SponsorshipDialog
            open={sponsorshipDialogOpen}
            onOpenChange={setSponsorshipDialogOpen}
            event={event}
            onSuccess={() => setSponsorshipDialogOpen(false)}
          />

          <ExhibitionDialog
            open={exhibitionDialogOpen}
            onOpenChange={setExhibitionDialogOpen}
            event={event}
            onSuccess={() => setExhibitionDialogOpen(false)}
          />
        </>
      )}
    </section>
  );
}
