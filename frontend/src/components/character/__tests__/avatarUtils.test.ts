// =============================================================================
// Tests for avatarUtils (Story 23.1)
//
// Tests file validation, image processing (with mocked canvas), and
// default avatar generation for all races and classes.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImageFile,
  processImage,
  cropImage,
  generateDefaultAvatar,
  getClassColor,
  CLASS_COLORS,
} from '../avatarUtils';
import type { CropRegion } from '../avatarUtils';

// -- Mock Canvas API ----------------------------------------------------------
// jsdom does not have a real canvas, so we mock the relevant APIs.

function createMockCanvas() {
  const mockCtx = {
    drawImage: vi.fn(),
  };

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockBase64Data'),
  };

  return { mockCanvas, mockCtx };
}

// -- File Validation Tests ----------------------------------------------------

describe('validateImageFile', () => {
  it('should accept JPEG files', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept PNG files', () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject GIF files', () => {
    const file = new File(['data'], 'animation.gif', { type: 'image/gif' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject WebP files', () => {
    const file = new File(['data'], 'photo.webp', { type: 'image/webp' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject SVG files', () => {
    const file = new File(['<svg></svg>'], 'icon.svg', {
      type: 'image/svg+xml',
    });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject non-image files (PDF)', () => {
    const file = new File(['data'], 'document.pdf', {
      type: 'application/pdf',
    });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject non-image files (text)', () => {
    const file = new File(['hello'], 'readme.txt', { type: 'text/plain' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should accept files under 2MB', () => {
    // 1MB file
    const data = new Uint8Array(1 * 1024 * 1024);
    const file = new File([data], 'photo.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept files exactly at 2MB', () => {
    const data = new Uint8Array(2 * 1024 * 1024);
    const file = new File([data], 'photo.png', { type: 'image/png' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject files over 2MB', () => {
    const data = new Uint8Array(2 * 1024 * 1024 + 1);
    const file = new File([data], 'photo.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('should reject oversized file with clear error message', () => {
    const data = new Uint8Array(5 * 1024 * 1024);
    const file = new File([data], 'huge.png', { type: 'image/png' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2MB');
  });
});

// -- Image Processing Tests ---------------------------------------------------

describe('processImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a base64 JPEG data URL', async () => {
    const { mockCanvas } = createMockCanvas();

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,originalData',
    };
    vi.spyOn(window, 'FileReader').mockImplementation(
      () => mockFileReader as unknown as FileReader,
    );

    // Mock Image
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      width: 800,
      height: 600,
      naturalWidth: 800,
      naturalHeight: 600,
    };
    vi.spyOn(window, 'Image').mockImplementation(
      () => mockImage as unknown as HTMLImageElement,
    );

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const promise = processImage(file);

    // Trigger FileReader load
    mockFileReader.readAsDataURL.mock.calls.length; // ensure it was called
    mockFileReader.onload?.call(mockFileReader as unknown as FileReader, {} as ProgressEvent<FileReader>);

    // Trigger Image load
    await vi.waitFor(() => {
      expect(mockImage.src).toBeTruthy();
    });
    mockImage.onload?.();

    const result = await promise;
    expect(result).toBe('data:image/jpeg;base64,mockBase64Data');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should resize large images to fit within 400x400', async () => {
    const { mockCanvas, mockCtx } = createMockCanvas();

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/jpeg;base64,test',
    };
    vi.spyOn(window, 'FileReader').mockImplementation(
      () => mockFileReader as unknown as FileReader,
    );

    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      width: 1000,
      height: 800,
      naturalWidth: 1000,
      naturalHeight: 800,
    };
    vi.spyOn(window, 'Image').mockImplementation(
      () => mockImage as unknown as HTMLImageElement,
    );

    const file = new File(['data'], 'big.jpg', { type: 'image/jpeg' });
    const promise = processImage(file);

    mockFileReader.onload?.call(mockFileReader as unknown as FileReader, {} as ProgressEvent<FileReader>);
    await vi.waitFor(() => expect(mockImage.src).toBeTruthy());
    mockImage.onload?.();

    await promise;

    // Canvas should have been set to scaled dimensions
    // 1000x800 scaled by min(400/1000, 400/800) = min(0.4, 0.5) = 0.4
    // Result: 400x320
    expect(mockCanvas.width).toBe(400);
    expect(mockCanvas.height).toBe(320);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockImage,
      0,
      0,
      400,
      320,
    );
  });
});

describe('cropImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should apply the crop region and return a data URL', async () => {
    const { mockCanvas, mockCtx } = createMockCanvas();

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: '',
      width: 400,
      height: 400,
    };
    vi.spyOn(window, 'Image').mockImplementation(
      () => mockImage as unknown as HTMLImageElement,
    );

    const crop: CropRegion = { x: 50, y: 50, width: 200, height: 200 };
    const promise = cropImage('data:image/jpeg;base64,test', crop);

    await vi.waitFor(() => expect(mockImage.src).toBeTruthy());
    mockImage.onload?.();

    const result = await promise;

    expect(result).toBe('data:image/jpeg;base64,mockBase64Data');
    expect(mockCanvas.width).toBe(200);
    expect(mockCanvas.height).toBe(200);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockImage,
      50,
      50,
      200,
      200,
      0,
      0,
      200,
      200,
    );
  });
});

// -- Default Avatar Generation Tests ------------------------------------------

describe('getClassColor', () => {
  it('should return the correct color for each of the 12 classes', () => {
    expect(getClassColor('fighter')).toBe('#dc2626');
    expect(getClassColor('wizard')).toBe('#2563eb');
    expect(getClassColor('rogue')).toBe('#4b5563');
    expect(getClassColor('cleric')).toBe('#d97706');
    expect(getClassColor('ranger')).toBe('#16a34a');
    expect(getClassColor('paladin')).toBe('#94a3b8');
    expect(getClassColor('barbarian')).toBe('#ea580c');
    expect(getClassColor('bard')).toBe('#7c3aed');
    expect(getClassColor('druid')).toBe('#92400e');
    expect(getClassColor('monk')).toBe('#0d9488');
    expect(getClassColor('sorcerer')).toBe('#be123c');
    expect(getClassColor('warlock')).toBe('#6b21a8');
  });

  it('should return a default gray for unknown classes', () => {
    expect(getClassColor('unknown-class')).toBe('#6b7280');
  });
});

describe('generateDefaultAvatar', () => {
  it('should return a data URL starting with data:image/svg+xml;base64,', () => {
    const result = generateDefaultAvatar('human', 'fighter');
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('should generate unique avatars for all 12 classes', () => {
    const classIds = Object.keys(CLASS_COLORS);
    expect(classIds).toHaveLength(12);

    const avatars = classIds.map((id) => generateDefaultAvatar('human', id));
    const uniqueAvatars = new Set(avatars);
    expect(uniqueAvatars.size).toBe(12);
  });

  it('should generate unique avatars for all 9 races', () => {
    const raceIds = [
      'human',
      'elf',
      'dwarf',
      'halfling',
      'dragonborn',
      'gnome',
      'half-elf',
      'half-orc',
      'tiefling',
    ];

    const avatars = raceIds.map((id) => generateDefaultAvatar(id, 'fighter'));
    const uniqueAvatars = new Set(avatars);
    expect(uniqueAvatars.size).toBe(9);
  });

  it('should include the class color in the SVG for each class', () => {
    for (const [classId, color] of Object.entries(CLASS_COLORS)) {
      const avatar = generateDefaultAvatar('human', classId);
      const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
      expect(decoded).toContain(color);
    }
  });

  it('should include race silhouette shapes for known races', () => {
    const avatar = generateDefaultAvatar('elf', 'wizard');
    const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
    // Elf silhouette has polygon elements for pointed ears
    expect(decoded).toContain('polygon');
  });

  it('should show first letter fallback for unknown race', () => {
    const avatar = generateDefaultAvatar('custom-race', 'fighter');
    const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
    expect(decoded).toContain('<text');
    expect(decoded).toContain('C'); // First letter of "custom"
  });

  it('should generate valid SVG for the dwarf race', () => {
    const avatar = generateDefaultAvatar('dwarf', 'cleric');
    const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
    expect(decoded).toContain('<svg');
    expect(decoded).toContain('</svg>');
    expect(decoded).toContain(CLASS_COLORS['cleric']);
    // Dwarf has rect elements for stocky body
    expect(decoded).toContain('rect');
  });

  it('should generate a valid SVG for the dragonborn race', () => {
    const avatar = generateDefaultAvatar('dragonborn', 'paladin');
    const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
    expect(decoded).toContain('<svg');
    // Dragonborn has a triangle/polygon for the snout
    expect(decoded).toContain('polygon');
  });

  it('should generate a valid SVG for the tiefling race', () => {
    const avatar = generateDefaultAvatar('tiefling', 'warlock');
    const decoded = atob(avatar.replace('data:image/svg+xml;base64,', ''));
    expect(decoded).toContain('<svg');
    // Tiefling has path elements for horns
    expect(decoded).toContain('path');
  });
});
