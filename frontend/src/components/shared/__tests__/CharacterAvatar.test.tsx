// =============================================================================
// Tests for CharacterAvatar (Story 23.2)
//
// Tests size variants, custom avatar display, default avatar fallback,
// editable overlay on hover, circular mask, parchment border ring,
// and corrupted data URL fallback.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterAvatar } from '../CharacterAvatar';
import type { AvatarSize } from '../CharacterAvatar';

// -- Mocks --------------------------------------------------------------------

vi.mock('@/components/character/avatarUtils', () => ({
  generateDefaultAvatar: vi.fn(
    (raceId: string, classId: string) =>
      `data:image/svg+xml;base64,default-${raceId}-${classId}`,
  ),
}));

// -- Tests --------------------------------------------------------------------

describe('CharacterAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Size Variant Tests -----------------------------------------------------

  describe('size variants', () => {
    const sizes: { size: AvatarSize; expectedPx: number }[] = [
      { size: 'sm', expectedPx: 32 },
      { size: 'md', expectedPx: 48 },
      { size: 'lg', expectedPx: 64 },
      { size: 'xl', expectedPx: 128 },
    ];

    sizes.forEach(({ size, expectedPx }) => {
      it(`should render at ${expectedPx}px for size="${size}"`, () => {
        render(
          <CharacterAvatar avatarUrl={null} size={size} />,
        );
        const avatar = screen.getByTestId('character-avatar');
        expect(avatar).toHaveAttribute('data-size', size);
        expect(avatar.style.width).toBe(`${expectedPx}px`);
        expect(avatar.style.height).toBe(`${expectedPx}px`);
      });
    });
  });

  // -- Custom Avatar Tests ----------------------------------------------------

  describe('custom avatar display', () => {
    it('should display a custom avatar from data URL', () => {
      const avatarUrl = 'data:image/jpeg;base64,customAvatarData';
      render(
        <CharacterAvatar avatarUrl={avatarUrl} size="lg" />,
      );
      const img = screen.getByTestId('avatar-image');
      expect(img).toHaveAttribute('src', avatarUrl);
    });

    it('should display alt text with character name', () => {
      render(
        <CharacterAvatar
          avatarUrl="data:image/jpeg;base64,test"
          size="md"
          characterName="Gandalf"
        />,
      );
      const img = screen.getByTestId('avatar-image');
      expect(img).toHaveAttribute('alt', "Gandalf's avatar");
    });

    it('should display generic alt text when no name is provided', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="sm" />,
      );
      const img = screen.getByTestId('avatar-image');
      expect(img).toHaveAttribute('alt', 'Character avatar');
    });
  });

  // -- Default Avatar Tests ---------------------------------------------------

  describe('default avatar', () => {
    it('should display default avatar when avatarUrl is null', () => {
      render(
        <CharacterAvatar
          avatarUrl={null}
          raceId="elf"
          classId="wizard"
          size="lg"
        />,
      );
      const img = screen.getByTestId('avatar-image');
      expect(img).toHaveAttribute(
        'src',
        'data:image/svg+xml;base64,default-elf-wizard',
      );
    });

    it('should use default race/class when not specified', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="md" />,
      );
      const img = screen.getByTestId('avatar-image');
      // Default is human/fighter
      expect(img).toHaveAttribute(
        'src',
        'data:image/svg+xml;base64,default-human-fighter',
      );
    });

    it('should generate different defaults for different race/class combos', () => {
      const { unmount } = render(
        <CharacterAvatar
          avatarUrl={null}
          raceId="dwarf"
          classId="cleric"
          size="lg"
        />,
      );
      const img1 = screen.getByTestId('avatar-image');
      const src1 = img1.getAttribute('src');
      unmount();

      render(
        <CharacterAvatar
          avatarUrl={null}
          raceId="elf"
          classId="ranger"
          size="lg"
        />,
      );
      const img2 = screen.getByTestId('avatar-image');
      const src2 = img2.getAttribute('src');

      expect(src1).not.toBe(src2);
    });
  });

  // -- Corrupted Data URL Fallback Tests --------------------------------------

  describe('corrupted data URL fallback', () => {
    it('should fall back to default avatar on image load error', () => {
      render(
        <CharacterAvatar
          avatarUrl="data:image/jpeg;base64,CORRUPTED_INVALID_DATA"
          raceId="halfling"
          classId="rogue"
          size="lg"
        />,
      );

      const img = screen.getByTestId('avatar-image');
      // Initially shows the corrupted URL
      expect(img).toHaveAttribute(
        'src',
        'data:image/jpeg;base64,CORRUPTED_INVALID_DATA',
      );

      // Simulate image load error
      fireEvent.error(img);

      // Now it should show the default avatar
      expect(img).toHaveAttribute(
        'src',
        'data:image/svg+xml;base64,default-halfling-rogue',
      );
    });
  });

  // -- Editable Overlay Tests -------------------------------------------------

  describe('editable overlay', () => {
    it('should show editable overlay when editable prop is true', () => {
      render(
        <CharacterAvatar
          avatarUrl={null}
          size="xl"
          editable
          onClick={() => {}}
        />,
      );
      expect(screen.getByTestId('editable-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('should not show editable overlay when editable prop is false', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="xl" editable={false} />,
      );
      expect(screen.queryByTestId('editable-overlay')).not.toBeInTheDocument();
    });

    it('should not show editable overlay by default', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="lg" />,
      );
      expect(screen.queryByTestId('editable-overlay')).not.toBeInTheDocument();
    });

    it('should call onClick when editable avatar is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <CharacterAvatar
          avatarUrl={null}
          size="xl"
          editable
          onClick={onClick}
        />,
      );

      await user.click(screen.getByTestId('character-avatar'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when editable with onClick', () => {
      render(
        <CharacterAvatar
          avatarUrl={null}
          size="xl"
          editable
          onClick={() => {}}
        />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar).toHaveAttribute('role', 'button');
      expect(avatar).toHaveAttribute('tabindex', '0');
    });

    it('should respond to keyboard activation (Enter)', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <CharacterAvatar
          avatarUrl={null}
          size="xl"
          editable
          onClick={onClick}
        />,
      );

      const avatar = screen.getByTestId('character-avatar');
      avatar.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalled();
    });
  });

  // -- Circular Mask Tests ----------------------------------------------------

  describe('circular mask', () => {
    it('should apply rounded-full class for circular mask', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="xl" />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar.classList.contains('rounded-full')).toBe(true);
    });

    it('should apply overflow-hidden for mask clipping', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="lg" />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar.classList.contains('overflow-hidden')).toBe(true);
    });
  });

  // -- Parchment Border Ring Tests --------------------------------------------

  describe('parchment border ring', () => {
    it('should render the parchment border element', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="xl" />,
      );
      expect(screen.getByTestId('parchment-border')).toBeInTheDocument();
    });

    it('should have a border style on the avatar container', () => {
      render(
        <CharacterAvatar avatarUrl={null} size="xl" />,
      );
      const avatar = screen.getByTestId('character-avatar');
      // Border is set via inline style
      expect(avatar.style.borderColor).toBeTruthy();
    });

    it('should render parchment border at all sizes', () => {
      const sizes: AvatarSize[] = ['sm', 'md', 'lg', 'xl'];
      sizes.forEach((size) => {
        const { unmount } = render(
          <CharacterAvatar avatarUrl={null} size={size} />,
        );
        expect(screen.getByTestId('parchment-border')).toBeInTheDocument();
        unmount();
      });
    });
  });

  // -- Gallery / Sheet / Shared View Context Tests ----------------------------

  describe('display contexts', () => {
    it('should render correctly in gallery card context (size="lg", 64px)', () => {
      render(
        <CharacterAvatar
          avatarUrl="data:image/jpeg;base64,galleryAvatar"
          raceId="human"
          classId="fighter"
          characterName="Conan"
          size="lg"
        />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar.style.width).toBe('64px');
      expect(avatar.style.height).toBe('64px');
    });

    it('should render correctly in sheet banner context (size="xl", 128px, circular)', () => {
      render(
        <CharacterAvatar
          avatarUrl="data:image/jpeg;base64,sheetAvatar"
          raceId="elf"
          classId="wizard"
          characterName="Elrond"
          size="xl"
          editable
          onClick={() => {}}
        />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar.style.width).toBe('128px');
      expect(avatar.style.height).toBe('128px');
      expect(avatar.classList.contains('rounded-full')).toBe(true);
    });

    it('should render correctly in shared view context (size="xl", not editable)', () => {
      render(
        <CharacterAvatar
          avatarUrl="data:image/jpeg;base64,sharedAvatar"
          raceId="dwarf"
          classId="cleric"
          characterName="Gimli"
          size="xl"
          editable={false}
        />,
      );
      const avatar = screen.getByTestId('character-avatar');
      expect(avatar.style.width).toBe('128px');
      expect(avatar.style.height).toBe('128px');
      expect(screen.queryByTestId('editable-overlay')).not.toBeInTheDocument();
      expect(avatar).not.toHaveAttribute('role', 'button');
    });
  });
});
