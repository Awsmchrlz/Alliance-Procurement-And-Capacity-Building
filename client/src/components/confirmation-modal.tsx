import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, HelpCircle, Zap, Shield } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const isDestructive = variant === "destructive";

  const getVariantStyles = () => {
    if (isDestructive) {
      return {
        gradient: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        defaultIcon: <AlertTriangle className="h-8 w-8" />,
        confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
        patternColor: "border-red-300",
      };
    }
    return {
      gradient: "from-primary-yellow to-primary-yellow/80",
      bgColor: "bg-primary-yellow/5",
      borderColor: "border-primary-yellow/20",
      iconBg: "bg-primary-yellow/10",
      iconColor: "text-primary-yellow",
      defaultIcon: <HelpCircle className="h-8 w-8" />,
      confirmButtonClass:
        "bg-primary-yellow hover:bg-primary-yellow/80 text-white",
      patternColor: "border-primary-yellow/30",
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-3xl border-0 shadow-2xl bg-white overflow-hidden">
        {/* Custom close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:text-white hover:bg-gray-500 transition-all duration-300 transform hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Section */}
        <div
          className={`relative bg-gradient-to-br ${variantStyles.gradient} p-6 sm:p-8 text-white overflow-hidden`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className={`absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full ${isDestructive ? "animate-pulse" : ""}`}
            ></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-8 h-8 border-2 border-white rounded-full transform -translate-y-1/2"></div>
            {isDestructive && (
              <>
                <div className="absolute top-8 left-8 w-6 h-6 border-2 border-white rounded-full animate-ping"></div>
                <div className="absolute bottom-8 right-8 w-4 h-4 border-2 border-white rounded-full"></div>
              </>
            )}
          </div>

          <div className="relative z-10 text-center">
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 transform transition-all duration-500 ${isDestructive ? "animate-bounce" : "hover:scale-105"}`}
            >
              {icon || variantStyles.defaultIcon}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>

            {/* Subtitle for destructive actions */}
            {isDestructive && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="h-4 w-4 opacity-80" />
                <span className="text-sm opacity-80 font-medium">
                  Action Required
                </span>
                <Shield className="h-4 w-4 opacity-80" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          {/* Description */}
          <div
            className={`${variantStyles.bgColor} p-6 rounded-2xl border ${variantStyles.borderColor} mb-8`}
          >
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center font-medium">
              {description}
            </p>
          </div>

          {/* Action indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isDestructive ? "bg-red-400" : "bg-primary-yellow"} animate-pulse`}
              ></div>
              <span className="text-sm text-gray-500 font-medium">
                {isDestructive ? "Irreversible Action" : "Confirmation Needed"}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${isDestructive ? "bg-red-400" : "bg-primary-yellow"} animate-pulse`}
              ></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="order-2 sm:order-1 font-semibold py-3 px-8 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 min-w-[120px]"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`order-1 sm:order-2 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg min-w-[120px] ${variantStyles.confirmButtonClass}`}
            >
              {isDestructive && <Zap className="h-4 w-4 mr-2" />}
              {confirmText}
            </Button>
          </div>

          {/* Warning message for destructive actions */}
          {isDestructive && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 italic">
                This action cannot be undone. Please confirm your choice.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
