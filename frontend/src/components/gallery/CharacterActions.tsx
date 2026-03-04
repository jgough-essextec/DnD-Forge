// =============================================================================
// CharacterActions (Story 21.3)
//
// Dropdown menu from kebab icon providing character quick actions:
// Duplicate, Archive, Delete, Export JSON, View, Edit.
// =============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Download,
  Archive,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CharacterActionsProps {
  characterId: string;
  characterName: string;
  isArchived?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function CharacterActions({
  characterId,
  characterName,
  isArchived = false,
  onView,
  onEdit,
  onDuplicate,
  onExport,
  onArchive,
  onDelete,
}: CharacterActionsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleAction = useCallback(
    (action: () => void) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(false);
        action();
      };
    },
    [],
  );

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative" data-testid="character-actions">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-label={`Actions for ${characterName}`}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          'text-parchment/50 hover:text-parchment hover:bg-parchment/10',
          open && 'text-parchment bg-parchment/10',
        )}
        data-testid="actions-trigger"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${characterName}`}
          className={cn(
            'absolute right-0 top-full mt-1 z-50',
            'w-48 rounded-lg border border-parchment/20 bg-bg-secondary shadow-xl',
            'py-1 animate-in fade-in-0 zoom-in-95',
          )}
          data-testid="actions-menu"
        >
          <MenuItem
            icon={<Eye size={16} />}
            label="View"
            onClick={handleAction(() => onView(characterId))}
          />
          <MenuItem
            icon={<Pencil size={16} />}
            label="Edit"
            onClick={handleAction(() => onEdit(characterId))}
          />
          <MenuDivider />
          <MenuItem
            icon={<Copy size={16} />}
            label="Duplicate"
            onClick={handleAction(() => onDuplicate(characterId))}
          />
          <MenuItem
            icon={<Download size={16} />}
            label="Export JSON"
            onClick={handleAction(() => onExport(characterId))}
          />
          <MenuDivider />
          <MenuItem
            icon={<Archive size={16} />}
            label={isArchived ? 'Unarchive' : 'Archive'}
            onClick={handleAction(() => onArchive(characterId))}
          />
          <MenuItem
            icon={<Trash2 size={16} />}
            label="Delete"
            variant="danger"
            onClick={handleAction(() => onDelete(characterId, characterName))}
          />
        </div>
      )}
    </div>
  );
}

// -- Internal sub-components --------------------------------------------------

function MenuItem({
  icon,
  label,
  variant = 'default',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors',
        variant === 'danger'
          ? 'text-damage-red hover:bg-damage-red/10'
          : 'text-parchment/80 hover:bg-parchment/10 hover:text-parchment',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 border-t border-parchment/10" role="separator" />;
}
