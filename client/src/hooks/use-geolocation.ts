import { useState, useEffect } from 'react';

export interface LocationData {
  country: string;
  countryCode: string;
  isZambia: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [locationData, setLocationData] = useState<LocationData>({
    country: '',
    countryCode: '',
    isZambia: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try multiple free IP geolocation services for reliability
        const services = [
          'https://ipapi.co/json/',
          'http://ip-api.com/json/',
          'https://ipinfo.io/json',
        ];

        let locationDetected = false;

        for (const serviceUrl of services) {
          if (locationDetected) break;

          try {
            const response = await fetch(serviceUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });

            if (!response.ok) continue;

            const data = await response.json();
            
            // Handle different API response formats
            let country = '';
            let countryCode = '';

            if (serviceUrl.includes('ipapi.co')) {
              country = data.country_name || '';
              countryCode = data.country_code || '';
            } else if (serviceUrl.includes('ip-api.com')) {
              country = data.country || '';
              countryCode = data.countryCode || '';
            } else if (serviceUrl.includes('ipinfo.io')) {
              country = data.country || '';
              countryCode = data.country || '';
            }

            if (country && countryCode) {
              const isZambia = countryCode.toLowerCase() === 'zm' || 
                              country.toLowerCase().includes('zambia');

              setLocationData({
                country,
                countryCode: countryCode.toUpperCase(),
                isZambia,
                isLoading: false,
                error: null,
              });

              locationDetected = true;
              
              // Store in localStorage for future use
              localStorage.setItem('userLocation', JSON.stringify({
                country,
                countryCode: countryCode.toUpperCase(),
                isZambia,
                timestamp: Date.now(),
              }));

              console.log('🌍 Location detected:', { country, countryCode, isZambia });
              break;
            }
          } catch (serviceError) {
            console.warn(`Failed to fetch from ${serviceUrl}:`, serviceError);
            continue;
          }
        }

        // If all services failed, check localStorage for cached data
        if (!locationDetected) {
          const cached = localStorage.getItem('userLocation');
          if (cached) {
            try {
              const cachedData = JSON.parse(cached);
              // Use cached data if it's less than 24 hours old
              if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
                setLocationData({
                  country: cachedData.country,
                  countryCode: cachedData.countryCode,
                  isZambia: cachedData.isZambia,
                  isLoading: false,
                  error: null,
                });
                console.log('🌍 Using cached location:', cachedData);
                return;
              }
            } catch (e) {
              console.warn('Failed to parse cached location data:', e);
            }
          }

          // If no cached data or all services failed, default to international
          setLocationData({
            country: 'Unknown',
            countryCode: 'XX',
            isZambia: false,
            isLoading: false,
            error: 'Unable to detect location. Defaulting to international pricing.',
          });
          
          console.log('🌍 Location detection failed, defaulting to international');
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        setLocationData({
          country: 'Unknown',
          countryCode: 'XX',
          isZambia: false,
          isLoading: false,
          error: 'Location detection failed',
        });
      }
    };

    detectLocation();
  }, []);

  return locationData;
}

// Helper function to get preferred currency based on location
export function getPreferredCurrency(isZambia: boolean): 'USD' | 'ZMW' {
  return isZambia ? 'ZMW' : 'USD';
}

// Helper function to get currency display name
export function getCurrencyDisplayName(currency: 'USD' | 'ZMW'): string {
  return currency === 'ZMW' ? 'Zambian Kwacha' : 'US Dollars';
}
