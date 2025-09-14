import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  occupation: string;
  educationLevel: string;
  password: string;
  confirmPassword: string;
}

const steps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Let's start with your basic details",
    icon: User,
  },
  {
    id: 2,
    title: "Contact Details",
    description: "How can we reach you?",
    icon: Mail,
  },
  {
    id: 3,
    title: "Professional Background",
    description: "Tell us about your experience",
    icon: Briefcase,
  },
  {
    id: 4,
    title: "Account Security",
    description: "Create a secure password",
    icon: Lock,
  },
];

export default function MultiStepRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<FormData>();

  const password = watch("password");

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["firstName", "lastName"];
        break;
      case 2:
        fieldsToValidate = ["email", "phoneNumber", "gender"];
        break;
      case 3:
        fieldsToValidate = ["address", "occupation", "educationLevel"];
        break;
      case 4:
        fieldsToValidate = ["password", "confirmPassword"];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Register user with Supabase
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phoneNumber,
            role: "ordinary_user",
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create user profile
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          address: data.address,
          occupation: data.occupation,
          educationLevel: data.educationLevel,
          userId: authData.user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // Auto-login after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      toast({
        title: "Welcome to Alliance!",
        description: "Your account has been created successfully.",
      });

      setLocation("/events?from=auth");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message || "Unable to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register("firstName", { required: "First name is required" })}
                    className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register("lastName", { required: "Last name is required" })}
                    className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
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
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+260977123456"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                    className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                  Gender
                </Label>
                <Select {...register("gender", { required: "Please select your gender" })}>
                  <SelectTrigger className="h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Your current address"
                  {...register("address", { required: "Address is required" })}
                  className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Occupation
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="occupation"
                  type="text"
                  placeholder="Your current job or profession"
                  {...register("occupation", { required: "Occupation is required" })}
                  className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
                />
              </div>
              {errors.occupation && (
                <p className="text-red-500 text-sm">{errors.occupation.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="educationLevel" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Education Level
              </Label>
              <Select {...register("educationLevel", { required: "Please select your education level" })}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.educationLevel && (
                <p className="text-red-500 text-sm">{errors.educationLevel.message}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
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
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "#1C356B" }}>
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
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
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.id
                  ? "bg-[#87CEEB] border-[#87CEEB] text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                  currentStep > step.id ? "bg-[#87CEEB]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#1C356B" }}>
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2 text-white"
              style={{ backgroundColor: "#87CEEB" }}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 text-white"
              style={{ backgroundColor: "#87CEEB" }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => setLocation("/login")}
            className="font-medium hover:underline"
            style={{ color: "#87CEEB" }}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
