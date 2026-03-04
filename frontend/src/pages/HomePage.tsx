// =============================================================================
// HomePage (Epic 21 -- Character Gallery)
//
// The application home screen showing all user characters in a searchable,
// filterable, sortable gallery. Supports grid and list views, batch selection,
// and character quick actions (duplicate, archive, delete, export).
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { useCharacters } from '@/hooks/useCharacters';
import { useCreateCharacter } from '@/hooks/useCharacterMutations';
import { useUpdateCharacter } from '@/hooks/useCharacterMutations';
import { useDeleteCharacter } from '@/hooks/useCharacterMutations';
import { useUIStore } from '@/stores/uiStore';
import { CharacterGallery } from '@/components/gallery/CharacterGallery';
import { GalleryToolbar } from '@/components/gallery/GalleryToolbar';
import { BatchActionBar } from '@/components/gallery/BatchActionBar';
import { DeleteConfirmDialog } from '@/components/gallery/DeleteConfirmDialog';
import {
  filterCharacters,
  sortCharacters,
  duplicateCharacterName,
  getClassCounts,
  getRaceCounts,
  DEFAULT_FILTERS,
} from '@/utils/gallery';
import type {
  GalleryCharacter,
  GalleryFilters,
  SortOption,
  ViewMode,
} from '@/utils/gallery';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);

  // Data fetching
  const { data: rawCharacters, isLoading, error } = useCharacters();

  // Mutations
  const createMutation = useCreateCharacter();
  const updateMutation = useUpdateCharacter();
  const deleteMutation = useDeleteCharacter();

  // Gallery state
  const [filters, setFilters] = useState<GalleryFilters>(DEFAULT_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>('lastEdited');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    characterId?: string;
    characterName?: string;
    batchCount?: number;
  }>({ open: false });

  // Undo archive state
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Cast raw API data to GalleryCharacter (API may return extra fields)
  const characters: GalleryCharacter[] = useMemo(
    () => (rawCharacters as GalleryCharacter[] | undefined) ?? [],
    [rawCharacters],
  );

  // Compute filter options from full character list (before filtering)
  const classOptions = useMemo(() => getClassCounts(characters), [characters]);
  const raceOptions = useMemo(() => getRaceCounts(characters), [characters]);

  // Apply filters and sorting
  const filteredCharacters = useMemo(
    () => sortCharacters(filterCharacters(characters, filters), sortOption),
    [characters, filters, sortOption],
  );

  const isFiltered =
    filters.search !== '' ||
    filters.classes.length > 0 ||
    filters.races.length > 0 ||
    filters.levelRanges.length > 0;

  // -------------------------------------------------------------------------
  // Navigation handlers
  // -------------------------------------------------------------------------

  const handleCreateNew = useCallback(() => {
    navigate('/character/new');
  }, [navigate]);

  const handleCardClick = useCallback(
    (id: string) => {
      navigate(`/character/${id}`);
    },
    [navigate],
  );

  const handleView = useCallback(
    (id: string) => {
      navigate(`/character/${id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/character/${id}/edit`);
    },
    [navigate],
  );

  // -------------------------------------------------------------------------
  // Character actions
  // -------------------------------------------------------------------------

  const handleDuplicate = useCallback(
    (id: string) => {
      const char = characters.find((c) => c.id === id);
      if (!char) return;

      const newName = duplicateCharacterName(char.name);

      createMutation.mutate(
        {
          name: newName,
          // Send minimal data; the API will fill in defaults
        } as Parameters<typeof createMutation.mutate>[0],
        {
          onSuccess: (newChar) => {
            addToast({
              message: 'Character duplicated!',
              type: 'success',
            });
            // Give user option to navigate to copy
            setTimeout(() => {
              addToast({
                message: `Open "${newName}"`,
                type: 'info',
              });
            }, 100);
            // Navigate to the new copy
            navigate(`/character/${newChar.id}`);
          },
          onError: () => {
            addToast({ message: 'Failed to duplicate character.', type: 'error' });
          },
        },
      );
    },
    [characters, createMutation, addToast, navigate],
  );

  const handleExport = useCallback(
    (id: string) => {
      const char = characters.find((c) => c.id === id);
      if (!char) return;

      const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${char.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({ message: `Exported "${char.name}" as JSON.`, type: 'success' });
    },
    [characters, addToast],
  );

  const handleArchive = useCallback(
    (id: string) => {
      const char = characters.find((c) => c.id === id);
      if (!char) return;

      const wasArchived = char.isArchived;

      updateMutation.mutate(
        { id, data: { isArchived: !wasArchived } },
        {
          onSuccess: () => {
            const msg = wasArchived
              ? `"${char.name}" restored from archive.`
              : `"${char.name}" archived.`;

            addToast({ message: msg, type: 'info' });

            // If archiving (not restoring), offer 5-second undo
            if (!wasArchived) {
              if (undoTimeout) clearTimeout(undoTimeout);
              const timeout = setTimeout(() => {
                setUndoTimeout(null);
              }, 5000);
              setUndoTimeout(timeout);
            }
          },
          onError: () => {
            addToast({ message: 'Failed to update character.', type: 'error' });
          },
        },
      );
    },
    [characters, updateMutation, addToast, undoTimeout],
  );

  const handleDeleteRequest = useCallback((id: string, name: string) => {
    setDeleteDialog({ open: true, characterId: id, characterName: name });
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.batchCount && deleteDialog.batchCount > 1) {
      // Batch delete
      const ids = Array.from(selectedIds);
      ids.forEach((id) => {
        deleteMutation.mutate(id);
      });
      addToast({ message: `${ids.length} characters deleted.`, type: 'success' });
      setSelectedIds(new Set());
      setSelectMode(false);
    } else if (deleteDialog.characterId) {
      // Single delete
      deleteMutation.mutate(deleteDialog.characterId, {
        onSuccess: () => {
          addToast({ message: 'Character deleted.', type: 'success' });
        },
        onError: () => {
          addToast({ message: 'Failed to delete character.', type: 'error' });
        },
      });
    }
    setDeleteDialog({ open: false });
  }, [deleteDialog, selectedIds, deleteMutation, addToast]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false });
  }, []);

  // -------------------------------------------------------------------------
  // Batch selection
  // -------------------------------------------------------------------------

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const handleBatchArchive = useCallback(() => {
    selectedIds.forEach((id) => {
      updateMutation.mutate({ id, data: { isArchived: true } });
    });
    addToast({ message: `${selectedIds.size} characters archived.`, type: 'info' });
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, updateMutation, addToast]);

  const handleBatchDelete = useCallback(() => {
    setDeleteDialog({ open: true, batchCount: selectedIds.size });
  }, [selectedIds]);

  const handleBatchExport = useCallback(() => {
    const selected = characters.filter((c) => selectedIds.has(c.id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'characters_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({ message: `Exported ${selected.length} characters.`, type: 'success' });
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [characters, selectedIds, addToast]);

  const cancelBatchMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  // -------------------------------------------------------------------------
  // Loading and error states
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="gallery-loading">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
          <p className="text-parchment/50 text-sm">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="gallery-error">
        <div className="text-center">
          <p className="text-damage-red mb-2">Failed to load characters.</p>
          <p className="text-parchment/40 text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto" data-testid="home-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl text-accent-gold">
            Character Gallery
          </h1>
          <p className="text-parchment/50 text-sm mt-1">
            {characters.length === 0
              ? 'No characters yet'
              : `${characters.length} character${characters.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select mode toggle */}
          {characters.length > 0 && (
            <button
              onClick={toggleSelectMode}
              aria-pressed={selectMode}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                selectMode
                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                  : 'text-parchment/60 border border-parchment/20 hover:text-parchment hover:border-parchment/40',
              )}
              data-testid="select-mode-btn"
            >
              <CheckSquare size={16} />
              Select
            </button>
          )}

          {/* Create New Character FAB */}
          <button
            onClick={handleCreateNew}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
              'bg-accent-gold text-bg-primary font-semibold',
              'hover:bg-accent-gold/90 transition-colors',
              'shadow-lg shadow-accent-gold/20',
            )}
            data-testid="create-character-btn"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Character</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Toolbar (search, filter, sort, view toggle) */}
      {characters.length > 0 && (
        <div className="mb-6">
          <GalleryToolbar
            filters={filters}
            onFiltersChange={setFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            classOptions={classOptions}
            raceOptions={raceOptions}
            totalCount={characters.length}
            filteredCount={filteredCharacters.length}
          />
        </div>
      )}

      {/* Character Grid / List */}
      <CharacterGallery
        characters={filteredCharacters}
        viewMode={viewMode}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onCardClick={handleCardClick}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onExport={handleExport}
        onArchive={handleArchive}
        onDelete={handleDeleteRequest}
        onCreateNew={handleCreateNew}
        isFiltered={isFiltered}
      />

      {/* Batch Action Bar */}
      {selectMode && (
        <BatchActionBar
          selectedCount={selectedIds.size}
          onArchive={handleBatchArchive}
          onDelete={handleBatchDelete}
          onExport={handleBatchExport}
          onCancel={cancelBatchMode}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        characterName={deleteDialog.characterName}
        batchCount={deleteDialog.batchCount}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
