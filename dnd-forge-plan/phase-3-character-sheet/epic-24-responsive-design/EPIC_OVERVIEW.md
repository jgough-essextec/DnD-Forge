# Epic 24: Character Sheet Responsive Design

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
Ensure the 3-page character sheet is fully usable across all device sizes, from mobile phones to wide desktop monitors, by intelligently reorganizing the layout without losing information.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 24.1 | Desktop Layout (1024px+) | Full 3-column character sheet layout with maximum information density |
| 24.2 | Tablet Layout (640-1024px) | Readable sheet balancing information density with touch-friendly targets |
| 24.3 | Mobile Layout (<640px) | Usable character sheet on phones with optimized scrolling |
| 24.4 | Print-Friendly Styles | Clean, readable print layout from the browser |

## Dependencies
- Epic 17: Page 1 components (layout targets)
- Epic 18: Page 2 components (layout targets)
- Epic 19: Page 3 components (layout targets)
- Epic 21: Gallery (responsive grid)

## Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | <640px | Single column, stacked sections, floating action bar |
| Tablet | 640-1024px | Two columns, touch-friendly targets (44x44px minimum) |
| Desktop | 1024-1440px | Three columns (Page 1), two columns (Page 2) |
| Wide | >1440px | Three columns with extra spacing, 4-column gallery grid |

## Notes
- Responsive design should be applied alongside or immediately after each page epic
- Mobile prioritizes combat-relevant info at top: AC, HP, initiative, speed, attacks
- Tablet uses 44x44px minimum touch targets for all interactive elements
- Print stylesheet removes UI chrome, forces white background, uses page breaks
- Mobile includes floating action bar with 4 common actions: Roll d20, HP +/-, Spell Slots, Edit toggle
