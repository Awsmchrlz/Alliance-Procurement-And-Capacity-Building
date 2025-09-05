import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ultra-minimal memory configuration
process.env.NODE_OPTIONS = '--max-old-space-size=128 --optimize-for-size';

const app = express();

// Minimal request parsing - reduce limits significantly
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Ultra-minimal logging - only errors
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Force garbage collection every 10 requests in ultra-constrained mode
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  if (requestCount % 10 === 0 && global.gc) {
    setImmediate(() => global.gc());
  }
  next();
});

// Minimal health check
app.get('/api/health', (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    status: 'ok',
    heap: Math.round(usage.heapUsed / 1024 / 1024) + 'MB'
  });
});

// Basic auth endpoint (no database operations to save memory)
app.post("/api/auth/login", (req, res) => {
  res.status(503).json({ message: "Database operations disabled in minimal mode" });
});

// Serve static files with minimal overhead
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: false,
  lastModified: false,
  index: 'index.html'
}));

// Ultra-simple catch-all
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API disabled in minimal mode" });
  }

  const indexPath = path.join(publicPath, "index.html");

  // Use streaming to reduce memory usage
  const fs = require('fs');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({
      message: "Client not built",
      hint: "Run 'npm run build:client' first"
    });
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).json({ message: "File error" });
    }
  });
});

// Minimal error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Error" });
});

const port = process.env.PORT || 5005;

// Create server with minimal configuration
const server = app.listen(port, '0.0.0.0', () => {
  const usage = process.memoryUsage();
  console.log(`🚀 Minimal server on port ${port}`);
  console.log(`💾 Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
});

// Minimal server settings
server.timeout = 15000; // 15 seconds
server.keepAliveTimeout = 30000; // 30 seconds
server.headersTimeout = 31000; // 31 seconds
server.maxConnections = 20; // Limit concurrent connections

// Aggressive cleanup on signals
const cleanup = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', () => {
  console.error('Uncaught exception - restarting');
  cleanup();
});
process.on('unhandledRejection', () => {
  console.error('Unhandled rejection - restarting');
  cleanup();
});

export default app;
