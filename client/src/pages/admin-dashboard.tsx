import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye
} from "lucide-react";

import { EvidenceViewer } from "@/components/evidence-viewer";

// Mock data for demonstration
const mockEvents = [
  {
    id: "1",
    title: "Advanced Project Management Training",
    description: "Comprehensive training on modern project management methodologies including Agile and Scrum frameworks.",
    startDate: "2025-09-15",
    endDate: "2025-09-17",
    location: "Lusaka Conference Center",
    price: "1500",
    currentAttendees: 45,
    maxAttendees: 60,
    featured: true
  },
  {
    id: "2",
    title: "Digital Procurement Systems Workshop",
    description: "Learn to implement and manage digital procurement systems for modern organizations.",
    startDate: "2025-09-22",
    endDate: "2025-09-24",
    location: "Ndola Business Hub",
    price: "1200",
    currentAttendees: 32,
    maxAttendees: 40,
    featured: false
  }
];

const mockUsers = [
  {
    id: "user1",
    firstName: "John",
    lastName: "Mwansa",
    email: "john.mwansa@example.com",
    phoneNumber: "+260977123456",
    role: "super_admin",
    createdAt: "2025-01-15T10:00:00Z"
  },
  {
    id: "user2",
    firstName: "Mary",
    lastName: "Banda",
    email: "mary.banda@example.com",
    phoneNumber: "+260966789012",
    role: "finance_person",
    createdAt: "2025-02-01T14:30:00Z"
  },
  {
    id: "user3",
    firstName: "Peter",
    lastName: "Phiri",
    email: "peter.phiri@example.com",
    phoneNumber: "+260955456789",
    role: "ordinary_user",
    createdAt: "2025-02-10T09:15:00Z"
  }
];

const mockRegistrations = [
  {
    id: "reg1",
    userId: "user3",
    eventId: "1",
    paymentStatus: "completed",
    paymentEvidence: "evidence1.pdf",
    registeredAt: "2025-08-20T12:00:00Z",
    event: mockEvents[0],
    user: mockUsers[2]
  },
  {
    id: "reg2",
    userId: "user2",
    eventId: "2",
    paymentStatus: "pending",
    paymentEvidence: "evidence2.jpg",
    registeredAt: "2025-08-25T15:30:00Z",
    event: mockEvents[1],
    user: mockUsers[1]
  }
];

const mockNewsletterSubscriptions = [
  {
    id: "sub1",
    email: "subscriber1@example.com",
    subscribedAt: "2025-08-01T10:00:00Z"
  },
  {
    id: "sub2",
    email: "subscriber2@example.com",
    subscribedAt: "2025-08-15T14:00:00Z"
  },
  {
    id: "sub3",
    email: "subscriber3@example.com",
    subscribedAt: "2025-08-20T09:00:00Z"
  }
];

const mockUser = {
  id: "user1",
  firstName: "John",
  lastName: "Mwansa",
  email: "john.mwansa@example.com",
  role: "super_admin"
};

export default function AdminDashboard() {
  const [user] = useState(mockUser);
  const [events] = useState(mockEvents);
  const [users] = useState(mockUsers);
  const [registrations] = useState(mockRegistrations);
  const [newsletterSubscriptions] = useState(mockNewsletterSubscriptions);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [confirmRoleChange, setConfirmRoleChange] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [evidenceViewer, setEvidenceViewer] = useState<{
    open: boolean;
    evidencePath: string;
    fileName?: string;
  }>({
    open: false,
    evidencePath: "",
  });

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

  const handleViewPaymentEvidence = (evidencePath: string, fileName?: string) => {
    setEvidenceViewer({
      open: true,
      evidencePath,
      fileName,
    });
  };

  const exportToExcel = (type) => {
    // Simulate export
    console.log(`Exporting ${type} to Excel...`);
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

  if (!canManageUsers) {
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
            <Button variant="outline">
              Go Back
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
                  <Button
                    onClick={() => exportToExcel('users')}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                  >
                    Download Users as Excel
                  </Button>
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
                      {users.map((userData, index) => (
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
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-6 h-6 text-[#1C356B]" />
                  Event Management
                </CardTitle>
                <CardDescription>Overview and management of all training events</CardDescription>
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
                      {events.map((event, index) => (
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
                  <Button
                    onClick={() => exportToExcel('registrations')}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10"
                  >
                    Download Registrations as Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
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
                      {registrations.map((registration, index) => (
                        <TableRow key={registration.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
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
                                  onClick={() => handleViewPaymentEvidence(registration.paymentEvidence, registration.paymentEvidence?.split('/').pop())}
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
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Mail className="w-6 h-6 text-[#1C356B]" />
                    Newsletter Management
                  </CardTitle>
                  <CardDescription>Manage subscribers and send targeted email campaigns</CardDescription>
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
                        {newsletterSubscriptions.map((subscription, index) => (
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

        {/* Evidence Viewer */}
        <EvidenceViewer
          open={evidenceViewer.open}
          onOpenChange={(open) => setEvidenceViewer(prev => ({ ...prev, open }))}
          evidencePath={evidenceViewer.evidencePath}
          fileName={evidenceViewer.fileName}
        />
      </div>
    </div>
  );
}