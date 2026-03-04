# Story 29.1 — Active Conditions Display

> **Epic 29: Conditions Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see which conditions are currently affecting my character and what their mechanical effects are. The active conditions display is a horizontal badge strip on the character sheet Page 1, showing color-coded condition badges with icons that expand to reveal full mechanical effect descriptions on click.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### All 14 Standard D&D 5e Conditions + Exhaustion

**1. Blinded**
- A blinded creature can't see and automatically fails any ability check that requires sight
- Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage

**2. Charmed**
- A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects
- The charmer has advantage on any ability check to interact socially with the creature

**3. Deafened**
- A deafened creature can't hear and automatically fails any ability check that requires hearing

**4. Frightened**
- A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight
- The creature can't willingly move closer to the source of its fear

**5. Grappled**
- A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed
- The condition ends if the grappler is incapacitated or if an effect removes the grappled creature from the reach of the grappler

**6. Incapacitated**
- An incapacitated creature can't take actions or reactions

**7. Invisible**
- An invisible creature is impossible to see without the aid of magic or a special sense
- The creature's attack rolls have advantage, and attack rolls against it have disadvantage

**8. Paralyzed**
- A paralyzed creature is incapacitated and can't move or speak
- The creature automatically fails Strength and Dexterity saving throws
- Attack rolls against the creature have advantage
- Any attack that hits the creature is a critical hit if the attacker is within 5 feet

**9. Petrified**
- A petrified creature is transformed into a solid inanimate substance
- Its weight increases by a factor of ten, and it ceases aging
- The creature is incapacitated, can't move or speak, and is unaware of its surroundings
- Attack rolls against the creature have advantage
- The creature automatically fails Strength and Dexterity saving throws
- Resistance to all damage; immune to poison and disease

**10. Poisoned**
- A poisoned creature has disadvantage on attack rolls and ability checks

**11. Prone**
- A prone creature's only movement option is to crawl (half speed) unless it stands up
- The creature has disadvantage on attack rolls
- An attack roll against the creature has advantage if the attacker is within 5 feet; otherwise disadvantage

**12. Restrained**
- A restrained creature's speed becomes 0
- Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage
- The creature has disadvantage on Dexterity saving throws

**13. Stunned**
- A stunned creature is incapacitated, can't move, and can speak only falteringly
- The creature automatically fails Strength and Dexterity saving throws
- Attack rolls against the creature have advantage

**14. Unconscious**
- An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings
- The creature drops whatever it's holding and falls prone
- The creature automatically fails Strength and Dexterity saving throws
- Attack rolls against the creature have advantage
- Any attack that hits the creature is a critical hit if the attacker is within 5 feet

**Exhaustion (6 Levels, Cumulative):**
| Level | Effect |
|-------|--------|
| 1 | Disadvantage on ability checks |
| 2 | Speed halved |
| 3 | Disadvantage on attack rolls and saving throws |
| 4 | Hit point maximum halved |
| 5 | Speed reduced to 0 |
| 6 | Death |

### Color Coding Scheme
- **Red** (debilitating): Blinded, Paralyzed, Stunned, Unconscious, Petrified
- **Orange** (moderate): Frightened, Poisoned, Restrained, Exhaustion
- **Yellow** (mild): Charmed, Deafened, Grappled, Prone, Incapacitated
- **Green** (beneficial): Invisible

## Tasks

- [ ] **T29.1.1** — Create `components/character/ConditionsTracker.tsx` — displayed on the character sheet Page 1 as a horizontal badge strip below the combat stats row (AC/Init/Speed). When no conditions are active, show a subtle "No conditions" placeholder
- [ ] **T29.1.2** — Each active condition renders as a colored badge with an icon and condition name. Color coding: red for debilitating (blinded, paralyzed, stunned, unconscious, petrified), orange for moderate (frightened, poisoned, restrained, exhaustion), yellow for mild (charmed, deafened, grappled, prone), green for beneficial (invisible)
- [ ] **T29.1.3** — Clicking a condition badge shows a tooltip/popover with: condition name, full mechanical effects text (from the SRD conditions data created in Phase 1), and a "Remove" button
- [ ] **T29.1.4** — For **Exhaustion**: display as "Exhaustion [N]" with the level number (1-6). The tooltip shows all current cumulative effects. Level 6 shows a death warning: "Level 6: Death"

## Acceptance Criteria

1. Conditions tracker displays as a horizontal badge strip below the combat stats row on Page 1
2. When no conditions are active, a subtle "No conditions" placeholder is shown
3. Each condition badge shows an icon and condition name with correct color coding
4. Color coding matches: red (debilitating), orange (moderate), yellow (mild), green (beneficial)
5. Clicking a badge shows a popover with full mechanical effects text and a "Remove" button
6. Exhaustion displays as "Exhaustion [N]" with the level number
7. Exhaustion tooltip shows all cumulative effects for the current level
8. Exhaustion level 6 shows a prominent death warning

## Dependencies

- Phase 1 SRD conditions data
- Phase 3 character sheet Page 1 layout (combat stats row positioning)

## Notes

- The conditions badge strip should wrap to multiple rows if many conditions are active simultaneously
- Condition data should come from the Phase 1 SRD data layer for consistency
- The "Remove" button in the popover connects to Story 29.2 (Add/Remove Conditions)
- Mechanical effects on the sheet are handled in Story 29.3
