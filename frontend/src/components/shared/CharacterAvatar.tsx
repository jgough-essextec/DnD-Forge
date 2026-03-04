// =============================================================================
// CharacterAvatar (Story 23.2)
//
// Reusable avatar display component used across gallery cards, character
// sheet banners, shared views, and future DM party view.
//
// Features:
// - Size variants: sm (32px), md (48px), lg (64px), xl (128px)
// - Renders custom avatar or default (race silhouette + class color)
// - Editable overlay with camera icon on hover
// - Circular mask with parchment-textured border ring
// - Graceful fallback on corrupted/invalid base64 data
// - Accessible alt text
// =============================================================================

import { useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { generateDefaultAvatar } from '@/components/character/avatarUtils';
import { cn } from '@/lib/utils';

// -- Types --------------------------------------------------------------------

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface CharacterAvatarProps {
  /** The avatar image URL (data URL or remote URL). Null for default. */
  avatarUrl: string | null;
  /** Race ID for default avatar generation */
  raceId?: string;
  /** Class ID for default avatar generation */
  classId?: string;
  /** Character name for alt text */
  characterName?: string;
  /** Size variant */
  size: AvatarSize;
  /** When true, shows camera/upload icon overlay on hover */
  editable?: boolean;
  /** Click handler (typically opens AvatarUploader) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// -- Size mappings ------------------------------------------------------------

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 128,
};

const BORDER_WIDTH: Record<AvatarSize, number> = {
  sm: 2,
  md: 2,
  lg: 3,
  xl: 4,
};

const ICON_SIZE: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
};

// -- Component ----------------------------------------------------------------

export function CharacterAvatar({
  avatarUrl,
  raceId = 'human',
  classId = 'fighter',
  characterName,
  size,
  editable = false,
  onClick,
  className,
}: CharacterAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const px = SIZE_PX[size];
  const borderW = BORDER_WIDTH[size];
  const iconSize = ICON_SIZE[size];

  // Determine the image source
  const showCustomAvatar = avatarUrl && !hasImageError;
  const defaultAvatarUrl = generateDefaultAvatar(raceId, classId);
  const displayUrl = showCustomAvatar ? avatarUrl : defaultAvatarUrl;

  const altText = characterName
    ? `${characterName}'s avatar`
    : 'Character avatar';

  // Reset error state when avatarUrl changes
  const handleImageError = useCallback(() => {
    setHasImageError(true);
  }, []);

  // When avatarUrl changes, clear the error flag
  const handleLoad = useCallback(() => {
    setHasImageError(false);
  }, []);

  const isClickable = editable && onClick;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center flex-shrink-0',
        'rounded-full overflow-hidden group',
        isClickable && 'cursor-pointer',
        className,
      )}
      style={{
        width: px,
        height: px,
        border: `${borderW}px solid`,
        borderColor: 'rgba(232, 180, 48, 0.3)',
        boxShadow: `0 0 0 1px rgba(238, 232, 213, 0.1), inset 0 0 ${borderW * 2}px rgba(238, 232, 213, 0.05)`,
      }}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Change ${altText}` : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      data-testid="character-avatar"
      data-size={size}
    >
      {/* Parchment border ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(238,232,213,0.15) 0%, rgba(232,180,48,0.1) 50%, rgba(238,232,213,0.15) 100%)',
        }}
        data-testid="parchment-border"
      />

      {/* Avatar image */}
      <img
        src={displayUrl}
        alt={altText}
        className="w-full h-full object-cover rounded-full"
        onError={handleImageError}
        onLoad={handleLoad}
        draggable={false}
        data-testid="avatar-image"
      />

      {/* Editable hover overlay */}
      {editable && (
        <div
          className={cn(
            'absolute inset-0 rounded-full flex items-center justify-center',
            'bg-black/0 group-hover:bg-black/50 transition-colors',
          )}
          data-testid="editable-overlay"
        >
          <Camera
            size={iconSize}
            className="text-white/0 group-hover:text-white/90 transition-colors"
            aria-hidden="true"
            data-testid="upload-icon"
          />
        </div>
      )}
    </div>
  );
}
