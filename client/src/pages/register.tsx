import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Handshake, ArrowRight, Shield, CheckCircle, Star, Award } from "lucide-react";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  // Background images
  const backgroundImages = [
        "/src/assets/background-images/groupPhoto1.jpg"
  ];

  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsImageVisible(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsImageVisible(true);
      }, 800);
    }, 5500);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    if (!formData.email || !/^\S+@\S+$/i.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = "Phone number must be at least 10 characters";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    console.log("Registration data:", formData);
  };

  const passwordStrength = (password) => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)) return 4;
    return 3;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-900">
      {/* Dark Base Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"
      />

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

      {/* Left Side - Benefits */}
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
            Join Our
            <span className="text-yellow-400"> Professional </span>
            Network
          </h2>

          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Connect with industry experts and unlock exclusive opportunities in procurement and capacity building.
          </p>

          {/* Benefits */}
          <div className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Expert Training Programs</h3>
                <p className="text-blue-200 text-sm">Access world-class professional development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Exclusive Networking</h3>
                <p className="text-blue-200 text-sm">Connect with industry leaders and peers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Certified Excellence</h3>
                <p className="text-blue-200 text-sm">Earn recognized professional credentials</p>
              </div>
            </div>
          </div>

          {/* Trust Indicator */}
          <div className="mt-10 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-sm text-blue-100">
              <Shield className="w-4 h-4 inline mr-2 text-green-400" />
              Join <span className="font-semibold text-white">5,000+</span> professionals across Africa
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-start justify-center px-4 lg:px-6 py-4 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md lg:my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-4 pt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-2xl">
              <Handshake className="w-9 h-9 text-white" />
            </div>
          </div>

          {/* Enhanced Registration Card */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-8 rounded-t-3xl border-b border-white/10">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-gray-300">Join APCB for professional development</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    First Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Last Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    type="tel"
                    placeholder="+260 974 486 945"
                    className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Choose a strong password"
                    className="w-full pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Enhanced Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-300">Password strength</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        passwordStrength(formData.password) === 4 ? 'bg-green-500/20 text-green-400' :
                        passwordStrength(formData.password) === 3 ? 'bg-blue-500/20 text-blue-400' :
                        passwordStrength(formData.password) === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {getStrengthText(passwordStrength(formData.password))}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength(formData.password)
                              ? getStrengthColor(passwordStrength(formData.password))
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400 text-sm hover:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-0.5 text-blue-600 bg-transparent border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ background: `#1C356B` }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group shadow-2xl border border-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="p-8 pt-0 border-t border-white/10">
              <p className="text-center text-sm text-gray-300">
                Already have an account?{" "}
                <a href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                  Sign in here
                </a>
              </p>
            </div>
          </div>

          {/* Mobile Trust Indicator */}
          <div className="lg:hidden mt-4 mb-4 text-center">
            <p className="text-white/60 text-sm">
              <Shield className="w-4 h-4 inline mr-1" />
              Join 5,000+ professionals across Africa
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

export default RegisterPage;