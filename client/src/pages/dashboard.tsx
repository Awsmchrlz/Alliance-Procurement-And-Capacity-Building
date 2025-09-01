import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Upload,
  FileText,
  X,
  Eye,
  Download,
  AlertCircle,
  Star,
  ArrowRight,
  Home
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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const { data: registrations, isLoading, refetch } = useQuery<RegistrationWithEvent[]>({
    queryKey: ["/api/users", user?.id, "registrations"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${user?.id}/registrations`);
      return response.json();
    },
    enabled: !!user,
  });

  const handleEvidenceUpload = async () => {
    if (!evidenceFile || !uploadDialog.registration) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('evidence', evidenceFile);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Use direct fetch for FormData upload
      const response = await fetch(`/api/users/payment-evidence/${uploadDialog.registration.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload evidence');
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
        description: error.message || "Failed to upload payment evidence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelRegistration = async (registration: RegistrationWithEvent) => {
    if (confirm("Are you sure you want to cancel this registration? This action cannot be undone.")) {
      try {
        await apiRequest("DELETE", `/api/users/${user?.id}/registrations/${registration.id}`);
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
          label: "PAID"
        };
      case "pending":
        return {
          variant: "secondary" as const,
          class: "bg-amber-100 text-amber-700 border-amber-200",
          icon: Clock,
          label: "PENDING"
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          class: "bg-red-100 text-red-700 border-red-200",
          icon: X,
          label: "CANCELLED"
        };
      default:
        return {
          variant: "outline" as const,
          class: "bg-gray-100 text-gray-700 border-gray-200",
          icon: AlertCircle,
          label: status.toUpperCase()
        };
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-primary-blue">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const paidRegistrations = registrations?.filter(r => r.paymentStatus === "paid") || [];
  const pendingRegistrations = registrations?.filter(r => r.paymentStatus === "pending") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-[#2d4a7a] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Paid Events</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
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

        {/* Registrations */}
        {registrations && registrations.length > 0 ? (
          <div className="space-y-6">
            {registrations.map((registration) => {
              const statusConfig = getStatusConfig(registration.paymentStatus);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={registration.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary-blue" />
                                <span>{format(new Date(registration.event.startDate), "MMM d, yyyy")}</span>
                              </div>
                              {registration.event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary-blue" />
                                  <span>{registration.event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary-blue" />
                                <span>K{Number(registration.event.price).toFixed(2)}</span>
                              </div>
                              {registration.organization && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-primary-blue" />
                                  <span>{registration.organization}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={`${statusConfig.class} px-3 py-1 text-sm font-medium flex items-center gap-1`}>
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
                                <span className="text-sm text-blue-800">Payment Evidence Uploaded</span>
                              </div>
                                                             <Button
                                 size="sm"
                                 variant="outline"
                                 className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                 onClick={() => {
                                   setEvidenceViewer({
                                     open: true,
                                     evidencePath: registration.paymentEvidence,
                                     fileName: registration.paymentEvidence?.split('/').pop(),
                                     registrationId: registration.id
                                   });
                                 }}
                               >
                                 <Eye className="w-3 h-3 mr-1" />
                                 View
                               </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                        {registration.paymentStatus === "pending" && (
                          <>
                            <Button
                              onClick={() => setUploadDialog({ open: true, registration })}
                              className="bg-primary-yellow text-primary-blue hover:bg-yellow-400 font-semibold"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Evidence
                            </Button>
                            <Button
                              variant="outline"
                              className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleCancelRegistration(registration)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-gray-600 mb-6">You haven't registered for any events yet.</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-primary-blue to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-primary-blue text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Browse Events
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evidence Upload Dialog */}
      <Dialog open={uploadDialog.open} onOpenChange={(open) => setUploadDialog({ open, registration: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Evidence</DialogTitle>
            <DialogDescription>
              Upload proof of payment for {uploadDialog.registration?.event.title}
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
                    <span className="text-sm text-blue-800">{evidenceFile.name}</span>
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
              onClick={() => setUploadDialog({ open: false, registration: null })}
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

       {/* Evidence Viewer */}
       <EvidenceViewer
         open={evidenceViewer.open}
         onOpenChange={(open) => setEvidenceViewer({ ...evidenceViewer, open })}
         evidencePath={evidenceViewer.evidencePath}
         fileName={evidenceViewer.fileName}
         registrationId={evidenceViewer.registrationId}
         canUpdate={true}
         onEvidenceUpdate={(newPath) => {
           // Update the evidence viewer with the new path
           setEvidenceViewer({ 
             ...evidenceViewer, 
             evidencePath: newPath,
             open: true 
           });
           // Refetch the registrations to get updated data
           refetch();
         }}
       />
     </div>
   );
 }