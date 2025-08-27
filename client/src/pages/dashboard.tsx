import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { EventRegistration, Event } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, DollarSign, Users, TrendingUp,CheckCircle,Clock, LogOut, Building2, User } from "lucide-react"; // Changed User to Users for total registrations
import { format } from "date-fns";

interface RegistrationWithEvent extends EventRegistration {
  event: Event;
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const { data: registrations, isLoading } = useQuery<RegistrationWithEvent[]>({
    queryKey: ["/api/users", user?.id, "registrations"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${user?.id}/registrations`);
      return response.json();
    },
    enabled: !!user,
  });

  // Use Shadcn Badge variants with custom classes for flare
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800 transition-colors";
      case "pending":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 transition-colors";
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 transition-all duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse text-center text-lg font-semibold text-primary-blue dark:text-white">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enhanced Header inspired by admin */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-blue via-primary-blue to-[#2d4a7a] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-8 h-8 text-primary-yellow" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Your Dashboard</h1>
                    <p className="text-blue-100 text-lg">Manage your events and registrations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900" data-testid="dashboard-title">
                      Welcome back, {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 text-sm" data-testid="dashboard-description">Your personal event management hub</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid like admin */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="dashboard-total-registrations">
                    {registrations?.length || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">All Events</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-primary-blue to-[#2d4a7a] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Paid Events</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="dashboard-paid-events">
                    {registrations?.filter(r => r.paymentStatus === "paid").length || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="dashboard-pending-payments">
                    {registrations?.filter(r => r.paymentStatus === "pending").length || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm text-amber-600 font-medium">Action Needed</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-primary-yellow to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Registrations Card */}
        <Card className="shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-primary-blue/5 dark:bg-gray-800 p-6">
            <CardTitle className="text-2xl font-bold text-primary-blue dark:text-white flex items-center gap-2" data-testid="dashboard-registrations-title">
              <Calendar className="w-6 h-6" />
              Your Event Registrations
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              View and manage your registered events
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {registrations && registrations.length > 0 ? (
              <div className="space-y-6">
                {registrations.map((registration) => (
                  <Card
                    key={registration.id}
                    className="border-l-4 border-l-primary-blue shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden group"
                  >
                    <CardContent className="p-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-primary-blue dark:text-white mb-3" data-testid={`registration-title-${registration.id}`}>
                            {registration.event.title}
                          </h3>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                            <Calendar className="w-4 h-4 mr-2 text-primary-blue" />
                            <span data-testid={`registration-date-${registration.id}`}>
                              {format(new Date(registration.event.startDate), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          {registration.event.location && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                              <MapPin className="w-4 h-4 mr-2 text-primary-blue" />
                              <span data-testid={`registration-location-${registration.id}`}>
                                {registration.event.location}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-primary-blue" />
                            <span data-testid={`registration-price-${registration.id}`}>
                              K{Number(registration.event.price).toFixed(2)}
                            </span>
                          </div>
                          {registration.organization && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                              <Building2 className="w-4 h-4 mr-2 text-primary-blue" />
                              <span>{registration.organization}</span>
                            </div>
                          )}
                          {registration.position && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                              <User className="w-4 h-4 mr-2 text-primary-blue" />
                              <span>{registration.position}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <Badge
                            variant={getStatusVariant(registration.paymentStatus)}
                            className={`${getStatusClass(registration.paymentStatus)} px-3 py-1 text-sm font-medium`}
                            data-testid={`registration-status-${registration.id}`}
                          >
                            {registration.paymentStatus.toUpperCase()}
                          </Badge>
                          {registration.paymentStatus === "pending" && (
                            <Button
                              size="sm"
                              className="bg-primary-yellow text-primary-blue hover:bg-yellow-400 transition-colors duration-300 font-semibold shadow-sm hover:shadow mr-2"
                              data-testid={`registration-pay-${registration.id}`}
                            >
                              Pay Now
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-300"
                            onClick={async () => {
                              if (confirm("Are you sure you want to cancel this registration?")) {
                                try {
                                  await apiRequest("DELETE", `/api/users/${user?.id}/registrations/${registration.id}`);
                                  // Refresh the data
                                  window.location.reload();
                                } catch (error) {
                                  console.error("Failed to cancel registration:", error);
                                  alert("Failed to cancel registration. Please try again.");
                                }
                              }
                            }}
                            data-testid={`registration-cancel-${registration.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6" data-testid="dashboard-no-registrations">
                  You haven't registered for any events yet. Let's get started!
                </p>
                <Button
                  className="bg-gradient-to-r from-primary-blue to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-primary-blue text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="dashboard-browse-events"
                  onClick={() => navigate("/")}
                >
                  Back to home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}