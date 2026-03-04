// =============================================================================
// Gallery component tests (Epic 21)
//
// Tests for CharacterCard, CharacterGallery, GalleryToolbar, CharacterActions,
// BatchActionBar, DeleteConfirmDialog, GalleryEmptyState, and HomePage.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { GalleryCharacter } from '@/utils/gallery';

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCharacters: GalleryCharacter[] = [
  {
    id: 'char-001',
    name: 'Thorn Ironforge',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
    passivePerception: 13,
    updatedAt: '2024-06-15T08:30:00Z',
    createdAt: '2024-06-01T12:00:00Z',
    isArchived: false,
    campaignName: 'Lost Mine',
  },
  {
    id: 'char-002',
    name: 'Elara Nightwhisper',
    race: 'Elf',
    class: 'Wizard',
    level: 3,
    hp: { current: 18, max: 18 },
    ac: 12,
    passivePerception: 11,
    updatedAt: '2024-06-14T10:00:00Z',
    createdAt: '2024-05-20T14:00:00Z',
    isArchived: false,
    avatarUrl: 'https://example.com/elara.png',
  },
  {
    id: 'char-003',
    name: 'Shadow',
    race: 'Halfling',
    class: 'Rogue',
    level: 1,
    hp: { current: 8, max: 8 },
    ac: 14,
    isArchived: true,
    updatedAt: '2024-06-10T06:00:00Z',
    createdAt: '2024-04-15T08:00:00Z',
  },
];

const mockUseCharacters = vi.fn();
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockAddToast = vi.fn();

vi.mock('@/hooks/useCharacters', () => ({
  useCharacters: () => mockUseCharacters(),
  CHARACTERS_KEY: ['characters'],
  CHARACTER_KEY: (id: string) => ['character', id],
}));

vi.mock('@/hooks/useCharacterMutations', () => ({
  useCreateCharacter: () => ({ mutate: mockCreateMutate }),
  useUpdateCharacter: () => ({ mutate: mockUpdateMutate }),
  useDeleteCharacter: () => ({ mutate: mockDeleteMutate }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: { addToast: typeof mockAddToast }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

// ---------------------------------------------------------------------------
// Test utilities
// ---------------------------------------------------------------------------

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ---------------------------------------------------------------------------
// Import components (after mocks are set up)
// ---------------------------------------------------------------------------

// We import after mock setup to ensure mocks take effect
const { CharacterCard } = await import('../CharacterCard');
const { CharacterGallery } = await import('../CharacterGallery');
const { GalleryToolbar } = await import('../GalleryToolbar');
const { CharacterActions } = await import('../CharacterActions');
const { BatchActionBar } = await import('../BatchActionBar');
const { DeleteConfirmDialog } = await import('../DeleteConfirmDialog');
const { GalleryEmptyState } = await import('../GalleryEmptyState');
const { default: HomePage } = await import('@/pages/HomePage');

// ---------------------------------------------------------------------------
// CharacterCard tests
// ---------------------------------------------------------------------------

describe('CharacterCard', () => {
  const defaultProps = {
    character: mockCharacters[0],
    onClick: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onExport: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders character name', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument();
  });

  it('renders level, race, and class subtitle', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByText('Level 5 Dwarf Fighter')).toBeInTheDocument();
  });

  it('renders HP stat', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('renders AC stat', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders passive perception when available', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('renders campaign badge when campaignName is set', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    expect(screen.getByTestId('campaign-badge')).toHaveTextContent('Lost Mine');
  });

  it('does not render campaign badge when no campaign', () => {
    renderWithProviders(
      <CharacterCard {...defaultProps} character={mockCharacters[1]} />,
    );
    expect(screen.queryByTestId('campaign-badge')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterCard {...defaultProps} />);
    await user.click(screen.getByRole('article'));
    expect(defaultProps.onClick).toHaveBeenCalledWith('char-001');
  });

  it('renders checkbox in select mode', () => {
    renderWithProviders(
      <CharacterCard {...defaultProps} selectMode onSelect={vi.fn()} />,
    );
    expect(screen.getByTestId('card-checkbox')).toBeInTheDocument();
  });

  it('calls onSelect instead of onClick in select mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();
    renderWithProviders(
      <CharacterCard {...defaultProps} onClick={onClick} selectMode onSelect={onSelect} />,
    );
    await user.click(screen.getByRole('article'));
    expect(onSelect).toHaveBeenCalledWith('char-001');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies archived opacity styling', () => {
    renderWithProviders(
      <CharacterCard {...defaultProps} character={mockCharacters[2]} />,
    );
    const card = screen.getByRole('article');
    expect(card.className).toContain('opacity-60');
  });

  it('has accessible label with character info', () => {
    renderWithProviders(<CharacterCard {...defaultProps} />);
    const card = screen.getByRole('article');
    expect(card.getAttribute('aria-label')).toContain('Thorn Ironforge');
    expect(card.getAttribute('aria-label')).toContain('Level 5');
  });
});

