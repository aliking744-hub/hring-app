import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Loader2, ZoomIn, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
  targetWidth?: number;
  targetHeight?: number;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedArea,
  rotation: number,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to target dimensions
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate rotation
  const rotRad = (rotation * Math.PI) / 180;

  // Create a temporary canvas for the cropped area
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    throw new Error('No 2d context');
  }

  // Set temp canvas to crop size
  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;

  // Handle rotation
  if (rotation !== 0) {
    const centerX = image.width / 2;
    const centerY = image.height / 2;

    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(rotRad);
    tempCtx.translate(-centerX, -centerY);
    tempCtx.drawImage(image, 0, 0);
    tempCtx.restore();

    // Draw to final canvas with resize
    ctx.drawImage(
      tempCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    // Draw cropped and resized image directly
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
};

const ImageCropper = ({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1200 / 630,
  targetWidth = 1200,
  targetHeight = 630,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        targetWidth,
        targetHeight
      );
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>برش تصویر</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) => setZoom(value)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12 text-left">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              چرخش ۹۰°
            </Button>
            <span className="text-sm text-muted-foreground">
              ابعاد نهایی: {targetWidth}×{targetHeight} پیکسل
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={processing}>
            {processing && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            اعمال برش
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
