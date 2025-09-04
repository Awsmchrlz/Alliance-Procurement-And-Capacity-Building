import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Eye, X, Image, File, Upload, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";

interface EvidenceViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidencePath: string | null;
  fileName?: string;
  registrationId?: string;
  onEvidenceUpdate?: (newPath: string) => void;
  canUpdate?: boolean;
  isAdmin?: boolean;
}

export function EvidenceViewer({
  open,
  onOpenChange,
  evidencePath,
  fileName,
  registrationId,
  onEvidenceUpdate,
  canUpdate = false,
  isAdmin = false
}: EvidenceViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [currentEvidencePath, setCurrentEvidencePath] = useState<string | null>(evidencePath);

  const getFileType = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    }
    if (['pdf'].includes(extension || '')) {
      return 'pdf';
    }
    return 'document';
  };

  const getFileIcon = (path: string) => {
    const fileType = getFileType(path);
    switch (fileType) {
      case 'image':
        return Image;
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  const loadFileUrl = async (path?: string) => {
    const targetPath = path || currentEvidencePath;
    if (!targetPath) return;

    console.log('🔍 loadFileUrl called with path:', targetPath);
    setLoading(true);
    setError(null);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Use appropriate endpoint based on user type with cache busting
      const cacheBuster = `?t=${Date.now()}`;
      const baseEndpoint = isAdmin 
        ? `/api/admin/payment-evidence/${encodeURIComponent(targetPath)}`
        : `/api/users/payment-evidence/${encodeURIComponent(targetPath)}`;
      const fetchUrl = `${baseEndpoint}${cacheBuster}`;
      console.log('🌐 Fetching from URL:', fetchUrl, 'isAdmin:', isAdmin);

      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Cache-Control': 'no-cache',
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ Failed to load file:', response.status, response.statusText);
        // Try to get more details from the response
        try {
          const errorData = await response.json();
          console.error('❌ Error details:', errorData);
          throw new Error(errorData.message || `Failed to load file: ${response.statusText}`);
        } catch {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      console.log('✅ File loaded successfully, blob size:', blob.size);
      const blobUrl = URL.createObjectURL(blob);
      setFileUrl(blobUrl);
    } catch (err: any) {
      console.error('Error loading file:', err);
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentEvidencePath) return;

    setLoading(true);
    setError(null);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Download file via API
      const downloadEndpoint = isAdmin 
        ? `/api/admin/payment-evidence/${encodeURIComponent(currentEvidencePath)}`
        : `/api/users/payment-evidence/${encodeURIComponent(currentEvidencePath)}`;
      
      const response = await fetch(downloadEndpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || currentEvidencePath.split('/').pop() || 'evidence';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!currentEvidencePath) return;

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Open file in new tab via API
      const viewEndpoint = isAdmin 
        ? `/api/admin/payment-evidence/${encodeURIComponent(currentEvidencePath)}`
        : `/api/users/payment-evidence/${encodeURIComponent(currentEvidencePath)}`;
      
      const response = await fetch(viewEndpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to open file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to open file. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpdateEvidence = async () => {
    if (!newFile || !registrationId) return;

    setUpdating(true);
    setError(null);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      console.log('Updating evidence for registration:', registrationId);
      console.log('File being uploaded:', newFile.name);

      // Step 1: Upload new file directly to Supabase storage (same as registration dialog)
      const fileExtension = newFile.name.split('.').pop();
      const sanitizedFileName = `evidence_${Date.now()}.${fileExtension}`;
      const bucket = import.meta.env.VITE_SUPABASE_EVIDENCE_BUCKET || 'registrations';
      
      // Get user ID from session
      const userId = session.user.id;
      
      // We need to get the event ID from the current evidence path or registration
      // For now, let's extract it from the current evidence path
      let eventId = '';
      if (currentEvidencePath) {
        const pathParts = currentEvidencePath.split('/');
        if (pathParts.length >= 3 && pathParts[0] === 'evidence') {
          eventId = pathParts[2]; // evidence/userId/eventId/filename
        }
      }
      
      if (!eventId) {
        throw new Error('Could not determine event ID from evidence path');
      }
      
      const newFilePath = `evidence/${userId}/${eventId}/${sanitizedFileName}`;
      
      console.log('Uploading to path:', newFilePath);
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(newFilePath, newFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: newFile.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message?.toLowerCase().includes('bucket')) {
          throw new Error('Payment evidence bucket not found. Please create a Storage bucket named "' + bucket + '" or set VITE_SUPABASE_EVIDENCE_BUCKET to an existing bucket.');
        }
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully to:', newFilePath);

      // Step 2: Update the registration record via API
      const apiEndpoint = isAdmin 
        ? `/api/admin/registrations/${registrationId}`
        : `/api/users/registrations/${registrationId}`;
      
      console.log('Using API endpoint:', apiEndpoint, 'isAdmin:', isAdmin);
      
      const updateResponse = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentEvidence: newFilePath,
        }),
      });

      if (!updateResponse.ok) {
        // If registration update fails, try to clean up the uploaded file
        try {
          await supabase.storage.from(bucket).remove([newFilePath]);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Failed to update registration record');
      }

      console.log('✅ Registration updated successfully');

      // Step 3: Delete old evidence file if it exists
      if (currentEvidencePath) {
        try {
          console.log('🗑️ Deleting old evidence:', currentEvidencePath);
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([currentEvidencePath]);
          
          if (deleteError) {
            console.warn('Failed to delete old evidence:', deleteError);
            // Don't fail the update if deletion fails
          } else {
            console.log('✅ Old evidence deleted successfully');
          }
        } catch (deleteError) {
          console.warn('Error deleting old evidence:', deleteError);
        }
      }

      // Step 4: Update UI state
      console.log('New evidence path:', newFilePath);
      setCurrentEvidencePath(newFilePath);

      // Clear old file URL
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }

      // Call the callback to update the parent component
      if (onEvidenceUpdate) {
        onEvidenceUpdate(newFilePath);
      }

      // Force reload the file with cache busting and retry logic
      const retryLoadFile = async (attempts = 3) => {
        for (let i = 0; i < attempts; i++) {
          try {
            console.log(`🔄 Attempt ${i + 1} to reload file with new path:`, newFilePath);
            await loadFileUrl(newFilePath);
            console.log('✅ File loaded successfully on attempt', i + 1);
            break;
          } catch (error) {
            console.warn(`⚠️ Attempt ${i + 1} failed:`, error);
            if (i === attempts - 1) {
              console.error('❌ All attempts failed to load new evidence file');
              setError('Failed to load updated evidence. Please refresh the page.');
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
        }
      };

      setTimeout(() => retryLoadFile(), 500); // Small delay to ensure file is fully uploaded

      setShowUpdateForm(false);
      setNewFile(null);

      // Show success message
      setError(null);
      setSuccess('Evidence updated successfully!');
      console.log('✅ Evidence updated successfully!');

    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update evidence. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Update current evidence path when prop changes
  useEffect(() => {
    if (evidencePath !== currentEvidencePath) {
      console.log('Evidence path changed from', currentEvidencePath, 'to', evidencePath);
      setCurrentEvidencePath(evidencePath);
      // Clear old file URL when evidence path changes
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      // Clear messages when evidence path changes
      setError(null);
      setSuccess(null);
    }
  }, [evidencePath]);

  // Load file URL when dialog opens or evidence path changes
  useEffect(() => {
    if (open && currentEvidencePath && !fileUrl) {
      console.log('Loading file URL for:', currentEvidencePath);
      loadFileUrl(currentEvidencePath);
    }
  }, [open, currentEvidencePath]);

  // Clean up blob URL when dialog closes
  useEffect(() => {
    if (!open && fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }, [open, fileUrl]);

  if (!currentEvidencePath) {
    return null;
  }

  const fileType = getFileType(currentEvidencePath);
  const FileIcon = getFileIcon(currentEvidencePath);
  const displayName = fileName || currentEvidencePath.split('/').pop() || 'Evidence File';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileIcon className="w-5 h-5 text-primary-blue" />
            Payment Evidence
          </DialogTitle>
          <DialogDescription>
            View and download your payment evidence for verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="p-4 bg-blue-50/90 backdrop-blur-sm rounded-lg border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{displayName}</p>
                  <p className="text-sm text-blue-700 capitalize">{fileType} file</p>
                  <p className="text-xs text-blue-600">Path: {currentEvidencePath}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Force refresh the file
                    if (fileUrl) {
                      URL.revokeObjectURL(fileUrl);
                      setFileUrl(null);
                    }
                    loadFileUrl(currentEvidencePath);
                  }}
                  disabled={loading}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
                {canUpdate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Update
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Update Form */}
          {showUpdateForm && canUpdate && (
            <div className="p-4 bg-yellow-50/90 backdrop-blur-sm rounded-lg border border-yellow-200/50">
              <h4 className="font-medium text-yellow-900 mb-3">Update Payment Evidence</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-evidence" className="text-sm text-yellow-800">
                    New Evidence File
                  </Label>
                  <Input
                    id="new-evidence"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateEvidence}
                    disabled={!newFile || updating}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-1" />
                        Update Evidence
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setNewFile(null);
                    }}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8 bg-white/50 backdrop-blur-sm rounded-lg">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading evidence...</span>
            </div>
          )}

          {/* File Preview */}
          {!loading && fileUrl && fileType === 'image' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
              <img
                src={fileUrl}
                alt="Payment Evidence"
                className="w-full h-64 object-contain bg-gray-50"
                onError={() => setError('Failed to load image preview')}
              />
            </div>
          )}

          {!loading && fileUrl && fileType === 'pdf' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
              <iframe
                src={fileUrl}
                className="w-full h-64"
                title="Payment Evidence PDF"
                onError={() => setError('Failed to load PDF preview')}
              />
            </div>
          )}

          {!loading && fileType === 'document' && (
            <div className="border border-gray-200 rounded-lg p-8 text-center bg-white/80 backdrop-blur-sm">
              <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Document preview not available</p>
              <p className="text-sm text-gray-500">Please download to view the file</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50/90 backdrop-blur-sm border border-green-200/50 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleView}
              disabled={loading}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="bg-primary-blue text-white hover:bg-[#2d4a7a]"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "Download"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
