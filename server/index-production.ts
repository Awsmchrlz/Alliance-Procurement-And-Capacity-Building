import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { storage } from "./storage-optimized.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set Node.js memory options for shared hosting
process.env.NODE_OPTIONS = "--max-old-space-size=512 --optimize-for-size";

const app = express();

// Reduce memory usage with smaller limits
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

// Minimal logging middleware to reduce memory overhead
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Memory monitoring for debugging
const logMemoryUsage = () => {
  const usage = process.memoryUsage();
  console.log(
    `Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB heap, ${Math.round(usage.rss / 1024 / 1024)}MB RSS`,
  );
};

// Force garbage collection periodically if available
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 30000); // Every 30 seconds
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    status: "ok",
    memory: {
      heap: Math.round(usage.heapUsed / 1024 / 1024) + "MB",
      rss: Math.round(usage.rss / 1024 / 1024) + "MB",
      external: Math.round(usage.external / 1024 / 1024) + "MB",
    },
    uptime: Math.round(process.uptime()) + "s",
  });
});

// Serve static files with aggressive caching
const publicPath = path.join(__dirname, "../public");
app.use(
  express.static(publicPath, {
    maxAge: "7d",
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=604800"); // 7 days
    },
  }),
);

// Register API routes
try {
  const server = await registerRoutes(app);
  console.log("✅ API routes registered successfully");
} catch (error) {
  console.error("❌ Failed to register routes:", error.message);
  // Cleanup storage connections
  storage.cleanup();
  process.exit(1);
}

// Catch-all for client-side routing - optimized
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  // Check if the built client exists
  const indexPath = path.join(publicPath, "index.html");

  // If built client doesn't exist, provide helpful error
  if (!require("fs").existsSync(indexPath)) {
    console.error(`Client build not found at ${indexPath}`);
    return res.status(503).json({
      message: "Client application not built yet",
      hint: "Run 'npm run build:client' first",
      path: indexPath,
    });
  }

  res.sendFile(
    indexPath,
    {
      maxAge: 3600000, // 1 hour cache
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
    (err) => {
      if (err) {
        console.error("Error serving index.html:", err.message);
        res.status(500).json({ message: "Server error" });
      }
    },
  );
});

// Minimal error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

const port = process.env.PORT || 5005;

// Create server with optimized settings
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📁 Serving static files from: ${publicPath}`);
  logMemoryUsage();

  // Log memory every 5 minutes
  setInterval(logMemoryUsage, 300000);
});

// Set server timeouts to prevent memory leaks
server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

// Handle process signals gracefully
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  // Cleanup storage connections first
  storage.cleanup();

  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log("Forcing exit...");
    storage.cleanup();
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  storage.cleanup();
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  storage.cleanup();
  gracefulShutdown("UNHANDLED_REJECTION");
});

export default app;
