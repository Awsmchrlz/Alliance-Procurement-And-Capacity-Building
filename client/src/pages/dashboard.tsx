import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { EventRegistration, Event } from "@shared/schema";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  LogOut,
  Building2,
  User,
  FileText,
  X,
  Eye,
  Download,
  Upload,
  AlertCircle,
  Star,
  ArrowRight,
  Home,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { EvidenceViewer } from "@/components/evidence-viewer";

interface RegistrationWithEvent extends EventRegistration {
  event: Event;
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"active" | "paid" | "cancelled">(
    "active",
  );

  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    registration: RegistrationWithEvent | null;
  }>({ open: false, registration: null });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [evidenceViewer, setEvidenceViewer] = useState<{
    open: boolean;
    evidencePath: string | null;
    fileName?: string;
    registrationId?: string;
  }>({ open: false, evidencePath: null });
  const [registrationModal, setRegistrationModal] = useState<{
    open: boolean;
    registrations: RegistrationWithEvent[];
  }>({ open: false, registrations: [] });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const {
    data: registrations,
    isLoading,
    refetch,
  } = useQuery<RegistrationWithEvent[]>({
    queryKey: ["/api/users", user?.id, "registrations"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/users/${user?.id}/registrations`,
      );
      return response.json();
    },
    enabled: !!user,
  });

  // Check for new registrations and show modal
  useEffect(() => {
    if (registrations && registrations.length > 0) {
      // Check if there are recent registrations (within last 5 minutes)
      const recentRegistrations = registrations.filter(reg => {
        if (!reg.registeredAt) return false;
        const registrationTime = new Date(reg.registeredAt);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return registrationTime > fiveMinutesAgo && reg.paymentStatus === 'pending';
      });
      
      if (recentRegistrations.length > 0) {
        // Check if we haven't shown this modal for these registrations yet
        const hasShownModal = sessionStorage.getItem('registrationModalShown');
        const currentRegistrationIds = recentRegistrations.map(r => r.id).sort().join(',');
        
        if (hasShownModal !== currentRegistrationIds) {
          setRegistrationModal({ open: true, registrations: recentRegistrations });
          sessionStorage.setItem('registrationModalShown', currentRegistrationIds);
        }
      }
    }
  }, [registrations]);

  const { paidRegistrations, pendingRegistrations, cancelledRegistrations } =
    useMemo(() => {
      return {
        paidRegistrations:
          registrations?.filter((r) => r.paymentStatus === "paid") || [],
        pendingRegistrations:
          registrations?.filter((r) => r.paymentStatus === "pending") || [],
        cancelledRegistrations:
          registrations?.filter((r) => r.paymentStatus === "cancelled") || [],
      };
    }, [registrations]);

  const handleEvidenceUpload = async () => {
    if (!evidenceFile || !uploadDialog.registration) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("evidence", evidenceFile);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session found");
      }

      const response = await fetch(
        `/api/users/evidence/${uploadDialog.registration.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload evidence");
      }

      toast({
        title: "Evidence Uploaded",
        description: "Payment evidence has been uploaded successfully.",
      });

      setUploadDialog({ open: false, registration: null });
      setEvidenceFile(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description:
          error.message ||
          "Failed to upload payment evidence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelRegistration = async (
    registration: RegistrationWithEvent,
  ) => {
    if (
      confirm(
        "Are you sure you want to cancel this registration? You can still view it in your cancelled registrations.",
      )
    ) {
      try {
        await apiRequest(
          "PATCH",
          `/api/users/${user?.id}/registrations/${registration.id}/cancel`,
        );
        toast({
          title: "Registration Cancelled",
          description: "Your registration has been cancelled successfully.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Cancellation Failed",
          description: "Failed to cancel registration. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          variant: "default" as const,
          class: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          label: "PAID",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          class: "bg-amber-100 text-amber-700 border-amber-200",
          icon: Clock,
          label: "PENDING",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          class: "bg-red-100 text-red-700 border-red-200",
          icon: X,
          label: "CANCELLED",
        };
      default:
        return {
          variant: "outline" as const,
          class: "bg-gray-100 text-gray-700 border-gray-200",
          icon: AlertCircle,
          label: status.toUpperCase(),
        };
    }
  };

  const renderRegistrationList = (
    list: RegistrationWithEvent[],
    emptyMessage: string,
  ) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {list.map((registration) => {
          const statusConfig = getStatusConfig(registration.paymentStatus);
          const StatusIcon = statusConfig.icon;

          return (
            <Card
              key={registration.id}
              className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden transition-all ${registration.paymentStatus === "cancelled" ? "opacity-70" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {registration.event.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <h3 className="text-xl font-bold text-gray-900">
                            {registration.event.title}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-blue" />
                            <span>
                              {format(
                                new Date(registration.event.startDate),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </div>
                          {registration.event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary-blue" />
                              <span>{registration.event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary-blue" />
                            <span>
                              {registration.currency && registration.pricePaid
                                ? `${registration.currency} ${registration.pricePaid}`
                                : `K${Number(registration.event.price).toFixed(2)}`}
                            </span>
                          </div>
                          {registration.organization && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-primary-blue" />
                              <span>{registration.organization}</span>
                            </div>
                          )}
                          {registration.country && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-primary-blue" />
                              <span>{registration.country}</span>
                            </div>
                          )}
                          {registration.delegateType && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary-blue" />
                              <span className="capitalize">
                                {registration.delegateType} Delegate
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Additional Registration Details */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {registration.position && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Position:
                                </span>
                                <span className="ml-2 text-gray-600">
                                  {registration.position}
                                </span>
                              </div>
                            )}

                            {registration.paymentMethod && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Payment Method:
                                </span>
                                <span className="ml-2 text-gray-600 capitalize">
                                  {registration.paymentMethod === "mobile"
                                    ? "Mobile Money"
                                    : registration.paymentMethod === "bank"
                                      ? "Bank Transfer"
                                      : registration.paymentMethod === "cash"
                                        ? "Cash Payment"
                                        : registration.paymentMethod}
                                </span>
                              </div>
                            )}
                            {registration.registrationNumber && (
                              <div>
                                <span className="font-medium text-gray-700">
                                  Registration #:
                                </span>
                                <span className="ml-2 text-gray-600 font-mono">
                                  {registration.registrationNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${statusConfig.class} px-3 py-1 text-sm font-medium flex items-center gap-1 self-start`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Payment Evidence */}
                    {registration.paymentEvidence && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              Payment Evidence Uploaded
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              console.log('🔍 Dashboard Debug - Opening evidence viewer:');
                              console.log('  - registration.paymentEvidence:', registration.paymentEvidence);
                              console.log('  - registration.id:', registration.id);
                              console.log('  - registration object:', registration);
                              
                              setEvidenceViewer({
                                open: true,
                                evidencePath: registration.paymentEvidence,
                                fileName: registration.paymentEvidence
                                  ?.split("/")
                                  .pop(),
                                registrationId: registration.id,
                              })
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column - Always rendered for consistent layout */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-40 flex-shrink-0">
                    {registration.paymentStatus === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                          onClick={() => handleCancelRegistration(registration)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-primary-blue">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6 text-center lg:text-left">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-[#FDC123]" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage your event registrations and track your learning
                  journey
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-[#FDC123]" />
                    <span className="text-white text-sm font-medium">
                      {paidRegistrations.length} Paid
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-[#FDC123]" />
                    <span className="text-white text-sm font-medium">
                      {pendingRegistrations.length} Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
              <Button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Events
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {registrations?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-[#2d4a7a] rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Paid Events
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {paidRegistrations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingRegistrations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>My Registrations</CardTitle>
            <div className="flex items-center justify-between mt-2">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <Button
                    variant={activeTab === "active" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("active")}
                  >
                    Active ({pendingRegistrations.length})
                  </Button>
                  <Button
                    variant={activeTab === "paid" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("paid")}
                  >
                    Paid ({paidRegistrations.length})
                  </Button>
                  <Button
                    variant={activeTab === "cancelled" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("cancelled")}
                  >
                    Cancelled ({cancelledRegistrations.length})
                  </Button>
                </nav>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <>
                {activeTab === "active" &&
                  renderRegistrationList(
                    pendingRegistrations,
                    "You have no active registrations.",
                  )}
                {activeTab === "paid" &&
                  renderRegistrationList(
                    paidRegistrations,
                    "You have no paid registrations.",
                  )}
                {activeTab === "cancelled" &&
                  renderRegistrationList(
                    cancelledRegistrations,
                    "You have no cancelled registrations.",
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evidence Upload Dialog */}
      <Dialog
        open={uploadDialog.open}
        onOpenChange={(open) => setUploadDialog({ open, registration: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Evidence</DialogTitle>
            <DialogDescription>
              Upload proof of payment for{" "}
              {uploadDialog.registration?.event.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="evidence">Payment Evidence</Label>
              <Input
                id="evidence"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            {evidenceFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {evidenceFile.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEvidenceFile(null)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setUploadDialog({ open: false, registration: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleEvidenceUpload}
              disabled={!evidenceFile || uploading}
              className="bg-primary-blue text-white hover:bg-[#2d4a7a]"
            >
              {uploading ? "Uploading..." : "Upload Evidence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Numbers Modal */}
      <Dialog
        open={registrationModal.open}
        onOpenChange={(open) => setRegistrationModal({ ...registrationModal, open })}
      >
        <DialogContent className="sm:max-w-2xl bg-slate-50 border border-slate-200 shadow-2xl">
          <DialogHeader className="bg-[#1C356B] text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              🎉 Registration Successful!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-100">
              Your registration{registrationModal.registrations.length > 1 ? 's have' : ' has'} been completed successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {registrationModal.registrations.map((registration) => (
              <div key={registration.id} className="bg-white border border-slate-300 rounded-xl p-6 shadow-md">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{registration.event.title}</h3>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl">🎫</span>
                    <h4 className="text-xl font-bold text-[#1C356B]">Your Registration Number</h4>
                  </div>
                  
                  <div className="bg-slate-100 rounded-lg border-2 border-slate-300 p-4 mb-4">
                    <div className="text-3xl font-mono font-black text-gray-900 tracking-wider">
                      {registration.registrationNumber}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <span className="text-xl">💡</span>
                    <span className="font-bold text-blue-800 text-lg">Important - Keep This Safe!</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Write down</strong> or <strong>screenshot</strong> this registration number</p>
                    <p>• You'll need it for event check-in and payment verification</p>
                    <p>• This number is also in your confirmation email</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-slate-600">📋</span>
                <span className="text-sm font-medium text-slate-700">
                  You can always find your registration numbers in the "Active" tab below
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              onClick={() => setRegistrationModal({ open: false, registrations: [] })}
              className="w-full bg-[#1C356B] hover:bg-[#2d4a7a] text-white font-semibold py-3 shadow-lg"
            >
              Perfect! I've got my registration number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Viewer */}
      <EvidenceViewer
        open={evidenceViewer.open}
        onOpenChange={(open) => setEvidenceViewer({ ...evidenceViewer, open })}
        evidencePath={evidenceViewer.evidencePath}
        fileName={evidenceViewer.fileName}
        registrationId={evidenceViewer.registrationId}
        canUpdate={false}
        onEvidenceUpdate={(newPath) => {
          setEvidenceViewer({
            ...evidenceViewer,
            evidencePath: newPath,
            open: true,
          });
          refetch();
        }}
      />
    </div>
  );
}
