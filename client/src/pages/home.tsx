import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { PartnershipSection } from "@/components/partnership-section";
import { PartnersShowcase } from "@/components/partners-showcase";
import { SponsorshipsShowcase } from "@/components/sponsorships-showcase";
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
      <PartnershipSection />
      <AboutSection />
      <ServicesSection />
      <PartnersShowcase />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
