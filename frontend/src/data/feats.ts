/**
 * SRD Feat Data (Story 3.6)
 *
 * All SRD feats with prerequisites, ability score increases, and mechanical effects.
 * Source: D&D 5e SRD (OGL 1.0a)
 *
 * Note: Feats are an optional rule. A feat is taken instead of (or in addition to)
 * an Ability Score Improvement at ASI levels. Some feats include a +1 ability score
 * increase that partially offsets the lost ASI.
 */

import type { Feat } from '@/types';

/**
 * All 42 SRD feats.
 *
 * Each feat includes:
 * - id: kebab-case unique identifier
 * - name: display name
 * - description: full text description
 * - prerequisite: optional requirements (ability scores, proficiencies, etc.)
 * - abilityScoreIncrease: optional +1 to a specific ability
 * - mechanicalEffects: array of concise mechanical effect descriptions
 */
export const FEATS = [
  {
    id: 'alert',
    name: 'Alert',
    description: 'Always on the lookout for danger, you gain the following benefits: You can\'t be surprised while you are conscious. You gain a +5 bonus to initiative. Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you.',
    mechanicalEffects: [
      'Cannot be surprised while conscious',
      '+5 bonus to initiative',
      'Hidden creatures do not gain advantage on attack rolls against you',
    ],
  },
  {
    id: 'athlete',
    name: 'Athlete',
    description: 'You have undergone extensive physical training to gain the following benefits: Increase your Strength or Dexterity score by 1, to a maximum of 20. When you are prone, standing up uses only 5 feet of your movement. Climbing doesn\'t cost you extra movement. You can make a running long jump or a running high jump after moving only 5 feet on foot, rather than 10 feet.',
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength or Dexterity by 1 (max 20)',
      'Standing from prone costs only 5 feet of movement',
      'Climbing does not cost extra movement',
      'Running jump requires only 5 feet of movement instead of 10',
    ],
  },
  {
    id: 'actor',
    name: 'Actor',
    description: 'Skilled at mimicry and dramatics, you gain the following benefits: Increase your Charisma score by 1, to a maximum of 20. You have advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person. You can mimic the speech of another person or the sounds made by other creatures.',
    abilityScoreIncrease: { charisma: 1 },
    mechanicalEffects: [
      'Increase Charisma by 1 (max 20)',
      'Advantage on Deception and Performance checks to pass as another person',
      'Can mimic speech and creature sounds (DC 14 Insight to detect)',
    ],
  },
  {
    id: 'charger',
    name: 'Charger',
    description: 'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or to shove a creature. If you move at least 10 feet in a straight line immediately before taking this bonus action, you either gain a +5 bonus to the attack\'s damage roll (if you chose to make a melee attack and hit) or push the target up to 10 feet away from you (if you chose to shove and you succeed).',
    mechanicalEffects: [
      'After Dash action, bonus action melee attack or shove',
      '+5 damage if moved 10+ feet in straight line before melee attack',
      'Push target 10 feet if moved 10+ feet in straight line before shove',
    ],
  },
  {
    id: 'crossbow-expert',
    name: 'Crossbow Expert',
    description: 'Thanks to extensive practice with the crossbow, you gain the following benefits: You ignore the loading quality of crossbows with which you are proficient. Being within 5 feet of a hostile creature doesn\'t impose disadvantage on your ranged attack rolls. When you use the Attack action and attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow you are holding.',
    mechanicalEffects: [
      'Ignore loading property on crossbows you are proficient with',
      'No disadvantage on ranged attacks within 5 feet of hostile creature',
      'Bonus action hand crossbow attack after one-handed weapon Attack action',
    ],
  },
  {
    id: 'defensive-duelist',
    name: 'Defensive Duelist',
    description: 'When you are wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack, potentially causing the attack to miss you.',
    prerequisite: { minAbilityScore: { dexterity: 13 } },
    mechanicalEffects: [
      'Reaction: add proficiency bonus to AC against one melee attack (requires finesse weapon)',
    ],
  },
  {
    id: 'dual-wielder',
    name: 'Dual Wielder',
    description: 'You master fighting with two weapons, gaining the following benefits: You gain a +1 bonus to AC while you are wielding a separate melee weapon in each hand. You can use two-weapon fighting even when the one-handed melee weapons you are wielding aren\'t light. You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one.',
    mechanicalEffects: [
      '+1 AC while dual wielding melee weapons',
      'Can two-weapon fight with non-light one-handed melee weapons',
      'Draw or stow two one-handed weapons at once',
    ],
  },
  {
    id: 'dungeon-delver',
    name: 'Dungeon Delver',
    description: 'Alert to the hidden traps and secret doors found in many dungeons, you gain the following benefits: You have advantage on Wisdom (Perception) and Intelligence (Investigation) checks made to detect the presence of secret doors. You have advantage on saving throws made to avoid or resist traps. You have resistance to the damage dealt by traps. You can search for traps while traveling at a normal pace, instead of only at a slow pace.',
    mechanicalEffects: [
      'Advantage on Perception and Investigation checks to detect secret doors',
      'Advantage on saving throws to avoid or resist traps',
      'Resistance to damage dealt by traps',
      'Can search for traps at normal travel pace',
    ],
  },
  {
    id: 'durable',
    name: 'Durable',
    description: 'Hardy and resilient, you gain the following benefits: Increase your Constitution score by 1, to a maximum of 20. When you roll a Hit Die to regain hit points, the minimum number of hit points you regain from the roll equals twice your Constitution modifier (minimum of 2).',
    abilityScoreIncrease: { constitution: 1 },
    mechanicalEffects: [
      'Increase Constitution by 1 (max 20)',
      'Minimum HP regained from Hit Die = 2 x Constitution modifier (min 2)',
    ],
  },
  {
    id: 'elemental-adept',
    name: 'Elemental Adept',
    description: 'When you gain this feat, choose one of the following damage types: acid, cold, fire, lightning, or thunder. Spells you cast ignore resistance to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2. You can select this feat multiple times. Each time you do so, you must choose a different damage type.',
    prerequisite: { spellcasting: true },
    mechanicalEffects: [
      'Choose one damage type: acid, cold, fire, lightning, or thunder',
      'Spells ignore resistance to the chosen damage type',
      'Treat any 1 on damage dice as a 2 for spells of the chosen type',
      'Repeatable: can take multiple times with different damage types',
    ],
  },
  {
    id: 'grappler',
    name: 'Grappler',
    description: 'You\'ve developed the skills necessary to hold your own in close-quarters grappling. You gain the following benefits: You have advantage on attack rolls against a creature you are grappling. You can use your action to try to pin a creature grappled by you. To do so, make another grapple check. If you succeed, you and the creature are both restrained until the grapple ends.',
    prerequisite: { minAbilityScore: { strength: 13 } },
    mechanicalEffects: [
      'Advantage on attack rolls against creatures you are grappling',
      'Action: pin a grappled creature (both restrained until grapple ends)',
    ],
  },
  {
    id: 'great-weapon-master',
    name: 'Great Weapon Master',
    description: 'You\'ve learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes. You gain the following benefits: On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action. Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.',
    mechanicalEffects: [
      'Bonus action melee attack on crit or reducing creature to 0 HP',
      'Optional -5 to hit / +10 damage with heavy melee weapons',
    ],
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'You are an able physician, allowing you to mend wounds quickly and get your allies back in the fight. You gain the following benefits: When you use a healer\'s kit to stabilize a dying creature, that creature also regains 1 hit point. As an action, you can spend one use of a healer\'s kit to tend to a creature and restore 1d6 + 4 hit points to it, plus additional hit points equal to the creature\'s maximum number of Hit Dice. The creature can\'t regain hit points from this feat again until it finishes a short or long rest.',
    mechanicalEffects: [
      'Healer\'s kit stabilize also restores 1 HP',
      'Action: spend healer\'s kit use to restore 1d6+4+max Hit Dice HP (once per rest per creature)',
    ],
  },
  {
    id: 'heavily-armored',
    name: 'Heavily Armored',
    description: 'You have trained to master the use of heavy armor, gaining the following benefits: Increase your Strength score by 1, to a maximum of 20. You gain proficiency with heavy armor.',
    prerequisite: { armorProficiency: true },
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength by 1 (max 20)',
      'Gain proficiency with heavy armor',
    ],
  },
  {
    id: 'heavy-armor-master',
    name: 'Heavy Armor Master',
    description: 'You can use your armor to deflect strikes that would kill others. You gain the following benefits: Increase your Strength score by 1, to a maximum of 20. While you are wearing heavy armor, bludgeoning, piercing, and slashing damage that you take from nonmagical weapons is reduced by 3.',
    prerequisite: { armorProficiency: true },
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength by 1 (max 20)',
      'While wearing heavy armor, reduce nonmagical BPS damage by 3',
    ],
  },
  {
    id: 'inspiring-leader',
    name: 'Inspiring Leader',
    description: 'You can spend 10 minutes inspiring your companions, shoring up their resolve to fight. When you do so, choose up to six friendly creatures (which can include yourself) within 30 feet of you who can see or hear you and who can understand you. Each creature can gain temporary hit points equal to your level + your Charisma modifier. A creature can\'t gain temporary hit points from this feat again until it has finished a short or long rest.',
    prerequisite: { minAbilityScore: { charisma: 13 } },
    mechanicalEffects: [
      '10-minute speech: up to 6 creatures gain temp HP = your level + Charisma modifier',
      'Once per short or long rest per creature',
    ],
  },
  {
    id: 'keen-mind',
    name: 'Keen Mind',
    description: 'You have a mind that can track time, direction, and detail with uncanny precision. You gain the following benefits: Increase your Intelligence score by 1, to a maximum of 20. You always know which way is north. You always know the number of hours left before the next sunrise or sunset. You can accurately recall anything you have seen or heard within the past month.',
    abilityScoreIncrease: { intelligence: 1 },
    mechanicalEffects: [
      'Increase Intelligence by 1 (max 20)',
      'Always know which way is north',
      'Always know hours until next sunrise/sunset',
      'Accurately recall anything seen or heard within past month',
    ],
  },
  {
    id: 'lightly-armored',
    name: 'Lightly Armored',
    description: 'You have trained to master the use of light armor, gaining the following benefits: Increase your Strength or Dexterity score by 1, to a maximum of 20. You gain proficiency with light armor.',
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength or Dexterity by 1 (max 20)',
      'Gain proficiency with light armor',
    ],
  },
  {
    id: 'linguist',
    name: 'Linguist',
    description: 'You have studied languages and codes, gaining the following benefits: Increase your Intelligence score by 1, to a maximum of 20. You learn three languages of your choice. You can ably create written ciphers. Others can\'t decipher a code you create unless you teach them, they succeed on an Intelligence check (DC equal to your Intelligence score + your proficiency bonus), or they use magic to decipher it.',
    abilityScoreIncrease: { intelligence: 1 },
    mechanicalEffects: [
      'Increase Intelligence by 1 (max 20)',
      'Learn 3 languages of your choice',
      'Can create written ciphers (DC = Intelligence score + proficiency bonus to decode)',
    ],
  },
  {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have inexplicable luck that seems to kick in at just the right moment. You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can choose to spend one of your luck points after you roll the die, but before the outcome is determined. You choose which of the d20s is used for the attack roll, ability check, or saving throw. You can also spend one luck point when an attack roll is made against you. Roll a d20, and then choose whether the attack uses the attacker\'s roll or yours. You regain your expended luck points when you finish a long rest.',
    mechanicalEffects: [
      '3 luck points per long rest',
      'Spend 1 point: roll extra d20 on attack, check, or save (choose which to use)',
      'Spend 1 point: roll d20 when attacked (choose attacker\'s roll or yours)',
    ],
  },
  {
    id: 'mage-slayer',
    name: 'Mage Slayer',
    description: 'You have practiced techniques useful in melee combat against spellcasters, gaining the following benefits: When a creature within 5 feet of you casts a spell, you can use your reaction to make a melee weapon attack against that creature. When you damage a creature that is concentrating on a spell, that creature has disadvantage on the saving throw it makes to maintain its concentration. You have advantage on saving throws against spells cast by creatures within 5 feet of you.',
    mechanicalEffects: [
      'Reaction: melee attack when creature within 5 feet casts a spell',
      'Creatures you damage have disadvantage on concentration saves',
      'Advantage on saving throws against spells cast within 5 feet',
    ],
  },
  {
    id: 'magic-initiate',
    name: 'Magic Initiate',
    description: 'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list. In addition, choose one 1st-level spell from that same list. You learn that spell and can cast it at its lowest level. Once you cast it, you must finish a long rest before you can cast it again. Your spellcasting ability for these spells depends on the class you chose.',
    mechanicalEffects: [
      'Choose a spellcasting class',
      'Learn 2 cantrips from that class\'s spell list',
      'Learn 1 first-level spell (cast once per long rest)',
      'Spellcasting ability matches chosen class',
    ],
  },
  {
    id: 'martial-adept',
    name: 'Martial Adept',
    description: 'You have martial training that allows you to perform special combat maneuvers. You gain the following benefits: You learn two maneuvers of your choice from among those available to the Battle Master archetype in the fighter class. If a maneuver you use requires your target to make a saving throw to resist the maneuver\'s effects, the saving throw DC equals 8 + your proficiency bonus + your Strength or Dexterity modifier (your choice). You gain one superiority die, which is a d6 (this die is added to any superiority dice you have from another source). This die is used to fuel your maneuvers. A superiority die is expended when you use it. You regain your expended superiority dice when you finish a short or long rest.',
    mechanicalEffects: [
      'Learn 2 Battle Master maneuvers',
      'Gain 1 superiority die (d6, recharges on short/long rest)',
      'Maneuver save DC = 8 + proficiency bonus + STR or DEX modifier',
    ],
  },
  {
    id: 'medium-armor-master',
    name: 'Medium Armor Master',
    description: 'You have practiced moving in medium armor to gain the following benefits: Wearing medium armor doesn\'t impose disadvantage on your Dexterity (Stealth) checks. When you wear medium armor, you can add 3, rather than 2, to your AC if you have a Dexterity of 16 or higher.',
    prerequisite: { armorProficiency: true },
    mechanicalEffects: [
      'Medium armor does not impose stealth disadvantage',
      'Medium armor DEX cap increases to +3 (if DEX 16+)',
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'You are exceptionally speedy and agile. You gain the following benefits: Your speed increases by 10 feet. When you use the Dash action, difficult terrain doesn\'t cost you extra movement on that turn. When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature for the rest of the turn, whether you hit or not.',
    mechanicalEffects: [
      '+10 feet to speed',
      'Dash action ignores difficult terrain',
      'No opportunity attacks from creatures you melee attack (until end of turn)',
    ],
  },
  {
    id: 'moderately-armored',
    name: 'Moderately Armored',
    description: 'You have trained to master the use of medium armor and shields, gaining the following benefits: Increase your Strength or Dexterity score by 1, to a maximum of 20. You gain proficiency with medium armor and shields.',
    prerequisite: { armorProficiency: true },
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength or Dexterity by 1 (max 20)',
      'Gain proficiency with medium armor and shields',
    ],
  },
  {
    id: 'mounted-combatant',
    name: 'Mounted Combatant',
    description: 'You are a dangerous foe to face while mounted. While you are mounted and aren\'t incapacitated, you gain the following benefits: You have advantage on melee attack rolls against any unmounted creature that is smaller than your mount. You can force an attack targeted at your mount to target you instead. If your mount is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails.',
    mechanicalEffects: [
      'Advantage on melee attacks against unmounted creatures smaller than mount',
      'Can redirect attacks targeted at mount to yourself',
      'Mount gains evasion (DEX saves: success=0 damage, fail=half damage)',
    ],
  },
  {
    id: 'observant',
    name: 'Observant',
    description: 'Quick to notice details of your environment, you gain the following benefits: Increase your Intelligence or Wisdom score by 1, to a maximum of 20. If you can see a creature\'s mouth while it is speaking a language you understand, you can interpret what it\'s saying by reading its lips. You have a +5 bonus to your passive Wisdom (Perception) and passive Intelligence (Investigation) scores.',
    abilityScoreIncrease: { wisdom: 1 },
    mechanicalEffects: [
      'Increase Intelligence or Wisdom by 1 (max 20)',
      'Can read lips (if you understand the language)',
      '+5 to passive Perception and passive Investigation',
    ],
  },
  {
    id: 'polearm-master',
    name: 'Polearm Master',
    description: 'You can keep your enemies at bay with reach weapons. You gain the following benefits: When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon. This attack uses the same ability modifier as the primary attack. The weapon\'s damage die for this attack is a d4, and the attack deals bludgeoning damage. While you are wielding a glaive, halberd, pike, quarterstaff, or spear, other creatures provoke an opportunity attack from you when they enter your reach.',
    mechanicalEffects: [
      'Bonus action: 1d4 bludgeoning attack with glaive, halberd, quarterstaff, or spear',
      'Opportunity attack when creatures enter your reach (glaive, halberd, pike, quarterstaff, spear)',
    ],
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: 'Choose one ability score. You gain the following benefits: Increase the chosen ability score by 1, to a maximum of 20. You gain proficiency in saving throws using the chosen ability.',
    mechanicalEffects: [
      'Choose one ability score: increase by 1 (max 20)',
      'Gain proficiency in saving throws for the chosen ability',
    ],
  },
  {
    id: 'ritual-caster',
    name: 'Ritual Caster',
    description: 'You have learned a number of spells that you can cast as rituals. These spells are written in a ritual book, which you must have in hand while casting one of them. When you choose this feat, you acquire a ritual book holding two 1st-level spells of your choice. Choose one of the following classes: bard, cleric, druid, sorcerer, warlock, or wizard. You must choose your spells from that class\'s spell list, and the spells you choose must have the ritual tag.',
    prerequisite: { minAbilityScore: { intelligence: 13 } },
    mechanicalEffects: [
      'Acquire a ritual book with 2 first-level ritual spells from a chosen class',
      'Can cast ritual spells from the book (adds 10 minutes to casting time)',
      'Can copy other ritual spells into the book (2 hours and 50 gp per spell level)',
    ],
  },
  {
    id: 'savage-attacker',
    name: 'Savage Attacker',
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total.',
    mechanicalEffects: [
      'Once per turn: reroll melee weapon damage dice and use either result',
    ],
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'You have mastered techniques to take advantage of every drop in any enemy\'s guard, gaining the following benefits: When you hit a creature with an opportunity attack, the creature\'s speed becomes 0 for the rest of the turn. Creatures provoke opportunity attacks from you even if they take the Disengage action before leaving your reach. When a creature within 5 feet of you makes an attack against a target other than you (and that target doesn\'t have this feat), you can use your reaction to make a melee weapon attack against the attacking creature.',
    mechanicalEffects: [
      'Opportunity attacks reduce target speed to 0 for the turn',
      'Disengage does not prevent your opportunity attacks',
      'Reaction: melee attack when creature within 5 feet attacks someone else',
    ],
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'You have mastered ranged weapons and can make shots that others find impossible. You gain the following benefits: Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls. Your ranged weapon attacks ignore half cover and three-quarters cover. Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage.',
    mechanicalEffects: [
      'No disadvantage on ranged attacks at long range',
      'Ranged attacks ignore half and three-quarters cover',
      'Optional -5 to hit / +10 damage with ranged weapons',
    ],
  },
  {
    id: 'shield-master',
    name: 'Shield Master',
    description: 'You use shields not just for protection but also for offense. You gain the following benefits while you are wielding a shield: If you take the Attack action on your turn, you can use a bonus action to try to shove a creature within 5 feet of you with your shield. If you aren\'t incapacitated, you can add your shield\'s AC bonus to any Dexterity saving throw you make against a spell or other harmful effect that targets only you. If you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you can use your reaction to take no damage if you succeed on the saving throw, interposing your shield between yourself and the source of the effect.',
    mechanicalEffects: [
      'Bonus action: shove with shield after Attack action',
      'Add shield AC bonus to DEX saves against effects targeting only you',
      'Reaction: take no damage on successful DEX save (evasion with shield)',
    ],
  },
  {
    id: 'skilled',
    name: 'Skilled',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    mechanicalEffects: [
      'Gain proficiency in any 3 skills or tools of your choice',
    ],
  },
  {
    id: 'skulker',
    name: 'Skulker',
    description: 'You are expert at slinking through shadows. You gain the following benefits: You can try to hide when you are lightly obscured from the creature from which you are hiding. When you are hidden from a creature and miss it with a ranged weapon attack, making the attack doesn\'t reveal your position. Dim light doesn\'t impose disadvantage on your Wisdom (Perception) checks relying on sight.',
    prerequisite: { minAbilityScore: { dexterity: 13 } },
    mechanicalEffects: [
      'Can hide when lightly obscured',
      'Missing a ranged attack while hidden does not reveal position',
      'Dim light does not impose disadvantage on Perception checks relying on sight',
    ],
  },
  {
    id: 'spell-sniper',
    name: 'Spell Sniper',
    description: 'You have learned techniques to enhance your attacks with certain kinds of spells, gaining the following benefits: When you cast a spell that requires you to make an attack roll, the spell\'s range is doubled. Your ranged spell attacks ignore half cover and three-quarters cover. You learn one cantrip that requires an attack roll. Choose the cantrip from the bard, cleric, druid, sorcerer, warlock, or wizard spell list. Your spellcasting ability for this cantrip depends on the spell list you chose from.',
    prerequisite: { spellcasting: true },
    mechanicalEffects: [
      'Double range on spells that require attack rolls',
      'Ranged spell attacks ignore half and three-quarters cover',
      'Learn one cantrip that requires an attack roll',
    ],
  },
  {
    id: 'tavern-brawler',
    name: 'Tavern Brawler',
    description: 'Accustomed to rough-and-tumble fighting using whatever weapons happen to be at hand, you gain the following benefits: Increase your Strength or Constitution score by 1, to a maximum of 20. You are proficient with improvised weapons. Your unarmed strike uses a d4 for damage. When you hit a creature with an unarmed strike or an improvised weapon on your turn, you can use a bonus action to attempt to grapple the target.',
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength or Constitution by 1 (max 20)',
      'Proficient with improvised weapons',
      'Unarmed strike deals 1d4 damage',
      'Bonus action: grapple after hitting with unarmed strike or improvised weapon',
    ],
  },
  {
    id: 'tough',
    name: 'Tough',
    description: 'Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    mechanicalEffects: [
      'HP maximum increases by 2 per character level (retroactive and ongoing)',
    ],
  },
  {
    id: 'war-caster',
    name: 'War Caster',
    description: 'You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits: You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage. You can perform the somatic components of spells even when you have weapons or a shield in one or both hands. When a hostile creature\'s movement provokes an opportunity attack from you, you can use your reaction to cast a spell at the creature, rather than making an opportunity attack. The spell must have a casting time of 1 action and must target only that creature.',
    prerequisite: { spellcasting: true },
    mechanicalEffects: [
      'Advantage on concentration saves when taking damage',
      'Can perform somatic components with weapons/shield in hands',
      'Reaction: cast a spell instead of opportunity attack',
    ],
  },
  {
    id: 'weapon-master',
    name: 'Weapon Master',
    description: 'You have practiced extensively with a variety of weapons, gaining the following benefits: Increase your Strength or Dexterity score by 1, to a maximum of 20. You gain proficiency with four weapons of your choice. Each one must be a simple or a martial weapon.',
    abilityScoreIncrease: { strength: 1 },
    mechanicalEffects: [
      'Increase Strength or Dexterity by 1 (max 20)',
      'Gain proficiency with 4 simple or martial weapons of your choice',
    ],
  },
] as const satisfies readonly Feat[];

// ---------------------------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------------------------

/** Look up a feat by ID. Returns undefined if not found. */
export function getFeatById(id: string): Feat | undefined {
  return FEATS.find((f) => f.id === id);
}

/**
 * Get all feats that have no prerequisites (available to any character).
 */
export function getFeatsWithNoPrerequisites(): readonly Feat[] {
  return (FEATS as readonly Feat[]).filter((f) => f.prerequisite === undefined);
}

/**
 * Get all feats that include an ability score increase.
 * These are relevant for the ASI/feat choice since they partially
 * offset the lost +2 from a standard ASI.
 */
export function getFeatsWithASI(): readonly Feat[] {
  return (FEATS as readonly Feat[]).filter((f) => f.abilityScoreIncrease !== undefined);
}
