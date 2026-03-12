import { Dialog, DialogContent } from './ui/dialog';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  itemName: string;
}

export function ImageViewer({ isOpen, onClose, imagePath, itemName }: ImageViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
          >
            <X className="size-6 font-bold" />
          </Button>
          <img
            src={`http://localhost:5000${imagePath}`}
            alt={itemName}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}