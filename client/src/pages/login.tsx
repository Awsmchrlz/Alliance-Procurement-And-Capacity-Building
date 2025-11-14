import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(true);

  // Background images
  const backgroundImages = [
    "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg",
    "https://res.cloudinary.com/duu5rnmeu/image/upload/v1757918917/WhatsApp_Image_2025-09-12_at_09.34.29_2_lxhwza.jpg",
  ];

  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsImageVisible(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsImageVisible(true);
      }, 800);
    }, 6000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

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

      // Use backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user, token } = await response.json();

      // Use Supabase to authenticate with the token
      // This will properly set up the session with user metadata
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        throw new Error(authError.message);
      }

      // Check user role and redirect accordingly
      const userRole = user.role || "ordinary_user";

      toast({
        title: "Welcome back!",
        description: userRole === "super_admin" || userRole === "finance_person" 
          ? "Redirecting to admin dashboard..." 
          : "Ready to register for events?",
      });

      // Navigate based on role
      if (userRole === "super_admin" || userRole === "finance_person") {
        navigate("/admin-dashboard");
      } else {
        navigate("/events?from=auth");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        title: "Sign in failed",
        description: err.message ?? "Unable to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Dynamic Background Images */}
        <div className="absolute inset-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex && isImageVisible
                ? "opacity-80"
                : "opacity-0"
                }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-12 w-full flex justify-center">
            <div className="relative w-64 h-64 p-1">
              <img
                src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
                alt="APCB Logo"
                className="w-full h-full object-contain filter drop-shadow-lg"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'flex';
                  target.style.alignItems = 'center';
                  target.style.justifyContent = 'center';
                  target.style.color = '#87CEEB';
                  target.style.fontSize = '24px';
                  target.style.fontWeight = 'bold';
                  target.textContent = 'APCB';
                }}
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Welcome Back to <span style={{ color: "#87CEEB" }}>Alliance</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Continue your procurement and capacity building journey with us.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Access your personalized dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Manage your event registrations</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Track your professional development</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Clean Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 p-2 bg-gradient-to-br from-[#1C356B] to-[#87CEEB] rounded-lg shadow-sm">
              <img
                src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
                alt="APCB Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'flex';
                  target.style.alignItems = 'center';
                  target.style.justifyContent = 'center';
                  target.style.color = 'white';
                  target.style.fontSize = '10px';
                  target.style.fontWeight = 'bold';
                  target.textContent = 'APCB';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#1C356B]">Welcome Back</h1>
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-medium text-[#87CEEB] hover:underline"
              >
                Create one
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email or Phone */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                Email or Phone Number
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or phone number"
                  {...register("identifier", {
                    required: "Email or phone number is required",
                    validate: (value) => {
                      const emailPattern = /^\S+@\S+$/i;
                      const phonePattern = /^[+]?[0-9\s\-()]+$/;

                      if (emailPattern.test(value) || phonePattern.test(value)) {
                        return true;
                      }
                      return "Please enter a valid email address or phone number";
                    },
                  })}
                  className="pl-10 h-11 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-xs">
                  {errors.identifier.message as string}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                style={{ color: "#87CEEB" }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-white font-semibold bg-[#1C356B] hover:bg-[#2563eb] transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Mobile Create Account Link */}
            <div className="lg:hidden text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-[#1C356B] hover:text-[#87CEEB] hover:underline transition-colors"
                >
                  Create one
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
