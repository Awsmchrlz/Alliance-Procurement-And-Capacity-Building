import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Handshake, ArrowRight, Shield, Users, Target } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(true);

  // Background images
  const backgroundImages = [
      "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858603/groupPhoto2_gkijtp.jpg",
   "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858600/groupPhoto4_shvwfy.jpg"
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

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      
      // Check user role and redirect accordingly
      const userRole = authData.user?.user_metadata?.role || 'ordinary_user';
      
      if (userRole === 'super_admin' || userRole === 'finance_person') {
        toast({ title: "Welcome back!", description: "Redirecting to admin dashboard..." });
        navigate("/admin-dashboard");
      } else {
        toast({ title: "Welcome back!", description: "Redirecting to your dashboard..." });
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message ?? "Unable to sign in", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-900">
      {/* Dark Base Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />

      {/* Background Images - Less opaque */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex && isImageVisible ? 'opacity-[0.15]' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ))}
      </div>

      {/* Dark Overlay - reduced for less opacity */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Subtle Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/5 to-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-slate-600/3 to-indigo-600/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 xl:px-16 text-white">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold tracking-tight">APCB</h1>
              <p className="text-blue-200 text-sm">Alliance Procurement & Capacity Building</p>
            </div>
          </div>

          {/* Main Content */}
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Building
            <span className="text-yellow-400"> Strategic </span>
            Partnerships
          </h2>

          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Empowering organizations through expert procurement solutions and capacity building initiatives.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-blue-100">Secure & Trusted Platform</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-blue-100">Expert Team Support</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-blue-100">Strategic Outcomes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-start justify-center px-4 lg:px-6 py-8 lg:py-12 min-h-screen">
        <div className="w-full max-w-md lg:my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-6 pt-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Handshake className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Enhanced Login Card */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10 w-full">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 lg:p-8 rounded-t-2xl lg:rounded-t-3xl border-b border-white/10">
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-300 text-sm lg:text-base">Sign in to access your APCB dashboard</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 lg:p-8 space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email"
                      }
                    })}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 hover:bg-white/10"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-transparent border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors underline underline-offset-2">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={{ background: `#1C356B` }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 lg:py-4 px-6 rounded-xl font-semibold transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group shadow-2xl border border-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Create Account Link */}
            <div className="p-6 lg:p-8 pt-4 lg:pt-0 border-t border-white/10">
              <p className="text-center text-sm text-gray-300">
                Don't have an account?{" "}
                <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                  Create account
                </a>
              </p>
            </div>

            {/* Security Badge */}
            <div className="pb-6 lg:pb-8 flex items-center justify-center text-xs text-gray-400">
              <Shield className="w-4 h-4 mr-1" />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="lg:hidden mt-6 mb-20 text-center">
            <p className="text-white/60 text-sm">
              Trusted by organizations worldwide for strategic procurement solutions
            </p>
          </div>

          {/* Background Image Indicators */}
          <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsImageVisible(false);
                  setTimeout(() => {
                    setCurrentImageIndex(index);
                    setIsImageVisible(true);
                  }, 400);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-yellow-400 shadow-lg'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`View background image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;