import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Award, Building2, Globe, Users, Crown, Medal, Trophy, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

interface Sponsorship {
  id: string;
  companyName: string;
  website?: string;
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze';
  logo_url?: string;
  status: string;
}

const SPONSORSHIP_LEVELS = {
  platinum: {
    icon: Crown,
    color: 'bg-gradient-to-r from-gray-300 to-gray-500',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    priority: 1,
    label: 'Platinum Partner'
  },
  gold: {
    icon: Trophy,
    color: 'bg-gradient-to-r from-yellow-300 to-yellow-600',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-400',
    priority: 2,
    label: 'Gold Partner'
  },
  silver: {
    icon: Medal,
    color: 'bg-gradient-to-r from-gray-200 to-gray-400',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    priority: 3,
    label: 'Silver Partner'
  },
  bronze: {
    icon: Star,
    color: 'bg-gradient-to-r from-amber-600 to-amber-800',
    textColor: 'text-amber-100',
    borderColor: 'border-amber-500',
    priority: 4,
    label: 'Bronze Partner'
  }
};

const getPublicUrl = (path: string | undefined) => {
  if (!path) return null;
  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data?.publicUrl;
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
      const response = await apiRequest('GET', '/api/showcase/sponsorships');
      console.log('🔍 Sponsorships data received:', response);

      // Ensure we have an array before filtering
      const sponsorshipsArray = Array.isArray(response) ? response : [];

      // Filter only approved ones
      const approvedSponsors = sponsorshipsArray.filter((s: any) =>
        s.status === 'approved' || s.status === 'Approved'
      );

      console.log('🔍 Approved sponsorships:', approvedSponsors.length, 'items');
      setSponsorships(approvedSponsors);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching sponsorships:', err);
      const errorMessage = err?.message || 'Failed to load sponsorships';
      setError(errorMessage);
      setSponsorships([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Valued Partners</h2>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Valued Partners</h2>
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
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/70 text-blue-700 border border-blue-200 mb-4">
            Trusted Partners
          </div>
          <div className="flex items-center justify-center mb-2">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Our Valued Partners</h2>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            We're proud to partner with industry leaders who share our vision for procurement excellence across Africa.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {sponsorships.length} Partner{sponsorships.length !== 1 ? 's' : ''} Supporting Our Mission
            </span>
          </div>
        </div>

        {/* Debug Info */}
        {showEmptyState && (
          <div className="text-center mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Debug Info:</p>
            <p className="text-sm">Loading: {loading.toString()}</p>
            <p className="text-sm">Error: {error || 'none'}</p>
            <p className="text-sm">Sponsorships count: {sponsorships.length}</p>
          </div>
        )}

        {/* Sponsorships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedSponsorships.map((sponsor) => {
            const levelConfig = SPONSORSHIP_LEVELS[sponsor.sponsorshipLevel] || SPONSORSHIP_LEVELS.bronze; // Fallback to bronze
            const IconComponent = levelConfig.icon;

            return (
              <Card 
                key={sponsor.id} 
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${levelConfig.borderColor} bg-white overflow-hidden rounded-2xl`}
              >
                <CardContent className="p-0">
                  {/* Level Badge */}
                  <div className={`${levelConfig.color} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-5 h-5 ${levelConfig.textColor}`} />
                      <span className={`text-sm font-bold ${levelConfig.textColor}`}>
                        {levelConfig.label}
                      </span>
                    </div>
                    <Award className={`w-4 h-4 ${levelConfig.textColor}`} />
                  </div>

                  {/* Logo Section */}
                  <div className="p-6 flex flex-col items-center">
                    <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-blue-100 group-hover:ring-blue-300 transition-colors">
                      {sponsor.logo_url ? (
                        <img 
                          src={getPublicUrl(sponsor.logo_url) || ''} 
                          alt={`${sponsor.companyName} logo`}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${sponsor.logo_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Company Name */}
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-1 group-hover:text-blue-600 transition-colors">
                      {sponsor.companyName}
                    </h3>
                    <div className="mb-3">
                      <Badge variant="secondary" className="capitalize">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h3>
            <p className="text-gray-600 mb-6">
              Join our growing network of partners and help shape the future of procurement and capacity building in Africa.
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
      </div>
    </section>
  );
}
