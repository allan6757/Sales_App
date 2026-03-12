import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Camera, Upload, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imagePath: string) => void;
}

export function ImageUpload({ isOpen, onClose, onImageSelect }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const backCameraRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onImageSelect(data.imagePath);
        toast.success('Image uploaded successfully');
        onClose();
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            Add Item Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {isMobileDevice() ? (
            <>
              {/* Front Camera (Selfie) */}
              <Button
                onClick={() => frontCameraRef.current?.click()}
                disabled={uploading}
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Smartphone className="size-5 mr-3" />
                {uploading ? 'Uploading...' : 'Front Camera'}
              </Button>
              
              {/* Back Camera */}
              <Button
                onClick={() => backCameraRef.current?.click()}
                disabled={uploading}
                className="w-full h-14 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                <Camera className="size-5 mr-3" />
                {uploading ? 'Uploading...' : 'Back Camera'}
              </Button>
            </>
          ) : (
            /* Desktop/Laptop Camera */
            <Button
              onClick={() => frontCameraRef.current?.click()}
              disabled={uploading}
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Monitor className="size-5 mr-3" />
              {uploading ? 'Uploading...' : 'Take Photo'}
            </Button>
          )}
          
          {/* Upload from Gallery */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full h-14"
          >
            <Upload className="size-5 mr-3" />
            Upload from Gallery
          </Button>
          
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Front camera input */}
          <input
            ref={frontCameraRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Back camera input (mobile only) */}
          <input
            ref={backCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Supported formats: PNG, JPG, JPEG, GIF, WEBP</p>
            {isMobileDevice() && (
              <p className="text-blue-600">📱 Mobile detected - Camera options available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}