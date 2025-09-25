"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export interface WhatsAppFloatProps {
  phoneNumber?: string;
  message?: string;
  position?: {
    bottom?: string;
    right?: string;
  };
  showTooltip?: boolean;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  phoneNumber = "+1234567890", // Default phone number - replace with actual
  message = "Hello! I'm interested in your services.",
  position = { bottom: "24px", right: "24px" },
  showTooltip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipText, setShowTooltipText] = useState(false);

  const handleWhatsAppClick = () => {
    // Format phone number (remove any non-digits and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp Web/App URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open in new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div
        className="fixed z-50 group"
        style={{
          bottom: position.bottom,
          right: position.right,
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (showTooltip) {
            setTimeout(() => setShowTooltipText(true), 100);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltipText(false);
        }}
      >
        {/* Tooltip */}
        {showTooltip && showTooltipText && (
          <div
            className="absolute right-16 bottom-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap transform transition-all duration-300 ease-out opacity-100 translate-x-0"
            style={{
              animation: "slideIn 0.3s ease-out",
            }}
          >
            💬 WhatsApp us now!
            {/* Tooltip Arrow */}
            <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gray-900 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleWhatsAppClick}
          className={`
            relative w-14 h-14 bg-gradient-to-br from-green-400 to-green-600
            hover:from-green-500 hover:to-green-700
            rounded-full shadow-lg hover:shadow-xl
            flex items-center justify-center
            transform transition-all duration-300 ease-out
            hover:scale-110 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
            ${isHovered ? "animate-bounce" : ""}
          `}
          aria-label="WhatsApp us directly"
          title="Click to start WhatsApp chat"
        >
          {/* WhatsApp Icon */}
          <div className="relative">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white drop-shadow-sm"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488" />
            </svg>

            {/* Animated pulse ring */}
            <div
              className={`
                absolute inset-0 rounded-full border-2 border-green-300
                transition-all duration-1000 ease-out
                ${isHovered ? "scale-150 opacity-0" : "scale-100 opacity-100"}
              `}
            />
          </div>

          {/* Notification Badge (optional) */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </button>

        {/* Background glow effect */}
        <div
          className={`
            absolute inset-0 rounded-full bg-green-400 opacity-20 blur-xl
            transition-all duration-300 ease-out
            ${isHovered ? "scale-150" : "scale-100"}
          `}
          style={{ zIndex: -1 }}
        />
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .group {
            bottom: 20px !important;
            right: 20px !important;
          }

          .group button {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppFloat;
