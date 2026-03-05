/**
 * Campaign & DM Types (Story 2.9)
 *
 * Types for campaigns, house rules, session notes, NPCs, loot tracking,
 * and encounter management.
 */

import type { Character } from './character'
import type { NPCEntry, LootTrackerEntry } from '@/utils/dm-notes'

export type { NPCEntry, LootTrackerEntry };

// ---------------------------------------------------------------------------
// Ability Score Method (campaign-level)
// ---------------------------------------------------------------------------

/**
 * Ability score methods allowed in a campaign.
 * 'any' means the DM allows players to choose their preferred method.
 */
export type CampaignAbilityScoreMethod =
  | 'standard'
  | 'pointBuy'
  | 'rolled'
  | 'any';

// ---------------------------------------------------------------------------
// House Rules
// ---------------------------------------------------------------------------

/**
 * DM-configurable campaign settings that override or restrict default
 * game options.
 */
export interface HouseRules {
  /** Which source books are permitted in this campaign */
  allowedSources: string[];
  /** Which ability score generation method(s) players may use */
  abilityScoreMethod: CampaignAbilityScoreMethod;
  /** Starting level for new characters in this campaign */
  startingLevel: number;
  /** Optional starting gold override (bypasses class-based starting equipment) */
  startingGold?: number;
  /** Whether multiclassing is allowed */
  allowMulticlass: boolean;
  /** Whether feats are allowed (variant rule) */
  allowFeats: boolean;
  /** Whether to use the variant encumbrance rule */
  encumbranceVariant: boolean;
}

// ---------------------------------------------------------------------------
// Campaign Settings
// ---------------------------------------------------------------------------

/**
 * Extended campaign settings including XP tracking mode and house rules.
 */
export interface CampaignSettings {
  /** How experience is tracked: milestone (DM awards levels) or xp (track XP) */
  xpTracking: 'milestone' | 'xp';
  /** The campaign's house rules */
  houseRules: HouseRules;
}

// ---------------------------------------------------------------------------
// Session Note
// ---------------------------------------------------------------------------

/** Loot distributed to a specific character during a session */
export interface LootDistribution {
  characterId: string;
  items: string[];
}

/**
 * DM notes for a game session including date, narrative summary,
 * XP awarded, and loot distributed.
 */
export interface SessionNote {
  id: string;
  campaignId: string;
  sessionNumber: number;
  date: string;
  title: string;
  content: string;
  tags: string[];
  /** XP awarded to all party members in this session */
  xpAwarded?: number;
  /** Items distributed to specific characters */
  lootDistributed?: LootDistribution[];
}

// ---------------------------------------------------------------------------
// NPC (Non-Player Character)
// ---------------------------------------------------------------------------

/**
 * A non-player character tracked by the DM.
 *
 * `stats` uses `Partial<Character>` because NPCs typically only need a
 * subset of character stats (e.g. just AC, HP, and a couple of attacks)
 * rather than a fully detailed character sheet.
 */
export interface NPC {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  location?: string;
  /** Relationship to the player characters */
  relationship?: string;
  /** Optional partial character stats for DM reference */
  stats?: Partial<Character>;
  /** DM-only private notes */
  dmNotes?: string;
}

// ---------------------------------------------------------------------------
// Loot Entry
// ---------------------------------------------------------------------------

/**
 * A record of loot obtained during a session, including how it was
 * divided among party members.
 */
export interface LootEntry {
  id: string;
  campaignId: string;
  sessionNumber: number;
  items: string[];
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  dividedAmong: string[];
}

// ---------------------------------------------------------------------------
// Encounter Combatant
// ---------------------------------------------------------------------------

/**
 * A participant in a combat encounter (player character or NPC/monster).
 */
export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  isPlayerCharacter: boolean;
  /** Character ID if this combatant is a player character */
  characterId?: string;
  /** Active conditions on this combatant */
  conditions: string[];
}

// ---------------------------------------------------------------------------
// Encounter
// ---------------------------------------------------------------------------

/**
 * A combat encounter tracked by the DM.
 */
export interface CampaignEncounter {
  id: string;
  campaignId: string;
  name: string;
  combatants: Combatant[];
  round: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

/**
 * A D&D campaign that groups players, characters, and sessions together.
 *
 * The `joinCode` is a 6-character alphanumeric code used for sharing;
 * the format is enforced at runtime, not at the type level.
 */
export interface Campaign {
  id: string;
  name: string;
  description: string;
  /** User ID of the Dungeon Master */
  dmId: string;
  /** User IDs of players in this campaign */
  playerIds: string[];
  /** Character IDs associated with this campaign */
  characterIds: string[];
  /**
   * 6-character alphanumeric join code for sharing.
   * Format validated at runtime.
   */
  joinCode: string;
  /** Campaign settings including house rules */
  settings: CampaignSettings;
  /** Session notes for this campaign */
  sessions: SessionNote[];
  /** NPCs tracked by the DM */
  npcs: NPCEntry[];
  /** Loot entries tracked by the DM */
  lootEntries?: LootTrackerEntry[];
  /** Whether this campaign is archived (soft-deleted) */
  isArchived: boolean;
  /** Number of characters in this campaign */
  characterCount?: number;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Payload for creating a new campaign.
 */
export interface CreateCampaignData {
  name: string;
  description?: string;
  settings?: Partial<CampaignSettings>;
}

/**
 * A character summary as returned nested within a campaign response.
 */
export interface CampaignCharacterSummary {
  id: string;
  name: string;
  race: string;
  className: string;
  level: number;
  owner: string;
}

/**
 * A party member as returned by the /party/ endpoint.
 * Matches the CharacterListSerializer (gallery card) shape.
 */
export interface PartyMember {
  id: string
  name: string
  race: string
  class: string
  level: number
  hp: { current: number; max: number }
  ac: number
  updatedAt: string | null
  createdAt: string | null
  isArchived: boolean
  campaignId: string | null
}
