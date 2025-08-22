import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { UpcomingEventsSection } from "@/components/upcoming-events";
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
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
