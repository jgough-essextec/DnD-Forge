# Epic 21: Character Gallery (Home Screen)

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
The app's home screen — a visually rich gallery of all the player's characters with search, filter, sort, and character management actions. This is the primary entry point after login/launch.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 21.1 | Gallery Grid Layout | All characters displayed as visually distinct cards in a responsive grid |
| 21.2 | Search, Filter & Sort | Search by name, filter by class/race/level/campaign, sort by multiple criteria |
| 21.3 | Character Quick Actions | Quick-access actions for each character: duplicate, export, archive, delete |

## Key Components
- `pages/HomePage.tsx` — main gallery route
- `components/gallery/CharacterGallery.tsx` — responsive card grid
- `components/gallery/CharacterCard.tsx` — individual character card
- `components/gallery/GalleryToolbar.tsx` — search and filter controls
- `components/gallery/CharacterActions.tsx` — dropdown menu for card actions

## Dependencies
- Phase 1: Character type system, IndexedDB database layer
- Phase 2: Character data in IndexedDB from creation wizard
- Epic 17-19: Character sheet must be viewable (cards link to sheets)
- Epic 23: Avatar/portrait system (displayed on cards)

## Notes
- Gallery is the primary entry point for the app (route: `/`)
- Responsive grid: 1 column mobile, 2 tablet, 3 desktop, 4 wide
- Cards show: avatar, name, race/class/level, quick stats (HP, AC, passive Perception), last edited
- Empty state with welcoming illustration and CTA for first-time users
- Grid/list view toggle with persistent preference
- Batch operations with multi-select mode
