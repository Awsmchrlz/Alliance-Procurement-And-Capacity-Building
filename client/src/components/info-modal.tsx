import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, X, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  variant?: "info" | "success" | "warning";
}

export function InfoModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  buttonText = "Got it!",
  onButtonClick,
  variant = "info",
}: InfoModalProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          gradient: "from-green-500 to-emerald-600",
          bgColor: "bg-green-500/10",
          iconColor: "text-green-600",
          defaultIcon: <CheckCircle className="h-8 w-8" />,
        };
      case "warning":
        return {
          gradient: "from-amber-500 to-orange-600",
          bgColor: "bg-amber-500/10",
          iconColor: "text-amber-600",
          defaultIcon: <AlertTriangle className="h-8 w-8" />,
        };
      default:
        return {
          gradient: "from-primary-yellow to-primary-yellow/80",
          bgColor: "bg-primary-yellow/10",
          iconColor: "text-primary-yellow",
          defaultIcon: <Info className="h-8 w-8" />,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-3xl border-0 shadow-2xl bg-white overflow-hidden">
        {/* Custom close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:text-white hover:bg-primary-yellow transition-all duration-300 transform hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero Section */}
        <div
          className={`relative bg-gradient-to-br ${variantStyles.gradient} p-6 sm:p-8 text-white overflow-hidden`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-white rounded-full transform -translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 transform transition-transform duration-500 hover:scale-105">
              {icon || variantStyles.defaultIcon}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          {/* Description */}
          <div
            className={`${variantStyles.bgColor} p-6 rounded-2xl border border-current/20 mb-6`}
          >
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-center">
              {description}
            </p>
          </div>

          {/* Decorative element */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex space-x-1">
              <Sparkles className="h-4 w-4 text-primary-yellow animate-pulse" />
              <Sparkles className="h-4 w-4 text-primary-yellow animate-pulse delay-75" />
              <Sparkles className="h-4 w-4 text-primary-yellow animate-pulse delay-150" />
            </div>
          </div>

          {/* Button */}
          <div className="text-center">
            <Button
              onClick={handleButtonClick}
              className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg min-w-[140px]"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
