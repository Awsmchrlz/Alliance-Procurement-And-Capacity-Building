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
import { Store, Plus, Eye, ArrowUpDown, FileText } from "lucide-react";
import { formatZambianTime } from "@/lib/utils";
import { DetailViewModal, DetailItem } from "./detail-view-modal";

interface ExhibitionsTabProps {
  exhibitions: any[];
  canManageFinance: boolean;
  setShowCreateExhibitionDialog: (show: boolean) => void;
  handleStatusChange: (id: string, newStatus: string, type: string) => void;
  onViewEvidence?: (url: string, name: string) => void;
}

export function ExhibitionsTab({
  exhibitions,
  canManageFinance,
  setShowCreateExhibitionDialog,
  handleStatusChange,
  onViewEvidence,
}: ExhibitionsTabProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "submittedAt",
    direction: "desc",
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const sortedExhibitions = useMemo(() => {
    let sortableItems = [...exhibitions];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "submittedAt") {
        aValue = new Date(a.submittedAt).getTime();
        bValue = new Date(b.submittedAt).getTime();
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
  }, [exhibitions, sortConfig]);

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
    return [
      { label: "Company Name", value: item.companyName },
      { label: "Booth Size", value: item.boothSize },
      { label: "Contact Person", value: item.contactPerson },
      { label: "Email Address", value: item.email },
      { label: "Phone Number", value: item.phoneNumber },
      { label: "Website", value: item.website },
      { label: "Amount", value: `${item.currency} ${item.amount.toLocaleString()}` },
      { label: "Status", value: <Badge>{item.status}</Badge> },
      { label: "Payment Status", value: <Badge variant="outline">{item.paymentStatus}</Badge> },
      { label: "Electrical Req.", value: item.electricalRequirements ? "Yes" : "No" },
      { label: "Internet Req.", value: item.internetRequirements ? "Yes" : "No" },
      { label: "Event", value: item.event?.title || "N/A", fullWidth: true },
      { label: "Products/Services", value: item.productsServices, fullWidth: true },
      { label: "Booth Requirements", value: item.boothRequirements, fullWidth: true },
      { label: "Notes", value: item.notes, fullWidth: true },
    ];
  };

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                Exhibition Applications
              </CardTitle>
              <CardDescription>
                Manage exhibition space and booth applications
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {canManageFinance && (
              <Button
                onClick={() => setShowCreateExhibitionDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2 hidden sm:block" />
                Create
              </Button>
            )}
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {exhibitions.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exhibitions.length === 0 ? (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Exhibition Applications
            </h3>
            <p className="text-gray-600">
              {canManageFinance
                ? "Exhibition applications will appear here when submitted."
                : "Exhibition applications will appear here. Only Super Admins and Finance Managers can create new exhibitions."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <SortableHeader label="Company" sortKey="companyName" />
                  <SortableHeader label="Booth Size" sortKey="boothSize" />
                  <SortableHeader label="Amount" sortKey="amount" />
                  <SortableHeader label="Status" sortKey="status" />
                  <TableHead>Payment Evidence</TableHead>
                  <SortableHeader label="Submitted" sortKey="submittedAt" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExhibitions.map((exhibition) => (
                  <TableRow key={exhibition.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {exhibition.companyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">
                        {exhibition.boothSize}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {exhibition.currency} {exhibition.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={!canManageFinance}
                        value={exhibition.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            exhibition.id,
                            value,
                            "exhibition"
                          )
                        }
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {exhibition.paymentEvidence ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewEvidence?.(exhibition.paymentEvidence, exhibition.companyName ? `${exhibition.companyName}_payment_evidence` : "payment_evidence")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Evidence
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {exhibition.submittedAt
                          ? formatZambianTime(exhibition.submittedAt, "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(exhibition)}
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
        title="Exhibition Details"
        details={getDetails(selectedItem)}
      />
    </Card>
  );
}
