// =============================================================================
// Avatar Utilities (Story 23.1)
//
// Image validation, processing, cropping, and default avatar generation
// for the D&D Character Forge avatar system.
// =============================================================================

// -- Types --------------------------------------------------------------------

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// -- Constants ----------------------------------------------------------------

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.8;

/**
 * Class-themed background colors for default avatars.
 */
export const CLASS_COLORS: Record<string, string> = {
  fighter: '#dc2626',
  wizard: '#2563eb',
  rogue: '#4b5563',
  cleric: '#d97706',
  ranger: '#16a34a',
  paladin: '#94a3b8',
  barbarian: '#ea580c',
  bard: '#7c3aed',
  druid: '#92400e',
  monk: '#0d9488',
  sorcerer: '#be123c',
  warlock: '#6b21a8',
};

/**
 * Default color when class is unknown.
 */
const DEFAULT_CLASS_COLOR = '#6b7280';

// -- Race Silhouette SVG Paths ------------------------------------------------

/**
 * SVG path data for race silhouettes used in default avatars.
 * Each produces a distinctive shape inside a 100x100 viewBox.
 */
const RACE_SILHOUETTES: Record<string, string> = {
  human:
    '<circle cx="50" cy="35" r="18" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="75" rx="22" ry="20" fill="rgba(255,255,255,0.85)"/>',
  elf:
    '<circle cx="50" cy="38" r="16" fill="rgba(255,255,255,0.85)"/>' +
    '<polygon points="34,30 28,15 38,28" fill="rgba(255,255,255,0.85)"/>' +
    '<polygon points="66,30 72,15 62,28" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="75" rx="18" ry="18" fill="rgba(255,255,255,0.85)"/>',
  dwarf:
    '<circle cx="50" cy="32" r="17" fill="rgba(255,255,255,0.85)"/>' +
    '<rect x="26" y="48" width="48" height="36" rx="8" fill="rgba(255,255,255,0.85)"/>' +
    '<rect x="38" y="42" width="24" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>',
  halfling:
    '<circle cx="50" cy="42" r="14" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="72" rx="16" ry="16" fill="rgba(255,255,255,0.85)"/>',
  dragonborn:
    '<polygon points="50,12 35,35 65,35" fill="rgba(255,255,255,0.85)"/>' +
    '<circle cx="50" cy="42" r="16" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="75" rx="22" ry="18" fill="rgba(255,255,255,0.85)"/>',
  gnome:
    '<circle cx="50" cy="40" r="15" fill="rgba(255,255,255,0.85)"/>' +
    '<polygon points="50,12 44,30 56,30" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="72" rx="15" ry="16" fill="rgba(255,255,255,0.85)"/>',
  'half-elf':
    '<circle cx="50" cy="36" r="17" fill="rgba(255,255,255,0.85)"/>' +
    '<polygon points="33,30 30,20 37,28" fill="rgba(255,255,255,0.85)"/>' +
    '<polygon points="67,30 70,20 63,28" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="75" rx="20" ry="18" fill="rgba(255,255,255,0.85)"/>',
  'half-orc':
    '<circle cx="50" cy="34" r="20" fill="rgba(255,255,255,0.85)"/>' +
    '<rect x="40" y="48" width="6" height="6" rx="1" fill="rgba(255,255,255,0.7)"/>' +
    '<rect x="54" y="48" width="6" height="6" rx="1" fill="rgba(255,255,255,0.7)"/>' +
    '<ellipse cx="50" cy="75" rx="24" ry="18" fill="rgba(255,255,255,0.85)"/>',
  tiefling:
    '<circle cx="50" cy="38" r="16" fill="rgba(255,255,255,0.85)"/>' +
    '<path d="M34,32 C30,18 26,10 24,8 L32,26" fill="rgba(255,255,255,0.85)"/>' +
    '<path d="M66,32 C70,18 74,10 76,8 L68,26" fill="rgba(255,255,255,0.85)"/>' +
    '<ellipse cx="50" cy="75" rx="18" ry="18" fill="rgba(255,255,255,0.85)"/>',
};

// -- Validation ---------------------------------------------------------------

/**
 * Validate an image file for type and size constraints.
 *
 * @param file - The File object to validate
 * @returns Validation result with optional error message
 */
export function validateImageFile(file: File): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG or PNG image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 2MB.',
    };
  }

  return { valid: true };
}

// -- Image Processing ---------------------------------------------------------

/**
 * Load a File as a data URL string.
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Load an image element from a data URL.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Process an uploaded image file: resize to max 400x400 maintaining
 * aspect ratio, convert to JPEG at 80% quality, and return as a
 * base64 data URL.
 *
 * @param file - The uploaded image File
 * @returns Promise resolving to a base64 JPEG data URL
 */
export async function processImage(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;

  // Scale down to fit within MAX_DIMENSION x MAX_DIMENSION
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/**
 * Apply a square crop region to an image data URL and return
 * the cropped result as a base64 JPEG data URL.
 *
 * @param dataUrl - Source image as a data URL
 * @param crop - The crop region to apply
 * @returns Promise resolving to a cropped base64 JPEG data URL
 */
export async function cropImage(
  dataUrl: string,
  crop: CropRegion,
): Promise<string> {
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

// -- Default Avatar Generation ------------------------------------------------

/**
 * Get the background color for a class ID.
 */
export function getClassColor(classId: string): string {
  return CLASS_COLORS[classId] ?? DEFAULT_CLASS_COLOR;
}

/**
 * Get the first letter of the race name for fallback text.
 */
function getRaceLetter(raceId: string): string {
  const name = raceId.replace(/-/g, ' ');
  return name.charAt(0).toUpperCase();
}

/**
 * Generate a default avatar SVG data URL based on race silhouette
 * and class-themed background color.
 *
 * @param raceId - The character's race ID (e.g., "elf", "dwarf")
 * @param classId - The character's class ID (e.g., "wizard", "fighter")
 * @returns An SVG data URL string
 */
export function generateDefaultAvatar(
  raceId: string,
  classId: string,
): string {
  const bgColor = getClassColor(classId);
  const silhouette = RACE_SILHOUETTES[raceId];

  let innerSvg: string;
  if (silhouette) {
    innerSvg = silhouette;
  } else {
    // Fallback: show first letter of race name
    const letter = getRaceLetter(raceId);
    innerSvg =
      `<text x="50" y="58" font-family="serif" font-size="40" ` +
      `fill="rgba(255,255,255,0.9)" text-anchor="middle" ` +
      `dominant-baseline="middle">${letter}</text>`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">` +
    `<rect width="100" height="100" rx="50" fill="${bgColor}"/>` +
    `${innerSvg}` +
    `</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
