# Epic 30: Short Rest & Long Rest Automation

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

One-button rest actions that correctly recover the right resources -- HP via hit dice (short rest), all HP + half hit dice + spell slots + class features (long rest), plus exhaustion reduction and death save reset, with clear summary of what was recovered.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 30.1 | Short Rest Flow | 8 | Hit dice spending with roll/average option, multiclass die type selection, short-rest feature recovery, Wizard Arcane Recovery prompt, complete summary |
| 30.2 | Long Rest Flow | 8 | Full HP recovery, half hit dice recovery (min 1), all spell slot recovery, long-rest feature recovery, death save reset, exhaustion -1, condition clearing checklist, before/after summary |
| 30.3 | Class Feature Usage Tracking | 5 | Extended Feature type with maxUses/usesRemaining/recoversOn, usage counter UI (filled/empty circles), restRecovery utility functions, SRD feature-to-recovery mapping |

## Key Technical Notes

### Short Rest Recovery
- **Hit Dice:** Player chooses which/how many to spend. Roll hit die + CON mod, add to HP (capped at max HP). Multiclass: different die types per class
- **Class Features:** Second Wind, Action Surge, Channel Divinity, Wild Shape, Ki Points, Warlock Spell Slots all recover on short rest
- **Wizard Arcane Recovery:** Optional, once per day during short rest
- **Duration:** At least 1 hour of light activity

### Long Rest Recovery
- **HP:** Full recovery to max HP
- **Spell Slots:** All slots restored
- **Hit Dice:** Recover up to half total hit dice (minimum 1, round down)
- **Exhaustion:** Reduce by 1 level (if fed and watered)
- **Death Saves:** Reset to 0 successes / 0 failures
- **Temp HP:** Persist through rests (not reset)
- **Long Rest Features:** Rage, Bardic Inspiration (Lv <5), Lay on Hands, Sorcery Points, Arcane Recovery daily use
- **Duration:** At least 8 hours, no more than 2 hours of light activity
- **Limit:** One long rest per 24-hour period

### Class Feature Recovery Mapping
| Feature | Class | Recovers On |
|---------|-------|-------------|
| Rage | Barbarian | Long Rest |
| Bardic Inspiration | Bard | Long Rest (Short Rest at Lv 5+) |
| Channel Divinity | Cleric | Short Rest |
| Wild Shape | Druid | Short Rest |
| Second Wind | Fighter | Short Rest |
| Action Surge | Fighter | Short Rest |
| Ki Points | Monk | Short Rest |
| Lay on Hands Pool | Paladin | Long Rest |
| Sorcery Points | Sorcerer | Long Rest |
| Arcane Recovery | Wizard | Long Rest (used during Short Rest) |
| Warlock Spell Slots | Warlock | Short Rest |

## Dependencies

- **Phase 1:** Character data model, class feature data
- **Phase 4 Epics:** HP Tracker (Epic 27), Spell Slot Tracker (Epic 28), Dice Roller (Epic 26 for hit dice rolling)

## Components Created

- `components/session/ShortRestModal.tsx`
- `components/session/LongRestModal.tsx`
- `utils/restRecovery.ts`
- Extended Feature type in data model
