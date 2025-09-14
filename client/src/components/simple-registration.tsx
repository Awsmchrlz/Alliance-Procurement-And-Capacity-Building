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
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
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
  password: string;
}

export default function SimpleRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

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
          educationLevel: "Not specified", // Default value
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#1C356B" }}>
          Create Your Account
        </h2>
        <p className="text-gray-600">Join Alliance and start your professional journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
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

        {/* Email */}
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

        {/* Phone and Gender */}
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
            <Select onValueChange={(value) => setValue("gender", value)}>
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

        {/* Address and Occupation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium" style={{ color: "#1C356B" }}>
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                placeholder="Your address"
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
                placeholder="Your profession"
                {...register("occupation", { required: "Occupation is required" })}
                className="pl-10 h-12 border-gray-300 focus:border-[#87CEEB] focus:ring-[#87CEEB]"
              />
            </div>
            {errors.occupation && (
              <p className="text-red-500 text-sm">{errors.occupation.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#1C356B" }}>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
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
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg mt-6"
          style={{ backgroundColor: "#87CEEB" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="font-medium hover:underline"
              style={{ color: "#87CEEB" }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
