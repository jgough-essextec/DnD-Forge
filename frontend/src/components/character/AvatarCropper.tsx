// =============================================================================
// AvatarCropper (Story 23.1)
//
// Post-upload crop interface that lets the user select a square region
// of the uploaded image, preview the result, and confirm or cancel.
// Uses CSS-based drag-to-position with resize handles. No external library.
// =============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CropRegion } from './avatarUtils';
import { cropImage } from './avatarUtils';
import { cn } from '@/lib/utils';

// -- Types --------------------------------------------------------------------

interface AvatarCropperProps {
  /** The image data URL to crop */
  imageUrl: string;
  /** Called with the cropped image data URL on confirm */
  onConfirm: (croppedDataUrl: string) => void;
  /** Called when the user cancels cropping */
  onCancel: () => void;
}

// -- Component ----------------------------------------------------------------

export function AvatarCropper({
  imageUrl,
  onConfirm,
  onCancel,
}: AvatarCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<CropRegion>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load the image to get dimensions and set initial crop
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const size = Math.min(naturalWidth, naturalHeight);
      const x = Math.round((naturalWidth - size) / 2);
      const y = Math.round((naturalHeight - size) / 2);

      setImageSize({ width: naturalWidth, height: naturalHeight });
      setCrop({ x, y, width: size, height: size });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Update preview when crop changes
  useEffect(() => {
    if (crop.width <= 0 || crop.height <= 0) return;

    const timer = setTimeout(() => {
      void cropImage(imageUrl, crop).then(setPreview).catch(() => {
        // Preview generation failed silently
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [imageUrl, crop]);

  // Calculate display scale (image fits in max 400px container)
  const maxDisplay = 400;
  const displayScale =
    imageSize.width > 0
      ? Math.min(maxDisplay / imageSize.width, maxDisplay / imageSize.height, 1)
      : 1;

  const displayWidth = Math.round(imageSize.width * displayScale);
  const displayHeight = Math.round(imageSize.height * displayScale);

  // Clamp crop region to image bounds
  const clampCrop = useCallback(
    (c: CropRegion): CropRegion => {
      const w = Math.max(20, Math.min(c.width, imageSize.width, imageSize.height));
      const h = w; // Keep square
      const x = Math.max(0, Math.min(c.x, imageSize.width - w));
      const y = Math.max(0, Math.min(c.y, imageSize.height - h));
      return { x, y, width: w, height: h };
    },
    [imageSize],
  );

  // Mouse/touch handlers for drag
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const point = 'touches' in e ? e.touches[0] : e;
      setIsDragging(true);
      setDragStart({ x: point.clientX - crop.x * displayScale, y: point.clientY - crop.y * displayScale });
    },
    [crop.x, crop.y, displayScale],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const point = 'touches' in e ? e.touches[0] : e;
      setIsResizing(true);
      setDragStart({ x: point.clientX, y: point.clientY });
    },
    [],
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;

      if (isDragging) {
        const newX = (point.clientX - dragStart.x) / displayScale;
        const newY = (point.clientY - dragStart.y) / displayScale;
        setCrop((prev) => clampCrop({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        const deltaX = point.clientX - dragStart.x;
        const deltaY = point.clientY - dragStart.y;
        const delta = Math.max(deltaX, deltaY) / displayScale;
        setDragStart({ x: point.clientX, y: point.clientY });
        setCrop((prev) => clampCrop({ ...prev, width: prev.width + delta, height: prev.height + delta }));
      }
    },
    [isDragging, isResizing, dragStart, displayScale, clampCrop],
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, isResizing, handleMove, handleEnd]);

  // Confirm: process and return
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await cropImage(imageUrl, crop);
      onConfirm(result);
    } catch {
      // Crop failed, stay on cropper
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="dialog"
      aria-label="Crop avatar image"
      data-testid="avatar-cropper"
    >
      <p className="text-sm text-parchment/70">
        Drag to reposition. Drag the corner handle to resize.
      </p>

      {/* Crop area */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-black/40 rounded-lg"
        style={{ width: displayWidth, height: displayHeight }}
        data-testid="crop-container"
      >
        {/* Source image */}
        <img
          src={imageUrl}
          alt="Image to crop"
          style={{ width: displayWidth, height: displayHeight }}
          className="block select-none pointer-events-none"
          draggable={false}
        />

        {/* Dark overlay outside crop */}
        <div
          className="absolute inset-0 bg-black/50 pointer-events-none"
          style={{
            clipPath: `polygon(
              0% 0%, 100% 0%, 100% 100%, 0% 100%,
              0% ${crop.y * displayScale}px,
              ${crop.x * displayScale}px ${crop.y * displayScale}px,
              ${crop.x * displayScale}px ${(crop.y + crop.height) * displayScale}px,
              0% ${(crop.y + crop.height) * displayScale}px
            )`,
          }}
        />

        {/* Crop selection box */}
        <div
          className={cn(
            'absolute border-2 border-white/80 cursor-move',
            isDragging && 'border-accent-gold',
          )}
          style={{
            left: crop.x * displayScale,
            top: crop.y * displayScale,
            width: crop.width * displayScale,
            height: crop.height * displayScale,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          role="slider"
          aria-label="Crop region"
          aria-valuetext={`Position ${Math.round(crop.x)}, ${Math.round(crop.y)}, size ${Math.round(crop.width)}`}
          tabIndex={0}
          data-testid="crop-selection"
        >
          {/* Resize handle (bottom-right corner) */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white/90 border border-black/30 cursor-se-resize translate-x-1/2 translate-y-1/2 rounded-sm"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            data-testid="crop-resize-handle"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-xs text-parchment/50 mb-1">Preview</p>
          <div
            className="w-16 h-16 rounded-full overflow-hidden border-2 border-parchment/30 bg-black/20"
            data-testid="crop-preview"
          >
            {preview && (
              <img
                src={preview}
                alt="Cropped preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-parchment/30 text-parchment/70 hover:bg-parchment/10 transition-colors"
          data-testid="crop-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isProcessing}
          className={cn(
            'px-4 py-2 text-sm rounded-lg font-medium transition-colors',
            'bg-accent-gold text-primary hover:bg-accent-gold/90',
            isProcessing && 'opacity-50 cursor-not-allowed',
          )}
          data-testid="crop-confirm"
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
