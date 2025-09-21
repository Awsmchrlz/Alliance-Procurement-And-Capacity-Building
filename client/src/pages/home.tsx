import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { UpcomingEventsSection } from "@/components/upcoming-events";
import { PartnershipSection } from "@/components/partnership-section";
import { PartnersShowcase } from "@/components/partners-showcase";
import { SponsorsShowcase } from "@/components/sponsors-showcase";
import { ExhibitionsShowcase } from "@/components/exhibitions-showcase";
import { AboutSection } from "@/components/about-section";
import { ServicesSection } from "@/components/services-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { TestimonialsSection } from "@/components/testimonial-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <HeroSection />
      <UpcomingEventsSection />
      <PartnershipSection />
      <PartnersShowcase />
      <AboutSection />
      <ServicesSection />
      <SponsorsShowcase />
      <ExhibitionsShowcase />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
