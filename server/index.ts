import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(
        `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`,
      );
    }
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// Serve static files
const publicPath = path.join(__dirname, "../public");
app.use(
  express.static(publicPath, {
    maxAge: "1d",
    etag: false,
  }),
);

// Register API routes
registerRoutes(app)
  .then(() => {
    console.log("✅ API routes registered successfully");
  })
  .catch((error: any) => {
    console.error("❌ Failed to register routes:", error.message);
    process.exit(1);
  });

// Catch-all for client-side routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  const indexPath = path.join(publicPath, "index.html");

  // Check if the built client exists
  if (!fs.existsSync(indexPath)) {
    console.error(`Client build not found at ${indexPath}`);
    return res.status(503).json({
      message: "Client application not built yet",
      hint: "Run 'npm run build:client' first",
      path: indexPath,
    });
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(`Error: ${err.message}`);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

const port = parseInt(process.env.PORT || "5005", 10);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📁 Serving static files from: ${publicPath}`);
  console.log(
    `💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
  );
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);

  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log("Forcing exit...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

export default app;
