import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Briefcase,
  Users,
  Target,
  Globe,
  Calendar,
  MapPin,
  Award,
  Building,
  Lightbulb,
  Zap,
  Heart,
  Star,
  ArrowRight,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface ProjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IndabaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectsModal({ open, onOpenChange }: ProjectsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl mx-4 rounded-3xl border-0 shadow-2xl bg-white max-h-[95vh] overflow-hidden">
        {/* Custom close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:text-white hover:bg-primary-yellow transition-all duration-300 transform hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-yellow to-primary-yellow/80 p-6 sm:p-8 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 border-2 border-white rounded-full transform -translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Briefcase className="h-10 w-10" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Current Projects
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Transforming communities through strategic procurement and
              capacity building initiatives
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 max-h-[60vh] overflow-y-auto">
          {/* Project Categories Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="group bg-gradient-to-br from-primary-yellow/5 to-primary-yellow/10 p-6 rounded-2xl border border-primary-yellow/20 hover:border-primary-yellow/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <Target className="h-6 w-6 text-primary-blue" />
                </div>
                <h3 className="text-xl font-bold text-primary-blue">
                  Capacity Building
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Comprehensive training programs enhancing procurement expertise
                across public and private sectors
              </p>
            </div>

            <div className="group bg-gradient-to-br from-primary-yellow/5 to-primary-yellow/10 p-6 rounded-2xl border border-primary-yellow/20 hover:border-primary-yellow/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <Heart className="h-6 w-6 text-primary-blue" />
                </div>
                <h3 className="text-xl font-bold text-primary-blue">
                  Community Impact
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Engaging local communities to build sustainable practices and
                drive economic development
              </p>
            </div>

            <div className="group bg-gradient-to-br from-primary-yellow/5 to-primary-yellow/10 p-6 rounded-2xl border border-primary-yellow/20 hover:border-primary-yellow/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-primary-blue" />
                </div>
                <h3 className="text-xl font-bold text-primary-blue">
                  Policy Innovation
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Developing cutting-edge procurement frameworks with government
                partnerships
              </p>
            </div>

            <div className="group bg-gradient-to-br from-primary-yellow/5 to-primary-yellow/10 p-6 rounded-2xl border border-primary-yellow/20 hover:border-primary-yellow/40 transition-all duration-300 hover:transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <TrendingUp className="h-6 w-6 text-primary-blue" />
                </div>
                <h3 className="text-xl font-bold text-primary-blue">
                  Growth Catalyst
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Supporting infrastructure growth through strategic procurement
                guidance
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-primary-yellow/10 via-primary-yellow/5 to-primary-yellow/10 p-6 sm:p-8 rounded-2xl border border-primary-yellow/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-yellow/20 rounded-xl mb-4">
              <Lightbulb className="h-8 w-8 text-primary-yellow" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-primary-blue mb-3">
              Ready to Explore More?
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
              Detailed project portfolios and impact stories coming soon
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
            >
              Stay Connected
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IndabaModal({ open, onOpenChange }: IndabaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl mx-4 rounded-3xl border-0 shadow-2xl bg-white max-h-[95vh] overflow-hidden">
        {/* Custom close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:text-white hover:bg-primary-yellow transition-all duration-300 transform hover:scale-110"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-blue to-primary-blue/90 p-6 sm:p-8 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-6 w-20 h-20">
              <Star className="w-full h-full" />
            </div>
            <div className="absolute bottom-6 right-6 w-16 h-16">
              <Award className="w-full h-full" />
            </div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 -translate-y-1/2">
              <Globe className="w-full h-full" />
            </div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-yellow/20 backdrop-blur-sm rounded-2xl mb-4">
              <Award className="h-10 w-10 text-primary-yellow" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              International Indaba
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto text-primary-yellow/90">
              Where global leaders unite to shape the future of procurement
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 max-h-[60vh] overflow-y-auto">
          {/* Feature Highlights */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary-blue mb-6 text-center">
              Conference Experience
            </h3>

            <div className="grid gap-4 sm:gap-6">
              <div className="flex items-start space-x-4 bg-gradient-to-r from-primary-yellow/5 to-transparent p-4 sm:p-6 rounded-2xl border border-primary-yellow/20 group hover:border-primary-yellow/40 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <Users className="h-6 w-6 text-primary-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-blue mb-2 text-lg">
                    Global Expert Network
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Connect with industry pioneers, government leaders, and
                    procurement visionaries from around the world
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gradient-to-r from-primary-yellow/5 to-transparent p-4 sm:p-6 rounded-2xl border border-primary-yellow/20 group hover:border-primary-yellow/40 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <Zap className="h-6 w-6 text-primary-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-blue mb-2 text-lg">
                    Innovation Workshops
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Hands-on sessions featuring cutting-edge technologies and
                    methodologies in procurement
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gradient-to-r from-primary-yellow/5 to-transparent p-4 sm:p-6 rounded-2xl border border-primary-yellow/20 group hover:border-primary-yellow/40 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-yellow/30 transition-colors duration-300">
                  <Target className="h-6 w-6 text-primary-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-blue mb-2 text-lg">
                    Strategic Insights
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Discover proven frameworks and emerging trends that drive
                    procurement excellence
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Card */}
          <div className="bg-gradient-to-br from-primary-blue/5 via-primary-yellow/5 to-primary-blue/5 p-6 sm:p-8 rounded-2xl border border-primary-yellow/30 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-yellow/20 rounded-xl mb-4">
                <Calendar className="h-8 w-8 text-primary-blue" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-primary-blue mb-2">
                Save the Date
              </h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-center text-gray-600 bg-white p-4 rounded-xl border border-primary-yellow/20">
                <Calendar className="h-5 w-5 text-primary-yellow mr-3" />
                <span className="font-medium">Dates: Coming Soon</span>
              </div>
              <div className="flex items-center justify-center text-gray-600 bg-white p-4 rounded-xl border border-primary-yellow/20">
                <MapPin className="h-5 w-5 text-primary-yellow mr-3" />
                <span className="font-medium">Location: TBA</span>
              </div>
            </div>

            <p className="text-gray-600 text-center text-sm sm:text-base mb-6">
              Be the first to know when registration opens for this exclusive
              gathering of procurement leaders
            </p>

            <div className="text-center">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-primary-yellow hover:bg-primary-yellow/80 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
              >
                Get Notified
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
