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
import { Crown, Plus, Eye, ArrowUpDown, Download } from "lucide-react";
import { formatZambianTime } from "@/lib/utils";
import { DetailViewModal, DetailItem } from "./detail-view-modal";
import { EvidenceViewer } from "@/components/evidence-viewer";

interface SponsorshipsTabProps {
  sponsorships: any[];
  canManageFinance: boolean;
  setShowCreateSponsorshipDialog: (show: boolean) => void;
  handleStatusChange: (id: string, newStatus: string, type: string) => void;
}

export function SponsorshipsTab({
  sponsorships,
  canManageFinance,
  setShowCreateSponsorshipDialog,
  handleStatusChange,
}: SponsorshipsTabProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "submittedAt",
    direction: "desc",
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const sortedSponsorships = useMemo(() => {
    let sortableItems = [...sponsorships];
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
  }, [sponsorships, sortConfig]);

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
      { label: "Sponsorship Level", value: item.sponsorshipLevel },
      { label: "Contact Person", value: item.contactPerson },
      { label: "Email Address", value: item.email },
      { label: "Phone Number", value: item.phoneNumber },
      { label: "Website", value: item.website },
      { label: "Amount", value: `${item.currency} ${item.amount.toLocaleString()}` },
      { label: "Status", value: <Badge>{item.status}</Badge> },
      { label: "Payment Status", value: <Badge variant="outline">{item.paymentStatus}</Badge> },
      { label: "Event", value: item.event?.title || "N/A", fullWidth: true },
      { label: "Company Address", value: item.companyAddress, fullWidth: true },
      { label: "Special Requirements", value: item.specialRequirements, fullWidth: true },
      { label: "Marketing Materials", value: item.marketingMaterials, fullWidth: true },
      { label: "Notes", value: item.notes, fullWidth: true },
    ];
  };

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                Sponsorship Applications
              </CardTitle>
              <CardDescription>
                Manage sponsorship applications and partnerships
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {canManageFinance && (
              <Button
                onClick={() => setShowCreateSponsorshipDialog(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2 hidden sm:block" />
                Create
              </Button>
            )}
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {sponsorships.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sponsorships.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Sponsorship Applications
            </h3>
            <p className="text-gray-600">
              {canManageFinance
                ? "Sponsorship applications will appear here when submitted."
                : "Sponsorship applications will appear here. Only Super Admins and Finance Managers can create new sponsorships."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <SortableHeader label="Company" sortKey="companyName" />
                  <SortableHeader label="Level" sortKey="sponsorshipLevel" />
                  <SortableHeader label="Amount" sortKey="amount" />
                  <SortableHeader label="Status" sortKey="status" />
                  <TableHead>Payment Evidence</TableHead>
                  <SortableHeader label="Submitted" sortKey="submittedAt" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSponsorships.map((sponsorship) => (
                  <TableRow key={sponsorship.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {sponsorship.companyName}
                      </div>
                      <div className="text-sm text-gray-500 md:hidden">
                        {sponsorship.contactPerson}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">
                        {sponsorship.sponsorshipLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {sponsorship.currency} {sponsorship.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={!canManageFinance}
                        value={sponsorship.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            sponsorship.id,
                            value,
                            "sponsorship"
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
                      {sponsorship.paymentEvidence ? (
                        <EvidenceViewer
                          url={sponsorship.paymentEvidence}
                          type="image"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {sponsorship.submittedAt
                          ? formatZambianTime(sponsorship.submittedAt, "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(sponsorship)}
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
        title="Sponsorship Details"
        details={getDetails(selectedItem)}
      />
    </Card>
  );
}
