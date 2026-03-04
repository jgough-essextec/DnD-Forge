# Epic 18: Character Sheet — Page 2 (Backstory & Details)

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
The second page of the character sheet displaying character appearance, backstory narrative, allies & organizations, additional features, equipment/inventory with weight tracking, and currency.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 18.1 | Appearance & Description Section | Character's physical description fields and appearance notes |
| 18.2 | Backstory & Additional Features | Character's backstory narrative and overflow features from Page 1 |
| 18.3 | Equipment & Inventory | Full equipment list with quantities, weights, equip/unequip, and encumbrance |
| 18.4 | Currency Section | Currency tracking across five denominations with auto-conversion |
| 18.5 | Treasure Section | Freeform section for non-currency treasure items |

## Key Components
- `components/character/page2/BackstoryPage.tsx` — Page 2 container
- `components/character/page2/AppearanceBanner.tsx` — physical detail fields
- `components/character/page2/CharacterPortrait.tsx` — portrait area
- `components/character/page2/AlliesOrgs.tsx` — allies & organizations
- `components/character/page2/BackstoryBlock.tsx` — backstory text
- `components/character/page2/AdditionalFeatures.tsx` — overflow features
- `components/character/page2/EquipmentList.tsx` — equipment table
- `components/character/page2/CurrencyTracker.tsx` — currency fields
- `components/character/page2/TreasureBlock.tsx` — treasure section

## Dependencies
- Phase 1: Character type system, SRD equipment data, calculation engine (carrying capacity)
- Phase 2: Equipment picker, character data in IndexedDB
- Epic 17: Page 1 AC calculation (equipment equip state affects AC)
- Epic 20: View/Edit mode toggle system
- Epic 23: Avatar/portrait system (portrait display)

## Layout
**Page 2 Layout Zones (2-column on desktop):**
- Top banner: character name (duplicate), appearance fields (age, height, weight, eyes, skin, hair)
- Left narrow column (~35%): character appearance image/description, allies & organizations
- Right wide column (~65%): character backstory, additional features & traits, treasure
- Bottom: Equipment list with weight, currency section (CP, SP, EP, GP, PP)
