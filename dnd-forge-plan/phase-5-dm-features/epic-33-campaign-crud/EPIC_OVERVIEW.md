# Epic 33: Campaign CRUD & Data Model

> **Phase 5: DM Features** | Weeks 9-10

## Goal

Full campaign lifecycle management — create, view, edit, archive, and delete campaigns with house rules, join codes, and character assignment. Extend the IndexedDB schema to support campaigns as first-class entities.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 33.1 | Campaign Data Model & Store | 5 | TypeScript interfaces, Dexie schema, Zustand store, hooks, local userId |
| 33.2 | Create Campaign Flow | 6 | Multi-step modal: Basic Info, House Rules, Invite Setup |
| 33.3 | Campaign List & Selection | 7 | Campaign gallery with cards, sorting, archive toggle |
| 33.4 | Edit Campaign & House Rules | 4 | Edit modal, mid-campaign rule change warning, auto-save |
| 33.5 | Character-Campaign Assignment | 6 | Add/import/create characters, remove from campaign, party size cap |

## Key Data Models

This epic defines the foundational data types for all DM features:

- **Campaign** — core entity with name, description, dmId, joinCode, houseRules, characterIds, sessions, isArchived
- **HouseRules** — allowedSources, abilityScoreMethod, startingLevel, hpMethod, allowFeats, allowMulticlass, encumbranceRule, criticalHitRule, customNotes
- **SessionNote** — id, sessionNumber, date, title, summary, npcsEncountered, locationsVisited, lootAwarded, xpAwarded, milestoneLevel, tags
- **Encounter** — id, campaignId, sessionId, name, combatants, currentTurnIndex, roundNumber, isActive, xpBudget, notes
- **Combatant** — id, name, type (player/npc/monster), characterId, initiativeRoll, initiativeModifier, armorClass, HP fields, conditions, notes, isVisible, groupId

## Dependencies

- **Foundation epic** — must be built first; all other Phase 5 epics depend on the data model from Story 33.1
- **Phase 1-3:** Character data model, IndexedDB/Dexie setup, export/import system
- **Phase 4:** Session play features (HP, conditions, dice roller) referenced by combat tracker

## New Components

- `components/dm/CreateCampaignModal.tsx`
- `components/dm/EditCampaignModal.tsx`
- `components/dm/CampaignList.tsx`
- `stores/useCampaignStore.ts`
- `hooks/useCampaign.ts`
- `types/campaign.ts`
