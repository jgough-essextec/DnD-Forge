# D&D Character Forge — Phase 5: DM Features

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 9–10  
**Phase Goal:** Deliver a complete Dungeon Master toolkit. Campaign CRUD with house rules and invite codes, a party dashboard with at-a-glance stats grid and skill/language matrices, a full combat/initiative tracker with turn cycling and NPC/monster support, DM-only character notes, a campaign session log, an NPC tracker, a loot/reward tracker, and XP/milestone level-up distribution — all while maintaining the local-first IndexedDB architecture.

**Phase 4 Dependencies:** Phase 5 assumes all Phase 4 session play features are complete — dice roller, HP tracker, spell slot tracker, conditions tracker, rest automation, and level-up flow. The DM features build on these by orchestrating them across multiple characters simultaneously (party HP, group initiative, party-wide XP awards, etc.).

---

## Pre-Phase 5 Audit: Edge Cases & Gaps to Address

### Gap D1 — No User Identity System Yet

The tech spec's Campaign interface has a `dmId: string` field, but the app is local-first with no authentication (Open Question #1 in the spec). This creates a fundamental tension: how does the app distinguish "DM" from "player" when there are no user accounts?

**Resolution for Phase 5:** Use a local DM role model. The user who creates a campaign is the DM of that campaign by definition. Characters added to a campaign are always "their own" characters from the local IndexedDB. There is no true multi-device sharing in this phase — the DM sees only characters that exist in their own local database. Players "join" by importing a character JSON (from Phase 3 export) into the DM's app, or by the DM creating a placeholder character. The `dmId` field is set to a locally generated persistent user ID stored in the preferences table.

This is explicitly a single-device DM-centric workflow. Real multi-user collaboration requires authentication and a backend (Phase 6+ or post-MVP).

### Gap D2 — Campaign–Character Relationship Is One-to-Many but Characters May Be in Zero or One Campaign

The spec defines `campaignId?: string` on Character and `characterIds: string[]` on Campaign. A character can only be in one campaign at a time (or none). But the DM might want the same character across campaigns (e.g., a recurring NPC). The data model must handle:

