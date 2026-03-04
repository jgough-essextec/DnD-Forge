// =============================================================================
// AvatarUploader (Story 23.1)
//
// Upload dialog triggered by clicking avatar in edit mode.
// Validates file type (JPEG/PNG) and size (max 2MB), then opens the
// AvatarCropper for the user to select a square region. Also provides
// a "Remove Avatar" button to clear the avatar and revert to default.
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import { Upload, Trash2, X } from 'lucide-react';
import { validateImageFile, processImage } from './avatarUtils';
import { AvatarCropper } from './AvatarCropper';
import { cn } from '@/lib/utils';

// -- Types --------------------------------------------------------------------

interface AvatarUploaderProps {
  /** Current avatar URL (null if no avatar) */
  currentAvatarUrl: string | null;
  /** Called with the new avatar data URL when upload/crop is complete */
  onAvatarChange: (avatarUrl: string | null) => void;
  /** Called when the dialog should close */
  onClose: () => void;
}

// -- Component ----------------------------------------------------------------

export function AvatarUploader({
  currentAvatarUrl,
  onAvatarChange,
  onClose,
}: AvatarUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from the input
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so the same file can be re-selected
      e.target.value = '';

      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid file');
        return;
      }

      // Process the image (resize, convert to JPEG)
      setIsProcessing(true);
      try {
        const dataUrl = await processImage(file);
        setProcessedImageUrl(dataUrl);
      } catch {
        setError('Failed to process image. Please try a different file.');
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  // Handle crop confirmation
  const handleCropConfirm = useCallback(
    (croppedDataUrl: string) => {
      onAvatarChange(croppedDataUrl);
      onClose();
    },
    [onAvatarChange, onClose],
  );

  // Handle crop cancellation (back to upload view)
  const handleCropCancel = useCallback(() => {
    setProcessedImageUrl(null);
  }, []);

  // Remove current avatar
  const handleRemoveAvatar = useCallback(() => {
    onAvatarChange(null);
    onClose();
  }, [onAvatarChange, onClose]);

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // If we have a processed image, show the cropper
  if (processedImageUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-label="Crop avatar"
        data-testid="avatar-uploader-dialog"
      >
        <div className="bg-primary rounded-xl p-6 max-w-lg w-full shadow-2xl border border-parchment/10">
          <h3 className="text-lg font-semibold text-parchment mb-4">
            Crop Your Avatar
          </h3>
          <AvatarCropper
            imageUrl={processedImageUrl}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        </div>
      </div>
    );
  }

  // Upload view
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-label="Upload avatar"
      data-testid="avatar-uploader-dialog"
    >
      <div className="bg-primary rounded-xl p-6 max-w-sm w-full shadow-2xl border border-parchment/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-parchment">
            Character Avatar
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-parchment/50 hover:text-parchment hover:bg-parchment/10 transition-colors"
            aria-label="Close"
            data-testid="uploader-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm"
            role="alert"
            data-testid="upload-error"
          >
            {error}
          </div>
        )}

        {/* Upload area */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isProcessing}
            className={cn(
              'w-full flex flex-col items-center justify-center gap-2 p-8',
              'border-2 border-dashed border-parchment/20 rounded-lg',
              'text-parchment/60 hover:text-parchment hover:border-parchment/40',
              'transition-colors cursor-pointer',
              isProcessing && 'opacity-50 cursor-not-allowed',
            )}
            data-testid="upload-trigger"
          >
            <Upload size={32} />
            <span className="text-sm">
              {isProcessing ? 'Processing...' : 'Click to upload an image'}
            </span>
            <span className="text-xs text-parchment/40">
              JPEG or PNG, max 2MB
            </span>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => void handleFileSelect(e)}
            className="hidden"
            data-testid="file-input"
            aria-label="Choose avatar image file"
          />

          {/* Remove avatar button (only if there is a current avatar) */}
          {currentAvatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2',
                'text-sm rounded-lg border border-red-500/30',
                'text-red-400 hover:bg-red-900/20 transition-colors',
              )}
              data-testid="remove-avatar"
            >
              <Trash2 size={16} />
              Remove Avatar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
