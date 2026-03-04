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
- Phase 1: Character type system (avatar field), IndexedDB database layer
- Epic 17: Character sheet banner (avatar display)
- Epic 21: Gallery cards (avatar display)

## Notes
- Accept JPEG and PNG files up to 2MB
- Client-side resize to max 400x400 pixels, convert to JPEG at 80% quality
- Store as base64 data URL string in character's avatar field in IndexedDB
- CSS-based crop interface for square region selection
- Default avatar generation: race silhouette icon with class-themed color background
- Avatar sizes: sm (32px), md (48px), lg (64px), xl (128px)
- Parchment-textured border ring for dark fantasy aesthetic
- Independent epic — can be built in parallel with other Phase 3 work
