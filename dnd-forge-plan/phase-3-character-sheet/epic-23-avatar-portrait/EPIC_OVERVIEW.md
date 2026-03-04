# Epic 23: Character Avatar / Portrait System

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
Allow players to upload, crop, and display a character portrait/avatar throughout the app — on gallery cards, character sheet headers, and shared views.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 23.1 | Avatar Upload & Storage | Upload an image for character portrait with client-side processing and storage |
| 23.2 | Avatar Display Across the App | Consistent avatar rendering in all contexts |

## Key Components
- `components/character/AvatarUploader.tsx` — upload dialog
- `components/character/AvatarCropper.tsx` — crop interface
- `components/shared/CharacterAvatar.tsx` — reusable avatar display component

## Dependencies
- Phase 1: Character type system (avatar field), Django REST API layer
- Epic 17: Character sheet banner (avatar display)
- Epic 21: Gallery cards (avatar display)

## Notes
- Accept JPEG and PNG files up to 2MB
- Client-side resize to max 400x400 pixels, convert to JPEG at 80% quality
- Upload via Django REST API; stored server-side with URL reference in character's avatar field
- CSS-based crop interface for square region selection
- Default avatar generation: race silhouette icon with class-themed color background
- Avatar sizes: sm (32px), md (48px), lg (64px), xl (128px)
- Parchment-textured border ring for dark fantasy aesthetic
- Independent epic — can be built in parallel with other Phase 3 work

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 23.1 — Avatar Upload & Storage | 7 | 8 | 1 | 16 |
| 23.2 — Avatar Display Across the App | 0 | 9 | 0 | 9 |
| **Totals** | **7** | **17** | **1** | **25** |

### Key Gaps Found
- **Accessibility**: Missing ARIA labels for upload dialog, crop interface, and avatar images. No keyboard support for crop drag. No alt text specification for avatars
- **Performance**: No specification for image processing time limits (large images may be slow to resize via canvas)
- **Edge Cases**: Corrupted base64 avatar data fallback not specified. Touch-based crop interaction for mobile not specified
- **Error Handling**: Canvas API failure during image processing not specified