// ---------------------------------------------------------------------------
// CharacterActions tests
// ---------------------------------------------------------------------------

describe('CharacterActions', () => {
  const defaultProps = {
    characterId: 'char-001',
    characterName: 'Thorn',
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onExport: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders kebab trigger button', () => {
    renderWithProviders(<CharacterActions {...defaultProps} />);
    expect(screen.getByTestId('actions-trigger')).toBeInTheDocument();
  });

  it('opens menu when clicking trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} />);
    await user.click(screen.getByTestId('actions-trigger'));
    expect(screen.getByTestId('actions-menu')).toBeInTheDocument();
  });

  it('shows all action items', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} />);
    await user.click(screen.getByTestId('actions-trigger'));
    expect(screen.getByRole('menuitem', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /duplicate/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /export json/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /archive/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onView when View is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} />);
    await user.click(screen.getByTestId('actions-trigger'));
    await user.click(screen.getByRole('menuitem', { name: /view/i }));
    expect(defaultProps.onView).toHaveBeenCalledWith('char-001');
  });

  it('calls onDuplicate when Duplicate is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} />);
    await user.click(screen.getByTestId('actions-trigger'));
    await user.click(screen.getByRole('menuitem', { name: /duplicate/i }));
    expect(defaultProps.onDuplicate).toHaveBeenCalledWith('char-001');
  });

  it('calls onDelete when Delete is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} />);
    await user.click(screen.getByTestId('actions-trigger'));
    await user.click(screen.getByRole('menuitem', { name: /delete/i }));
    expect(defaultProps.onDelete).toHaveBeenCalledWith('char-001', 'Thorn');
  });

  it('shows "Unarchive" for archived characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CharacterActions {...defaultProps} isArchived />);
    await user.click(screen.getByTestId('actions-trigger'));
    expect(screen.getByRole('menuitem', { name: /unarchive/i })).toBeInTheDocument();
  });

  it('has accessible trigger label', () => {
    renderWithProviders(<CharacterActions {...defaultProps} />);
    const trigger = screen.getByTestId('actions-trigger');
    expect(trigger.getAttribute('aria-label')).toContain('Thorn');
  });
});

// ---------------------------------------------------------------------------
// CharacterGallery tests
// ---------------------------------------------------------------------------

