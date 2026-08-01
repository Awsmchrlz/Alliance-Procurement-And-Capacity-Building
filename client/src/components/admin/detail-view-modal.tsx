import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface DetailViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  details: DetailItem[];
}

export function DetailViewModal({
  open,
  onOpenChange,
  title,
  details,
}: DetailViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="p-6 max-h-[calc(85vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pb-12">
            {details.map((detail, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 rounded-lg p-4 border border-gray-100 ${detail.fullWidth ? 'col-span-1 md:col-span-2' : ''}`}
              >
                <div className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  {detail.label}
                </div>
                <div className="text-base text-gray-900 break-words font-medium">
                  {detail.value || <span className="text-gray-400 italic">Not provided</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
