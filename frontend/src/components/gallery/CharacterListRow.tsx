// =============================================================================
// CharacterListRow (Story 21.2)
//
// Compact table row for the list view of the gallery.
// Columns: checkbox (select mode), avatar thumb, name, race, class, level,
// AC, HP, campaign, last edited, actions kebab.
// =============================================================================

import { useCallback } from 'react';
import { CharacterAvatar } from '@/components/shared/CharacterAvatar';
import { CharacterActions } from './CharacterActions';
import { formatRelativeTime } from '@/utils/gallery';
import type { GalleryCharacter } from '@/utils/gallery';
import { cn } from '@/lib/utils';

interface CharacterListRowProps {
  character: GalleryCharacter;
  selectMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function CharacterListRow({
  character,
  selectMode,
  isSelected,
  onSelect,
  onClick,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onArchive,
  onDelete,
}: CharacterListRowProps) {
  const handleRowClick = useCallback(() => {
    if (selectMode) {
      onSelect(character.id);
    } else {
      onClick(character.id);
    }
  }, [selectMode, onSelect, onClick, character.id]);

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(character.id);
    },
    [onSelect, character.id],
  );

  const raceId = character.race.toLowerCase().replace(/\s+/g, '-');
  const classId = character.class.toLowerCase().split('/')[0].trim().replace(/\s+/g, '-');

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        'border-b border-parchment/10 cursor-pointer transition-colors',
        'hover:bg-parchment/5',
        isSelected && 'bg-accent-gold/5',
        character.isArchived && 'opacity-60',
      )}
      data-testid={`character-row-${character.id}`}
    >
      {selectMode && (
        <td className="py-2 px-2">
          <div onClick={handleCheckboxClick}>
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-accent-gold border-accent-gold'
                  : 'border-parchment/40 hover:border-accent-gold/60',
              )}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-bg-primary"
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
        </td>
      )}

      <td className="py-2 px-3">
        <CharacterAvatar
          avatarUrl={character.avatarUrl ?? null}
          raceId={raceId}
          classId={classId}
          characterName={character.name}
          size="sm"
        />
      </td>

      <td className="py-2 px-3">
        <span className="font-heading text-accent-gold">{character.name}</span>
      </td>

      <td className="py-2 px-3 text-parchment/70">{character.race}</td>

      <td className="py-2 px-3 text-parchment/70">{character.class}</td>

      <td className="py-2 px-3 text-center text-parchment/70 font-mono">
        {character.level}
      </td>

      <td className="py-2 px-3 text-center text-parchment/70 font-mono">
        {character.ac}
      </td>

      <td className="py-2 px-3 text-center text-parchment/70 font-mono">
        {character.hp.max}
      </td>

      <td className="py-2 px-3">
        {character.campaignName ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-accent-gold/15 text-accent-gold border border-accent-gold/25 truncate max-w-[100px]">
            {character.campaignName}
          </span>
        ) : (
          <span className="text-parchment/30">--</span>
        )}
      </td>

      <td className="py-2 px-3 text-parchment/40 text-xs whitespace-nowrap">
        {character.updatedAt ? formatRelativeTime(character.updatedAt) : '--'}
      </td>

      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
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
      </td>
    </tr>
  );
}
