import {
  Mail,
  Phone,
  MapPin,
  Handshake,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { LocationModal } from "./location-modal";

export function Footer() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const quickLinks = [
    { href: "#about", label: "About Us" },
    { href: "#services", label: "Our Services" },
    { href: "#events", label: "Training Events" },
    { href: "#", label: "Resources" },
  ];

  const servicesLinks = [
    { href: "#", label: "Capacity Building" },
    { href: "#", label: "Procurement Advisory" },
    { href: "#", label: "Compliance Audit" },
    { href: "#", label: "Tender Management" },
    { href: "#", label: "Research Services" },
  ];

  return (
    <footer
      id="contact"
      className="bg-dark-gray dark:bg-gray-900 text-white py-16 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
                <Handshake className="text-primary-blue w-6 h-6" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  data-testid="footer-logo-title"
                >
                  APCB Ltd
                </h1>
                <p
                  className="text-sm text-gray-400"
                  data-testid="footer-logo-subtitle">
                  Supply Chain Matters
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-6" data-testid="footer-description">
              Leading procurement and capacity building solutions across
              Southern Africa, empowering professionals with world-class
              training and consultancy services.
            </p>
            <div className="flex space-x-4">
              <Facebook
                className="text-gray-400 hover:text-primary-yellow cursor-pointer transition-colors w-5 h-5"
                data-testid="footer-social-facebook"
              />
              <Twitter
                className="text-gray-400 hover:text-primary-yellow cursor-pointer transition-colors w-5 h-5"
                data-testid="footer-social-twitter"
              />
              <Linkedin
                className="text-gray-400 hover:text-primary-yellow cursor-pointer transition-colors w-5 h-5"
                data-testid="footer-social-linkedin"
              />
              <Youtube
                className="text-gray-400 hover:text-primary-yellow cursor-pointer transition-colors w-5 h-5"
                data-testid="footer-social-youtube"
              />
            </div>
          </div>

          <div>
            <h3
              className="text-lg font-semibold mb-6"
              data-testid="footer-quick-links-title"
            >
               Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary-yellow transition-colors"
                    data-testid={`footer-quick-link-${index}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-lg font-semibold mb-6"
              data-testid="footer-services-title"
            >
              Services
            </h3>
            <ul className="space-y-3">
              {servicesLinks.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="text-gray-300 hover:text-primary-yellow transition-colors"
                    data-testid={`footer-service-link-${index}`}
                  >
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-lg font-semibold mb-6"
              data-testid="footer-contact-title"
            >
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="text-primary-yellow mr-3 mt-1 w-4 h-4" />
                <div>
                  <p
                    className="text-gray-300"
                    data-testid="footer-contact-email"
                  >
                    globaltrainingalliance@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="text-primary-yellow mr-3 mt-1 w-4 h-4" />
                <div className="space-y-1">
                  <a
                    href="tel:+260974486945"
                    className="block text-gray-300 hover:text-primary-yellow transition-colors cursor-pointer"
                    data-testid="footer-contact-phone-1"
                  >
                    +260 974486945
                  </a>
                  <a
                    href="tel:+260977897943"
                    className="block text-gray-300 hover:text-primary-yellow transition-colors cursor-pointer"
                    data-testid="footer-contact-phone-2"
                  >
                    +260977897943
                  </a>
                  <a
                    href="tel:+260977414203"
                    className="block text-gray-300 hover:text-primary-yellow transition-colors cursor-pointer"
                    data-testid="footer-contact-phone-3"
                  >
                    +260977414203
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-primary-yellow mr-3 mt-1 w-4 h-4" />
                <div>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-gray-300 hover:text-primary-yellow transition-colors cursor-pointer text-left"
                    data-testid="footer-contact-location"
                  >
                    Lusaka, Zambia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-gray-400">
            <p data-testid="footer-copyright">
              &copy; 2025 Alliance Procurement & Capacity Building Ltd. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
      
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </footer>
  );
}
