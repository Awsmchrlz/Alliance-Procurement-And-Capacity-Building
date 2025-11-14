import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Trash2, Download, Plus, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  uploadedBy: string;
  uploadedAt: string;
  uploaderName?: string;
}

export function AdminDocumentsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.file) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      // Note: Using 'public_documents' bucket for admin-uploaded documents
      // 'registrations' bucket is used for payment evidence
      const fileExt = uploadData.file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const bucketName = "public_documents";
      
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: uploadData.file.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Create document record
      await apiRequest("POST", "/api/admin/documents", {
        title: uploadData.title,
        description: uploadData.description || null,
        fileUrl: publicUrl,
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size,
        fileType: uploadData.file.type,
      });

      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully",
      });

      // Reset form and close dialog
      setUploadData({ title: "", description: "", file: null });
      setShowUploadDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
    } catch (error: any) {
      console.error("Upload error:", error);
      
      let errorMessage = error.message || "Failed to upload document";
      
      // Provide helpful error messages
      if (error.message?.includes('mime type') || error.message?.includes('MIME')) {
        errorMessage = "File type not supported by storage bucket. Please configure the Supabase bucket to allow this file type, or contact an administrator.";
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage = "Storage bucket not configured. Please check SUPABASE_BUCKET_SETUP.md for configuration instructions.";
      } else if (error.message?.includes('size')) {
        errorMessage = "File is too large. Maximum size is 10MB.";
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/admin/documents/${documentId}`);

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Management
              </CardTitle>
              <CardDescription>
                Upload and manage documents accessible to all users
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents && documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        {doc.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatFileSize(doc.fileSize)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.fileUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.fileName)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowUploadDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Upload Document</DialogTitle>
            <DialogDescription className="text-gray-600">
              Upload a document that will be accessible to all users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Event Guidelines 2025"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData({ ...uploadData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the document..."
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File * (Max 10MB)</Label>
              <div className="text-xs text-gray-500 mb-2">
                Supported: PDF, Word, Excel, PowerPoint, Text, Images
              </div>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              {uploadData.file && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <FileText className="h-4 w-4" />
                  <span>{uploadData.file.name}</span>
                  <span className="text-gray-400">
                    ({formatFileSize(uploadData.file.size)})
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadData({ title: "", description: "", file: null });
                setShowUploadDialog(false);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
