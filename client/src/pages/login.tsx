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
      
      // First, find the user by email or phone using our backend
      const findUserResponse = await fetch('/api/auth/find-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
        }),
      });

      let userEmail = data.identifier;
      
      // If identifier is not an email, get the email from backend
      if (!data.identifier.includes('@')) {
        if (findUserResponse.ok) {
          const userData = await findUserResponse.json();
          userEmail = userData.email;
        } else {
          throw new Error('User not found');
        }
      }

      // Use Supabase signInWithPassword directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: data.password,
      });
      
      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Login failed');
      }

      // Check user role from Supabase user metadata and redirect accordingly
      const userRole = authData.user.user_metadata?.role || "ordinary_user";

      if (userRole === "super_admin" || userRole === "finance_person") {
        toast({
          title: "Welcome back!",
          description: "Redirecting to admin dashboard...",
        });
        navigate("/admin-dashboard");
      } else {
        toast({
          title: "Welcome back!",
          description: "Ready to register for events?",
        });
        navigate("/events?from=auth");
      }
    } catch (err: any) {
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
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex && isImageVisible
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
            <div className="relative w-40 h-40 p-4 bg-white rounded-2xl shadow-lg">
              <img
                src="https://res.cloudinary.com/duu5rnmeu/image/upload/v1755860055/APCB_logo_o7rt91.png"
                alt="Alliance Procurement & Capacity Building Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.className = "w-full h-full flex items-center justify-center text-[#1C356B] text-2xl font-bold";
                  e.currentTarget.innerHTML = 'APCB';
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
            <div className="lg:hidden text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium hover:underline"
                  style={{ color: "#87CEEB" }}
                >
                  Create one
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 mt-0.5" style={{ color: "#87CEEB" }} />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Secure Login</p>
                <p className="text-gray-600">
                  Your login credentials are encrypted and secure.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
