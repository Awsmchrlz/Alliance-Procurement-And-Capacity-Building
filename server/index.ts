import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  if (app.get("env") === "development") {
    // Dynamically import vite setup only in dev
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // In production, serve built frontend from ./client
    import("path").then((path) => {
      import("express").then((express) => {
        const clientPath = path.resolve(process.cwd(), "client");
        app.use(express.static(clientPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(clientPath, "index.html"));
        });
      });
    });
  }

  // Use cPanel's expected port (5000–5005 range usually allowed)
  const port = 5005;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
