import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User, FileIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

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

export default function DocumentsPage() {
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("doc")) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes("excel") || fileType.includes("sheet")) return <FileText className="h-5 w-5 text-green-500" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // First, try to fetch the file to check if it's accessible
      const response = await fetch(fileUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        console.error('File not accessible:', response.status, response.statusText);
        alert(`Unable to download file. The file may not be publicly accessible. Please contact an administrator.\n\nError: ${response.status} ${response.statusText}`);
        return;
      }
      
      // If accessible, proceed with download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Unable to download file. Please check your internet connection or contact an administrator.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documents & Resources
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access important documents, guidelines, and resources shared by our team
          </p>
        </div>

        {/* Documents Grid */}
        {documents && documents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {doc.fileName}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doc.description && (
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {doc.fileSize && (
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(doc.fileSize)}
                      </Badge>
                    )}
                    {doc.fileType && (
                      <Badge variant="outline" className="text-xs">
                        {doc.fileType.split("/")[1]?.toUpperCase() || "FILE"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleDownload(doc.fileUrl, doc.fileName)}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Documents Available
              </h3>
              <p className="text-gray-600">
                Check back later for important documents and resources
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
