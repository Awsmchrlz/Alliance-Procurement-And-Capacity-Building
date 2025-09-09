import { Link, useLocation } from "wouter";
import {
  Menu,
  Handshake,
  Home,
  Info,
  Briefcase,
  Calendar,
  Mail,
  User,
  Settings,
  LogOut,
  UserPlus,
  LogIn,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function Navigation() {
  const [location, navigate] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const navLinks = [
    { href: "/", id: "home", label: "Home", isRoute: true, icon: Home },
    {
      href: "#events",
      id: "events",
      label: "Events",
      isRoute: false,
      icon: Calendar,
    },
    {
      href: "#services",
      id: "services",
      label: "Services",
      isRoute: false,
      icon: Briefcase,
    },
    {
      href: "#contact",
      id: "contact",
      label: "Contact",
      isRoute: false,
      icon: Mail,
    },
    { href: "#about", id: "about", label: "About", isRoute: false, icon: Info },
  ];

  // Intersection Observer for active section detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Observe all sections
    const sections = ["about", "services", "events", "contact"];
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    // Set home as active when at top
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (href, id, isRoute) => {
    if (isRoute) {
      setActiveSection(id);
      closeMobileMenu(); // Close mobile menu on navigation
      return;
    }

    // Smooth scroll to section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveSection(id);
      closeMobileMenu(); // Close mobile menu after scrolling
    }
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      // Start closing animation
      setIsAnimating(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsAnimating(false);
      }, 350); // Match animation duration
    } else {
      // Open immediately
      setIsMobileMenuOpen(true);
      setIsAnimating(false);
    }
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsAnimating(false);
      }, 350);
    }
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 flex-shrink-0"
              data-testid="logo-link"
            >
              <Handshake className="hidden sm:block w-8 h-8 text-[#87CEEB] flex-shrink-0" />
              <span className="font-bold text-[#1C356B] text-xs sm:text-sm lg:text-base">
                <span className="hidden sm:inline">
                  ALLIANCE PROCUREMENT & CAPACITY BUILDING
                </span>
                <span className="sm:hidden">APCB</span>
              </span>
            </Link>

            {/* Center - Navigation Links */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-8">
                {navLinks.map((link) => {
                  const isActive = link.isRoute
                    ? location === link.href && activeSection === link.id
                    : activeSection === link.id;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        if (!link.isRoute) {
                          e.preventDefault();
                        }
                        handleLinkClick(link.href, link.id, link.isRoute);
                      }}
                      className={`relative text-gray-700 hover:text-[#1C356B] transition-all duration-300 font-medium text-sm uppercase tracking-wide group whitespace-nowrap ${
                        isActive ? "text-[#1C356B]" : ""
                      }`}
                      data-testid={`nav-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                      {/* Yellow underline */}
                      <span
                        className={`absolute bottom-[-8px] left-0 h-0.5 bg-[#87CEEB] transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right side - Auth buttons and mobile menu */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
              {user ? (
                <div className="hidden sm:flex items-center space-x-1 sm:space-x-2">
                  {user.role === "super_admin" ||
                  user.role === "finance_person" ||
                  user.role === "event_manager" ? (
                    <Link href="/admin-dashboard">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                        data-testid="nav-admin"
                      >
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                        data-testid="nav-dashboard"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-[#1C356B] hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                    data-testid="nav-logout"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-1 sm:space-x-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                      data-testid="nav-login"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-[#1C356B] text-white hover:bg-[#1C356B]/90 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                      data-testid="nav-register"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}

              {/* Improved Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-700 hover:text-[#1C356B] transition-all duration-300 flex-shrink-0 p-3 rounded-lg hover:bg-gray-50 relative group"
                data-testid="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  {/* Top line */}
                  <span
                    className={`absolute top-0 left-0 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out transform-gpu ${
                      isMobileMenuOpen || isAnimating
                        ? "rotate-45 translate-y-2.5 bg-[#1C356B]"
                        : "rotate-0 translate-y-0"
                    }`}
                  />
                  {/* Middle line */}
                  <span
                    className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen || isAnimating
                        ? "opacity-0 scale-0"
                        : "opacity-100 scale-100"
                    }`}
                  />
                  {/* Bottom line */}
                  <span
                    className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out transform-gpu ${
                      isMobileMenuOpen || isAnimating
                        ? "-rotate-45 -translate-y-2.5 bg-[#1C356B]"
                        : "rotate-0 translate-y-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop Overlay */}
      {(isMobileMenuOpen || isAnimating) && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-350 ease-out ${
            isMobileMenuOpen && !isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileMenu}
        />
      )}

      {/* Enhanced Side Mobile Navigation Menu */}
      {(isMobileMenuOpen || isAnimating) && (
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 lg:hidden transform-gpu transition-all duration-350 ease-out ${
            isMobileMenuOpen && !isAnimating
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          {/* Enhanced Header with gradient */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-br from-[#1C356B] via-[#1C356B] to-[#0f1e3d] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#87CEEB] transform -translate-x-12 translate-y-12"></div>
            </div>

            <div className="flex items-center space-x-3 relative z-10">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Handshake className="w-6 h-6 text-[#87CEEB]" />
              </div>
              <div>
                <span className="font-bold text-white text-sm block">APCB</span>
                <span className="text-white/80 text-xs">Menu</span>
              </div>
            </div>

            <button
              onClick={closeMobileMenu}
              className="text-white hover:text-[#87CEEB] transition-colors duration-200 p-2 rounded-full hover:bg-white/20 backdrop-blur-sm relative z-10"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
            {/* Enhanced Auth buttons section */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                    <div className="w-10 h-10 bg-[#1C356B] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Welcome back
                      </div>
                      <div className="font-semibold text-[#1C356B] text-sm">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={closeMobileMenu}
                        className="w-full border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group"
                        data-testid="nav-mobile-dashboard"
                      >
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    {(user.role === "super_admin" ||
                      user.role === "finance_person" ||
                      user.role === "event_manager") && (
                      <Link href="/admin-dashboard">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={closeMobileMenu}
                          className="w-full border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group"
                          data-testid="nav-mobile-admin"
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </div>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group"
                      data-testid="nav-mobile-logout"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100/50">
                    <div className="w-12 h-12 bg-[#1C356B] rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Join our community
                    </div>
                    <div className="text-xs text-gray-500">
                      Access exclusive features
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={closeMobileMenu}
                        className="w-full border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group"
                        data-testid="nav-mobile-login"
                      >
                        <div className="flex items-center space-x-2">
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <Link href="/register">
                      <Button
                        size="sm"
                        onClick={closeMobileMenu}
                        className="w-full bg-gradient-to-r from-[#1C356B] to-[#0f1e3d] text-white hover:from-[#0f1e3d] hover:to-[#1C356B] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group shadow-lg"
                        data-testid="nav-mobile-register"
                      >
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-4 h-4" />
                          <span>Register</span>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Navigation links */}
            <div className="flex-1 p-6">
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center">
                  <div className="w-8 h-px bg-gradient-to-r from-[#87CEEB] to-transparent mr-2"></div>
                  Navigation
                </h3>
              </div>

              <div className="space-y-2">
                {navLinks.map((link, index) => {
                  const isActive = link.isRoute
                    ? location === link.href && activeSection === link.id
                    : activeSection === link.id;

                  const IconComponent = link.icon;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        if (!link.isRoute) {
                          e.preventDefault();
                        }
                        handleLinkClick(link.href, link.id, link.isRoute);
                      }}
                      className={`block relative transition-all duration-300 font-medium text-base py-4 px-5 rounded-2xl group transform hover:scale-[1.02] hover:shadow-lg ${
                        isActive
                          ? "text-[#1C356B] bg-gradient-to-r from-[#87CEEB]/20 via-blue-50 to-indigo-50 shadow-md border border-[#87CEEB]/30"
                          : "text-gray-700 hover:text-[#1C356B] hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border border-transparent hover:border-gray-200/50"
                      }`}
                      style={{
                        transitionDelay: `${index * 50}ms`,
                        animation:
                          isMobileMenuOpen && !isAnimating
                            ? `slideInRight 0.4s ease-out ${index * 0.05}s both`
                            : "",
                      }}
                      data-testid={`nav-mobile-${link.label.toLowerCase()}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              isActive
                                ? "bg-[#1C356B] text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 group-hover:bg-[#1C356B] group-hover:text-white"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{link.label}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <div className="w-2 h-2 bg-[#87CEEB] rounded-full animate-pulse shadow-sm"></div>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 transition-all duration-300 ${
                              isActive
                                ? "text-[#1C356B] translate-x-1"
                                : "text-gray-400 group-hover:text-[#1C356B] group-hover:translate-x-1"
                            }`}
                          />
                        </div>
                      </div>

                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#87CEEB] to-[#1C356B] rounded-r-full"></div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="p-6 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-blue-50/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Handshake className="w-4 h-4 text-[#87CEEB]" />
                  <span className="text-sm font-semibold text-[#1C356B]">
                    APCB
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  © 2024 Alliance Procurement
                </div>
                <div className="text-xs text-gray-500">& Capacity Building</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
