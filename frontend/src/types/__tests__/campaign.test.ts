/**
 * Type assertion tests for campaign.ts (Story 2.9)
 *
 * These tests verify that all campaign and DM types compile correctly
 * under strict TypeScript. They use type-level assertions and minimal
 * runtime checks.
 */

import { describe, it, expect } from 'vitest';
import type {
  Campaign,
  CampaignAbilityScoreMethod,
  CampaignEncounter,
  CampaignSettings,
  Combatant,
  HouseRules,
  LootDistribution,
  LootEntry,
  NPC,
  SessionNote,
} from '../campaign';
import type { Character } from '../character';

// ---------------------------------------------------------------------------
// Helper: assert a value satisfies a type at compile time
// ---------------------------------------------------------------------------
function assertType<T>(_value: T): void {
  // compile-time check only
}

// ---------------------------------------------------------------------------
// HouseRules
// ---------------------------------------------------------------------------
describe('HouseRules', () => {
  it('should define HouseRules with abilityScoreMethod supporting standard, pointBuy, rolled, and any', () => {
    const rules: HouseRules = {
      allowedSources: ['PHB', 'XGE'],
      abilityScoreMethod: 'standard',
      startingLevel: 1,
      allowMulticlass: true,
      allowFeats: true,
      encumbranceVariant: false,
    };
    assertType<HouseRules>(rules);
    expect(rules.abilityScoreMethod).toBe('standard');

    const methods: CampaignAbilityScoreMethod[] = [
      'standard',
      'pointBuy',
      'rolled',
      'any',
    ];
    methods.forEach((m) => assertType<CampaignAbilityScoreMethod>(m));
    expect(methods).toHaveLength(4);
  });

  it('should define HouseRules with allowMulticlass and allowFeats boolean flags', () => {
    const rules: HouseRules = {
      allowedSources: ['PHB'],
      abilityScoreMethod: 'any',
      startingLevel: 3,
      startingGold: 500,
      allowMulticlass: false,
      allowFeats: false,
      encumbranceVariant: true,
    };
    assertType<HouseRules>(rules);
    assertType<boolean>(rules.allowMulticlass);
    assertType<boolean>(rules.allowFeats);
    expect(rules.allowMulticlass).toBe(false);
    expect(rules.allowFeats).toBe(false);
    expect(rules.startingGold).toBe(500);
  });

  it('should define HouseRules with optional startingGold', () => {
    const rules: HouseRules = {
      allowedSources: ['PHB'],
      abilityScoreMethod: 'rolled',
      startingLevel: 1,
      allowMulticlass: true,
      allowFeats: true,
      encumbranceVariant: false,
    };
    expect(rules.startingGold).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SessionNote
// ---------------------------------------------------------------------------
describe('SessionNote', () => {
  it('should define SessionNote with optional xpAwarded and lootDistributed per character', () => {
    const session: SessionNote = {
      id: 'session-1',
      campaignId: 'campaign-abc',
      sessionNumber: 1,
      date: '2025-01-20',
      title: 'The Lost Mine',
      content: 'The party ventured into the lost mine of Phandelver...',
      tags: ['exploration', 'combat'],
    };
    assertType<SessionNote>(session);
    expect(session.xpAwarded).toBeUndefined();
    expect(session.lootDistributed).toBeUndefined();
  });

  it('should support xpAwarded and lootDistributed fields', () => {
    const loot: LootDistribution[] = [
      { characterId: 'char-001', items: ['longsword', 'potion-of-healing'] },
      { characterId: 'char-002', items: ['spellbook'] },
    ];
    const session: SessionNote = {
      id: 'session-2',
      campaignId: 'campaign-abc',
      sessionNumber: 2,
      date: '2025-01-27',
      title: 'Ambush at Cragmaw Hideout',
      content: 'The party fought goblins and rescued Sildar.',
      tags: ['combat', 'rescue'],
      xpAwarded: 300,
      lootDistributed: loot,
    };
    assertType<SessionNote>(session);
    expect(session.xpAwarded).toBe(300);
    expect(session.lootDistributed).toHaveLength(2);
    expect(session.lootDistributed![0].characterId).toBe('char-001');
    expect(session.lootDistributed![0].items).toContain('longsword');
  });
});

// ---------------------------------------------------------------------------
// NPC
// ---------------------------------------------------------------------------
describe('NPC', () => {
  it('should define NPC with optional stats as Partial<Character>', () => {
    const npc: NPC = {
      id: 'npc-1',
      campaignId: 'campaign-abc',
      name: 'Sildar Hallwinter',
      description: 'A kind-hearted human knight of about 50 years.',
      location: 'Phandalin',
      relationship: 'Quest giver and ally',
      stats: {
        hpMax: 27,
        hpCurrent: 27,
        alignment: 'lawful-good',
      } as Partial<Character>,
      dmNotes: 'Will join the party temporarily if they rescue him.',
    };
    assertType<NPC>(npc);
    expect(npc.name).toBe('Sildar Hallwinter');
    expect(npc.location).toBe('Phandalin');
    expect(npc.stats).toBeDefined();
    expect(npc.dmNotes).toBeDefined();
  });

  it('should allow NPC with minimal fields', () => {
    const npc: NPC = {
      id: 'npc-2',
      campaignId: 'campaign-abc',
      name: 'Mysterious Stranger',
      description: 'A hooded figure at the tavern.',
    };
    assertType<NPC>(npc);
    expect(npc.location).toBeUndefined();
    expect(npc.relationship).toBeUndefined();
    expect(npc.stats).toBeUndefined();
    expect(npc.dmNotes).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------
describe('Campaign', () => {
  it('should define Campaign interface with id, name, dmId, playerIds, characterIds, joinCode', () => {
    const campaign: Campaign = {
      id: 'campaign-abc',
      name: 'Lost Mine of Phandelver',
      description: 'A classic D&D 5e starter adventure.',
      dmId: 'user-001',
      playerIds: ['user-002', 'user-003', 'user-004'],
      characterIds: ['char-001', 'char-002', 'char-003'],
      joinCode: 'ABC123',
      settings: {
        xpTracking: 'milestone',
        houseRules: {
          allowedSources: ['PHB'],
          abilityScoreMethod: 'any',
          startingLevel: 1,
          allowMulticlass: true,
          allowFeats: true,
          encumbranceVariant: false,
        },
      },
      sessions: [],
      npcs: [],
      isArchived: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-20T18:30:00Z',
    };
    assertType<Campaign>(campaign);
    expect(campaign.id).toBe('campaign-abc');
    expect(campaign.name).toBe('Lost Mine of Phandelver');
    expect(campaign.dmId).toBe('user-001');
    expect(campaign.playerIds).toHaveLength(3);
    expect(campaign.characterIds).toHaveLength(3);
    expect(campaign.joinCode).toBe('ABC123');
  });

  it('should define Campaign.joinCode as string type', () => {
    const campaign: Campaign = {
      id: 'campaign-def',
      name: 'Curse of Strahd',
      description: 'A gothic horror adventure.',
      dmId: 'user-001',
      playerIds: [],
      characterIds: [],
      joinCode: 'XYZ789',
      settings: {
        xpTracking: 'xp',
        houseRules: {
          allowedSources: ['PHB', 'VGM'],
          abilityScoreMethod: 'rolled',
          startingLevel: 3,
          allowMulticlass: false,
          allowFeats: true,
          encumbranceVariant: true,
        },
      },
      sessions: [],
      npcs: [],
      isArchived: false,
      createdAt: '2025-02-01T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
    };
    assertType<string>(campaign.joinCode);
    expect(typeof campaign.joinCode).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// CampaignSettings
// ---------------------------------------------------------------------------
describe('CampaignSettings', () => {
  it('should define xpTracking as milestone or xp', () => {
    const milestone: CampaignSettings = {
      xpTracking: 'milestone',
      houseRules: {
        allowedSources: ['PHB'],
        abilityScoreMethod: 'any',
        startingLevel: 1,
        allowMulticlass: true,
        allowFeats: true,
        encumbranceVariant: false,
      },
    };
    const xp: CampaignSettings = {
      ...milestone,
      xpTracking: 'xp',
    };
    assertType<CampaignSettings>(milestone);
    assertType<CampaignSettings>(xp);
    expect(milestone.xpTracking).toBe('milestone');
    expect(xp.xpTracking).toBe('xp');
  });
});

// ---------------------------------------------------------------------------
// LootEntry
// ---------------------------------------------------------------------------
describe('LootEntry', () => {
  it('should define LootEntry with items, currency, and dividedAmong', () => {
    const loot: LootEntry = {
      id: 'loot-1',
      campaignId: 'campaign-abc',
      sessionNumber: 3,
      items: ['potion-of-healing', 'scroll-of-fireball', 'gold-necklace'],
      currency: { cp: 0, sp: 50, ep: 0, gp: 100, pp: 0 },
      dividedAmong: ['char-001', 'char-002', 'char-003'],
    };
    assertType<LootEntry>(loot);
    expect(loot.items).toHaveLength(3);
    expect(loot.currency.gp).toBe(100);
    expect(loot.dividedAmong).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Combatant & CampaignEncounter
// ---------------------------------------------------------------------------
describe('Combatant', () => {
  it('should define Combatant for both player characters and NPCs', () => {
    const player: Combatant = {
      id: 'comb-1',
      name: 'Theron',
      initiative: 18,
      hp: 44,
      maxHp: 44,
      ac: 18,
      isPlayerCharacter: true,
      characterId: 'char-001',
      conditions: [],
    };
    assertType<Combatant>(player);
    expect(player.isPlayerCharacter).toBe(true);
    expect(player.characterId).toBe('char-001');

    const monster: Combatant = {
      id: 'comb-2',
      name: 'Goblin',
      initiative: 12,
      hp: 7,
      maxHp: 7,
      ac: 15,
      isPlayerCharacter: false,
      conditions: ['frightened'],
    };
    assertType<Combatant>(monster);
    expect(monster.isPlayerCharacter).toBe(false);
    expect(monster.characterId).toBeUndefined();
    expect(monster.conditions).toContain('frightened');
  });
});

describe('CampaignEncounter', () => {
  it('should define CampaignEncounter with combatants, round, and isActive', () => {
    const encounter: CampaignEncounter = {
      id: 'enc-1',
      campaignId: 'campaign-abc',
      name: 'Cragmaw Ambush',
      combatants: [
        {
          id: 'c1',
          name: 'Theron',
          initiative: 18,
          hp: 44,
          maxHp: 44,
          ac: 18,
          isPlayerCharacter: true,
          characterId: 'char-001',
          conditions: [],
        },
        {
          id: 'c2',
          name: 'Goblin',
          initiative: 12,
          hp: 7,
          maxHp: 7,
          ac: 15,
          isPlayerCharacter: false,
          conditions: [],
        },
      ],
      round: 1,
      isActive: true,
    };
    assertType<CampaignEncounter>(encounter);
    expect(encounter.name).toBe('Cragmaw Ambush');
    expect(encounter.combatants).toHaveLength(2);
    expect(encounter.round).toBe(1);
    expect(encounter.isActive).toBe(true);
  });
});
