import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the appropriate base URL for authentication redirects
 * Automatically detects production vs development without environment variables
 */
export function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side rendering - return empty string as fallback
    return "";
  }

  const { protocol, hostname, port } = window.location;

  // Development environments - comprehensive detection
  const isDevelopment =
    // Common local addresses
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    // Local network addresses
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    // Local domains
    hostname.endsWith(".local") ||
    hostname.endsWith(".localhost") ||
    // Common dev ports
    port === "3000" ||
    port === "5173" ||
    port === "8000" ||
    port === "8080" ||
    port === "4000" ||
    // Dev-specific subdomains
    hostname.includes("dev.") ||
    hostname.includes("staging.") ||
    hostname.includes("test.") ||
    // Protocol check for non-secure local development
    (protocol === "http:" && !hostname.includes("."));

  if (isDevelopment) {
    // For development, use the current origin
    return window.location.origin;
  }

  // Production environment detection and URL construction
  // Force HTTPS for production (security best practice)
  const productionProtocol = "https:";

  // Handle common hosting platforms and custom domains
  let baseUrl = `${productionProtocol}//${hostname}`;

  // For production, we typically don't include non-standard ports
  // Most production deployments use standard ports (80/443)
  // Only include port if it's explicitly not standard and we're sure it's needed
  const isStandardPort =
    (productionProtocol === "https:" && (port === "443" || !port)) ||
    (productionProtocol === "http:" && (port === "80" || !port));

  if (
    port &&
    !isStandardPort &&
    !hostname.includes("vercel.app") &&
    !hostname.includes("netlify.app")
  ) {
    baseUrl += `:${port}`;
  }

  return baseUrl;
}

/**
 * Get the password reset redirect URL
 * Uses the base URL with the reset-password path
 */
export function getPasswordResetUrl(): string {
  return `${getBaseUrl()}/reset-password`;
}

/**
 * Get authentication callback URL
 * For signup confirmations and other auth redirects
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Debug function to check URL detection
 * Remove in production or keep for troubleshooting
 */
export function debugUrlDetection(): void {
  if (typeof window === "undefined") return;

  const { protocol, hostname, port } = window.location;
  console.log("URL Detection Debug:", {
    currentOrigin: window.location.origin,
    detectedBaseUrl: getBaseUrl(),
    passwordResetUrl: getPasswordResetUrl(),
    authCallbackUrl: getAuthCallbackUrl(),
    urlComponents: { protocol, hostname, port },
    isDevelopment: getBaseUrl() === window.location.origin,
  });
}
