// =============================================================================
// CharacterCard (Story 21.1)
//
// Individual character card for the gallery grid. Displays:
// - Avatar thumbnail (120px) with race silhouette / class color defaults
// - Character name, level / race / class subtitle
// - Quick stats: HP, AC, passive perception
// - Last edited relative timestamp
// - Campaign badge
// - Hover lift effect with gold border glow
// - Kebab context menu via CharacterActions
// - Optional checkbox overlay for batch selection mode
// =============================================================================

import { useCallback } from 'react';
import { Heart, Shield, Eye } from 'lucide-react';
import { CharacterAvatar } from '@/components/shared/CharacterAvatar';
import { CharacterActions } from './CharacterActions';
import { formatRelativeTime } from '@/utils/gallery';
import type { GalleryCharacter } from '@/utils/gallery';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: GalleryCharacter;
  selectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onClick: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function CharacterCard({
  character,
  selectMode = false,
  isSelected = false,
  onSelect,
  onClick,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onArchive,
  onDelete,
}: CharacterCardProps) {
  const handleCardClick = useCallback(() => {
    if (selectMode && onSelect) {
      onSelect(character.id);
    } else {
      onClick(character.id);
    }
  }, [selectMode, onSelect, onClick, character.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.(character.id);
    },
    [onSelect, character.id],
  );

  const raceId = character.race.toLowerCase().replace(/\s+/g, '-');
  const classId = character.class.toLowerCase().split('/')[0].trim().replace(/\s+/g, '-');

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${character.name}, Level ${character.level} ${character.race} ${character.class}`}
      className={cn(
        'relative group rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
        'bg-bg-secondary/80 backdrop-blur-sm',
        'hover:shadow-lg hover:shadow-accent-gold/10 hover:-translate-y-1',
        'hover:border-accent-gold/40',
        'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
        isSelected
          ? 'border-accent-gold shadow-[0_0_16px_rgba(232,180,48,0.3)] bg-accent-gold/5'
          : 'border-parchment/15',
        character.isArchived && 'opacity-60',
      )}
      data-testid={`character-card-${character.id}`}
    >
      {/* Batch selection checkbox overlay */}
      {selectMode && (
        <div
          className="absolute top-2 left-2 z-10"
          onClick={handleCheckboxClick}
          data-testid="card-checkbox"
        >
          <div
            className={cn(
              'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-accent-gold border-accent-gold'
                : 'border-parchment/40 bg-bg-primary/60 hover:border-accent-gold/60',
            )}
          >
            {isSelected && (
              <svg
                className="w-4 h-4 text-bg-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Actions kebab menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CharacterActions
          characterId={character.id}
          characterName={character.name}
          isArchived={character.isArchived}
          onView={onView}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <CharacterAvatar
          avatarUrl={character.avatarUrl ?? null}
          raceId={raceId}
          classId={classId}
          characterName={character.name}
          size="xl"
        />
      </div>

      {/* Character name */}
      <h3
        className="font-heading text-lg text-accent-gold text-center truncate mb-1"
        title={character.name}
      >
        {character.name}
      </h3>

      {/* Subtitle: Level N Race Class */}
      <p className="text-sm text-parchment/60 text-center mb-3 truncate">
        Level {character.level} {character.race} {character.class}
      </p>

      {/* Quick stats row */}
      <div className="flex items-center justify-center gap-4 mb-3 text-xs">
        <StatBadge
          icon={<Heart size={14} className="text-damage-red" />}
          value={String(character.hp.max)}
          label="HP"
        />
        <StatBadge
          icon={<Shield size={14} className="text-spell-blue" />}
          value={String(character.ac)}
          label="AC"
        />
        {character.passivePerception !== undefined && (
          <StatBadge
            icon={<Eye size={14} className="text-healing-green" />}
            value={String(character.passivePerception)}
            label="PP"
          />
        )}
      </div>

      {/* Footer: last edited + campaign badge */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-parchment/40 truncate" data-testid="last-edited">
          {character.updatedAt ? formatRelativeTime(character.updatedAt) : 'Never edited'}
        </span>

        {character.campaignName && (
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs',
              'bg-accent-gold/15 text-accent-gold border border-accent-gold/25',
              'truncate max-w-[120px]',
            )}
            title={character.campaignName}
            data-testid="campaign-badge"
          >
            {character.campaignName}
          </span>
        )}
      </div>
    </div>
  );
}

// -- Internal sub-component ---------------------------------------------------

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-1 text-parchment/70"
      title={label}
      aria-label={`${label}: ${value}`}
    >
      {icon}
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
