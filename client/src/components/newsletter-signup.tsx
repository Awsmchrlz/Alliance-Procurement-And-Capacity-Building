import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate(email);
  };

  return (
    <section className="py-20" style={{ backgroundColor: '#1C356B' }}>
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Mail className="w-12 h-12 mx-auto mb-6" style={{ color: '#87CEEB' }} />
          <h2 className="text-3xl font-bold text-white mb-4" data-testid="newsletter-title">
            STAY UPDATED
          </h2>
          <p className="text-lg text-white opacity-90 mb-8" data-testid="newsletter-description">
            Subscribe to our newsletter to receive updates on upcoming training events and procurement insights.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-gray-900"
              data-testid="newsletter-email-input"
              required
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="font-semibold px-8"
              style={{ backgroundColor: '#87CEEB', color: '#1C356B' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6ae1f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#87CEEB'}
              data-testid="newsletter-subscribe-button"
            >
              {subscribeMutation.isPending ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}