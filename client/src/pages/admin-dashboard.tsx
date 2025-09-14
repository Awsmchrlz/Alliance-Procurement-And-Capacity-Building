import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  DollarSign,
  Mail,
  Send,
  MoreHorizontal,
  Crown,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Activity,
  BarChart3,
  MessageCircle,
  Star,
  Target,
  Shield,
  UserCog,
  LogOut,
  Eye,
  UserPlus,
  Plus,
  CalendarPlus,
  FileText,
  Phone,
  MapPin,
  CreditCard,
  User,
  History,
  RotateCcw,
  Loader2,
  X,
  Check,
  Info,
} from "lucide-react";

import { EvidenceViewer } from "@/components/evidence-viewer";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Real data interfaces
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: string;
  currentAttendees: number;
  maxAttendees: number;
  featured: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  title: string | null;
  role: string;
  createdAt: string;
}

interface Registration {
  id: string;
  registrationNumber: string;
  userId: string;
  eventId: string;
  paymentStatus: string;
  paymentEvidence: string | null;
  paymentMethod: string | null;
  currency: string | null;
  pricePaid: string | null;
  delegateType: string | null;

  gender: string | null;
  country: string | null;
  organization: string | null;

  position: string | null;
  hasPaid: boolean;
  registeredAt: string;
  event?: Event;
  user?: User;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email functionality
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Email campaign functionality
  const [emailContent, setEmailContent] = useState("");
  const [emailRecipientType, setEmailRecipientType] = useState("all");
  const [emailSending, setEmailSending] = useState(false);
  const [excludedUserIds, setExcludedUserIds] = useState<Set<string>>(new Set());

  // Role change functionality
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    role: string;
    userName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Evidence viewer
  const [evidenceViewer, setEvidenceViewer] = useState<{
    open: boolean;
    evidencePath: string;
    fileName?: string;
    registrationId?: string;
  }>({
    open: false,
    evidencePath: "",
  });

