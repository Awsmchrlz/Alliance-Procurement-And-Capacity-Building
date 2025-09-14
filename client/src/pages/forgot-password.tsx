import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [, navigate] = useLocation();
  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;

      setSentEmail(data.email);
      setEmailSent(true);
      
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
    } catch (err: any) {
      toast({
        title: "Error sending reset email",
        description: err.message ?? "Unable to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#1C356B" }}>
                Check Your Email
              </h1>
              <p className="text-gray-600">
                We've sent password reset instructions to
              </p>
              <p className="font-medium text-gray-800 mt-1">{sentEmail}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-gray-800 mb-2">Next steps:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your email inbox</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create your new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="font-medium hover:underline"
                  style={{ color: "#87CEEB" }}
                >
                  try again
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-12 text-white font-semibold transition-all duration-300"
                style={{ backgroundColor: "#87CEEB" }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%)`,
          }}
        />

        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-12 w-full flex justify-center">
            <div className="relative w-48 h-48">
              <img
                src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
                alt="Alliance Procurement & Capacity Building Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.className = "w-full h-full bg-white/10 rounded-lg flex items-center justify-center";
                  e.currentTarget.innerHTML = '<span class="text-[#87CEEB] text-2xl font-bold">APCB</span>';
                }}
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Reset Your <span style={{ color: "#87CEEB" }}>Password</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back to your account.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Secure password reset process</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Email verification required</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Quick and easy process</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
              alt="Alliance Procurement Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold" style={{ color: "#1C356B" }}>
              Reset Password
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your email to reset your password
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#1C356B" }}
            >
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "#1C356B" }}
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email",
                    },
                  })}
                  className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "#87CEEB",
                borderColor: "#87CEEB",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e6ae1f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#87CEEB")
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending Reset Email...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Send Reset Email</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-medium hover:underline flex items-center justify-center space-x-1 mx-auto"
                style={{ color: "#87CEEB" }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 mt-0.5" style={{ color: "#87CEEB" }} />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Secure Reset Process</p>
                <p className="text-gray-600">
                  We'll send a secure link to your email that expires in 1 hour.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
