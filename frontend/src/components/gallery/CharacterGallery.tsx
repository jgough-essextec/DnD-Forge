// =============================================================================
// CharacterGallery (Story 21.1)
//
// Responsive grid layout for character cards.
// Breakpoints: 1 col (<640px), 2 col (640-1024px), 3 col (1024-1440px), 4 col (>1440px)
//
// Also supports a compact list/table view.
// =============================================================================

import { CharacterCard } from './CharacterCard';
import { CharacterListRow } from './CharacterListRow';
import { GalleryEmptyState } from './GalleryEmptyState';
import type { GalleryCharacter, ViewMode } from '@/utils/gallery';
import { cn } from '@/lib/utils';

interface CharacterGalleryProps {
  characters: GalleryCharacter[];
  viewMode: ViewMode;
  selectMode: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onCardClick: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onCreateNew: () => void;
  isFiltered: boolean;
}

export function CharacterGallery({
  characters,
  viewMode,
  selectMode,
  selectedIds,
  onSelectToggle,
  onCardClick,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onArchive,
  onDelete,
  onCreateNew,
  isFiltered,
}: CharacterGalleryProps) {
  if (characters.length === 0) {
    return <GalleryEmptyState isFiltered={isFiltered} onCreateNew={onCreateNew} />;
  }

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto" data-testid="character-list">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-parchment/20 text-parchment/60 text-left">
              {selectMode && <th className="py-2 px-2 w-10" />}
              <th className="py-2 px-3 w-12" />
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Race</th>
              <th className="py-2 px-3">Class</th>
              <th className="py-2 px-3 text-center">Level</th>
              <th className="py-2 px-3 text-center">AC</th>
              <th className="py-2 px-3 text-center">HP</th>
              <th className="py-2 px-3">Campaign</th>
              <th className="py-2 px-3">Last Edited</th>
              <th className="py-2 px-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {characters.map((char) => (
              <CharacterListRow
                key={char.id}
                character={char}
                selectMode={selectMode}
                isSelected={selectedIds.has(char.id)}
                onSelect={onSelectToggle}
                onClick={onCardClick}
                onView={onView}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onExport={onExport}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-5',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        '2xl:grid-cols-4',
      )}
      data-testid="character-grid"
    >
      {characters.map((char) => (
        <CharacterCard
          key={char.id}
          character={char}
          selectMode={selectMode}
          isSelected={selectedIds.has(char.id)}
          onSelect={onSelectToggle}
          onClick={onCardClick}
          onView={onView}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