describe('CharacterGallery', () => {
  const defaultProps = {
    characters: mockCharacters.filter((c) => !c.isArchived),
    viewMode: 'grid' as const,
    selectMode: false,
    selectedIds: new Set<string>(),
    onSelectToggle: vi.fn(),
    onCardClick: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onExport: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
    onCreateNew: vi.fn(),
    isFiltered: false,
  };

  it('renders grid of character cards', () => {
    renderWithProviders(<CharacterGallery {...defaultProps} />);
    expect(screen.getByTestId('character-grid')).toBeInTheDocument();
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument();
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument();
  });

  it('renders list view when viewMode is list', () => {
    renderWithProviders(<CharacterGallery {...defaultProps} viewMode="list" />);
    expect(screen.getByTestId('character-list')).toBeInTheDocument();
  });

  it('shows empty state when no characters', () => {
    renderWithProviders(
      <CharacterGallery {...defaultProps} characters={[]} />,
    );
    expect(screen.getByTestId('empty-state-new')).toBeInTheDocument();
  });

  it('shows filtered empty state when filters return no results', () => {
    renderWithProviders(
      <CharacterGallery {...defaultProps} characters={[]} isFiltered />,
    );
    expect(screen.getByTestId('empty-state-filtered')).toBeInTheDocument();
  });

  it('list view has table headers', () => {
    renderWithProviders(<CharacterGallery {...defaultProps} viewMode="list" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Race')).toBeInTheDocument();
    expect(screen.getByText('Class')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// GalleryToolbar tests
// ---------------------------------------------------------------------------

describe('GalleryToolbar', () => {
  const defaultProps = {
    filters: {
      search: '',
      classes: [] as string[],
      races: [] as string[],
      levelRanges: [],
      showArchived: false,
    } as Parameters<typeof GalleryToolbar>[0]['filters'],
    onFiltersChange: vi.fn(),
    sortOption: 'lastEdited' as const,
    onSortChange: vi.fn(),
    viewMode: 'grid' as const,
    onViewModeChange: vi.fn(),
    classOptions: [
      { value: 'Fighter', label: 'Fighter (2)' },
      { value: 'Wizard', label: 'Wizard (1)' },
    ],
    raceOptions: [
      { value: 'Dwarf', label: 'Dwarf (1)' },
      { value: 'Elf', label: 'Elf (1)' },
    ],
    totalCount: 3,
    filteredCount: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByTestId('sort-select')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByTestId('view-grid-btn')).toBeInTheDocument();
    expect(screen.getByTestId('view-list-btn')).toBeInTheDocument();
  });

  it('toggles view mode when clicking list button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    await user.click(screen.getByTestId('view-list-btn'));
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('calls onSortChange when sort option changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    await user.selectOptions(screen.getByTestId('sort-select'), 'nameAZ');
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('nameAZ');
  });

  it('renders show archived toggle', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByTestId('show-archived-toggle')).toBeInTheDocument();
  });

  it('renders filter chip buttons for class and race', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.getByTestId('filter-chip-class')).toBeInTheDocument();
    expect(screen.getByTestId('filter-chip-race')).toBeInTheDocument();
    expect(screen.getByTestId('filter-chip-level')).toBeInTheDocument();
  });

  it('shows results count when filters are active', () => {
    renderWithProviders(
      <GalleryToolbar
        {...defaultProps}
        filters={{ ...defaultProps.filters, search: 'test' }}
      />,
    );
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 2 of 3 characters');
  });

  it('does not show results count when no filters active', () => {
    renderWithProviders(<GalleryToolbar {...defaultProps} />);
    expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// BatchActionBar tests
// ---------------------------------------------------------------------------

describe('BatchActionBar', () => {
  const defaultProps = {
    selectedCount: 3,
    onArchive: vi.fn(),
    onDelete: vi.fn(),
    onExport: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders when selectedCount > 0', () => {
    renderWithProviders(<BatchActionBar {...defaultProps} />);
    expect(screen.getByTestId('batch-action-bar')).toBeInTheDocument();
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('does not render when selectedCount is 0', () => {
    renderWithProviders(<BatchActionBar {...defaultProps} selectedCount={0} />);
    expect(screen.queryByTestId('batch-action-bar')).not.toBeInTheDocument();
  });

  it('calls onArchive when Archive button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BatchActionBar {...defaultProps} />);
    await user.click(screen.getByLabelText('Archive selected'));
    expect(defaultProps.onArchive).toHaveBeenCalled();
  });

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BatchActionBar {...defaultProps} />);
    await user.click(screen.getByLabelText('Delete selected'));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('calls onExport when Export button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BatchActionBar {...defaultProps} />);
    await user.click(screen.getByLabelText('Export selected'));
    expect(defaultProps.onExport).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BatchActionBar {...defaultProps} />);
    await user.click(screen.getByLabelText('Cancel selection'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// DeleteConfirmDialog tests
// ---------------------------------------------------------------------------

describe('DeleteConfirmDialog', () => {
  beforeEach(() => {
    // jsdom doesn't support dialog.showModal, so we mock it
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('renders with character name', () => {
    renderWithProviders(
      <DeleteConfirmDialog
        open
        characterName="Thorn"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/Thorn/)).toBeInTheDocument();
    expect(screen.getByText('Delete Character')).toBeInTheDocument();
  });

  it('renders batch delete variant', () => {
    renderWithProviders(
      <DeleteConfirmDialog
        open
        batchCount={5}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Delete 5 Characters')).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <DeleteConfirmDialog
        open
        characterName="Thorn"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId('delete-confirm-btn'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithProviders(
      <DeleteConfirmDialog
        open
        characterName="Thorn"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByTestId('delete-cancel-btn'));
    expect(onCancel).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// GalleryEmptyState tests
// ---------------------------------------------------------------------------

describe('GalleryEmptyState', () => {
  it('renders new user empty state', () => {
    renderWithProviders(
      <GalleryEmptyState isFiltered={false} onCreateNew={vi.fn()} />,
    );
    expect(screen.getByTestId('empty-state-new')).toBeInTheDocument();
    expect(screen.getByText('Begin Your Adventure')).toBeInTheDocument();
    expect(screen.getByTestId('create-first-character-btn')).toBeInTheDocument();
  });

  it('renders filtered empty state', () => {
    renderWithProviders(
      <GalleryEmptyState isFiltered onCreateNew={vi.fn()} />,
    );
    expect(screen.getByTestId('empty-state-filtered')).toBeInTheDocument();
    expect(screen.getByText('No Characters Found')).toBeInTheDocument();
  });

  it('calls onCreateNew when CTA is clicked', async () => {
    const user = userEvent.setup();
    const onCreateNew = vi.fn();
    renderWithProviders(
      <GalleryEmptyState isFiltered={false} onCreateNew={onCreateNew} />,
    );
    await user.click(screen.getByTestId('create-first-character-btn'));
    expect(onCreateNew).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// HomePage integration tests
// ---------------------------------------------------------------------------

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('shows loading state', () => {
    mockUseCharacters.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('gallery-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseCharacters.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('gallery-error')).toBeInTheDocument();
  });

  it('shows empty state when no characters', () => {
    mockUseCharacters.mockReturnValue({ data: [], isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('empty-state-new')).toBeInTheDocument();
  });

  it('renders character gallery with characters', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByText('Character Gallery')).toBeInTheDocument();
    // Non-archived characters should appear
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument();
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument();
  });

  it('shows Create Character button', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('create-character-btn')).toBeInTheDocument();
  });

  it('navigates to /character/new when Create Character is clicked', async () => {
    const user = userEvent.setup();
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    await user.click(screen.getByTestId('create-character-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/character/new');
  });

  it('renders toolbar when characters exist', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('gallery-toolbar')).toBeInTheDocument();
  });

  it('does not render toolbar when no characters', () => {
    mockUseCharacters.mockReturnValue({ data: [], isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.queryByTestId('gallery-toolbar')).not.toBeInTheDocument();
  });

  it('renders select mode toggle', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('select-mode-btn')).toBeInTheDocument();
  });

  it('navigates to character detail on card click', async () => {
    const user = userEvent.setup();
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);

    const card = screen.getByTestId('character-card-char-001');
    await user.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/character/char-001');
  });

  it('filters out archived characters by default', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    // Shadow is archived, should not appear
    expect(screen.queryByText('Shadow')).not.toBeInTheDocument();
  });

  it('displays character count in header', () => {
    mockUseCharacters.mockReturnValue({ data: mockCharacters, isLoading: false, error: null });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('3 characters')).toBeInTheDocument();
  });
});
