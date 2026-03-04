# Epic 27: HP Tracker

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

An interactive hit point management system that correctly applies 5e damage/healing rules, tracks temporary HP, handles instant death from massive damage, and provides quick damage/heal input accessible from both the character sheet and a compact floating widget.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 27.1 | Damage & Healing Input | 7 | Quick-input overlay with Take Damage/Heal tabs, strict 5e damage rules (temp HP first, massive damage, resistance/vulnerability), heal with stabilization, event history log |
| 27.2 | Temporary HP Management | 3 | Non-stacking temp HP (keep higher), animated depletion, blue shield visual overlay on HP bar |
| 27.3 | Compact HP Widget (Session Play) | 4 | Sticky floating mobile widget with HP/AC/damage/heal tap targets, collapsible, persists across tab changes |

## Key Technical Notes

### 5e Damage Rules (strict implementation required)
1. Damage reduces temporary HP first, then current HP
2. Current HP cannot go below 0 (no negative HP)
3. If remaining damage after hitting 0 HP >= max HP: **instant death** (massive damage rule)
4. Healing cannot exceed max HP
5. Healing at 0 HP stabilizes the character and resets death saves
6. Resistance halves damage (round down); vulnerability doubles damage
7. Temp HP don't stack -- keep the higher value when new temp HP is gained

## Dependencies

- **Phase 1:** Calculation engine, character data types
- **Phase 3:** HitPointBlock component (`components/character/page1/HitPointBlock.tsx`), character sheet view/edit modes

## Components Created

- Enhanced `components/character/page1/HitPointBlock.tsx` (damage/heal overlay)
- `components/session/CompactHPWidget.tsx`