  // Admin user registration functionality
  const [showUserRegistrationDialog, setShowUserRegistrationDialog] =
    useState(false);
  const [userRegistrationData, setUserRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "ordinary_user",
  });
  const [userRegistrationLoading, setUserRegistrationLoading] = useState(false);

  // Admin event registration functionality
  const [showEventRegistrationDialog, setShowEventRegistrationDialog] =
    useState(false);
  const [eventRegistrationData, setEventRegistrationData] = useState({
    userId: "",
    eventId: "",
    country: "",
    organization: "",

    position: "",
    hasPaid: false,
    paymentStatus: "pending",
  });
  const [eventRegistrationLoading, setEventRegistrationLoading] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);

  // Email campaign helper functions
  const getEmailRecipients = () => {
    let recipients = [];
    
    if (emailRecipientType === "all") {
      recipients = users;
    } else {
      recipients = users.filter((user) => user.role === emailRecipientType);
    }
    
    // Filter out excluded users
    return recipients
      .filter(user => !excludedUserIds.has(user.id))
      .map((user) => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      }));
  };
  
  const toggleExcludeUser = (userId: string) => {
    setExcludedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
  const resetExcludedUsers = () => {
    setExcludedUserIds(new Set());
  };
  
  const getFilteredUsers = () => {
    if (emailRecipientType === "all") {
      return users;
    }
    return users.filter(user => user.role === emailRecipientType);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim() || !emailRecipientType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setEmailSending(true);

      const recipients = getEmailRecipients();
      
      // Format recipients to match the expected API format
      const formattedRecipients = recipients.map(({ email, name }) => ({ email, name }));

      const response = await fetch("/api/email/campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          recipients: formattedRecipients,
          subject: emailSubject,
          content: emailContent,
          recipientType: emailRecipientType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email campaign");
      }

      toast({
        title: "Email Campaign Sent!",
        description: `Successfully sent to ${recipients.length} recipients`,
      });

      // Clear form
      setEmailSubject("");
      setEmailContent("");
      setEmailRecipientType("all");
    } catch (error: any) {
      console.error("Email campaign error:", error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email campaign",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Fetch real data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
      setFilteredEvents(events);
      setFilteredRegistrations(registrations);
    } else {
      const term = searchTerm.toLowerCase();

      // Filter users
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term),
        ),
      );

      // Filter events
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term),
        ),
      );

      // Filter registrations
      setFilteredRegistrations(
        registrations.filter(
          (registration) =>
            registration.user?.firstName.toLowerCase().includes(term) ||
            registration.user?.lastName.toLowerCase().includes(term) ||
            registration.user?.email.toLowerCase().includes(term) ||
            registration.event?.title.toLowerCase().includes(term) ||
            registration.paymentStatus.toLowerCase().includes(term) ||
            registration.registrationNumber?.toLowerCase().includes(term),
        ),
      );
    }
  }, [searchTerm, users, events, registrations]);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("No active session found");
        return;
      }

      // Get current user's role from Supabase metadata
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setError("Failed to get user information");
        return;
      }

      // Set user role from metadata
      const userRole = currentUser.user_metadata?.role || "ordinary_user";
      console.log("Current user role:", userRole);
      console.log("Current user metadata:", currentUser.user_metadata);

      // Fetch events (public endpoint)
      try {
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }

      // Only fetch admin data if user has admin role
      if (
        userRole === "super_admin" ||
        userRole === "finance_person" ||
        userRole === "event_manager"
      ) {
        // Fetch users
        try {
          const usersResponse = await fetch(`/api/admin/users`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (usersResponse.ok) {
            const { users: usersData } = await usersResponse.json();
            setUsers(usersData || []);
          } else {
            console.error(
              "Failed to fetch users:",
              usersResponse.status,
              usersResponse.statusText,
            );
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        }

        // Fetch registrations
        try {
          const registrationsResponse = await fetch(
            `/api/admin/registrations`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          );
          if (registrationsResponse.ok) {
            const registrationsData = await registrationsResponse.json();
            console.log("Fetched registrations:", registrationsData);
            setRegistrations(registrationsData);
          } else {
            console.error(
              "Failed to fetch registrations:",
              registrationsResponse.status,
              registrationsResponse.statusText,
            );
          }
        } catch (err) {
          console.error("Error fetching registrations:", err);
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await refreshData();
  };

  // Get auth permissions
  const {
    user,
    isSuperAdmin,
    isFinancePerson,
    isEventManager,
    isAdmin,
    canManageUsers,
    canManageFinance,
    canUpdatePaymentStatus,
    canRegisterUsers,
    canManageEvents,
  } = useAuth();

  // Redirect ordinary users to user dashboard
  useEffect(() => {
    if (user && !isAdmin) {
      window.location.href = "/dashboard";
    }
  }, [user, isAdmin]);

  // Payment status update handler
  const handlePaymentStatusUpdate = async (
    registrationId: string,
    newStatus: string,
  ) => {
    try {
      const hasPaid = newStatus === "paid";

      await apiRequest("PATCH", `/api/admin/registrations/${registrationId}`, {
        paymentStatus: newStatus,
        hasPaid,
      });

      toast({
        title: "Payment Status Updated",
        description: `Registration marked as ${newStatus}`,
      });

      // Refresh the data
      await refreshData();
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  // Calculate analytics
  const totalRevenue = registrations
    .filter(
      (reg) =>
        reg.paymentStatus === "completed" || reg.paymentStatus === "paid",
    )
    .reduce((sum, reg) => sum + parseFloat(reg.event?.price || "0"), 0);

  const pendingPayments = registrations.filter(
    (reg) => reg.paymentStatus === "pending",
  ).length;
  const completedPayments = registrations.filter(
    (reg) => reg.paymentStatus === "completed" || reg.paymentStatus === "paid",
  ).length;
  const superAdminUsers = users?.filter((u) => u.role === "super_admin").length || 0;
  const financeUsers = users?.filter((u) => u.role === "finance_person").length || 0;
  const eventManagerUsers = users?.filter(
    (u) => u.role === "event_manager",
  ).length || 0;

  const handleRoleChangeRequest = (
    userId: string,
    newRole: string,
    userName: string,
  ) => {
    setConfirmRoleChange({ userId, role: newRole, userName });
  };

  const confirmRoleChangeAction = async () => {
    if (!confirmRoleChange) return;

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session found");
      }

      const response = await fetch(
        `/api/admin/users/${confirmRoleChange.userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            role: confirmRoleChange.role,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user role");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === confirmRoleChange.userId
            ? { ...u, role: confirmRoleChange.role as any }
            : u,
        ),
      );

      toast({
        title: "Role Updated Successfully",
        description: `${confirmRoleChange.userName}'s role has been changed to ${confirmRoleChange.role.replace("_", " ")}.`,
      });

      setConfirmRoleChange(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Role Update Failed",
        description:
          err.message || "Failed to update user role. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailBlast = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Error",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/email-blast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message,
        });
        setEmailSubject("");
        setEmailMessage("");
        setShowEmailDialog(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        variant: "default",
        color: "bg-emerald-500 text-white",
        icon: CheckCircle,
        label: "Completed",
      },
      paid: {
        variant: "default",
        color: "bg-emerald-500 text-white",
        icon: CheckCircle,
        label: "Paid",
      },
      pending: {
        variant: "secondary",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        icon: Clock,
        label: "Pending",
      },
      cancelled: {
        variant: "destructive",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: XCircle,
        label: "Cancelled",
      },
      failed: {
        variant: "destructive",
        color: "bg-red-500 text-white",
        icon: XCircle,
        label: "Failed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge
        variant={
          config.variant as "default" | "destructive" | "secondary" | "outline"
        }
        className={config.color}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleViewPaymentEvidence = (
    evidencePath: string,
    fileName?: string,
    registrationId?: string,
  ) => {
    setEvidenceViewer({
      open: true,
      evidencePath,
      fileName,
      registrationId,
    });
  };

  const handleEvidenceUpdate = (newEvidencePath: string) => {
    // Update the registrations list with the new evidence path
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === evidenceViewer.registrationId
          ? { ...reg, paymentEvidence: newEvidencePath }
          : reg,
      ),
    );

    // Update filtered registrations as well
    setFilteredRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === evidenceViewer.registrationId
          ? { ...reg, paymentEvidence: newEvidencePath }
          : reg,
      ),
    );

    console.log("✅ Evidence updated in admin dashboard:", newEvidencePath);
  };

  const exportToExcel = (type: string) => {
    try {
      let data: any[] = [];
      let filename = "";
      let headers: string[] = [];

      switch (type) {
        case "users":
          data = users.map((user) => ({
            "User ID": user.id,
            "First Name": user.firstName,
            "Last Name": user.lastName,
            Email: user.email,
            "Phone Number": user.phoneNumber || "N/A",
            Role: user.role,
            "Created At": formatTime(user.createdAt),
          }));
          filename = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
          headers = [
            "User ID",
            "First Name",
            "Last Name",
            "Email",
            "Phone Number",
            "Role",
            "Created At",
          ];
          break;

        case "registrations":
          data = registrations.map((registration) => ({
            "Registration ID": registration.id,
            "Registration Number": registration.registrationNumber || "N/A",
            "User Name": registration.user
              ? `${registration.user.firstName} ${registration.user.lastName}`
              : "Unknown User",
            "User Email": registration.user?.email || "N/A",

            Gender: registration.gender || "N/A",
            Country: registration.country || "N/A",
            Organization: registration.organization || "N/A",
            Position: registration.position || "N/A",
            "Event Title": registration.event?.title || "Unknown Event",
            "Event Location": registration.event?.location || "N/A",
            "Event Date": registration.event?.startDate
              ? formatDate(registration.event.startDate)
              : "N/A",
            "Delegate Type": registration.delegateType || "N/A",
            "Payment Status": registration.paymentStatus,
            "Payment Method": registration.paymentMethod || "N/A",
            Currency: registration.currency || "N/A",
            "Price Paid":
              registration.pricePaid || registration.event?.price || "N/A",
            "Has Paid": registration.hasPaid ? "Yes" : "No",
            "Payment Evidence": registration.paymentEvidence ? "Yes" : "No",
            "Registered At": formatTime(registration.registeredAt),
          }));
          filename = `registrations_export_${new Date().toISOString().split("T")[0]}.csv`;
          headers = [
            "Registration ID",
            "Registration Number",
            "User Name",
            "User Email",
            "Gender",
            "Country",
            "Organization",
            "Position",
            "Event Title",
            "Event Location",
            "Event Date",
            "Delegate Type",
            "Payment Status",
            "Payment Method",
            "Currency",
            "Price Paid",
            "Has Paid",
            "Payment Evidence",
            "Notes",
            "Registered At",
          ];
          break;

        case "events":
          data = events.map((event) => ({
            "Event ID": event.id,
            Title: event.title,
            Description: event.description || "N/A",
            "Start Date": formatDate(event.startDate),
            "End Date": event.endDate ? formatDate(event.endDate) : "N/A",
            Location: event.location,
            Price: `K${event.price}`,
            "Current Attendees": event.currentAttendees,
            "Max Attendees": event.maxAttendees || "Unlimited",
            Featured: event.featured ? "Yes" : "No",
          }));
          filename = `events_export_${new Date().toISOString().split("T")[0]}.csv`;
          headers = [
            "Event ID",
            "Title",
            "Description",
            "Start Date",
            "End Date",
            "Location",
            "Price",
            "Current Attendees",
            "Max Attendees",
            "Featured",
          ];
          break;

        case "newsletter":
          data = users.map((user) => ({
            "User ID": user.id,
            Name: `${user.firstName} ${user.lastName}`,
            Email: user.email,
            "Phone Number": user.phoneNumber || "N/A",
            Role: user.role,
            "Created At": formatTime(user.createdAt),
          }));
          filename = `users_email_list_export_${new Date().toISOString().split("T")[0]}.csv`;
          headers = [
            "User ID",
            "Name",
            "Email",
            "Phone Number",
            "Role",
            "Created At",
          ];
          break;

        default:
          console.error("Unknown export type:", type);
          return;
      }

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (
                typeof value === "string" &&
                (value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n"))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(","),
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message
        toast({
          title: "Export Successful",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully as ${filename}`,
        });
      } else {
        // Fallback for older browsers
        window.open(
          "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent),
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Failed to export ${type}. Please try again.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Loading Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Fetching data from database...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Error Loading Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {error}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={fetchData} variant="outline" className="mr-2">
              Retry
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="default"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user can access admin dashboard
  if (
    !user ||
    (user.role !== "super_admin" &&
      user.role !== "finance_person" &&
      user.role !== "event_manager")
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Access Restricted
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Administrator privileges are required to access this dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Please contact your system administrator if you believe this is an
              error.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#FDC123]" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                      Admin Dashboard
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                      Alliance Procurement & Capacity Building Ltd
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-6 text-right">
                <div className="text-white/90">
                    <div className="text-2xl font-bold">{users.length}</div>
                    <div className="text-sm text-blue-200">Total Users</div>
                  </div>
                <div className="text-white/90">
                    <div className="text-2xl font-bold">{registrations.length}</div>
                    <div className="text-sm text-blue-200">Total Registrations</div>
                  </div>
                  <div className="text-white/90">
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-sm text-blue-200">Active Events</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-[#1C356B] text-white text-lg font-semibold">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      Welcome back, {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      System Administrator • Last login: Today
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#FDC123]" />
                  <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <span className="hidden sm:inline">Home</span>
                    <span className="sm:hidden">🏠</span>
                  </Button>
                  <Button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>

              {/* Global Search Bar */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search users, events, registrations (including registration numbers)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] rounded-xl shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-600">
                    Found {filteredUsers.length} users, {filteredEvents.length}{" "}
                    events, {filteredRegistrations.length} registrations
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Events
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {events.length}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">
                      {superAdminUsers} Super Admins, {financeUsers} Finance,{" "}
                      {eventManagerUsers} Event Managers
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    K{totalRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">
                      {completedPayments} Paid
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#FDC123] to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-1 shadow-sm overflow-x-auto">
            <TabsList
              className={`grid w-full ${canManageUsers && canManageEvents ? "grid-cols-5" : canManageUsers || canManageEvents ? "grid-cols-4" : "grid-cols-3"} bg-transparent gap-1 min-w-[600px] sm:min-w-0`}
            >
              {/* Overview - All admin roles can see */}
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Overview</span>
              </TabsTrigger>

              {/* Users - Only super_admin can manage users */}
              {canManageUsers && (
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Users</span>
                </TabsTrigger>
              )}

              {/* Events - super_admin and event_manager can manage events */}
              {canManageEvents && (
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Events</span>
                </TabsTrigger>
              )}

              {/* Registrations - All admin roles can see */}
              <TabsTrigger
                value="registrations"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
              >
                <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Regs</span>
              </TabsTrigger>

              {/* Emails - Only super_admin can send emails */}
              {isSuperAdmin && (
                <TabsTrigger
                  value="emails"
                  className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Emails</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {canManageFinance && (
                <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Payment Analytics
                    </CardTitle>
                    <CardDescription>
                      Overview of payment statuses and revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-900">
                              Completed Payments
                            </p>
                            <p className="text-sm text-emerald-700">
                              K{totalRevenue.toFixed(2)} revenue
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500 text-white text-lg px-3 py-1">
                          {completedPayments}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-amber-900">
                              Pending Payments
                            </p>
                            <p className="text-sm text-amber-700">
                              Awaiting confirmation
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-amber-200 text-amber-800 text-lg px-3 py-1"
                        >
                          {pendingPayments}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">
                              Total Registrations
                            </p>
                            <p className="text-sm text-blue-700">
                              All event registrations
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-lg px-3 py-1 border-blue-200 text-blue-800"
                        >
                          {registrations.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!canManageFinance && (
                <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-amber-500" />
                      Financial Analytics
                    </CardTitle>
                    <CardDescription>
                      Financial information access restricted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Access Restricted
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Financial analytics are only available to Super Admins
                        and Finance Persons.
                      </p>
                      <p className="text-xs text-gray-500">
                        Contact your administrator if you need access to
                        financial data.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                    Communication Center
                  </CardTitle>
                  <CardDescription>
                    Send emails to all registered users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <Mail className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-1">
                      Ready to Send
                    </h3>
                    <p className="text-purple-700 text-sm mb-4">
                      {users.length} registered users waiting for your updates
                    </p>
                    <Button
                      onClick={() => setShowEmailDialog(true)}
                      className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Email to Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {!canManageUsers && (
            <TabsContent value="users">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <Users className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      User Management Restricted
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md">
                      User management is only available to Super Admins. This
                      includes creating users, changing roles, and managing user
                      accounts.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Your current role:</strong>{" "}
                        {user?.role
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canManageUsers && (
            <TabsContent value="users">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C356B]" />
                        User Management
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Manage user accounts, roles, and permissions
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                      {canRegisterUsers && (
                        <Button
                          onClick={() => setShowUserRegistrationDialog(true)}
                          className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Add New User</span>
                          <span className="sm:hidden">Add User</span>
                        </Button>
                      )}
                      {canRegisterUsers && (
                        <Button
                          onClick={() => setShowEventRegistrationDialog(true)}
                          variant="outline"
                          className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10 min-h-[44px]"
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">
                            Register for Event
                          </span>
                          <span className="sm:hidden">Event Reg</span>
                        </Button>
                      )}
                      <Button
                        onClick={() => exportToExcel("users")}
                        variant="outline"
                        className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10 min-h-[44px]"
                      >
                        <span className="hidden sm:inline">
                          Download Users as Excel
                        </span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">
                            User Details
                          </TableHead>
                          <TableHead className="font-semibold">
                            Contact Info
                          </TableHead>
                          <TableHead className="font-semibold">
                            Role & Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Join Date
                          </TableHead>
                          <TableHead className="font-semibold text-center">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((userData, index) => (
                          <TableRow
                            key={userData.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="border-2 border-slate-200">
                                  <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                    {userData.firstName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                    {userData.lastName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {userData.firstName} {userData.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {userData.id?.slice(0, 8) || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-900">
                                  {userData.email}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {userData.phoneNumber || "No phone"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {userData.role === "super_admin" ? (
                                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Super Admin
                                </Badge>
                              ) : userData.role === "finance_person" ? (
                                <Badge className="bg-emerald-500 text-white">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Finance Person
                                </Badge>
                              ) : userData.role === "event_manager" ? (
                                <Badge className="bg-blue-500 text-white">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Event Manager
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-gray-300"
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Ordinary User
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {userData.createdAt
                                  ? formatDate(userData.createdAt)
                                  : "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-slate-100"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56 bg-white border border-slate-200 shadow-lg rounded-md"
                                >
                                  {isSuperAdmin &&
                                    user &&
                                    userData.id !== user.id && (
                                      <>
                                        {userData.role !== "super_admin" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleRoleChangeRequest(
                                                userData.id,
                                                "super_admin",
                                                `${userData.firstName} ${userData.lastName}`,
                                              )
                                            }
                                            className="text-purple-600"
                                          >
                                            <Crown className="w-4 h-4 mr-2" />
                                            Make Super Admin
                                          </DropdownMenuItem>
                                        )}
                                        {userData.role !== "finance_person" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleRoleChangeRequest(
                                                userData.id,
                                                "finance_person",
                                                `${userData.firstName} ${userData.lastName}`,
                                              )
                                            }
                                            className="text-green-600"
                                          >
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Make Finance Person
                                          </DropdownMenuItem>
                                        )}
                                        {userData.role !== "event_manager" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleRoleChangeRequest(
                                                userData.id,
                                                "event_manager",
                                                `${userData.firstName} ${userData.lastName}`,
                                              )
                                            }
                                            className="text-blue-600"
                                          >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Make Event Manager
                                          </DropdownMenuItem>
                                        )}
                                        {userData.role !== "ordinary_user" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleRoleChangeRequest(
                                                userData.id,
                                                "ordinary_user",
                                                `${userData.firstName} ${userData.lastName}`,
                                              )
                                            }
                                            className="text-amber-600"
                                          >
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Make Ordinary User
                                          </DropdownMenuItem>
                                        )}
                                      </>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredUsers.map((userData, index) => (
                      <Card
                        key={userData.id}
                        className="border border-slate-200 shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* User Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="border-2 border-slate-200 w-12 h-12">
                                  <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                    {userData.firstName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                    {userData.lastName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900 text-lg">
                                    {userData.firstName} {userData.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {userData.id?.slice(0, 8) || "N/A"}
                                  </div>
                                </div>
                              </div>
                              {isSuperAdmin &&
                                user &&
                                userData.id !== user.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 w-10 p-0"
                                      >
                                        <MoreHorizontal className="w-5 h-5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-56 bg-white border border-slate-200 shadow-lg rounded-md"
                                    >
                                      {userData.role !== "super_admin" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRoleChangeRequest(
                                              userData.id,
                                              "super_admin",
                                              `${userData.firstName} ${userData.lastName}`,
                                            )
                                          }
                                          className="text-purple-600"
                                        >
                                          <Crown className="w-4 h-4 mr-2" />
                                          Make Super Admin
                                        </DropdownMenuItem>
                                      )}
                                      {userData.role !== "finance_person" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRoleChangeRequest(
                                              userData.id,
                                              "finance_person",
                                              `${userData.firstName} ${userData.lastName}`,
                                            )
                                          }
                                          className="text-green-600"
                                        >
                                          <DollarSign className="w-4 h-4 mr-2" />
                                          Make Finance Person
                                        </DropdownMenuItem>
                                      )}
                                      {userData.role !== "event_manager" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRoleChangeRequest(
                                              userData.id,
                                              "event_manager",
                                              `${userData.firstName} ${userData.lastName}`,
                                            )
                                          }
                                          className="text-blue-600"
                                        >
                                          <Calendar className="w-4 h-4 mr-2" />
                                          Make Event Manager
                                        </DropdownMenuItem>
                                      )}
                                      {userData.role !== "ordinary_user" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRoleChangeRequest(
                                              userData.id,
                                              "ordinary_user",
                                              `${userData.firstName} ${userData.lastName}`,
                                            )
                                          }
                                          className="text-amber-600"
                                        >
                                          <UserCheck className="w-4 h-4 mr-2" />
                                          Make Ordinary User
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-900">
                                  {userData.email}
                                </span>
                              </div>
                              {userData.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-900">
                                    {userData.phoneNumber}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Role and Date */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div>
                                {userData.role === "super_admin" ? (
                                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Super Admin
                                  </Badge>
                                ) : userData.role === "finance_person" ? (
                                  <Badge className="bg-emerald-500 text-white">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Finance Person
                                  </Badge>
                                ) : userData.role === "event_manager" ? (
                                  <Badge className="bg-blue-500 text-white">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Event Manager
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-gray-300"
                                  >
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Ordinary User
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined:{" "}
                                {userData.createdAt
                                  ? formatDate(userData.createdAt)
                                  : "Unknown"}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!canManageEvents && (
            <TabsContent value="events">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                      <Calendar className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Event Management Restricted
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md">
                      Event management is only available to Super Admins and
                      Event Managers. This includes creating events, editing
                      event details, and managing event settings.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Your current role:</strong>{" "}
                        {user?.role
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canManageEvents && (
            <TabsContent value="events">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C356B]" />
                        Event Management
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Overview and management of all training events
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">
                            Event Details
                          </TableHead>
                          <TableHead className="font-semibold">
                            Schedule
                          </TableHead>
                          <TableHead className="font-semibold">
                            Location
                          </TableHead>
                          <TableHead className="font-semibold">
                            Pricing
                          </TableHead>
                        
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event, index) => (
                          <TableRow
                            key={event.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }
                          >
                            <TableCell>
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-900 text-base">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                                  {event.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(event.startDate)}
                                </div>
                                {event.endDate &&
                                  event.startDate &&
                                  event.endDate !== event.startDate && (
                                    <div className="text-sm text-gray-500">
                                      to {formatDate(event.endDate)}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                {event.location || "To be announced"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-lg text-[#1C356B]">
                                K{event.price}
                              </div>
                            </TableCell>
                          
                            <TableCell>
                              {event.featured ? (
                                <Badge className="bg-gradient-to-r from-[#FDC123] to-amber-500 text-[#1C356B] font-semibold">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-300 text-emerald-700 bg-emerald-50"
                                >
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredEvents.map((event, index) => (
                      <Card
                        key={event.id}
                        className="border border-slate-200 shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Event Header */}
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900 text-lg">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {event.description}
                              </div>
                            </div>

                            {/* Event Details Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Schedule
                                </div>
                                <div className="text-sm font-medium">
                                  {formatDate(event.startDate)}
                                </div>
                                {event.endDate &&
                                  event.startDate &&
                                  event.endDate !== event.startDate && (
                                    <div className="text-xs text-gray-500">
                                      to {formatDate(event.endDate)}
                                    </div>
                                  )}
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Price
                                </div>
                                <div className="font-semibold text-lg text-[#1C356B]">
                                  K{event.price}
                                </div>
                              </div>
                            </div>

                            {/* Location and Attendance */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Location
                                </div>
                                <div className="text-sm text-gray-900">
                                  {event.location || "To be announced"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Attendance
                                </div>
                                <div className="text-sm font-medium">
                                  {event.currentAttendees || 0}
                                  {event.maxAttendees &&
                                    ` of ${event.maxAttendees}`}
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div>
                                {event.featured ? (
                                  <Badge className="bg-gradient-to-r from-[#FDC123] to-amber-500 text-[#1C356B] font-semibold">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-300 text-emerald-700 bg-emerald-50"
                                  >
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="registrations">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <UserCog className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C356B]" />
                      Registration Management
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Monitor and manage event registrations and payment
                      statuses
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                    <Button
                      onClick={() => setShowEventRegistrationDialog(true)}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        Register User for Event
                      </span>
                      <span className="sm:hidden">Register User</span>
                    </Button>
                    <Button
                      onClick={() => exportToExcel("registrations")}
                      variant="outline"
                      className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10 min-h-[44px]"
                    >
                      <span className="hidden sm:inline">
                        Download Registrations as Excel
                      </span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden lg:block rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold">Reg. #</TableHead>
                        <TableHead className="font-semibold">
                          Participant
                        </TableHead>
                        <TableHead className="font-semibold">Country</TableHead>
                        <TableHead className="font-semibold">
                          Organization
                        </TableHead>
                        <TableHead className="font-semibold">
                          Delegate Type
                        </TableHead>
                        <TableHead className="font-semibold">Event</TableHead>
                        <TableHead className="font-semibold">
                          Registration
                        </TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Method</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">
                          Evidence
                        </TableHead>
                        <TableHead className="font-semibold text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration, index) => (
                        <TableRow
                          key={registration.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }
                        >
                          <TableCell>
                            <div className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {registration.registrationNumber || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                  {registration.user?.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                  {registration.user?.lastName
                                    ?.charAt(0)
                                    ?.toUpperCase() || ""}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {registration.user
                                    ? `${registration.user.firstName} ${registration.user.lastName}`
                                    : "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {registration.user?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-700">
                              {registration.country || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {registration.organization || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                registration.delegateType === "international"
                                  ? "border-blue-300 text-blue-700 bg-blue-50"
                                  : registration.delegateType === "private"
                                    ? "border-green-300 text-green-700 bg-green-50"
                                    : "border-purple-300 text-purple-700 bg-purple-50"
                              }
                            >
                              {registration.delegateType === "international"
                                ? "International"
                                : registration.delegateType === "private"
                                  ? "Private"
                                  : registration.delegateType === "public"
                                    ? "Public"
                                    : "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {registration.event?.title || "Unknown Event"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {registration.event?.startDate
                                  ? formatDate(registration.event.startDate)
                                  : "No date"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {registration.registeredAt
                                ? formatDate(registration.registeredAt)
                                : "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(registration.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {registration.paymentMethod === "mobile" && (
                                <Badge
                                  variant="outline"
                                  className="border-green-300 text-green-700 bg-green-50"
                                >
                                  Mobile Money
                                </Badge>
                              )}
                              {registration.paymentMethod === "bank" && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-300 text-blue-700 bg-blue-50"
                                >
                                  Bank Transfer
                                </Badge>
                              )}
                              {registration.paymentMethod === "cash" && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-300 text-amber-700 bg-amber-50"
                                >
                                  Cash
                                </Badge>
                              )}
                              {!registration.paymentMethod && (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-lg text-[#1C356B]">
                              {registration.currency && registration.pricePaid
                                ? `${registration.currency} ${registration.pricePaid}`
                                : registration.event?.price
                                  ? `K${registration.event.price}`
                                  : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {registration.paymentEvidence &&
                            registration.paymentEvidence.trim() ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleViewPaymentEvidence(
                                      registration.paymentEvidence || "",
                                      registration.paymentEvidence
                                        ?.split("/")
                                        .pop(),
                                      registration.id,
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Evidence
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No evidence
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-slate-100"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 bg-white border border-slate-200 shadow-lg rounded-md"
                              >
                                {canUpdatePaymentStatus && (
                                  <>
                                    <DropdownMenuItem
                                      disabled={
                                        registration.paymentStatus ===
                                          "completed" ||
                                        registration.paymentStatus === "paid"
                                      }
                                      className="text-emerald-600"
                                      onSelect={() =>
                                        handlePaymentStatusUpdate(
                                          registration.id,
                                          "paid",
                                        )
                                      }
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as Paid
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={
                                        registration.paymentStatus === "pending"
                                      }
                                      className="text-amber-600"
                                      onSelect={() =>
                                        handlePaymentStatusUpdate(
                                          registration.id,
                                          "pending",
                                        )
                                      }
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      Mark as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={
                                        registration.paymentStatus ===
                                        "cancelled"
                                      }
                                      className="text-red-600"
                                      onSelect={() =>
                                        handlePaymentStatusUpdate(
                                          registration.id,
                                          "cancelled",
                                        )
                                      }
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Mark as Cancelled
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {!canUpdatePaymentStatus && (
                                  <DropdownMenuItem
                                    disabled
                                    className="text-gray-400"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Payment actions restricted
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredRegistrations.map((registration, index) => (
                    <Card
                      key={registration.id}
                      className="border border-slate-200 shadow-sm"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Registration Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                  {registration.user?.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                  {registration.user?.lastName
                                    ?.charAt(0)
                                    ?.toUpperCase() || ""}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {registration.user
                                    ? `${registration.user.firstName} ${registration.user.lastName}`
                                    : "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  #{registration.registrationNumber || "N/A"}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(registration.paymentStatus)}
                          </div>

                          {/* Event Info */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                              {registration.event?.title || "Unknown Event"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {registration.event?.startDate
                                ? formatDate(registration.event.startDate)
                                : "No date"}
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Country
                              </div>
                              <div className="text-gray-900">
                                {registration.country || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Delegate Type
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  registration.delegateType === "international"
                                    ? "border-blue-300 text-blue-700 bg-blue-50 text-xs"
                                    : registration.delegateType === "private"
                                      ? "border-green-300 text-green-700 bg-green-50 text-xs"
                                      : "border-purple-300 text-purple-700 bg-purple-50 text-xs"
                                }
                              >
                                {registration.delegateType === "international"
                                  ? "Intl"
                                  : registration.delegateType === "private"
                                    ? "Private"
                                    : registration.delegateType === "public"
                                      ? "Public"
                                      : "N/A"}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Organization
                              </div>
                              <div className="font-medium text-gray-900">
                                {registration.organization || ""}
                              </div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <div className="font-medium">
                                  K{registration.event?.price || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {registration.paymentMethod === "mobile"
                                    ? "Mobile Money"
                                    : registration.paymentMethod === "bank"
                                      ? "Bank Transfer"
                                      : registration.paymentMethod || "N/A"}
                                </div>
                              </div>
                              {registration.paymentEvidence && (
                                <Button
                                  onClick={() => {
                                    console.log('🔍 Admin Dashboard Debug - Opening evidence viewer:');
                                    console.log('  - registration.paymentEvidence:', registration.paymentEvidence);
                                    console.log('  - registration.id:', registration.id);
                                    console.log('  - registration.user:', registration.user);
                                    console.log('  - registration object:', registration);
                                    
                                    setEvidenceViewer({
                                      open: true,
                                      evidencePath:
                                        registration.paymentEvidence || "",
                                      fileName: `${registration.user?.firstName}_${registration.user?.lastName}_payment_evidence`,
                                      registrationId: registration.id,
                                    })
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Evidence
                                </Button>
                              )}
                            </div>

                            {/* Payment Status Update Buttons */}
                            {canUpdatePaymentStatus && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(
                                      registration.id,
                                      "paid",
                                    )
                                  }
                                  disabled={
                                    registration.paymentStatus === "paid"
                                  }
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(
                                      registration.id,
                                      "pending",
                                    )
                                  }
                                  disabled={
                                    registration.paymentStatus === "pending"
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Mark Pending
                                </Button>
                                <Button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(
                                      registration.id,
                                      "cancelled",
                                    )
                                  }
                                  disabled={
                                    registration.paymentStatus === "cancelled"
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-red-600 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          {isSuperAdmin && (
            <TabsContent value="emails">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C356B]" />
                        Email Campaigns
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Send emails to users by role or to all members
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Email Campaign Form */}
                  <div className="space-y-6">
                    {/* Recipient Selection */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium text-gray-900">
                        Select Recipients
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            value: "all",
                            label: "All Users",
                            count: users.length,
                            icon: Users,
                          },
                          {
                            value: "super_admin",
                            label: "Super Admins",
                            count: users.filter((u) => u.role === "super_admin")
                              .length,
                            icon: Shield,
                          },
                          {
                            value: "event_manager",
                            label: "Event Managers",
                            count: users.filter(
                              (u) => u.role === "event_manager",
                            ).length,
                            icon: Calendar,
                          },
                          {
                            value: "finance_person",
                            label: "Finance Managers",
                            count: users.filter(
                              (u) => u.role === "finance_person",
                            ).length,
                            icon: CreditCard,
                          },
                          {
                            value: "ordinary_user",
                            label: "Regular Users",
                            count: users.filter(
                              (u) => u.role === "ordinary_user",
                            ).length,
                            icon: User,
                          },
                        ].map(({ value, label, count, icon: Icon }) => (
                          <div
                            key={value}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              emailRecipientType === value
                                ? "border-[#1C356B] bg-[#1C356B]/5 shadow-lg"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                            }`}
                            onClick={() => setEmailRecipientType(value)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  emailRecipientType === value
                                    ? "bg-[#1C356B] text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {label}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {count} users
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email Subject */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email-subject"
                        className="text-base font-medium text-gray-900"
                      >
                        Email Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email-subject"
                        placeholder="Enter compelling subject line"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="h-12 text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                      />
                    </div>

                    {/* Email Content */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email-content"
                        className="text-base font-medium text-gray-900"
                      >
                        Email Content <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="email-content"
                        placeholder="Write your email content here. You can use HTML formatting..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className="min-h-[200px] text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        HTML formatting is supported. The email will be styled
                        with our standard template.
                      </p>
                    </div>

                    {/* Recipient Management */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium text-gray-900">
                          Recipients ({getEmailRecipients().length} of {getFilteredUsers().length} selected)
                        </Label>
                        {excludedUserIds.size > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetExcludedUsers}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset all exclusions
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Select
                            value={emailRecipientType}
                            onValueChange={(value) => {
                              setEmailRecipientType(value);
                              resetExcludedUsers();
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select recipient group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="super_admin">Super Admins</SelectItem>
                              <SelectItem value="finance_person">Finance Team</SelectItem>
                              <SelectItem value="event_manager">Event Managers</SelectItem>
                              <SelectItem value="ordinary_user">Regular Users</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                          {getFilteredUsers().length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No users found in this group</p>
                          ) : (
                            <div className="space-y-1">
                              {getFilteredUsers().map((user) => (
                                <div 
                                  key={user.id} 
                                  className={`flex items-center justify-between p-2 rounded-md ${excludedUserIds.has(user.id) ? 'bg-red-50' : 'bg-white'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant={excludedUserIds.has(user.id) ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={() => toggleExcludeUser(user.id)}
                                    className={`ml-2 ${excludedUserIds.has(user.id) ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
                                  >
                                    {excludedUserIds.has(user.id) ? (
                                      <>
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        <span className="text-xs">Excluded</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                                        <span className="text-xs">Included</span>
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {excludedUserIds.size > 0 && (
                          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md p-2">
                            <div className="flex items-start">
                              <Info className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
                              <span>
                                {excludedUserIds.size} user{excludedUserIds.size !== 1 ? 's' : ''} excluded from this campaign. 
                                They will not receive this email.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Send Email Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        onClick={handleSendEmail}
                        disabled={
                          !emailSubject.trim() ||
                          !emailContent.trim() ||
                          !emailRecipientType ||
                          emailSending
                        }
                        className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {emailSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Email...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Email Campaign
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setEmailSubject("");
                          setEmailContent("");
                          setEmailRecipientType("all");
                        }}
                        disabled={emailSending}
                        className="px-6 py-3 border-slate-300 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear Form
                      </Button>
                    </div>

                    {/* Recent Email Campaigns */}
                    <div className="border-t pt-6 mt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="w-5 h-5 text-slate-600" />
                        <h3 className="text-lg font-medium text-gray-900">
                          Recent Email Campaigns
                        </h3>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-600 text-center">
                          Email campaign history will appear here after sending
                          emails.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Enhanced Email Blast Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Create Email Campaign
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Compose and send email campaign to all users
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      Campaign Details
                    </p>
                    <p className="text-blue-700 text-sm">
                      From: Alliance Procurement & Capacity Building Ltd
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email-subject"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Subject *
                </Label>
                <Input
                  id="email-subject"
                  placeholder="Enter compelling subject line"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="h-12 text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email-message"
                  className="text-sm font-semibold text-gray-700"
                >
                  Message Content *
                </Label>
                <Textarea
                  id="email-message"
                  placeholder="Write your email content here..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="min-h-[200px] text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] resize-none"
                />
                <p className="text-sm text-gray-500">
                  Tip: Keep your message clear, engaging, and valuable for your
                  subscribers.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
              <div className="text-sm text-gray-500 order-3 sm:order-1">
                Recipients: {users.length} users
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailDialog(false)}
                  className="w-full sm:w-auto px-6 order-2 sm:order-1 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmailBlast}
                  disabled={
                    isLoading || !emailSubject.trim() || !emailMessage.trim()
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 min-h-[44px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">
                        Sending Campaign...
                      </span>
                      <span className="sm:hidden">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        Send to {users.length} Users
                      </span>
                      <span className="sm:hidden">Send ({users.length})</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Role Change Confirmation Dialog */}
        <AlertDialog
          open={!!confirmRoleChange}
          onOpenChange={() => setConfirmRoleChange(null)}
        >
          <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-white border-0 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <AlertDialogTitle className="text-center text-xl sm:text-2xl font-bold">
                Confirm Role Change
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 text-sm sm:text-base leading-relaxed">
                Are you sure you want to change{" "}
                <span className="font-semibold text-gray-900">
                  {confirmRoleChange?.userName}
                </span>
                's role to{" "}
                <span className="font-semibold text-[#1C356B]">
                  {confirmRoleChange?.role}
                </span>
                ?
                <br />
                <br />
                This action will{" "}
                {confirmRoleChange?.role === "super_admin" ? (
                  <span className="text-purple-600 font-medium">
                    grant super admin privileges (full system access)
                  </span>
                ) : confirmRoleChange?.role === "finance_person" ? (
                  <span className="text-green-600 font-medium">
                    grant finance management privileges
                  </span>
                ) : confirmRoleChange?.role === "event_manager" ? (
                  <span className="text-blue-600 font-medium">
                    grant event management privileges (user registration and
                    event management)
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    remove administrative privileges
                  </span>
                )}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:space-x-4 pt-6">
              <AlertDialogCancel className="w-full sm:w-auto px-8 py-2 border-slate-300 hover:bg-slate-50 order-2 sm:order-1 min-h-[44px]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRoleChangeAction}
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Updating Role...</span>
                    <span className="sm:hidden">Updating...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Confirm Change</span>
                    <span className="sm:hidden">Confirm</span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Compact User Registration Dialog */}
        <Dialog
          open={showUserRegistrationDialog}
          onOpenChange={setShowUserRegistrationDialog}
        >
          <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl lg:max-w-4xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 sm:pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Register New User
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm">
                    Create a new user account with administrative privileges
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5">
              {/* Row 1: Role and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="user-role"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                    value={userRegistrationData.role}
                  >
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="finance_person">
                        Finance Person
                      </SelectItem>
                      <SelectItem value="event_manager">
                        Event Manager
                      </SelectItem>
                      <SelectItem value="ordinary_user">
                        Ordinary User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="user-firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="user-firstName"
                    placeholder="First name"
                    value={userRegistrationData.firstName}
                    onChange={(e) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="user-lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </Label>
                  <Input
                    id="user-lastName"
                    placeholder="Last name"
                    value={userRegistrationData.lastName}
                    onChange={(e) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="user-phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="user-phone"
                    placeholder="Phone (optional)"
                    value={userRegistrationData.phoneNumber}
                    onChange={(e) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Row 2: Email and Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="user-email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={userRegistrationData.email}
                    onChange={(e) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="user-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password *
                  </Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter secure password"
                    value={userRegistrationData.password}
                    onChange={(e) =>
                      setUserRegistrationData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Registration Information</p>
                    <p>
                      New users will receive a sequential registration ID (0001,
                      0002, etc.) and can log in immediately with their email
                      and password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserRegistrationDialog(false);
                  setUserRegistrationData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    role: "ordinary_user",
                  });
                }}
                className="w-full sm:w-auto px-6 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setUserRegistrationLoading(true);
                  try {
                    // Get current session
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      throw new Error("No active session found");
                    }

                    const response = await fetch("/api/admin/users/register", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(userRegistrationData),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(
                        errorData.message || "Failed to register user",
                      );
                    }

                    const result = await response.json();

                    // Show success message
                    toast({
                      title: "User Registration Successful",
                      description: `${userRegistrationData.firstName} ${userRegistrationData.lastName} has been registered with role ${userRegistrationData.role.replace("_", " ")}. They can now log in with their email and password.`,
                    });

                    setShowUserRegistrationDialog(false);
                    setUserRegistrationData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phoneNumber: "",
                      password: "",
                      role: "ordinary_user",
                    });
                    fetchData(); // Refresh users list
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Registration Failed",
                      description:
                        err.message ||
                        "An error occurred during user registration",
                    });
                    console.error("Registration error:", err);
                  } finally {
                    setUserRegistrationLoading(false);
                  }
                }}
                disabled={
                  userRegistrationLoading ||
                  !userRegistrationData.firstName ||
                  !userRegistrationData.lastName ||
                  !userRegistrationData.email ||
                  !userRegistrationData.password
                }
                className="w-full sm:w-auto bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 min-h-[44px]"
              >
                {userRegistrationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Creating User...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create User</span>
                    <span className="sm:hidden">Create</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compact Event Registration Dialog */}
        <Dialog
          open={showEventRegistrationDialog}
          onOpenChange={setShowEventRegistrationDialog}
        >
          <DialogContent className="w-[95vw] max-w-md sm:max-w-2xl lg:max-w-5xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 sm:pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Register User for Event
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm">
                    Register an existing user for a training event
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5">
              {/* Row 1: User and Event Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="event-user"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select User *
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                    />
                    {searchTerm && (
                      <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-lg">
                        {filteredUsers.slice(0, 5).map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchTerm("");
                            }}
                            className="p-2 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.email}
                            </div>
                          </div>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div className="p-2 text-gray-500 text-center text-sm">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                    {selectedUser && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          ✓ {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                        <div className="text-xs text-green-600">
                          {selectedUser.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="event-event"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select Event *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setSelectedEvent(
                        events.find((e) => e.id === value) || null,
                      )
                    }
                    value={selectedEvent?.id || ""}
                  >
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEvent && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        ✓ {selectedEvent.title}
                      </div>
                      <div className="text-xs text-blue-600">
                        {new Date(selectedEvent.startDate).toLocaleDateString()}{" "}
                        • K{selectedEvent.price}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="event-country"
                    className="text-sm font-medium text-gray-700"
                  >
                    Country *
                  </Label>
                  <Input
                    id="event-country"
                    placeholder="Country"
                    value={eventRegistrationData.country}
                    onChange={(e) =>
                      setEventRegistrationData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="event-position"
                    className="text-sm font-medium text-gray-700"
                  >
                    Position *
                  </Label>
                  <Input
                    id="event-position"
                    placeholder="Job position"
                    value={eventRegistrationData.position}
                    onChange={(e) =>
                      setEventRegistrationData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Row 3: Organization Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="event-organization"
                    className="text-sm font-medium text-gray-700"
                  >
                    Organization *
                  </Label>
                  <Input
                    id="event-organization"
                    placeholder="Organization name"
                    value={eventRegistrationData.organization}
                    onChange={(e) =>
                      setEventRegistrationData((prev) => ({
                        ...prev,
                        organization: e.target.value,
                      }))
                    }
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Row 4: Payment and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="event-paymentStatus"
                    className="text-sm font-medium text-gray-700"
                  >
                    Payment Status *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setEventRegistrationData((prev) => ({
                        ...prev,
                        paymentStatus: value,
                      }))
                    }
                    value={eventRegistrationData.paymentStatus}
                  >
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Confirmation
                  </Label>
                  <div className="flex items-center space-x-2 h-10">
                    <input
                      type="checkbox"
                      id="event-hasPaid"
                      checked={eventRegistrationData.hasPaid}
                      onChange={(e) =>
                        setEventRegistrationData((prev) => ({
                          ...prev,
                          hasPaid: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="event-hasPaid"
                      className="text-sm text-gray-700"
                    >
                      User has paid
                    </Label>
                  </div>
                </div>

              </div>

              {/* Info Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="text-sm text-emerald-800">
                    <p className="font-medium mb-1">Registration Information</p>
                    <p>
                      This will create a new event registration with a
                      sequential ID (0001, 0002, etc.) for the selected user and
                      event.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEventRegistrationDialog(false);
                  setEventRegistrationData({
                    userId: "",
                    eventId: "",
                    country: "",
                    organization: "",

                    position: "",
                                    hasPaid: false,
                    paymentStatus: "pending",
                  });
                  setSelectedUser(null);
                  setSelectedEvent(null);
                  setSearchTerm("");
                }}
                className="w-full sm:w-auto px-6 order-2 sm:order-1 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setEventRegistrationLoading(true);
                  try {
                    // Get current session
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      throw new Error("No active session found");
                    }

                    const response = await fetch("/api/admin/events/register", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        userId: selectedUser?.id,
                        eventId: selectedEvent?.id,

                        country: eventRegistrationData.country,
                        organization: eventRegistrationData.organization,
                        position: eventRegistrationData.position,
                        notes: "",
                        hasPaid: eventRegistrationData.hasPaid,
                        paymentStatus: eventRegistrationData.paymentStatus,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(
                        errorData.message ||
                          "Failed to register user for event",
                      );
                    }

                    const result = await response.json();

                    // Show success message
                    toast({
                      title: "Event Registration Successful",
                      description: `${selectedUser?.firstName} ${selectedUser?.lastName} has been registered for ${selectedEvent?.title} with ID ${result.registration?.registrationNumber || "Generated"}.`,
                    });

                    setShowEventRegistrationDialog(false);
                    setEventRegistrationData({
                      userId: "",
                      eventId: "",
                      country: "",
                      organization: "",

                      position: "",
                                        hasPaid: false,
                      paymentStatus: "pending",
                    });
                    setSelectedUser(null);
                    setSelectedEvent(null);
                    setSearchTerm("");
                    fetchData(); // Refresh registrations list
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Registration Failed",
                      description:
                        err.message ||
                        "An error occurred during event registration",
                    });
                    console.error("Registration error:", err);
                  } finally {
                    setEventRegistrationLoading(false);
                  }
                }}
                disabled={
                  eventRegistrationLoading ||
                  !selectedUser ||
                  !selectedEvent ||
                  !eventRegistrationData.country ||
                  !eventRegistrationData.organization ||
                  !eventRegistrationData.position
                }
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 order-1 sm:order-2 min-h-[44px]"
              >
                {eventRegistrationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Registering...</span>
                    <span className="sm:hidden">Saving...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Register for Event</span>
                    <span className="sm:hidden">Register</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Evidence Viewer */}
        <EvidenceViewer
          open={evidenceViewer.open}
          onOpenChange={(open) =>
            setEvidenceViewer((prev) => ({ ...prev, open }))
          }
          evidencePath={evidenceViewer.evidencePath}
          fileName={evidenceViewer.fileName}
          registrationId={evidenceViewer.registrationId}
          onEvidenceUpdate={handleEvidenceUpdate}
          canUpdate={true}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
