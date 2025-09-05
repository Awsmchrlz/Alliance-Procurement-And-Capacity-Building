import type { Express } from "express";
import { createServer, type Server } from "http";
import fileUpload from "express-fileupload";

// Import route modules
import { registerAuthRoutes } from "./routes/auth";
import { registerAdminRoutes } from "./routes/admin";
import { registerUserRoutes } from "./routes/user";
import { registerEventRoutes } from "./routes/events";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add file upload middleware
  app.use(
    fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      abortOnLimit: true,
      useTempFiles: true,
      tempFileDir: "/tmp/",
      debug: false,
    }),
  );

  // Register all route modules
  registerAuthRoutes(app);
  registerAdminRoutes(app);
  registerUserRoutes(app);
  registerEventRoutes(app);

  // Create and return HTTP server (for WebSocket support if needed)
  const server = createServer(app);

  return server;
}
