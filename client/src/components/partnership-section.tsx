import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Award, Medal, Star, Store, CheckCircle, ArrowRight } from 'lucide-react';
import { SponsorshipDialog } from './sponsorship-dialog';
import { ExhibitionDialog } from './exhibition-dialog';
import { Event } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PartnershipSectionProps {
  event?: Event;
}

const SPONSORSHIP_PACKAGES = [
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: 15000,
    currency: 'USD',
    icon: Crown,
    color: 'from-slate-300 via-slate-400 to-slate-500',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-400',
    popular: false,
    benefits: [
      'Prime logo placement on all conference materials and media',
      'Speaking slot (15 minutes) at the Opening Ceremony',
      'Branded keynote session (optional co-hosting)',
      'Booth in prime location at exhibition space',
      'Branding on conference bags, lanyards, and banners',
      '10 complimentary full conference passes',
      'Company promotional materials in all delegate packs',
      'One exclusive sponsored side event',
      'Recognition in all press releases, newsletters, and social media',
      'Meet-and-greet with the Guest of honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: 13000,
    currency: 'USD',
    icon: Award,
    color: 'from-yellow-400 via-yellow-500 to-yellow-600',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-500',
    popular: false,
    benefits: [
      'Featured logo on banners, Facebook, and social media',
      '10-minute speaking slot in plenary session',
      'Booth at exhibition space',
      'Branding during one key session',
      '6 complimentary full conference passes',
      'Company materials in delegate packs',
      'Social media mentions and interview opportunities',
      'Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: 11000,
    currency: 'USD',
    icon: Medal,
    color: 'from-gray-300 via-gray-400 to-gray-500',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-400',
    popular: false,
    benefits: [
      'Logo placement on Facebook, and printed programs',
      'Exhibition booth',
      '4 complimentary passes',
      'Opportunity to host a breakout session or technical workshop',
      'Inclusion in media and social media coverage',
      'Meet-and-greet with the Guest of Honor, keynote speakers and dignitaries'
    ]
  },
  {
    id: 'bronze',
    name: 'Bronze Sponsor',
    price: 9000,
    currency: 'USD',
    icon: Star,
    color: 'from-amber-600 via-amber-700 to-amber-800',
    textColor: 'text-amber-100',
    borderColor: 'border-amber-600',
    popular: false,
    benefits: [
      'Logo on Facebook page and printed program',
      '2 complimentary passes',
      'Shared booth space',
      'Company literature in delegate packs'
    ]
  }
];

const EXHIBITION_PACKAGE = {
  name: 'Exhibition Package',
  price: 7000,
  currency: 'USD',
  icon: Store,
  color: 'from-red-600 via-red-700 to-red-800',
  textColor: 'text-red-100',
  borderColor: 'border-red-600',
  benefits: [
    'Booth at exhibition space',
    '1 complimentary pass',
    'Logo on exhibitor\'s page in program and online'
  ]
};

export function PartnershipSection({ event: propEvent }: PartnershipSectionProps) {
  const [sponsorshipDialogOpen, setSponsorshipDialogOpen] = useState(false);
  const [exhibitionDialogOpen, setExhibitionDialogOpen] = useState(false);
  const [expandedBenefits, setExpandedBenefits] = useState<{[key: string]: boolean}>({});

  // Fetch events if no event is provided
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return await response.json();
    },
    enabled: !propEvent,
  });

  // Use provided event or first available event
  const event = propEvent || (Array.isArray(events) && events.length > 0 ? events[0] : null);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join us as a sponsor or exhibitor and showcase your brand to industry leaders, 
            decision-makers, and professionals in procurement and capacity building.
          </p>
        </div>

        {/* Sponsorship Packages */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sponsorship Packages</h3>
            <p className="text-gray-600">Choose the sponsorship level that aligns with your marketing objectives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPONSORSHIP_PACKAGES.map((pkg) => {
              const IconComponent = pkg.icon;
              return (
                <Card 
                  key={pkg.id} 
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  
                  <CardHeader className={`text-center bg-gradient-to-r ${pkg.color} text-white`}>
                    <div className="w-12 h-12 mx-auto mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                      <IconComponent className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                    <CardDescription className="text-white/90">
                      <span className="text-2xl font-bold">${pkg.price.toLocaleString()}</span>
                      <span className="text-sm ml-1">{pkg.currency}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {(expandedBenefits[pkg.id] ? pkg.benefits : pkg.benefits.slice(0, 4)).map((benefit, index) => (
                        <div key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                      {pkg.benefits.length > 4 && (
                        <button
                          onClick={() => setExpandedBenefits(prev => ({ ...prev, [pkg.id]: !prev[pkg.id] }))}
                          className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                        >
                          {expandedBenefits[pkg.id] ? (
                            <>
                              <span>Show less</span>
                              <span className="text-xs">▲</span>
                            </>
                          ) : (
                            <>
                              <span>+{pkg.benefits.length - 4} more benefits</span>
                              <span className="text-xs">▼</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setSponsorshipDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-[#1C356B] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1C356B] text-white"
                      disabled={!event}
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Exhibition Package */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Exhibition Package</h3>
            <p className="text-gray-600">Showcase your products and services to conference attendees</p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className={`text-center bg-gradient-to-r ${EXHIBITION_PACKAGE.color} text-white`}>
                <div className="w-12 h-12 mx-auto mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Store className="w-full h-full text-white" />
                </div>
                <CardTitle className="text-lg font-bold">{EXHIBITION_PACKAGE.name}</CardTitle>
                <CardDescription className="text-white/90">
                  <span className="text-2xl font-bold">${EXHIBITION_PACKAGE.price.toLocaleString()}</span>
                  <span className="text-sm ml-1">{EXHIBITION_PACKAGE.currency}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {EXHIBITION_PACKAGE.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => setExhibitionDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  disabled={!event}
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need More Information?</h3>
          <p className="text-gray-600 mb-6">
            Our partnership team is ready to help you find the perfect sponsorship or exhibition package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Phone:</span>
              <span className="ml-2">+260 974486945 | +260 977675449 | +260 968579172</span>
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