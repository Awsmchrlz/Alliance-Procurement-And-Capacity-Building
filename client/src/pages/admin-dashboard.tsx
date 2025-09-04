import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
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
  CreditCard
} from "lucide-react";


import { EvidenceViewer } from "@/components/evidence-viewer";
import { useToast } from "@/hooks/use-toast";

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
  registeredAt: string;
  event?: Event;
  user?: User;
}

interface NewsletterSubscription {
  id: string;
  email: string;
  subscribedAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email functionality
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
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
  const [showUserRegistrationDialog, setShowUserRegistrationDialog] = useState(false);
  const [userRegistrationData, setUserRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "ordinary_user"
  });
  const [userRegistrationLoading, setUserRegistrationLoading] = useState(false);

  // Admin event registration functionality
  const [showEventRegistrationDialog, setShowEventRegistrationDialog] = useState(false);
  const [eventRegistrationData, setEventRegistrationData] = useState({
    userId: "",
    eventId: "",
    title: "Mr",
    gender: "Male",
    country: "",
    organization: "",
    organizationType: "Government",
    position: "",
    notes: "",
    hasPaid: false,
    paymentStatus: "pending"
  });
  const [eventRegistrationLoading, setEventRegistrationLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [filteredNewsletter, setFilteredNewsletter] = useState<NewsletterSubscription[]>([]);

  // Fetch real data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      setFilteredEvents(events);
      setFilteredRegistrations(registrations);
      setFilteredNewsletter(newsletterSubscriptions);
    } else {
      const term = searchTerm.toLowerCase();
      
      // Filter users
      setFilteredUsers(users.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      ));
      
      // Filter events
      setFilteredEvents(events.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      ));
      
      // Filter registrations
      setFilteredRegistrations(registrations.filter(registration => 
        registration.user?.firstName.toLowerCase().includes(term) ||
        registration.user?.lastName.toLowerCase().includes(term) ||
        registration.user?.email.toLowerCase().includes(term) ||
        registration.event?.title.toLowerCase().includes(term) ||
        registration.paymentStatus.toLowerCase().includes(term)
      ));
      
      // Filter newsletter subscriptions
      setFilteredNewsletter(newsletterSubscriptions.filter(subscription => 
        subscription.email.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, users, events, registrations, newsletterSubscriptions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("No active session found");
        return;
      }

      // Get current user's role from Supabase metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setError("Failed to get user information");
        return;
      }

      // Set user role from metadata
      const userRole = currentUser.user_metadata?.role || 'ordinary_user';
      console.log('Current user role:', userRole);
      console.log('Current user metadata:', currentUser.user_metadata);
      
      const tempUser = {
        id: currentUser.id,
        firstName: currentUser.user_metadata?.first_name || '',
        lastName: currentUser.user_metadata?.last_name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.user_metadata?.phone_number || '',
        role: userRole,
        createdAt: currentUser.created_at || new Date().toISOString()
      };
      setUser(tempUser);

      // Fetch events (public endpoint)
      try {
        const eventsResponse = await fetch('/api/events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }

      // Only fetch admin data if user has admin role
      if (userRole === 'super_admin' || userRole === 'finance_person') {
        // Fetch users
        try {
          const usersResponse = await fetch(`/api/admin/users`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          } else {
            console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }

        // Fetch registrations
        try {
          const registrationsResponse = await fetch(`/api/admin/registrations`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (registrationsResponse.ok) {
            const registrationsData = await registrationsResponse.json();
            console.log('Fetched registrations:', registrationsData);
            setRegistrations(registrationsData);
          } else {
            console.error('Failed to fetch registrations:', registrationsResponse.status, registrationsResponse.statusText);
          }
        } catch (err) {
          console.error('Error fetching registrations:', err);
        }

        // Fetch newsletter subscriptions
        try {
          const newsletterResponse = await fetch(`/api/admin/newsletter-subscriptions`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (newsletterResponse.ok) {
            const newsletterData = await newsletterResponse.json();
            setNewsletterSubscriptions(newsletterData);
          } else {
            console.error('Failed to fetch newsletter subscriptions:', newsletterResponse.status, newsletterResponse.statusText);
          }
        } catch (err) {
          console.error('Error fetching newsletter subscriptions:', err);
        }
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Permission checks
  const isSuperAdmin = user?.role === "super_admin";
  const canManageUsers = isSuperAdmin || user?.role === "finance_person";
  const canManageFinance = isSuperAdmin || user?.role === "finance_person";

  // Calculate analytics
  const totalRevenue = registrations
    .filter(reg => reg.paymentStatus === "completed" || reg.paymentStatus === "paid")
    .reduce((sum, reg) => sum + parseFloat(reg.event?.price || "0"), 0);

  const pendingPayments = registrations.filter(reg => reg.paymentStatus === "pending").length;
  const completedPayments = registrations.filter(reg => reg.paymentStatus === "completed" || reg.paymentStatus === "paid").length;
  const superAdminUsers = users.filter(u => u.role === "super_admin").length;
  const financeUsers = users.filter(u => u.role === "finance_person").length;

  const handleRoleChangeRequest = (userId, newRole, userName) => {
    setConfirmRoleChange({ userId, role: newRole, userName });
  };

  const confirmRoleChangeAction = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setConfirmRoleChange(null);
      // In real implementation, update the users array
    }, 2000);
  };

  const handleSendEmailBlast = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSubject("");
      setEmailMessage("");
      setShowEmailDialog(false);
    }, 2000);
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: "default", color: "bg-emerald-500 text-white", icon: CheckCircle, label: "Completed" },
      paid: { variant: "default", color: "bg-emerald-500 text-white", icon: CheckCircle, label: "Paid" },
      pending: { variant: "secondary", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300", icon: Clock, label: "Pending" },
      failed: { variant: "destructive", color: "bg-red-500 text-white", icon: XCircle, label: "Failed" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleViewPaymentEvidence = (evidencePath: string, fileName?: string, registrationId?: string) => {
    setEvidenceViewer({
      open: true,
      evidencePath,
      fileName,
      registrationId,
    });
  };

  const handleEvidenceUpdate = (newEvidencePath: string) => {
    // Update the registrations list with the new evidence path
    setRegistrations(prev => prev.map(reg => 
      reg.id === evidenceViewer.registrationId 
        ? { ...reg, paymentEvidence: newEvidencePath }
        : reg
    ));
    
    // Update filtered registrations as well
    setFilteredRegistrations(prev => prev.map(reg => 
      reg.id === evidenceViewer.registrationId 
        ? { ...reg, paymentEvidence: newEvidencePath }
        : reg
    ));
    
    console.log('✅ Evidence updated in admin dashboard:', newEvidencePath);
  };

  const exportToExcel = (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'users':
          data = users.map(user => ({
            'User ID': user.id,
            'First Name': user.firstName,
            'Last Name': user.lastName,
            'Email': user.email,
            'Phone Number': user.phoneNumber || 'N/A',
            'Role': user.role,
            'Created At': formatDateTime(user.createdAt)
          }));
          filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Role', 'Created At'];
          break;

        case 'registrations':
          data = registrations.map(registration => ({
            'Registration ID': registration.id,
            'User Name': registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User',
            'User Email': registration.user?.email || 'N/A',
            'Event Title': registration.event?.title || 'Unknown Event',
            'Event Location': registration.event?.location || 'N/A',
            'Event Date': registration.event?.startDate ? formatDate(registration.event.startDate) : 'N/A',
            'Payment Status': registration.paymentStatus,
            'Payment Amount': registration.event?.price ? `K${registration.event.price}` : 'N/A',
            'Registered At': formatDateTime(registration.registeredAt),
            'Has Evidence': registration.paymentEvidence ? 'Yes' : 'No'
          }));
          filename = `registrations_export_${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Registration ID', 'User Name', 'User Email', 'Event Title', 'Event Location', 'Event Date', 'Payment Status', 'Payment Amount', 'Registered At', 'Has Evidence'];
          break;

        case 'events':
          data = events.map(event => ({
            'Event ID': event.id,
            'Title': event.title,
            'Description': event.description || 'N/A',
            'Start Date': formatDate(event.startDate),
            'End Date': event.endDate ? formatDate(event.endDate) : 'N/A',
            'Location': event.location,
            'Price': `K${event.price}`,
            'Current Attendees': event.currentAttendees,
            'Max Attendees': event.maxAttendees || 'Unlimited',
            'Featured': event.featured ? 'Yes' : 'No'
          }));
          filename = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Event ID', 'Title', 'Description', 'Start Date', 'End Date', 'Location', 'Price', 'Current Attendees', 'Max Attendees', 'Featured'];
          break;

        case 'newsletter':
          data = newsletterSubscriptions.map(subscription => ({
            'Subscription ID': subscription.id,
            'Email': subscription.email,
            'Subscribed At': formatDateTime(subscription.subscribedAt)
          }));
          filename = `newsletter_subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`;
          headers = ['Subscription ID', 'Email', 'Subscribed At'];
          break;

        default:
          console.error('Unknown export type:', type);
          return;
      }

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
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
        window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      }

    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Failed to export ${type}. Please try again.`,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <CardTitle className="text-2xl font-bold text-gray-900">Loading Dashboard</CardTitle>
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
              <CardTitle className="text-2xl font-bold text-gray-900">Error Loading Dashboard</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {error}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={fetchData} variant="outline" className="mr-2">
              Retry
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="default">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user can access admin dashboard
  if (!user || (user.role !== 'super_admin' && user.role !== 'finance_person')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Access Restricted</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Administrator privileges are required to access this dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Please contact your system administrator if you believe this is an error.
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="w-8 h-8 text-[#FDC123]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                    <p className="text-blue-100 text-lg">Alliance Procurement & Capacity Building Ltd</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-6 text-right">
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-blue-200 text-white bg-white/10 hover:bg-white/20 hover:border-white/40 transition-colors"
                  >
                    Home
                  </Button>
                  <div className="text-white/90">
                    <div className="text-2xl font-bold">{users.length}</div>
                    <div className="text-sm text-blue-200">Total Users</div>
                  </div>
                  <div className="text-white/90">
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-sm text-blue-200">Active Events</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-[#1C356B] text-white text-lg font-semibold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Welcome back, {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 text-sm">System Administrator • Last login: Today</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Crown className="w-8 h-8 text-[#FDC123]" />
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors mr-2"
                  >
                    Home
                  </Button>
                  <Button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
              
              {/* Global Search Bar */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
            </div>
                  <Input
                    type="text"
                    placeholder="Search users, events, registrations, or newsletter subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] rounded-xl shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-600">
                    Found {filteredUsers.length} users, {filteredEvents.length} events, {filteredRegistrations.length} registrations, {filteredNewsletter.length} newsletter subscribers
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">Active</span>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">{superAdminUsers} Super Admins, {financeUsers} Finance</span>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">K{totalRevenue.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">{completedPayments} Paid</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#FDC123] to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Newsletter</p>
                  <p className="text-3xl font-bold text-gray-900">{newsletterSubscriptions.length}</p>
                  <div className="flex items-center mt-2">
                    <Activity className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">Subscribers</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-1 shadow-sm">
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Activity className="w-4 h-4 mr-2 hidden sm:block" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Users className="w-4 h-4 mr-2 hidden sm:block" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-2 hidden sm:block" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="registrations"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <UserCog className="w-4 h-4 mr-2 hidden sm:block" />
                Registrations
              </TabsTrigger>
              <TabsTrigger
                value="newsletter"
                className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Mail className="w-4 h-4 mr-2 hidden sm:block" />
                Newsletter
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Payment Analytics
                  </CardTitle>
                  <CardDescription>Overview of payment statuses and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-900">Completed Payments</p>
                          <p className="text-sm text-emerald-700">K{(totalRevenue).toFixed(2)} revenue</p>
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
                          <p className="font-semibold text-amber-900">Pending Payments</p>
                          <p className="text-sm text-amber-700">Awaiting confirmation</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-lg px-3 py-1">
                        {pendingPayments}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">Total Registrations</p>
                          <p className="text-sm text-blue-700">All event registrations</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1 border-blue-200 text-blue-800">
                        {registrations.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                    Communication Center
                  </CardTitle>
                  <CardDescription>Manage newsletters and email campaigns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <Mail className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-1">Ready to Send</h3>
                    <p className="text-purple-700 text-sm mb-4">
                      {newsletterSubscriptions.length} active subscribers waiting for your updates
                    </p>
                    <Button
                      onClick={() => setShowEmailDialog(true)}
                      className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Newsletter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="w-6 h-6 text-[#1C356B]" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => setShowUserRegistrationDialog(true)}
                      className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register New User
                    </Button>
                    <Button
                      onClick={() => setShowEventRegistrationDialog(true)}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Register for Event
                    </Button>
                  <Button
                    onClick={() => exportToExcel('users')}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                  >
                    Download Users as Excel
                  </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold">User Details</TableHead>
                        <TableHead className="font-semibold">Contact Info</TableHead>
                        <TableHead className="font-semibold">Role & Status</TableHead>
                        <TableHead className="font-semibold">Join Date</TableHead>
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((userData, index) => (
                        <TableRow key={userData.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-slate-200">
                                <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                  {userData.firstName?.charAt(0)?.toUpperCase()}{userData.lastName?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {userData.firstName} {userData.lastName}
                                </div>
                                <div className="text-sm text-gray-500">ID: {userData.id.slice(0, 8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">{userData.email}</div>
                              <div className="text-sm text-gray-500">{userData.phoneNumber || "No phone"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {userData.role === "super_admin" ? (
                              <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                <Crown className="w-3 h-3 mr-1" />
                                Super Admin
                              </Badge>
                            ) : userData.role === "finance_person" ? (
                              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Finance Person
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-300">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Ordinary User
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {userData.createdAt ? formatDate(userData.createdAt) : "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg rounded-md">
                                {isSuperAdmin && user && userData.id !== user.id && (
                                  <>
                                    {userData.role !== "super_admin" && (
                                      <DropdownMenuItem
                                        onClick={() => handleRoleChangeRequest(userData.id, "super_admin", `${userData.firstName} ${userData.lastName}`)}
                                        className="text-purple-600"
                                      >
                                        <Crown className="w-4 h-4 mr-2" />
                                        Make Super Admin
                                      </DropdownMenuItem>
                                    )}
                                    {userData.role !== "finance_person" && (
                                      <DropdownMenuItem
                                        onClick={() => handleRoleChangeRequest(userData.id, "finance_person", `${userData.firstName} ${userData.lastName}`)}
                                        className="text-green-600"
                                      >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Make Finance Person
                                      </DropdownMenuItem>
                                    )}
                                    {userData.role !== "ordinary_user" && (
                                      <DropdownMenuItem
                                        onClick={() => handleRoleChangeRequest(userData.id, "ordinary_user", `${userData.firstName} ${userData.lastName}`)}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-6 h-6 text-[#1C356B]" />
                  Event Management
                </CardTitle>
                <CardDescription>Overview and management of all training events</CardDescription>
                  </div>
                  <Button
                    onClick={() => exportToExcel('events')}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                  >
                    Download Events as Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold">Event Details</TableHead>
                        <TableHead className="font-semibold">Schedule</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Pricing</TableHead>
                        <TableHead className="font-semibold">Attendance</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents.map((event, index) => (
                        <TableRow key={event.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900 text-base">{event.title}</div>
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
                              {event.endDate && event.startDate && event.endDate !== event.startDate && (
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
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {event.currentAttendees || 0}
                              </div>
                              {event.maxAttendees && (
                                <div className="text-sm text-gray-500">
                                  of {event.maxAttendees}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.featured ? (
                              <Badge className="bg-gradient-to-r from-[#FDC123] to-amber-500 text-[#1C356B] font-semibold">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <UserCog className="w-6 h-6 text-[#1C356B]" />
                      Registration Management
                    </CardTitle>
                    <CardDescription>Monitor and manage event registrations and payment statuses</CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => setShowEventRegistrationDialog(true)}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Register User for Event
                    </Button>
                  <Button
                    onClick={() => exportToExcel('registrations')}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                  >
                    Download Registrations as Excel
                  </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-semibold">Reg. #</TableHead>
                        <TableHead className="font-semibold">Participant</TableHead>
                        <TableHead className="font-semibold">Event</TableHead>
                        <TableHead className="font-semibold">Registration</TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Evidence</TableHead>
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration, index) => (
                        <TableRow key={registration.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                          <TableCell>
                            <div className="font-mono font-bold text-[#1C356B] text-lg">
                              #{registration.registrationNumber || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-slate-200">
                                <AvatarFallback className="bg-[#1C356B] text-white font-semibold">
                                  {registration.user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                                  {registration.user?.lastName?.charAt(0)?.toUpperCase() || ""}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">{registration.user?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900 max-w-xs truncate">
                              {registration.event?.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {registration.registeredAt ? formatDate(registration.registeredAt) : "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(registration.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-lg text-[#1C356B]">
                              K{registration.event?.price || "0"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {registration.paymentEvidence && registration.paymentEvidence.trim() ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPaymentEvidence(
                                    registration.paymentEvidence, 
                                    registration.paymentEvidence?.split('/').pop(),
                                    registration.id
                                  )}
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Evidence
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No evidence</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg rounded-md">
                                <DropdownMenuItem
                                  disabled={registration.paymentStatus === "completed" || registration.paymentStatus === "paid"}
                                  className="text-emerald-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={registration.paymentStatus === "pending"}
                                  className="text-amber-600"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={registration.paymentStatus === "failed"}
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Mark as Failed
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <div className="space-y-6">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Mail className="w-6 h-6 text-[#1C356B]" />
                    Newsletter Management
                  </CardTitle>
                  <CardDescription>Manage subscribers and send targeted email campaigns</CardDescription>
                    </div>
                    <Button
                      onClick={() => exportToExcel('newsletter')}
                      variant="outline"
                      className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                    >
                      Download Newsletter as Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-purple-900">
                            {newsletterSubscriptions.length}
                          </h3>
                          <p className="text-purple-700 font-medium">Active Subscribers</p>
                          <p className="text-purple-600 text-sm">Ready to receive your updates</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowEmailDialog(true)}
                        size="lg"
                        className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Campaign
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold">Email Address</TableHead>
                          <TableHead className="font-semibold">Subscriber Name</TableHead>
                          <TableHead className="font-semibold">Subscribe Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNewsletter.map((subscription, index) => (
                          <TableRow key={subscription.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                            <TableCell className="font-medium text-gray-900">
                              {subscription.email}
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-900">
                                {"name" in subscription ? subscription.name : "Anonymous Subscriber"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {subscription.subscribedAt ? formatDate(subscription.subscribedAt) : "Unknown"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Email Blast Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl">
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">Create Email Campaign</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Compose and send newsletter to all {newsletterSubscriptions.length} active subscribers
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Campaign Details</p>
                    <p className="text-blue-700 text-sm">From: Alliance Procurement & Capacity Building Ltd</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject" className="text-sm font-semibold text-gray-700">
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
                <Label htmlFor="email-message" className="text-sm font-semibold text-gray-700">
                  Message Content *
                </Label>
                <Textarea
                  id="email-message"
                  placeholder="Write your newsletter content here..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="min-h-[200px] text-base border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B] resize-none"
                />
                <p className="text-sm text-gray-500">
                  Tip: Keep your message clear, engaging, and valuable for your subscribers.
                </p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-gray-500">
                Recipients: {newsletterSubscriptions.length} subscribers
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailDialog(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmailBlast}
                  disabled={isLoading || !emailSubject.trim() || !emailMessage.trim()}
                  className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {newsletterSubscriptions.length} Subscribers
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Role Change Confirmation Dialog */}
        <AlertDialog open={!!confirmRoleChange} onOpenChange={() => setConfirmRoleChange(null)}>
          <AlertDialogContent className="bg-white border-0 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <AlertDialogTitle className="text-center text-2xl font-bold">
                Confirm Role Change
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 text-base leading-relaxed">
                Are you sure you want to change <span className="font-semibold text-gray-900">{confirmRoleChange?.userName}</span>'s role to{' '}
                <span className="font-semibold text-[#1C356B]">{confirmRoleChange?.role}</span>?
                <br /><br />
                This action will {confirmRoleChange?.role === "super_admin" ? (
                  <span className="text-purple-600 font-medium">grant super admin privileges (full system access)</span>
                ) : confirmRoleChange?.role === "finance_person" ? (
                  <span className="text-green-600 font-medium">grant finance management privileges</span>
                ) : (
                  <span className="text-amber-600 font-medium">remove administrative privileges</span>
                )}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center justify-center space-x-4 pt-6">
              <AlertDialogCancel className="px-8 py-2 border-slate-300 hover:bg-slate-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRoleChangeAction}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Role...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Confirm Change
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Compact User Registration Dialog */}
        <Dialog open={showUserRegistrationDialog} onOpenChange={setShowUserRegistrationDialog}>
          <DialogContent className="sm:max-w-4xl bg-white border-0 shadow-2xl">
            <DialogHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Register New User</DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm">
                    Create a new user account with administrative privileges
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Row 1: Role and Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <Select onValueChange={(value) => setUserRegistrationData(prev => ({ ...prev, role: value }))} value={userRegistrationData.role}>
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="finance_person">Finance Person</SelectItem>
                      <SelectItem value="ordinary_user">Ordinary User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="user-firstName"
                    placeholder="First name"
                    value={userRegistrationData.firstName}
                    onChange={(e) => setUserRegistrationData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="user-lastName"
                    placeholder="Last name"
                    value={userRegistrationData.lastName}
                    onChange={(e) => setUserRegistrationData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="user-phone"
                    placeholder="Phone (optional)"
                    value={userRegistrationData.phoneNumber}
                    onChange={(e) => setUserRegistrationData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Row 2: Email and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={userRegistrationData.email}
                    onChange={(e) => setUserRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter secure password"
                    value={userRegistrationData.password}
                    onChange={(e) => setUserRegistrationData(prev => ({ ...prev, password: e.target.value }))}
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
                    <p>New users will receive a sequential registration ID (0001, 0002, etc.) and can log in immediately with their email and password.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200">
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
                    role: "ordinary_user"
                  });
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setUserRegistrationLoading(true);
                  try {
                    // Get current session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      throw new Error('No active session found');
                    }

                    const response = await fetch('/api/admin/users/register', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(userRegistrationData),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to register user');
                    }

                    const result = await response.json();
                    
                    // Show success message
                    toast({
                      title: "User Registration Successful",
                      description: `${userRegistrationData.firstName} ${userRegistrationData.lastName} has been registered with role ${userRegistrationData.role.replace('_', ' ')}. They can now log in with their email and password.`,
                    });
                    
                    setShowUserRegistrationDialog(false);
                    setUserRegistrationData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phoneNumber: "",
                      password: "",
                      role: "ordinary_user"
                    });
                    fetchData(); // Refresh users list
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Registration Failed",
                      description: err.message || "An error occurred during user registration",
                    });
                    console.error('Registration error:', err);
                  } finally {
                    setUserRegistrationLoading(false);
                  }
                }}
                disabled={userRegistrationLoading || !userRegistrationData.firstName || !userRegistrationData.lastName || !userRegistrationData.email || !userRegistrationData.password}
                className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {userRegistrationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compact Event Registration Dialog */}
        <Dialog open={showEventRegistrationDialog} onOpenChange={setShowEventRegistrationDialog}>
          <DialogContent className="sm:max-w-5xl bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Register User for Event</DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm">
                    Register an existing user for a training event
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Row 1: User and Event Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-user" className="text-sm font-medium text-gray-700">
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
                        {filteredUsers.slice(0, 5).map(user => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchTerm('');
                            }}
                            className="p-2 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-600">{user.email}</div>
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
                        <div className="text-xs text-green-600">{selectedUser.email}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-event" className="text-sm font-medium text-gray-700">
                    Select Event *
                  </Label>
                  <Select onValueChange={(value) => setSelectedEvent(events.find(e => e.id === value) || null)} value={selectedEvent?.id || ""}>
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-xs text-gray-500">{new Date(event.startDate).toLocaleDateString()}</span>
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
                        {new Date(selectedEvent.startDate).toLocaleDateString()} • K{selectedEvent.price}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title" className="text-sm font-medium text-gray-700">
                    Title *
                  </Label>
                  <Select onValueChange={(value) => setEventRegistrationData(prev => ({ ...prev, title: value }))} value={eventRegistrationData.title}>
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-gender" className="text-sm font-medium text-gray-700">
                    Gender *
                  </Label>
                  <Select onValueChange={(value) => setEventRegistrationData(prev => ({ ...prev, gender: value }))} value={eventRegistrationData.gender}>
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-country" className="text-sm font-medium text-gray-700">
                    Country *
                  </Label>
                  <Input
                    id="event-country"
                    placeholder="Country"
                    value={eventRegistrationData.country}
                    onChange={(e) => setEventRegistrationData(prev => ({ ...prev, country: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-position" className="text-sm font-medium text-gray-700">
                    Position *
                  </Label>
                  <Input
                    id="event-position"
                    placeholder="Job position"
                    value={eventRegistrationData.position}
                    onChange={(e) => setEventRegistrationData(prev => ({ ...prev, position: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
              </div>

              {/* Row 3: Organization Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-organization" className="text-sm font-medium text-gray-700">
                    Organization *
                  </Label>
                  <Input
                    id="event-organization"
                    placeholder="Organization name"
                    value={eventRegistrationData.organization}
                    onChange={(e) => setEventRegistrationData(prev => ({ ...prev, organization: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-organizationType" className="text-sm font-medium text-gray-700">
                    Organization Type *
                  </Label>
                  <Select onValueChange={(value) => setEventRegistrationData(prev => ({ ...prev, organizationType: value }))} value={eventRegistrationData.organizationType}>
                    <SelectTrigger className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]">
                      <SelectValue placeholder="Organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Private">Private Sector</SelectItem>
                      <SelectItem value="NGO">NGO/Non-Profit</SelectItem>
                      <SelectItem value="Academic">Academic Institution</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Payment and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-paymentStatus" className="text-sm font-medium text-gray-700">
                    Payment Status *
                  </Label>
                  <Select onValueChange={(value) => setEventRegistrationData(prev => ({ ...prev, paymentStatus: value }))} value={eventRegistrationData.paymentStatus}>
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
                  <Label className="text-sm font-medium text-gray-700">Payment Confirmation</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <input
                      type="checkbox"
                      id="event-hasPaid"
                      checked={eventRegistrationData.hasPaid}
                      onChange={(e) => setEventRegistrationData(prev => ({ ...prev, hasPaid: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="event-hasPaid" className="text-sm text-gray-700">
                      User has paid
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-notes" className="text-sm font-medium text-gray-700">
                    Notes (optional)
                  </Label>
                  <Input
                    id="event-notes"
                    placeholder="Registration notes..."
                    value={eventRegistrationData.notes}
                    onChange={(e) => setEventRegistrationData(prev => ({ ...prev, notes: e.target.value }))}
                    className="h-10 text-sm border-slate-300 focus:border-[#1C356B] focus:ring-[#1C356B]"
                  />
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
                    <p>This will create a new event registration with a sequential ID (0001, 0002, etc.) for the selected user and event.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEventRegistrationDialog(false);
                  setEventRegistrationData({
                    userId: "",
                    eventId: "",
                    title: "Mr",
                    gender: "Male",
                    country: "",
                    organization: "",
                    organizationType: "Government",
                    position: "",
                    notes: "",
                    hasPaid: false,
                    paymentStatus: "pending"
                  });
                  setSelectedUser(null);
                  setSelectedEvent(null);
                  setSearchTerm('');
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setEventRegistrationLoading(true);
                  try {
                    // Get current session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      throw new Error('No active session found');
                    }

                    const response = await fetch('/api/admin/events/register', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({
                        userId: selectedUser?.id,
                        eventId: selectedEvent?.id,
                        title: eventRegistrationData.title,
                        gender: eventRegistrationData.gender,
                        country: eventRegistrationData.country,
                        organization: eventRegistrationData.organization,
                        organizationType: eventRegistrationData.organizationType,
                        position: eventRegistrationData.position,
                        notes: eventRegistrationData.notes,
                        hasPaid: eventRegistrationData.hasPaid,
                        paymentStatus: eventRegistrationData.paymentStatus,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to register user for event');
                    }

                    const result = await response.json();
                    
                    // Show success message
                    toast({
                      title: "Event Registration Successful",
                      description: `${selectedUser?.firstName} ${selectedUser?.lastName} has been registered for ${selectedEvent?.title} with ID ${result.registration?.registrationNumber || 'Generated'}.`,
                    });
                    
                    setShowEventRegistrationDialog(false);
                    setEventRegistrationData({
                      userId: "",
                      eventId: "",
                      title: "Mr",
                      gender: "Male",
                      country: "",
                      organization: "",
                      organizationType: "Government",
                      position: "",
                      notes: "",
                      hasPaid: false,
                      paymentStatus: "pending"
                    });
                    setSelectedUser(null);
                    setSelectedEvent(null);
                    setSearchTerm('');
                    fetchData(); // Refresh registrations list
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Registration Failed",
                      description: err.message || "An error occurred during event registration",
                    });
                    console.error('Registration error:', err);
                  } finally {
                    setEventRegistrationLoading(false);
                  }
                }}
                disabled={eventRegistrationLoading || !selectedUser || !selectedEvent || !eventRegistrationData.country || !eventRegistrationData.organization || !eventRegistrationData.position}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {eventRegistrationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Registration...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Register User for Event
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Evidence Viewer */}
        <EvidenceViewer
          open={evidenceViewer.open}
          onOpenChange={(open) => setEvidenceViewer(prev => ({ ...prev, open }))}
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