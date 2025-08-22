import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setIsSuccess(true);
      toast({
        title: "Subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });

      setEmail("");

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12" style={{ background: `#1C356B` }}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Left Side - Text Content */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Mail className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold text-white mb-1"
                data-testid="newsletter-title"
              >
                Subscribe for Newsletter
              </h2>
              <p
                className="text-slate-300 text-sm"
                data-testid="newsletter-description"
              >
                Manage Your Business With Our Software
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-auto lg:min-w-[400px]">
            <form onSubmit={handleSubmit} className="flex gap-0">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Email Address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white border-0 rounded-r-none focus:ring-2 focus:ring-yellow-500 text-slate-900 placeholder:text-slate-500"
                  required
                  data-testid="newsletter-email-input"
                  disabled={isLoading || isSuccess}
                />

                {isSuccess && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`
                  h-12 px-6 font-medium rounded-l-none transition-all duration-200
                  ${isSuccess
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-slate-600 hover:bg-slate-700 text-white"
                  }
                  disabled:opacity-70
                `}
                data-testid="newsletter-subscribe-button"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Subscribed!</span>
                  </div>
                ) : (
                  <span>Subscribe Now</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}