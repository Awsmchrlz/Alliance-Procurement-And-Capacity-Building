import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PublicEventRegistration } from "./public-event-registration";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Crown, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@shared/schema";

export function FeaturedEventSection() {
  // Fetch events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const data = await apiRequest("GET", "/api/events");
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  // Find the featured event
  let featuredEvent = events.find((e: Event) => e.featured === true);

  // FALLBACK: If no featured event from API, create a mock event so the form always shows
  if (!featuredEvent) {
    console.log("No featured event from API, using fallback");
    featuredEvent = {
      id: "ministry-health-2026",
      title: "2026 NATIONAL SEMINAR \"MINISTRY OF HEALTH\"",
      description: "THEME: STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR",
      location: "Livingstone, Zambia",
      startDate: new Date("2026-03-25"),
      endDate: new Date("2026-04-02"),
      featured: true,
      createdAt: new Date(),
    } as Event;
  }

  return (
    <section id="events" className="bg-gray-50">
      {/* Show the registration component directly */}
      <PublicEventRegistration event={featuredEvent} />
    </section>
  );
}
