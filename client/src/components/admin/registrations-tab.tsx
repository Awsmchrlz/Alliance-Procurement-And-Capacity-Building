import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Eye, ArrowUpDown, CreditCard } from "lucide-react";
import { formatZambianTime } from "@/lib/utils";
import { DetailViewModal, DetailItem } from "./detail-view-modal";

interface RegistrationsTabProps {
  registrations: any[];
  canManageFinance: boolean;
  handlePaymentStatusChange: (id: string, newStatus: string) => void;
  title?: string;
  icon?: React.ReactNode;
  extraActions?: React.ReactNode;
  onViewEvidence?: (url: string, name: string) => void;
}

export function RegistrationsTab({
  registrations,
  canManageFinance,
  handlePaymentStatusChange,
  title = "Event Registrations",
  icon = <FileText className="w-5 h-5 text-white" />,
  extraActions,
  onViewEvidence,
}: RegistrationsTabProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "registeredAt",
    direction: "desc",
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const sortedRegistrations = useMemo(() => {
    let sortableItems = [...registrations];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "registeredAt") {
        aValue = new Date(a.registeredAt).getTime();
        bValue = new Date(b.registeredAt).getTime();
      } else if (sortConfig.key === "userName") {
        aValue = `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase();
        bValue = `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [registrations, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="w-3 h-3 text-gray-400" />
      </div>
    </TableHead>
  );

  const getDetails = (item: any): DetailItem[] => {
    if (!item) return [];
    const isWomenEvent = item.event?.title?.toLowerCase().includes("women");
    
    return [
      { label: "Registration No.", value: <Badge variant="outline">{item.registrationNumber}</Badge> },
      { label: "Date Registered", value: formatZambianTime(item.registeredAt, "MMM d, yyyy, h:mm a") },
      { label: "Attendee Name", value: `${item.user?.firstName} ${item.user?.lastName}` },
      { label: "Email Address", value: item.user?.email },
      { label: "Phone Number", value: item.user?.phoneNumber },
      { label: "Gender", value: item.gender || item.user?.gender || "N/A" },
      { label: "Organization", value: item.organization },
      { label: "Position", value: item.position },
      { label: "Country", value: item.country },
      { label: "Delegate Type", value: <Badge variant="secondary" className="capitalize">{item.delegateType || "N/A"}</Badge> },
      { label: "Payment Status", value: <Badge variant={item.paymentStatus === 'paid' ? 'default' : 'outline'}>{item.paymentStatus}</Badge> },
      { label: "Amount Paid", value: item.pricePaid ? `${item.currency || 'ZMW'} ${item.pricePaid}` : "N/A" },
      { label: "Event Title", value: item.event?.title, fullWidth: true },
      
      ...(isWomenEvent ? [
        { label: "Dinner Gala Attendance", value: item.dinnerGalaAttendance ? "Yes" : "No" },
        { label: "Accommodation Package", value: item.accommodationPackage ? "Yes" : "No" },
        { label: "Victoria Falls Package", value: item.victoriaFallsPackage ? "Yes" : "No" },
      ] : [])
    ];
  };

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
              <CardDescription>
                Manage attendee registrations and payments
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {extraActions}
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {registrations.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Registrations
            </h3>
            <p className="text-gray-600">
              Registrations will appear here when users sign up.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <SortableHeader label="Reg No." sortKey="registrationNumber" />
                  <SortableHeader label="Attendee" sortKey="userName" />
                  <SortableHeader label="Delegate" sortKey="delegateType" />
                  <SortableHeader label="Payment" sortKey="paymentStatus" />
                  <TableHead>Evidence</TableHead>
                  <SortableHeader label="Date" sortKey="registeredAt" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white">
                        {reg.registrationNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {reg.user?.firstName} {reg.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reg.user?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {reg.delegateType || "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={!canManageFinance}
                        value={reg.paymentStatus}
                        onValueChange={(value) =>
                          handlePaymentStatusChange(reg.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {reg.paymentEvidence ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewEvidence?.(reg.paymentEvidence, reg.user ? `${reg.user.firstName}_${reg.user.lastName}_evidence` : "payment_evidence")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {reg.registeredAt
                          ? formatZambianTime(reg.registeredAt, "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(reg)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <DetailViewModal
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title="Registration Details"
        details={getDetails(selectedItem)}
      />
    </Card>
  );
}
