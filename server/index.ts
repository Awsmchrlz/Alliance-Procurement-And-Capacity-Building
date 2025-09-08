import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
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
    // Dev mode — use Vite middleware
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // ✅ Production — serve built frontend from dist/public
    const publicPath = path.resolve(import.meta.dirname, "public");
    app.use(express.static(publicPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  const port = process.env.PORT || 5005;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
