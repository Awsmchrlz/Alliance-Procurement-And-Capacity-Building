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

  const loadFileUrl = async (targetPath: string) => {
    if (!targetPath) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Evidence Viewer Debug Info:');
      console.log('  - targetPath:', targetPath);
      console.log('  - isAdmin:', isAdmin);
      console.log('  - registrationId:', registrationId);
      console.log('  - fileName:', fileName);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      console.log('  - userId:', session.user.id);

      // Add cache buster to prevent stale responses
      const cacheBuster = `?t=${Date.now()}`;
      const baseEndpoint = isAdmin 
        ? `/api/admin/evidence/${encodeURIComponent(targetPath)}`
        : `/api/users/evidence/${encodeURIComponent(targetPath)}`;
      const fetchUrl = `${baseEndpoint}${cacheBuster}`;
      console.log('🌐 Fetching from URL:', fetchUrl);

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
          
          // If it's a 404, provide a more helpful message
          if (response.status === 404) {
            throw new Error('Payment evidence file not found. It may have been moved or deleted.');
          }
          
          throw new Error(errorData.message || `Failed to load file: ${response.statusText}`);
        } catch (parseError) {
          if (response.status === 404) {
            throw new Error('Payment evidence file not found. Please check if the file exists.');
          }
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      console.log('✅ File loaded successfully, blob size:', blob.size);
      const blobUrl = URL.createObjectURL(blob);
      setFileUrl(blobUrl);
    } catch (err: any) {
      console.error('Error loading file:', err);
      const errorMessage = err.message || 'Failed to load file';
      
      // Provide more specific error messages and suggest solutions
      if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
        setError('Evidence file not found. This may be due to a path mismatch. Please try uploading the evidence file again.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Access denied. You may not have permission to view this file.');
      } else if (errorMessage.includes('Network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`${errorMessage}. If this persists, try re-uploading the evidence file.`);
      }
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
        ? `/api/admin/evidence/${encodeURIComponent(currentEvidencePath)}`
        : `/api/users/evidence/${encodeURIComponent(currentEvidencePath)}`;
      
      const response = await fetch(downloadEndpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Payment evidence file not found. The file may have been moved or deleted.');
        }
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
        ? `/api/admin/evidence/${encodeURIComponent(currentEvidencePath)}`
        : `/api/users/evidence/${encodeURIComponent(currentEvidencePath)}`;
      
      const response = await fetch(viewEndpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Payment evidence file not found. The file may have been moved or deleted.');
        }
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
      const bucket = 'evidence';
      
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
          throw new Error('Evidence bucket not found. Please create a Storage bucket named "' + bucket + '" or set VITE_SUPABASE_EVIDENCE_BUCKET to an existing bucket.');
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
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-hidden bg-white border-0 shadow-2xl rounded-2xl flex flex-col">
        <DialogHeader className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C356B] via-[#1C356B] to-[#2d4a7a] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
          
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          
          <div className="relative px-4 sm:px-6 py-4 sm:py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-3 sm:mb-4">
              <FileIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FDC123]" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
              Payment Evidence
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm sm:text-base px-2">
              View, download, or update your payment evidence
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
          {/* File Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1C356B] to-[#2d4a7a] rounded-xl flex items-center justify-center shrink-0">
                  <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{displayName}</h3>
                  <p className="text-sm text-gray-600 capitalize">{fileType} file</p>
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 break-all">
                    <span className="block sm:hidden">{currentEvidencePath.split('/').pop()}</span>
                    <span className="hidden sm:block">{currentEvidencePath}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setError(null); // Clear any previous errors
                    if (fileUrl) {
                      URL.revokeObjectURL(fileUrl);
                      setFileUrl(null);
                    }
                    loadFileUrl(currentEvidencePath);
                  }}
                  disabled={loading}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  title="Refresh file"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {canUpdate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Update Form */}
          {showUpdateForm && canUpdate && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Update Payment Evidence</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-evidence" className="text-sm font-medium text-gray-700 mb-2 block">
                    Choose New Evidence File
                  </Label>
                  <Input
                    id="new-evidence"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className="h-12 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG, GIF, WebP</p>
                </div>
                {newFile && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-700 block truncate">{newFile.name}</span>
                      <span className="text-xs text-gray-500">({(newFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpdateEvidence}
                    disabled={!newFile || updating}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg w-full sm:w-auto"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Update Evidence
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setNewFile(null);
                    }}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-3" />
              <span className="text-gray-700 font-medium">Loading evidence...</span>
              <span className="text-sm text-gray-500 mt-1">Please wait while we fetch your file</span>
            </div>
          )}

          {/* File Preview */}
          {!loading && fileUrl && fileType === 'image' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Image Preview</h4>
              </div>
              <div className="p-4">
                <img
                  src={fileUrl}
                  alt="Payment Evidence"
                  className="w-full max-h-96 object-contain bg-gray-50 rounded-lg border border-gray-200"
                  onError={() => setError('Failed to load image preview')}
                />
              </div>
            </div>
          )}

          {!loading && fileUrl && fileType === 'pdf' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">PDF Preview</h4>
              </div>
              <div className="p-4">
                <iframe
                  src={fileUrl}
                  className="w-full h-96 rounded-lg border border-gray-200"
                  title="Payment Evidence PDF"
                  onError={() => setError('Failed to load PDF preview')}
                />
              </div>
            </div>
          )}

          {!loading && fileType === 'document' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Document File</h4>
              </div>
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileIcon className="w-10 h-10 text-gray-500" />
                </div>
                <h5 className="font-medium text-gray-900 mb-2">Preview Not Available</h5>
                <p className="text-gray-600 mb-1">This document type cannot be previewed</p>
                <p className="text-sm text-gray-500">Use the download button to view the file</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-red-800 font-medium mb-2 break-words">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setError(null);
                      if (fileUrl) {
                        URL.revokeObjectURL(fileUrl);
                        setFileUrl(null);
                      }
                      loadFileUrl(currentEvidencePath);
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Actions Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              <span className="font-medium">File actions:</span>
              <span className="hidden sm:inline"> View in new tab or download to your device</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleView}
                disabled={loading}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                View in Tab
              </Button>
              <Button
                onClick={handleDownload}
                disabled={loading}
                className="bg-gradient-to-r from-[#1C356B] to-[#2d4a7a] hover:from-[#2d4a7a] hover:to-[#1C356B] text-white shadow-lg w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? "Loading..." : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
