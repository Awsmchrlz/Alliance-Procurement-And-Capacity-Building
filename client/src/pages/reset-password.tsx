import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [, navigate] = useLocation();
  const { toast } = useToast();

  const password = watch("password");

  useEffect(() => {
    // Check if we have valid session from reset link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setIsValidToken(false);
        } else if (session) {
          setIsValidToken(true);
        } else {
          // Check for hash parameters (password reset token)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens from the URL
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error("Session set error:", sessionError);
              setIsValidToken(false);
            } else {
              setIsValidToken(true);
            }
          } else {
            setIsValidToken(false);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) throw error;

      toast({
        title: "Password updated successfully!",
        description: "You can now sign in with your new password.",
      });

      // Sign out to clear the temporary session
      await supabase.auth.signOut();
      
      // Redirect to login page
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Error updating password",
        description: err.message ?? "Unable to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      return 4;
    return 3;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87CEEB] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-0 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#1C356B" }}>
              Invalid Reset Link
            </h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full h-12 text-white font-semibold transition-all duration-300"
              style={{ backgroundColor: "#87CEEB" }}
            >
              Request New Reset Link
            </Button>
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
            Create New <span style={{ color: "#87CEEB" }}>Password</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Choose a strong password to secure your Alliance account.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Include uppercase and lowercase letters</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5" style={{ color: "#87CEEB" }} />
              <span>Include at least one number</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
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
              Create a new secure password
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "#1C356B" }}
            >
              Create New Password
            </h1>
            <p className="text-gray-600">
              Choose a strong password for your account security.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: "#1C356B" }}
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength:</span>
                    <span style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: strengthColors[passwordStrength],
                      }}
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
                style={{ color: "#1C356B" }}
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords don't match",
                  })}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message as string}
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
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 mt-0.5" style={{ color: "#87CEEB" }} />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Password Security</p>
                <p className="text-gray-600">
                  Your new password will be encrypted and securely stored.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
