import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import { getBaseUrl, getPasswordResetUrl, getAuthCallbackUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const URLDebugComponent: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [urlInfo, setUrlInfo] = useState<any>(null);
  const { toast } = useToast();

  const detectUrlInfo = () => {
    if (typeof window === "undefined") return;

    const { protocol, hostname, port, origin, href } = window.location;

    // Development detection logic (same as in utils)
    const isDevelopment =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".localhost") ||
      port === "3000" ||
      port === "5173" ||
      port === "8000" ||
      port === "8080" ||
      port === "4000" ||
      hostname.includes("dev.") ||
      hostname.includes("staging.") ||
      hostname.includes("test.") ||
      (protocol === "http:" && !hostname.includes("."));

    const baseUrl = getBaseUrl();
    const passwordResetUrl = getPasswordResetUrl();
    const authCallbackUrl = getAuthCallbackUrl();

    setUrlInfo({
      current: {
        protocol,
        hostname,
        port: port || "default",
        origin,
        href,
      },
      detection: {
        isDevelopment,
        isProduction: !isDevelopment,
        baseUrl,
        passwordResetUrl,
        authCallbackUrl,
      },
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      },
    });
  };

  useEffect(() => {
    detectUrlInfo();
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={() => copyToClipboard(text, label)}
      className="ml-2 h-6 px-2"
    >
      {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  if (!urlInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        <Button
          size="sm"
          variant={isVisible ? "secondary" : "outline"}
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center space-x-2"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>URL Debug</span>
        </Button>

        {isVisible && (
          <Card className="w-96 max-h-[80vh] overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">URL Detection Debug</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={urlInfo.detection.isDevelopment ? "secondary" : "default"}>
                    {urlInfo.detection.isDevelopment ? "Development" : "Production"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={detectUrlInfo}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              {/* Current Location */}
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Current Location</h4>
                <div className="space-y-1 bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs">Origin:</span>
                    <div className="flex items-center">
                      <span className="font-mono text-xs truncate max-w-40">
                        {urlInfo.current.origin}
                      </span>
                      <CopyButton text={urlInfo.current.origin} label="Origin" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">Protocol:</span>
                    <span className="font-mono text-xs">{urlInfo.current.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">Hostname:</span>
                    <span className="font-mono text-xs">{urlInfo.current.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">Port:</span>
                    <span className="font-mono text-xs">{urlInfo.current.port}</span>
                  </div>
                </div>
              </div>

              {/* Detection Results */}
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Detection Results</h4>
                <div className="space-y-2">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs">Base URL:</span>
                      <CopyButton text={urlInfo.detection.baseUrl} label="Base URL" />
                    </div>
                    <div className="font-mono text-xs text-green-800 break-all">
                      {urlInfo.detection.baseUrl}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-2 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs">Password Reset URL:</span>
                      <CopyButton text={urlInfo.detection.passwordResetUrl} label="Reset URL" />
                    </div>
                    <div className="font-mono text-xs text-blue-800 break-all">
                      {urlInfo.detection.passwordResetUrl}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-2 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs">Auth Callback URL:</span>
                      <CopyButton text={urlInfo.detection.authCallbackUrl} label="Callback URL" />
                    </div>
                    <div className="font-mono text-xs text-purple-800 break-all">
                      {urlInfo.detection.authCallbackUrl}
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Detection */}
              <div>
                <h4 className="font-semibold mb-2 text-orange-700">Environment</h4>
                <div className="bg-orange-50 p-2 rounded space-y-1">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">Mode:</span>
                    <Badge
                      variant={urlInfo.detection.isDevelopment ? "secondary" : "default"}
                      className="h-4 text-xs"
                    >
                      {urlInfo.detection.isDevelopment ? "DEV" : "PROD"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">Platform:</span>
                    <span className="font-mono text-xs">{urlInfo.environment.platform}</span>
                  </div>
                  <div className="font-mono text-xs text-gray-500">
                    Updated: {new Date(urlInfo.environment.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Test Instructions */}
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Test Instructions</h4>
                <div className="bg-red-50 p-2 rounded text-xs space-y-1">
                  <p className="font-semibold">To test password reset:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to login page</li>
                    <li>Click "Forgot Password"</li>
                    <li>Check if reset URL matches above</li>
                    <li>Verify email contains correct domain</li>
                  </ol>

                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="font-semibold">Expected behavior:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Dev: Uses localhost</li>
                      <li>Prod: Uses production domain</li>
                      <li>No environment variables needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = "/forgot-password"}
                  className="flex-1"
                >
                  Test Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(urlInfo, null, 2), "Debug Info")}
                  className="flex-1"
                >
                  Copy All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default URLDebugComponent;
