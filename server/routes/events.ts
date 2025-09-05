import type { Express } from "express";
import { storage } from "../storage";
import { handleRouteError } from "./middleware";

export function registerEventRoutes(app: Express): void {
  // Get all public events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();

      // Filter out events that shouldn't be public or add public-only fields
      const publicEvents = events.map(event => ({
        ...event,
        // Remove any sensitive admin-only data if needed
        // For now, return all event data as it's generally public
      }));

      // Sort events by date (upcoming first)
      publicEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json(publicEvents);
    } catch (error) {
      handleRouteError(error, req, res, "events/list");
    }
  });

  // Get specific event details
  app.get("/api/events/:eventId", async (req, res) => {
    try {
      const { eventId } = req.params;

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Get registration stats for the event (public info)
      const registrations = await storage.getEventRegistrationsByEvent(eventId);
      const activeRegistrations = registrations.filter(
        r => r.paymentStatus !== "cancelled"
      );

      const eventWithStats = {
        ...event,
        registrationStats: {
          totalRegistrations: registrations.length,
          activeRegistrations: activeRegistrations.length,
          availableSpots: event.maxAttendees
            ? Math.max(0, event.maxAttendees - activeRegistrations.length)
            : null,
          isFull: event.maxAttendees
            ? activeRegistrations.length >= event.maxAttendees
            : false,
        }
      };

      res.json(eventWithStats);
    } catch (error) {
      handleRouteError(error, req, res, "events/details");
    }
  });

  // Get upcoming events only
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const events = await storage.getAllEvents();

      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) > now);

      // Sort by date (soonest first)
      upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Add registration availability info
      const eventsWithAvailability = await Promise.all(
        upcomingEvents.map(async (event) => {
          try {
            const registrations = await storage.getEventRegistrationsByEvent(event.id);
            const activeRegistrations = registrations.filter(
              r => r.paymentStatus !== "cancelled"
            );

            return {
              ...event,
              currentRegistrations: activeRegistrations.length,
              availableSpots: event.maxAttendees
                ? Math.max(0, event.maxAttendees - activeRegistrations.length)
                : null,
              isFull: event.maxAttendees
                ? activeRegistrations.length >= event.maxAttendees
                : false,
            };
          } catch (error) {
            console.error(`Error getting stats for event ${event.id}:`, error);
            return {
              ...event,
              currentRegistrations: 0,
              availableSpots: event.maxAttendees || null,
              isFull: false,
            };
          }
        })
      );

      res.json(eventsWithAvailability);
    } catch (error) {
      handleRouteError(error, req, res, "events/upcoming");
    }
  });

  // Get past events
  app.get("/api/events/past", async (req, res) => {
    try {
      const events = await storage.getAllEvents();

      const now = new Date();
      const pastEvents = events.filter(event => new Date(event.date) <= now);

      // Sort by date (most recent first)
      pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(pastEvents);
    } catch (error) {
      handleRouteError(error, req, res, "events/past");
    }
  });

  // Get events by category/type
  app.get("/api/events/category/:category", async (req, res) => {
    try {
      const { category } = req.params;

      const events = await storage.getAllEvents();
      const categoryEvents = events.filter(event =>
        event.category && event.category.toLowerCase() === category.toLowerCase()
      );

      // Sort by date (upcoming first)
      categoryEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json(categoryEvents);
    } catch (error) {
      handleRouteError(error, req, res, "events/category");
    }
  });

  // Search events
  app.get("/api/events/search", async (req, res) => {
    try {
      const { q: query, location, date_from, date_to } = req.query;

      let events = await storage.getAllEvents();

      // Text search
      if (query && typeof query === 'string') {
        const searchTerm = query.toLowerCase();
        events = events.filter(event =>
          event.title?.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm)
        );
      }

      // Location filter
      if (location && typeof location === 'string') {
        const locationTerm = location.toLowerCase();
        events = events.filter(event =>
          event.location?.toLowerCase().includes(locationTerm)
        );
      }

      // Date range filter
      if (date_from && typeof date_from === 'string') {
        const fromDate = new Date(date_from);
        events = events.filter(event => new Date(event.date) >= fromDate);
      }

      if (date_to && typeof date_to === 'string') {
        const toDate = new Date(date_to);
        events = events.filter(event => new Date(event.date) <= toDate);
      }

      // Sort by relevance (upcoming events first, then by date)
      const now = new Date();
      events.sort((a, b) => {
        const aIsUpcoming = new Date(a.date) > now;
        const bIsUpcoming = new Date(b.date) > now;

        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;

        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      res.json({
        query: {
          search: query,
          location,
          date_from,
          date_to,
        },
        results: events,
        count: events.length,
      });
    } catch (error) {
      handleRouteError(error, req, res, "events/search");
    }
  });
}