- Character without a campaign (standalone, personal use)
- Character assigned to exactly one campaign
- Removing a character from a campaign (unlinks but doesn't delete)
- Deleting a campaign (unlinks all characters, doesn't delete them)
- The same character cannot be in two campaigns simultaneously

### Gap D3 — HouseRules Interface Not Defined

The spec references `houseRules: HouseRules` but never defines the interface. Based on the DM journey ("allowed sources, ability score method, starting level"), HouseRules should cover:

```typescript
interface HouseRules {
  allowedSources: ('SRD' | 'PHB' | 'XGE' | 'TCE' | 'Custom')[];
  abilityScoreMethod: 'standard_array' | 'point_buy' | 'rolling' | 'any';
  startingLevel: number;                // 1–20
  startingGold?: number;                // Override class starting gold
  hpMethod: 'roll' | 'average' | 'max_first_level' | 'any';
  allowFeats: boolean;
  allowMulticlass: boolean;
  encumbranceRule: 'none' | 'standard' | 'variant';
  criticalHitRule: 'double_dice' | 'max_plus_roll' | 'standard';
  customNotes: string;                  // Freeform DM notes on rules
}
```

### Gap D4 — SessionNote Interface Not Defined

The spec includes `sessions: SessionNote[]` on Campaign but never defines SessionNote. Based on the DM journey ("session notes to a campaign timeline, track items given, NPCs encountered, locations visited"):

```typescript
interface SessionNote {
  id: string;
  sessionNumber: number;
  date: Date;
  title: string;                        // "Session 12: The Underdark Descent"
  summary: string;                      // Markdown-lite text
  npcsEncountered: string[];            // NPC names / references
  locationsVisited: string[];           // Location names
  lootAwarded: LootEntry[];             // Items given to party
  xpAwarded?: number;                   // XP distributed this session
  milestoneLevel?: number;              // If milestone leveling occurred
  tags: string[];                       // DM-defined tags for filtering
  createdAt: Date;
  updatedAt: Date;
}
```

### Gap D5 — Monster/NPC Stat Blocks for Initiative Tracker

The initiative tracker needs monster/NPC combatants with at minimum: name, AC, HP (current/max), initiative modifier, speed, and conditions. The SRD includes a full monsters dataset, but the combat tracker needs a lightweight "combatant" model, not full stat blocks. DMs also need to add custom creatures on the fly.

```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  characterId?: string;                 // Links to Character if player type
  initiativeRoll?: number;              // Rolled initiative value
  initiativeModifier: number;           // DEX mod or custom
  armorClass: number;
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];                 // Active condition names
  notes: string;                        // DM quick notes
  isVisible: boolean;                   // Hidden from player view?
  groupId?: string;                     // For grouping identical monsters
}
```

### Gap D6 — Encounter Data Model Missing

The spec mentions "Start Encounter" and "Encounter ends, XP is optionally distributed" but there's no Encounter interface. Encounters are distinct from sessions (one session may have multiple encounters):

```typescript
interface Encounter {
  id: string;
  campaignId: string;
  sessionId?: string;                   // Link to session note
  name: string;                         // "Goblin Ambush at Cragmaw Cave"
  combatants: Combatant[];
  currentTurnIndex: number;             // Index in sorted initiative
  roundNumber: number;                  // Current combat round
  isActive: boolean;                    // In-progress or resolved
  xpBudget?: number;                    // Total XP from monsters
  notes: string;
  createdAt: Date;
}
```

### Gap D7 — Party Composition Analysis Requires Role Mapping

The spec says the party dashboard should include "party composition analysis: roles covered (healer, tank, DPS, utility), gaps identified." This requires mapping each class (and subclass) to one or more archetypal roles. D&D 5e roles are not officially codified, but common community categories are:

| Role | Primary Classes | Secondary / Subclass |
|------|----------------|---------------------|
| Tank / Defender | Barbarian, Fighter, Paladin | Moon Druid, Cleric (heavy armor) |
| Melee DPS / Striker | Fighter, Barbarian, Monk, Paladin, Ranger | Rogue (melee), Hexblade Warlock |
| Ranged DPS | Ranger, Fighter (ranged), Warlock | Rogue (ranged), Sorcerer |
| Healer / Support | Cleric, Druid, Bard | Paladin, Divine Soul Sorcerer, Celestial Warlock |
| Controller | Wizard, Druid, Sorcerer | Bard, Warlock |
| Utility / Skill Monkey | Rogue, Bard, Ranger | Artificer, Wizard, Knowledge Cleric |
| Face (Social) | Bard, Warlock, Sorcerer, Paladin | Any high-CHA build |

The analysis should be informational, not prescriptive. Show which roles are covered and which have no representation, but avoid language suggesting a party "must" have a certain role.

### Gap D8 — Join Code System Without a Backend

The spec says "Generates a shareable join code or link. Players join with the code and add (or create) a character for the campaign." Without a backend server, true join codes are impossible — there's no shared database for codes to resolve against.

**Resolution for Phase 5:** Implement join codes as a local import mechanism:
1. DM generates a 6-character alphanumeric code tied to a campaign export
2. "Join Campaign" on the player's device opens an import dialog where they paste the code + import the campaign metadata JSON
3. The player then creates or selects a character to "add" to the campaign locally
4. The true sharing happens via JSON export/import: DM exports campaign + character data, players import it

This is a scaffolding pattern — the UI and flow match what the real feature will look like with a backend, but the transport layer is manual file sharing. Future phases can swap in real-time sync.

---

## Epic 33: Campaign CRUD & Data Model

**Goal:** Full campaign lifecycle management — create, view, edit, archive, and delete campaigns with house rules, join codes, and character assignment. Extend the IndexedDB schema to support campaigns as first-class entities.

### Story 33.1 — Campaign Data Model & Store

> As a developer, I need the campaign data model, IndexedDB table, and Zustand store so that all DM features have a data foundation.

**Tasks:**

- [ ] **T33.1.1** — Define the full TypeScript interfaces: `Campaign`, `HouseRules`, `SessionNote`, `Encounter`, `Combatant`, `LootEntry`, `NPCEntry` in `types/campaign.ts`. Include all fields from Gap D3, D4, D5, D6 analysis above
- [ ] **T33.1.2** — Extend the Dexie.js database schema (`db.ts`) with new tables: `campaigns` (indexed on `id, name, joinCode, isArchived`), `encounters` (indexed on `id, campaignId, isActive`). Bump DB version with migration
- [ ] **T33.1.3** — Create `stores/useCampaignStore.ts` (Zustand): state for `campaigns`, `activeCampaignId`, `activeEncounterId`. Actions: `createCampaign`, `updateCampaign`, `archiveCampaign`, `deleteCampaign`, `addCharacterToCampaign`, `removeCharacterFromCampaign`, `loadCampaigns`
- [ ] **T33.1.4** — Create `hooks/useCampaign.ts`: loads a single campaign by ID from IndexedDB, returns the campaign with its characters (resolved from `characterIds`), memoized with auto-refresh on changes
- [ ] **T33.1.5** — Generate a persistent local `userId` (UUID v4) on first app launch, stored in the preferences table. Used as `dmId` for campaigns created by this user

### Story 33.2 — Create Campaign Flow

> As a DM, I need to create a new campaign with a name, description, house rules, and optional starting parameters so my players know what to expect.

**Tasks:**

- [ ] **T33.2.1** — Create `components/dm/CreateCampaignModal.tsx` — a multi-step modal (3 steps): (1) Basic Info, (2) House Rules, (3) Invite Setup
- [ ] **T33.2.2** — **Step 1 — Basic Info:** Campaign name (required, max 100 chars), description (optional, markdown-lite, max 2000 chars), campaign setting/theme tag (optional: "Forgotten Realms", "Homebrew", "Eberron", or custom text)
- [ ] **T33.2.3** — **Step 2 — House Rules:** Form with all HouseRules fields: allowed sources (multi-select checkboxes), ability score method (radio group), starting level (number 1–20, default 1), HP method (radio group), allow feats (toggle, default true), allow multiclass (toggle, default true), encumbrance rule (dropdown), critical hit rule (dropdown), custom notes (textarea)
- [ ] **T33.2.4** — **Step 3 — Invite Setup:** auto-generate a 6-character alphanumeric join code (uppercase, no ambiguous chars like 0/O, 1/I/L). Display prominently with "Copy Code" button. Also generate a shareable URL: `/join/[code]`. Show: "Share this code with your players so they can join the campaign"
- [ ] **T33.2.5** — "Create Campaign" button: validates all fields, saves to IndexedDB, navigates to the new campaign's dashboard. Success toast: "Campaign '[name]' created!"
- [ ] **T33.2.6** — Pre-populate defaults for a quick-start: house rules all set to standard 5e defaults. "Use Standard Rules" button fills all defaults instantly

### Story 33.3 — Campaign List & Selection

> As a DM, I need to see all my campaigns and select one to manage.

**Tasks:**

- [ ] **T33.3.1** — Create `components/dm/CampaignList.tsx` — accessible from the main navigation (new "Campaigns" tab/section alongside the character gallery). Shows all non-archived campaigns as cards in a grid (responsive: 1–3 columns)
- [ ] **T33.3.2** — Campaign card: campaign name (Cinzel font), description preview (2 lines truncated), player count badge ("4 characters"), last session date, setting tag badge, status indicator (active/archived)
- [ ] **T33.3.3** — Card click: navigates to `/campaign/:id` (the campaign dashboard)
- [ ] **T33.3.4** — Card context menu (kebab icon): Edit, Archive, Delete, Export, Copy Join Code
- [ ] **T33.3.5** — "Create New Campaign" button (accent-gold FAB, same style as "Create Character" on gallery). Empty state: "No campaigns yet. Create your first campaign to start managing your party!"
- [ ] **T33.3.6** — "Show Archived" toggle to display archived campaigns with muted styling and "Unarchive" action
- [ ] **T33.3.7** — Sort dropdown: Last Updated, Name A–Z, Date Created

### Story 33.4 — Edit Campaign & House Rules

> As a DM, I need to edit campaign details and house rules after creation, including mid-campaign adjustments.

**Tasks:**

- [ ] **T33.4.1** — Create `components/dm/EditCampaignModal.tsx` — reuses the same form layout as CreateCampaignModal, pre-populated with current values. Tabs: "Details", "House Rules", "Invite"
- [ ] **T33.4.2** — Editing house rules mid-campaign shows an informational banner: "Changing house rules won't retroactively modify existing characters. Discuss changes with your players."
- [ ] **T33.4.3** — Regenerate join code option: "Generate New Code" button with confirmation ("This will invalidate the old code")
- [ ] **T33.4.4** — Auto-save on field blur (same debounce pattern as Phase 3 character edit)

### Story 33.5 — Character–Campaign Assignment

> As a DM, I need to add and remove characters from a campaign, whether they're characters I created or characters imported from players.

**Tasks:**

- [ ] **T33.5.1** — "Add Character" button on the campaign dashboard. Opens a picker showing all local characters not currently in another campaign. Each character card shows: name, race, class, level. Multi-select enabled
- [ ] **T33.5.2** — "Import Player Character" option in the picker: opens the JSON import flow (from Phase 3 Epic 22). Imported character is auto-assigned to the campaign
- [ ] **T33.5.3** — "Create New Character" option in the picker: opens the character creation wizard (Phase 2) with campaign house rules pre-applied (e.g., starting level, ability score method). On completion, auto-assigns to campaign
- [ ] **T33.5.4** — Remove character from campaign: context menu on any character in the party list. "Remove from Campaign" unlinks (sets `campaignId` to null) but does not delete the character. Confirmation: "Remove [name] from [campaign]? The character will still exist in your gallery."
- [ ] **T33.5.5** — Maximum party size: soft cap of 8 characters (show warning at 7+, but don't block). The party dashboard table and initiative tracker should remain usable at 8+ characters
- [ ] **T33.5.6** — When a campaign is deleted: unlink all characters (set `campaignId` to null), then remove the campaign record. Confirmation dialog: "Delete '[name]'? All session notes and encounters will be permanently removed. Characters will be kept in your gallery."

---

## Epic 34: Campaign Dashboard & Party Overview

**Goal:** A DM's command center for a campaign showing the party at a glance — stats grid, skill proficiency matrix, language coverage, party composition analysis, and quick access to each character's sheet, all viewable from a single screen.

### Story 34.1 — Campaign Dashboard Layout

> As a DM, I need a single dashboard screen that shows everything about my campaign and party at a glance.

**Tasks:**

- [ ] **T34.1.1** — Create `pages/CampaignDashboard.tsx` — route: `/campaign/:id`. Load campaign + all linked characters. If campaign not found: 404 with "Campaign not found" + "Go to Campaigns" button
- [ ] **T34.1.2** — Dashboard layout (desktop): header bar (campaign name, setting tag, player count, "Edit Campaign" gear icon), below: tab navigation with four tabs: "Party" (default), "Sessions", "Encounters", "Notes"
- [ ] **T34.1.3** — Campaign header: campaign name in Cinzel font, description as a collapsible subtitle, join code badge with copy button, "Start Encounter" action button (accent-red), "Award XP" button, "Long Rest All" button
- [ ] **T34.1.4** — Mobile layout: tabs become a horizontal scrollable strip. Header collapses to name + essential action buttons. Content stacks vertically
- [ ] **T34.1.5** — Empty party state: "No characters in this campaign yet. Add characters to get started!" with "Add Character" CTA button

### Story 34.2 — Party Stats Grid

> As a DM, I need to see every character's key combat stats in a sortable table so I can reference them during play.

**Tasks:**

- [ ] **T34.2.1** — Create `components/dm/PartyStatsGrid.tsx` — a data table showing all party characters with columns: Avatar (small, 32px), Name, Race, Class/Level, AC, HP (current/max with color bar), Speed, Passive Perception, Spell Save DC (or "—" for non-casters), Initiative Modifier
- [ ] **T34.2.2** — Sortable columns: clicking a column header sorts the table. Default sort: alphabetical by name. Clicking again reverses sort order. Sort indicator arrow on active column
- [ ] **T34.2.3** — HP column: show a mini progress bar (green/yellow/red gradient) alongside the numbers. If a character is at 0 HP, show a skull icon. If temp HP exists, show a blue badge
- [ ] **T34.2.4** — Active conditions: show condition badges inline in a "Conditions" column (or as colored dots under the character name). Hovering shows condition names
- [ ] **T34.2.5** — Row click: navigates to the character sheet in a side panel (desktop) or full page (mobile). Side panel shows a read-only compact view of the character sheet with "Open Full Sheet" link
- [ ] **T34.2.6** — Expandable rows: clicking an expand chevron reveals a detail panel showing: all proficient skills (highlighted), languages, key class features, and DM notes preview
- [ ] **T34.2.7** — "Quick HP" column actions: +/− buttons on each character's HP cell for fast combat damage/healing without navigating to their sheet. Uses the same damage logic from Phase 4 (temp HP first, overflow to 0, massive damage check)

### Story 34.3 — Skill Proficiency Matrix

> As a DM, I need to see which characters are proficient in which skills so I can quickly answer "Who has proficiency in Stealth?"

**Tasks:**

- [ ] **T34.3.1** — Create `components/dm/SkillMatrix.tsx` — a matrix table with characters as columns and the 18 skills as rows. Each cell shows the modifier and a proficiency indicator (empty/filled/double for expertise)
- [ ] **T34.3.2** — Highlight the highest modifier in each skill row with a gold background. If multiple characters tie, highlight all of them
- [ ] **T34.3.3** — Skill rows grouped by ability score with a subtle section header (STR skills, DEX skills, etc.)
- [ ] **T34.3.4** — Filter/search: text input above the matrix to filter skill rows. Also a toggle: "Show only proficient" that hides cells where the character has no proficiency
- [ ] **T34.3.5** — Column header: character name (rotated 45° for space efficiency on desktop) with class icon
- [ ] **T34.3.6** — Mobile: pivot the matrix — characters as rows, skills as a horizontal scrollable header. Or switch to a "Who has X?" search mode: type a skill name and see a ranked list of characters with their modifiers
- [ ] **T34.3.7** — Clicking a cell triggers a skill check roll for that character (integrates with the Phase 4 dice roller)

### Story 34.4 — Language Coverage

> As a DM, I need to see which languages the party collectively speaks for planning encounters with non-Common-speaking NPCs.

**Tasks:**

- [ ] **T34.4.1** — Create `components/dm/LanguageCoverage.tsx` — a compact panel showing all unique languages across the party. Each language is a badge with the count of speakers: "Common (4)", "Elvish (2)", "Dwarvish (1)", "Draconic (0)" — where 0 means "known in the world but no one in the party speaks it"
- [ ] **T34.4.2** — Categorize languages: Common languages (Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc) and Exotic languages (Abyssal, Celestial, Deep Speech, Draconic, Infernal, Primordial, Sylvan, Undercommon). Show SRD languages not covered by any party member as a "Gaps" section
- [ ] **T34.4.3** — Clicking a language badge shows which characters speak it
- [ ] **T34.4.4** — Include tool proficiencies in a separate "Tools" subsection with the same format

### Story 34.5 — Party Composition Analysis

> As a DM, I need to see what roles the party covers and where gaps exist to help balance encounters and story challenges.

**Tasks:**

- [ ] **T34.5.1** — Create `components/dm/PartyComposition.tsx` — a visual panel showing archetypal party roles and which characters fill them. Roles: Tank/Defender, Melee Striker, Ranged Striker, Healer/Support, Controller, Utility/Skill Monkey, Face (Social)
- [ ] **T34.5.2** — Map each class (and known subclass) to one or two primary roles and one or two secondary roles using the mapping from Gap D7. Show each role as a card with the character names/avatars that fill it
- [ ] **T34.5.3** — Role coverage indicator: filled circle (primary class covers this role), half-filled (secondary/subclass covers it), empty (no one covers it). Roles with no coverage are highlighted with a subtle amber background
- [ ] **T34.5.4** — Informational tone: header text "Party Strengths & Potential Gaps" rather than "Missing Roles." Tooltip on each role explains what it means: "Tank/Defender: Characters with high AC and HP who can absorb damage and protect allies"
- [ ] **T34.5.5** — Special notes: detect specific party strengths like "All party members have darkvision" or "No one has healing magic" as callout badges

---

## Epic 35: Initiative & Combat Tracker

**Goal:** A full-featured combat management tool where the DM can roll initiative for all combatants, add monsters/NPCs on the fly, sort by initiative order, cycle through turns tracking rounds, manage HP and conditions per combatant, and distribute XP when the encounter ends.

### Story 35.1 — Encounter Setup

> As a DM, I need to create an encounter by adding all combatants — party members auto-populate and I can add monsters/NPCs manually.

**Tasks:**

- [ ] **T35.1.1** — Create `components/dm/combat/EncounterSetup.tsx` — opened via "Start Encounter" button on the campaign dashboard. Two-panel layout: left panel is the combatant list, right panel is the "Add Combatant" interface
- [ ] **T35.1.2** — **Auto-populate party:** all characters in the campaign are added as player-type combatants automatically with their stats pulled from the character data (AC, HP current/max, initiative modifier from DEX mod + bonuses, conditions from active conditions)
- [ ] **T35.1.3** — **Add Monster/NPC:** a form with fields: Name (required), AC, Max HP, Initiative Modifier (DEX mod), optional notes. "Quick Add" button adds with just name + AC + HP (initiative mod defaults to 0)
- [ ] **T35.1.4** — **SRD Monster Quick Search:** a search input that queries the SRD monsters data (from Phase 1 data layer). Selecting a monster auto-fills: name, AC, HP (from hit dice formula — show "average" and let DM adjust), initiative modifier, and a collapsible stat block preview. Include monster CR for XP calculation
- [ ] **T35.1.5** — **Duplicate monster:** "Add Another" button that copies the last added monster with an incremented name suffix: "Goblin 1", "Goblin 2", etc. Or a quantity field: "Add 4 Goblins" creates 4 combatant entries with individual HP (rolled or average per DM preference)
- [ ] **T35.1.6** — **Monster grouping:** identical monsters can be grouped for simultaneous initiative rolling. Group shares one initiative but tracks HP and conditions individually
- [ ] **T35.1.7** — Combatant list shows all added combatants with: drag handle (reorder), name, type icon (player/monster/NPC), AC, HP, initiative modifier. Remove button (X) on each
- [ ] **T35.1.8** — "Roll Initiative & Start" button: proceeds to the combat tracker

### Story 35.2 — Initiative Rolling & Sort

> As a DM, I need to roll initiative for all combatants (or input manually) and see them sorted in initiative order.

**Tasks:**

- [ ] **T35.2.1** — Create `components/dm/combat/InitiativeRoller.tsx` — a transitional screen shown after encounter setup. Lists all combatants with an initiative input field next to each
- [ ] **T35.2.2** — **"Roll All" button:** rolls 1d20 + initiative modifier for every combatant simultaneously. Animate each roll result appearing with a staggered effect (100ms per combatant). Results populate the initiative fields
- [ ] **T35.2.3** — **Roll individually:** clicking the d20 icon next to a specific combatant rolls just their initiative. Manual override: DM can type any number directly into the initiative field (for players who roll their own dice at the table)
- [ ] **T35.2.4** — **Auto-roll for monsters, manual for players:** a toggle option. When enabled, monster initiatives are auto-rolled but player slots remain blank for the DM to enter their players' declared rolls
- [ ] **T35.2.5** — **Tie-breaking:** when two combatants have the same initiative, sort by initiative modifier (higher goes first). If still tied, maintain the order they were added (or let DM drag to reorder). Show a "Tie" indicator on tied combatants
- [ ] **T35.2.6** — **Sort preview:** show the sorted initiative order in real-time as rolls are made. "Confirm Order" button locks the order and starts combat

### Story 35.3 — Combat Tracker Main View

> As a DM running combat, I need to see the initiative order, track whose turn it is, cycle through turns, and manage the encounter round by round.

**Tasks:**

- [ ] **T35.3.1** — Create `components/dm/combat/CombatTracker.tsx` — the main combat view. Route: `/campaign/:id/encounter/:encounterId`. Full-screen overlay or dedicated page
- [ ] **T35.3.2** — **Initiative order list:** a vertical list of all combatants sorted by initiative (highest first). Current turn combatant is highlighted with a prominent gold border and "CURRENT TURN" indicator. Previous turns are dimmed, upcoming turns are normal
- [ ] **T35.3.3** — Each combatant row shows: initiative number, name (bold for current turn), type icon (sword for player, skull for monster, mask for NPC), AC badge, HP bar (current/max with color gradient), condition badges, notes preview
- [ ] **T35.3.4** — **"Next Turn" button (primary action):** advances to the next combatant. If the last combatant just went, start a new round (increment round counter). Show round number prominently: "Round 3"
- [ ] **T35.3.5** — **"Previous Turn" button:** goes back one step for corrections. DMs frequently need to undo an accidental advance
- [ ] **T35.3.6** — **Round tracker:** "Round [N]" displayed at the top. Useful for tracking spell durations (e.g., "lasts 1 minute = 10 rounds")
- [ ] **T35.3.7** — **Skip turn:** right-click or long-press on a combatant to "Skip" their turn (useful for incapacitated or fleeing combatants). Skipped combatants show with a strikethrough
- [ ] **T35.3.8** — **Delay/Ready action:** option to move a combatant's position in the initiative order mid-combat. "Delay" pushes them to just before the next combatant. "Ready" marks them as acting on a trigger (visual badge)
- [ ] **T35.3.9** — **Remove combatant mid-combat:** "Remove" option for defeated monsters (or fleeing NPCs). Removed combatants disappear from the order. Option to "Remove & Log XP" which adds that monster's XP to the encounter total

### Story 35.4 — Combatant HP & Condition Management

> As a DM, I need to quickly apply damage, healing, and conditions to any combatant during their turn or as reactions occur.

**Tasks:**

- [ ] **T35.4.1** — **Inline HP editing:** clicking the HP bar on any combatant opens a compact damage/heal input (same UI pattern as Phase 4 HP tracker). Enter a number, click Damage or Heal. HP updates in real-time with the color gradient
- [ ] **T35.4.2** — **Quick damage buttons:** preset quick-damage buttons on the current turn combatant: "−5", "−10", "−15", "Custom". These are the most common damage amounts DMs apply
- [ ] **T35.4.3** — **Monster death:** when a monster reaches 0 HP, auto-apply "Unconscious" condition and show a "Defeated" overlay. Option to remove from tracker or keep for resurrection scenarios. Show a brief death animation (fade to grey)
- [ ] **T35.4.4** — **Player at 0 HP:** when a player character reaches 0 HP, show the death saves tracker inline on their combatant row. "Roll Death Save" button rolls 1d20 and auto-fills the result (same Phase 4 logic). Alert: "Player [Name] is making death saves!"
- [ ] **T35.4.5** — **Conditions:** "Add Condition" button on each combatant row. Opens the condition picker (same as Phase 4). Active conditions display as colored badges. Removing conditions works the same way
- [ ] **T35.4.6** — **Temp HP in combat:** editable temp HP field on each combatant. Damage applies to temp HP first (same Phase 4 logic)
- [ ] **T35.4.7** — **Concentration tracking:** for spellcaster combatants, a "Concentrating" badge. When the concentrating combatant takes damage, show a reminder: "Concentration check! DC = max(10, [damage/2])" with a "Roll" button

### Story 35.5 — Add Combatants Mid-Combat

> As a DM, I need to add new monsters or NPCs to an ongoing encounter when reinforcements arrive.

**Tasks:**

- [ ] **T35.5.1** — "Add Combatant" button accessible during combat (not just setup). Opens the same add combatant form from Story 35.1
- [ ] **T35.5.2** — New combatant rolls initiative immediately and is inserted into the correct position in the initiative order
- [ ] **T35.5.3** — If the new combatant's initiative is higher than the current turn, they act this round. If lower, they act next round. Show a note: "[Orc Warchief] joins at initiative 18 — acts this round!"
- [ ] **T35.5.4** — "Add Lair Action" option: a special combatant type that acts on initiative count 20 (or a custom count). Represents environmental or lair effects. Shows with a distinct icon (castle/cave icon)

### Story 35.6 — End Encounter & XP Distribution

> As a DM, when combat ends, I need to distribute XP to the party and log the encounter results.

**Tasks:**

- [ ] **T35.6.1** — "End Encounter" button in the combat tracker header. Opens a summary modal showing: rounds elapsed, monsters defeated (with CR and XP value each), total XP earned, party members present
- [ ] **T35.6.2** — **XP calculation:** auto-calculate total XP from defeated monsters (using SRD CR-to-XP mapping). Show individual monster XP and the sum. DM can adjust the total manually (for story XP, bonus XP, etc.)
- [ ] **T35.6.3** — **XP distribution:** divide total XP equally among all player characters in the encounter. Show per-character XP: "[Name]: +[N] XP (total: [M] XP)." Option to exclude characters from the split (e.g., a character who fled or joined late)
- [ ] **T35.6.4** — **Milestone option:** instead of XP, toggle "Milestone Level Up" which levels up all (or selected) characters by 1 level. Triggers the Phase 4 level-up flow for each character
- [ ] **T35.6.5** — "Apply & Save" button: adds XP to each character's `experiencePoints`, checks if any character crosses a level threshold, and triggers level-up prompts if they do. Save the encounter to the campaign's encounter history
- [ ] **T35.6.6** — Encounter log: save a summary of the encounter (combatants, outcome, rounds, XP awarded) to the campaign's session notes or as a standalone encounter record viewable from the "Encounters" tab

---

## Epic 36: DM Notes System

**Goal:** A comprehensive note-taking system for the DM — per-character private notes (hidden from player view), campaign-level session logs with a timeline, NPC tracking, and loot/reward management.

### Story 36.1 — DM Notes Per Character

> As a DM, I need to write private notes about each character that are visible only from the DM campaign view, not on the player's character sheet.

**Tasks:**

- [ ] **T36.1.1** — The `dmNotes` field already exists on the Character type. Create `components/dm/DMNotesPanel.tsx` — a slide-out panel or inline section accessible from the character's expanded row in the party stats grid
- [ ] **T36.1.2** — Notes editor: markdown-lite textarea (bold, italic, headers, bullet lists) with real-time preview. Auto-save on 500ms debounce
- [ ] **T36.1.3** — Notes are visible ONLY in the campaign dashboard context. When viewing the character sheet from the gallery (non-DM context), `dmNotes` are not rendered. The field is excluded from JSON exports unless explicitly toggled
- [ ] **T36.1.4** — Quick-note tags: predefined tags the DM can click to add structured notes: "Secret", "Plot Hook", "Relationship", "Motivation", "Weakness". Tags appear as colored badges above the freeform notes
- [ ] **T36.1.5** — "All DM Notes" view: a single page showing all per-character DM notes across the campaign, organized by character name. Useful for pre-session review

### Story 36.2 — Session Log / Campaign Timeline

> As a DM, I need to keep a chronological log of sessions with notes about what happened, NPCs encountered, locations visited, and loot awarded.

**Tasks:**

- [ ] **T36.2.1** — Create `components/dm/SessionLog.tsx` — the "Sessions" tab on the campaign dashboard. Shows all session notes as a vertical timeline (newest first or oldest first toggle)
- [ ] **T36.2.2** — Each session entry: session number (auto-incremented), date (editable), title (required, e.g., "Session 5: Into the Mines"), summary (markdown-lite textarea), tags (DM-defined)
- [ ] **T36.2.3** — "Add Session" button: opens an editor for a new session note with the session number pre-filled and date set to today
- [ ] **T36.2.4** — Structured fields within each session (all optional): "NPCs Encountered" (tag input with autocomplete from previously entered NPCs), "Locations Visited" (tag input), "Loot Awarded" (structured list — see Story 36.4), "XP Awarded" (number)
- [ ] **T36.2.5** — Session timeline view: visual timeline with session markers. Each marker shows the session number and title. Clicking expands the full session details
- [ ] **T36.2.6** — Session search: text search across all session titles and summaries. Filter by tag
- [ ] **T36.2.7** — Edit and delete sessions: inline edit button, delete with confirmation ("Permanently delete Session [N]?")
- [ ] **T36.2.8** — Link encounters to sessions: when ending an encounter (from Story 35.6), option to attach it to an existing or new session note. The session then shows the encounter summary inline

### Story 36.3 — NPC Tracker

> As a DM, I need to track NPCs my party has encountered — their names, descriptions, relationships, and locations — so I can maintain consistency across sessions.

**Tasks:**

- [ ] **T36.3.1** — Create `components/dm/NPCTracker.tsx` — accessible from the "Notes" tab on the campaign dashboard. Shows a searchable, filterable list of NPCs
- [ ] **T36.3.2** — NPC entry fields: Name (required), Description (appearance, personality, voice notes), Location (where the party met them or where they reside), Role (Ally, Enemy, Neutral, Patron, Merchant, Quest Giver — multi-select), Relationship to party (freeform text), Status (Alive, Dead, Unknown, Captured), Session first appeared (link to session note)
- [ ] **T36.3.3** — "Add NPC" button: opens a compact form. Minimal required info is just a name — the DM can flesh out details later
- [ ] **T36.3.4** — NPC list: card layout with name, role badges, status badge, and description preview. Search by name. Filter by role, status, location
- [ ] **T36.3.5** — NPC detail view: click to expand the full NPC card with all fields editable. Auto-save on changes
- [ ] **T36.3.6** — Cross-reference: NPCs tagged in session notes link to their NPC tracker entry and vice versa. Clicking an NPC name in a session note opens their tracker entry
- [ ] **T36.3.7** — Quick-add from session log: when typing NPC names in session notes, autocomplete from existing NPCs or offer to create a new entry

### Story 36.4 — Loot & Reward Tracker

> As a DM, I need to track loot I've given to the party — magic items, gold, quest rewards — and optionally assign items to specific characters.

**Tasks:**

- [ ] **T36.4.1** — Create `components/dm/LootTracker.tsx` — accessible from the "Notes" tab. A running ledger of all treasure and rewards given during the campaign
- [ ] **T36.4.2** — Loot entry fields: Item name (required), Type (Gold/Currency, Magic Item, Mundane Item, Quest Reward, Other), Value (in GP equivalent, optional), Quantity (default 1), Assigned to (dropdown of party characters, or "Party Loot" for unassigned), Session awarded (link to session note), Notes (freeform)
- [ ] **T36.4.3** — Loot list: sortable table with columns for item name, type icon, value, assigned character, session number. Total value summary at the bottom: "Total party loot value: ~2,450 GP"
- [ ] **T36.4.4** — "Add Loot" button: quick-add form. SRD magic item search for auto-filling name and description of known items. Custom items for homebrew
- [ ] **T36.4.5** — "Assign to Character" action: when loot is assigned, optionally add it to that character's equipment list (updates the character's inventory in IndexedDB). Confirmation: "Add [item] to [character]'s inventory?"
- [ ] **T36.4.6** — Filtering: by type, by assigned character, by session. "Unassigned" filter shows party loot not yet claimed
- [ ] **T36.4.7** — Currency tracking: separate from item loot, a "Party Gold" tracker showing total currency across all characters (aggregated from each character's currency data)

---

## Epic 37: XP & Milestone Management

**Goal:** Tools for the DM to award experience points to individual characters or the whole party, trigger milestone level-ups, and track progression toward the next level.

### Story 37.1 — XP Award System

> As a DM, I need to award XP to individual characters or the whole party for encounters, roleplay, and quest completion.

**Tasks:**

- [ ] **T37.1.1** — Create `components/dm/XPAward.tsx` — accessible from the campaign dashboard header ("Award XP" button) and from within the session log
- [ ] **T37.1.2** — Two modes: "Award to All" and "Award Individually." "Award to All" gives the same XP to every character in the campaign. "Award Individually" lets the DM set a different amount per character
- [ ] **T37.1.3** — XP input: numeric field. Optional reason/source (e.g., "Goblin encounter", "Rescued the merchant", "Brilliant roleplay"). These notes are logged in the session record
- [ ] **T37.1.4** — Pre-award preview: for each character, show current XP, XP to add, new total, and whether the character levels up. Highlight any character crossing a level threshold: "[Name] will advance to Level [N]!"
- [ ] **T37.1.5** — "Apply" button: adds XP to each character's `experiencePoints` field, saves to IndexedDB. For characters that crossed a level threshold, show a "Level Up Available!" notification on their card with a link to trigger the level-up flow (Phase 4 Epic 31)
- [ ] **T37.1.6** — XP threshold table reference (from the SRD): display inline or as a tooltip so the DM can see how much XP is needed for each level

### Story 37.2 — Milestone Level-Up

> As a DM using milestone progression, I need to directly level up one or all characters without tracking XP.

**Tasks:**

- [ ] **T37.2.1** — "Milestone Level Up" button on the campaign dashboard. Two options: "Level Up All" and "Level Up Selected"
- [ ] **T37.2.2** — "Level Up All": every character in the campaign gains 1 level. Show a confirmation: "Level up all [N] characters to their next level?" After confirmation, trigger the level-up flow for each character sequentially (or in a batch summary view)
- [ ] **T37.2.3** — "Level Up Selected": checkboxes next to each character name. DM selects which characters level up and clicks "Apply." Useful when a new character joins at a higher level or one character earns an extra level
- [ ] **T37.2.4** — Batch level-up summary: after all characters have leveled, show a summary: "[Name]: Level 4 → 5 (HP +8, new feat: Extra Attack)" for each character
- [ ] **T37.2.5** — Campaign progression mode: a setting on the campaign (in house rules) that toggles between "XP Tracking" and "Milestone." When set to Milestone, the XP fields on character sheets show "Milestone" instead of a number, and the "Award XP" button is replaced by "Milestone Level Up"

### Story 37.3 — Level Progress Tracking

> As a DM, I need to see how close each character is to their next level.

**Tasks:**

- [ ] **T37.3.1** — On the party stats grid, add a "Level Progress" column: a mini progress bar showing XP progress toward the next level. Tooltip: "[current XP] / [threshold XP] ([percent]%)"
- [ ] **T37.3.2** — Characters at level 20 show "MAX LEVEL" instead of a progress bar
- [ ] **T37.3.3** — On each character's gallery card and sheet, show the XP progress prominently when in an XP-tracking campaign. When in a milestone campaign, show "Level [N] — Milestone" instead
- [ ] **T37.3.4** — DM quick reference: the XP thresholds table (Level 1: 0, Level 2: 300, Level 3: 900, ... Level 20: 355,000) accessible from the campaign dashboard as a collapsible reference card

---

## Epic 38: Campaign Routing & Navigation

**Goal:** Integrate all DM features into the app's routing and navigation structure, with clear separation between player and DM contexts.

### Story 38.1 — DM Route Structure

> As a developer, I need clean routes for all DM features that integrate with the existing Phase 3 routing.

**Tasks:**

- [ ] **T38.1.1** — Define new routes:
  - `/campaigns` — Campaign list
  - `/campaign/:id` — Campaign dashboard (Party tab default)
  - `/campaign/:id/encounter/:encounterId` — Active combat tracker
  - `/campaign/:id/session/:sessionId` — Session note detail view
  - `/join/:code` — Join campaign landing page
- [ ] **T38.1.2** — Breadcrumb updates: "Campaigns" → "[Campaign Name]" → "Encounter: [Name]" or "Session [N]"
- [ ] **T38.1.3** — Navigation: add "Campaigns" to the top navigation bar alongside the existing "Characters" section. Active section is highlighted. On mobile, both are accessible from the hamburger menu
- [ ] **T38.1.4** — Page transitions: consistent with Phase 3 (slide animations, framer-motion)
- [ ] **T38.1.5** — Deep linking: navigating directly to `/campaign/:id` loads the campaign and its characters from IndexedDB. If the campaign or characters are missing, show appropriate error states

### Story 38.2 — DM vs Player Context

> As a user, I need the app to clearly distinguish when I'm viewing a character as a player vs. managing it as a DM in a campaign context.

**Tasks:**

- [ ] **T38.2.1** — When a character is viewed from the campaign dashboard (DM context), show a subtle "DM View" badge in the header. DM notes are visible. Additional actions like "Award XP" and "Add to Encounter" are available
- [ ] **T38.2.2** — When a character is viewed from the gallery (player context), DM notes are hidden. Session play tools (dice, HP, spell slots) are prominent. No campaign management actions
- [ ] **T38.2.3** — "DM View" on a character sheet includes: DM notes panel (slide-out), campaign context badge showing the campaign name, quick link back to the campaign dashboard
- [ ] **T38.2.4** — The same character data is shared — edits in either context save to the same IndexedDB record. The difference is purely UI/access (which panels are shown)

### Story 38.3 — Join Campaign Flow

> As a player receiving a join code, I need to add my character to a campaign.

**Tasks:**

- [ ] **T38.3.1** — Create `pages/JoinCampaign.tsx` — route: `/join/:code` or accessed from a "Join Campaign" button in the navigation
- [ ] **T38.3.2** — Join flow: (1) Enter or paste the join code (6-char field). (2) If the code matches a local campaign (DM's device), show the campaign name and description. If no match, show: "Campaign not found locally. Ask your DM for the campaign JSON file to import."
- [ ] **T38.3.3** — For local-only Phase 5: "Import Campaign" button that accepts a campaign JSON export. Importing creates the campaign in the local DB with the player as a participant (not DM)
- [ ] **T38.3.4** — Character selection: after joining, pick an existing character to add to the campaign or create a new one (respecting campaign house rules)
- [ ] **T38.3.5** — Success state: "You've joined [Campaign Name]! Your character [Name] is part of the party." with a link to the campaign view

### Story 38.4 — Campaign Export & Import

> As a DM, I need to export my campaign data (including all characters) for backup or sharing with players.

**Tasks:**

- [ ] **T38.4.1** — "Export Campaign" action in the campaign context menu. Exports a JSON file containing: campaign metadata, all linked characters (full Character objects), all session notes, all encounter history, all NPC entries, all loot entries
- [ ] **T38.4.2** — Export filename: `[CampaignName]_Campaign_Export_[date].json` (sanitized)
- [ ] **T38.4.3** — "Export Campaign (Players Only)" option: exports campaign metadata + characters but excludes DM notes, NPC tracker entries, and session notes marked as "DM Only." Useful for sharing with players
- [ ] **T38.4.4** — Import campaign: validates structure similar to Phase 3 character import (syntax → schema → type → reference → business rules). Generates new IDs for campaign and characters to prevent conflicts
- [ ] **T38.4.5** — Merge handling: if importing a campaign and some characters already exist locally (matched by name + race + class), offer: "Merge (update existing)" or "Import as new copy"

---

## Phase 5 Completion Criteria

Before moving to Phase 6, ALL of the following must be true:

1. **Campaign CRUD:** Create campaign with name, description, house rules. Edit all fields. Archive (soft delete with undo). Permanent delete (confirmation, unlinks characters). Join code generation and display
2. **House Rules:** All configurable rules (allowed sources, ability score method, starting level, HP method, feats toggle, multiclass toggle, encumbrance, crit rules, custom notes). Defaults to standard 5e
3. **Character Assignment:** Add characters from local gallery, import via JSON, or create new (with house rules applied). Remove from campaign (unlinks, doesn't delete). 8-character soft cap
4. **Party Stats Grid:** Sortable data table: avatar, name, race, class/level, AC, HP (with bar), speed, passive perception, spell save DC, initiative mod. Expandable rows with skills, languages, features. Quick HP +/− buttons
5. **Skill Matrix:** 18 skills × N characters grid. Modifier + proficiency indicator. Highlight highest per skill. Filter/search. Mobile-friendly pivot view
6. **Language Coverage:** All party languages displayed with speaker count. Common vs. exotic categorization. Gap identification. Tool proficiency section
7. **Party Composition:** Role mapping for all 12 classes. Visual coverage indicator. Informational tone (strengths & gaps, not prescriptive). Special callout badges
8. **Encounter Setup:** Auto-populate party. Add monsters/NPCs manually or from SRD search. Duplicate monsters. Group identical monsters. Drag-to-reorder combatant list
9. **Initiative Rolling:** Roll all at once or individually. Manual input for player-declared rolls. Auto-roll monsters only mode. Tie-breaking by modifier. Sort preview. Confirm and start combat
10. **Combat Tracker:** Sorted initiative list with current turn highlight. Next/previous turn buttons. Round counter. Skip turn. Delay/ready action repositioning. Remove defeated combatants
11. **Combatant Management:** Inline HP damage/heal (temp HP first). Quick damage buttons. Monster death overlay. Player death saves at 0 HP. Condition add/remove. Concentration tracking reminder. Add new combatants mid-combat
12. **End Encounter:** Summary (rounds, defeated monsters, XP total). XP calculation from CR. XP split among party (exclude characters). Milestone level-up option. Save encounter to campaign history
13. **DM Notes Per Character:** Markdown-lite editor. Auto-save. Visible only in DM/campaign context. Quick-note tags. "All Notes" aggregate view
14. **Session Log:** Chronological timeline. Session number, date, title, summary. Structured fields (NPCs, locations, loot, XP). Search and filter. Edit/delete. Link encounters to sessions
15. **NPC Tracker:** Name, description, location, role, relationship, status. Search/filter. Cross-reference with session notes. Quick-add from session log
16. **Loot Tracker:** Item name, type, value, quantity, assignment. SRD magic item search. Assign to character inventory. Currency aggregation. Filter by type/character/session
17. **XP Awards:** Award to all or individually. Reason field. Pre-award level-up preview. Auto-detect level threshold crossing. XP threshold reference table
18. **Milestone Level-Up:** Level up all or selected characters. Batch summary. Campaign progression mode toggle (XP vs. Milestone)
19. **Level Progress:** Progress bar per character on stats grid. XP/threshold display. "MAX LEVEL" at 20. Milestone mode label
20. **Routing:** Clean URLs for all DM features. Breadcrumbs. Nav bar integration ("Campaigns" section). DM vs. Player context on character view. Deep linking
21. **Campaign Export/Import:** Full campaign JSON export. Player-safe export (excludes DM-only content). Import with validation and merge handling
22. **Responsive:** Campaign dashboard, party grid, skill matrix, and combat tracker all usable on mobile (640px), tablet (1024px), and desktop (1440px)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 6 (Epic 33–38) |
| Stories | 23 |
| Tasks | ~135 |
| New Components | ~35+ |
| New Data Types | 7 (Campaign, HouseRules, SessionNote, Encounter, Combatant, NPCEntry, LootEntry) |
| New Routes | 5 |
| DM Dashboard Tabs | 4 (Party, Sessions, Encounters, Notes) |
| Party Grid Columns | 10+ |
| Skill Matrix Cells | 18 skills × N characters |
| Combat Tracker States | 3 (Setup → Rolling → Active Combat → End) |
| Party Roles Analyzed | 7 |
| NPC Statuses | 4 (Alive, Dead, Unknown, Captured) |
| NPC Role Tags | 6 (Ally, Enemy, Neutral, Patron, Merchant, Quest Giver) |

---

## Dependency Graph

```
Epic 33 (Campaign CRUD & Data Model) ← FOUNDATION — build first
  │
  ├── Story 33.1 (Data model) ← everything depends on this
  │
  ├── Epic 34 (Campaign Dashboard & Party Overview)
  │     ├── Story 34.1 (Dashboard layout) ← shell for all tabs
  │     ├── Story 34.2 (Stats grid) ← uses character data
  │     ├── Story 34.3 (Skill matrix) ← uses character skills
  │     ├── Story 34.4 (Languages) ← uses character languages
  │     └── Story 34.5 (Composition) ← uses class/subclass data
  │
  ├── Epic 35 (Initiative & Combat Tracker)
  │     ├── Story 35.1 (Setup) ← uses campaign characters
  │     ├── Story 35.2 (Initiative) ← uses dice roller from Phase 4
  │     ├── Story 35.3 (Combat view) ← uses encounter data model
  │     ├── Story 35.4 (HP/Conditions) ← uses Phase 4 HP & conditions
  │     ├── Story 35.5 (Mid-combat add) ← extends setup
  │     └── Story 35.6 (End encounter) ← uses XP system, session log
  │
  ├── Epic 36 (DM Notes System)
  │     ├── Story 36.1 (Character notes) ← uses dmNotes field
  │     ├── Story 36.2 (Session log) ← standalone, links to encounters
  │     ├── Story 36.3 (NPC tracker) ← cross-references session log
  │     └── Story 36.4 (Loot tracker) ← links to characters + sessions
  │
  ├── Epic 37 (XP & Milestone)
  │     ├── Story 37.1 (XP awards) ← uses character XP field
  │     ├── Story 37.2 (Milestone) ← triggers Phase 4 level-up
  │     └── Story 37.3 (Progress tracking) ← extends stats grid
  │
  └── Epic 38 (Routing & Navigation)
        ├── Story 38.1 (Routes) ← scaffold early
        ├── Story 38.2 (DM vs Player context) ← applies across app
        ├── Story 38.3 (Join campaign) ← uses campaign import
        └── Story 38.4 (Export/Import) ← extends Phase 3 JSON system
```

**Recommended build order:**

1. **Week 9, Day 1:** Epic 33 (Campaign data model, store, CRUD) + Epic 38 Story 38.1 (Route scaffolding) — the foundation everything else depends on
2. **Week 9, Day 2–3:** Epic 34 (Campaign Dashboard + Party Overview) — the DM's home screen
3. **Week 9, Day 4–5:** Epic 35 Stories 35.1–35.3 (Encounter Setup + Initiative Rolling + Combat Main View) — the core combat tracker flow
4. **Week 10, Day 1:** Epic 35 Stories 35.4–35.6 (Combatant management + Mid-combat + End encounter) — completing the combat tracker
5. **Week 10, Day 2–3:** Epic 36 (DM Notes — character notes, session log, NPC tracker, loot tracker) — parallelizable
6. **Week 10, Day 4:** Epic 37 (XP & Milestone management)
7. **Week 10, Day 5:** Epic 38 Stories 38.2–38.4 (DM context, join flow, campaign export/import) — integration and polish

---

## Open Questions for Phase 5

1. **Local-Only vs. Real-Time Sync:** The biggest limitation of Phase 5 is that campaigns are single-device. The DM has all the data; players must import/export to stay in sync. Should Phase 5 include a simple peer-to-peer sync mechanism (e.g., WebRTC data channel between DM and player devices on the same network)? **Recommendation:** No for Phase 5 — keep it local-only. The architecture is ready for sync (all data flows through the store), but building a reliable P2P system is a Phase 6+ effort. Document the sync points for future implementation.

2. **SRD Monsters in the Combat Tracker:** The SRD contains approximately 300+ monsters. Should the Phase 1 ETL pipeline include monster data, or should it be loaded on demand? **Recommendation:** Include a lightweight monsters index (name, CR, AC, HP, initiative mod, type, XP value) in Phase 5, not full stat blocks. Full stat blocks are a Phase 6 enhancement. The DM can reference external resources for detailed monster abilities.

3. **Player View of Campaign:** When a character is in a campaign, should the player-context sheet show any campaign info (campaign name, party members, session history)? **Recommendation:** Yes, minimal — show the campaign name as a badge on the character sheet and gallery card. Don't show DM notes, NPC tracker, or loot tracker in player context. Session log could be partially visible (DM can mark sessions as "player visible").

4. **Multiple Active Encounters:** Can a DM run two encounters simultaneously (e.g., the party splits)? **Recommendation:** Not in Phase 5. One active encounter per campaign at a time. Multiple encounter support is a Phase 6+ feature requiring split-screen combat tracker UI.

5. **Combat Log / Action History:** Should the combat tracker log every action (damage, healing, condition, turn advance) as a replayable combat log? **Recommendation:** Yes, implement a lightweight action log (append-only array of `{ timestamp, action, details }` on the Encounter). Display as a collapsible "Combat Log" panel. This is invaluable for DMs who want to review what happened and for resolving disputes.

6. **NPC Stat Blocks vs. Notes:** Should NPCs in the NPC tracker have full stat blocks (like combatants) or just descriptive notes? **Recommendation:** Notes only for Phase 5. The NPC tracker is a narrative tool, not a combat tool. When an NPC enters combat, the DM adds them to the encounter tracker with quick stats. Linking NPC tracker entries to combat stat blocks is a Phase 6 enhancement.
