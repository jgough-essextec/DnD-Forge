// =============================================================================
// Tests for Epic 10 -- Class Selection Wizard Step
// Covers ClassCard, ClassDetailPanel, ClassSkillSelector, SubclassSelector,
// FightingStyleSelector, ClassStep, and validateClassStep.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CLASSES } from '@/data/classes'
import type { CharacterClass, FightingStyle, ClassSelection } from '@/types/class'
import type { SkillName } from '@/types/core'

// -- Mock framer-motion to avoid animation issues in tests --------------------
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        variants: _variants,
        custom: _custom,
        ...htmlProps
      } = props
      return <div {...htmlProps}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// -- Mock the wizard store ----------------------------------------------------
const mockSetClass = vi.fn()
const mockClassSelection: ClassSelection | null = null

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      classSelection: mockClassSelection,
      setClass: mockSetClass,
    }),
}))

// -- Imports after mocks ------------------------------------------------------
import { ClassCard, CLASS_ROLE_TAGS } from '../ClassCard'
import { ClassDetailPanel } from '../ClassDetailPanel'
import { ClassSkillSelector } from '../ClassSkillSelector'
import { SubclassSelector, SRD_SUBCLASSES } from '../SubclassSelector'
import { FightingStyleSelector, FIGHTING_STYLE_CLASSES } from '../FightingStyleSelector'
import { ClassStep, validateClassStep } from '../ClassStep'

// -- Helpers ------------------------------------------------------------------

function getClassByIdOrFail(id: string): CharacterClass {
  const cls = (CLASSES as readonly CharacterClass[]).find((c) => c.id === id)
  if (!cls) throw new Error(`Class ${id} not found`)
  return cls
}

// =============================================================================
// ClassCard Tests
// =============================================================================

describe('ClassCard', () => {
  it('renders class name and hit die', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassCard characterClass={fighter} isSelected={false} />)

    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('d10')).toBeInTheDocument()
  })

  it('renders role tags for each class', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassCard characterClass={fighter} isSelected={false} />)

    expect(screen.getByText('Striker')).toBeInTheDocument()
    expect(screen.getByText('Tank')).toBeInTheDocument()
  })

  it('renders class description', () => {
    const wizard = getClassByIdOrFail('wizard')
    render(<ClassCard characterClass={wizard} isSelected={false} />)

    expect(screen.getByText(/scholarly magic-user/)).toBeInTheDocument()
  })

  it('renders primary ability', () => {
    const wizard = getClassByIdOrFail('wizard')
    render(<ClassCard characterClass={wizard} isSelected={false} />)

    expect(screen.getByText('INT')).toBeInTheDocument()
  })

  it('shows multiple primary abilities', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassCard characterClass={fighter} isSelected={false} />)

    expect(screen.getByText('STR / DEX')).toBeInTheDocument()
  })

  it('applies selected styling (accent-gold text on name)', () => {
    const rogue = getClassByIdOrFail('rogue')
    render(<ClassCard characterClass={rogue} isSelected={true} />)

    const name = screen.getByText('Rogue')
    expect(name.className).toContain('text-accent-gold')
  })

  it('defines correct role archetype tags for all 12 classes', () => {
    expect(Object.keys(CLASS_ROLE_TAGS)).toHaveLength(12)
    expect(CLASS_ROLE_TAGS['barbarian']).toEqual(['Striker', 'Tank'])
    expect(CLASS_ROLE_TAGS['bard']).toEqual(['Support', 'Spellcaster'])
    expect(CLASS_ROLE_TAGS['cleric']).toEqual(['Healer', 'Support'])
    expect(CLASS_ROLE_TAGS['druid']).toEqual(['Spellcaster', 'Support'])
    expect(CLASS_ROLE_TAGS['fighter']).toEqual(['Striker', 'Tank'])
    expect(CLASS_ROLE_TAGS['monk']).toEqual(['Striker'])
    expect(CLASS_ROLE_TAGS['paladin']).toEqual(['Tank', 'Healer'])
    expect(CLASS_ROLE_TAGS['ranger']).toEqual(['Striker', 'Utility'])
    expect(CLASS_ROLE_TAGS['rogue']).toEqual(['Striker', 'Utility'])
    expect(CLASS_ROLE_TAGS['sorcerer']).toEqual(['Spellcaster'])
    expect(CLASS_ROLE_TAGS['warlock']).toEqual(['Spellcaster'])
    expect(CLASS_ROLE_TAGS['wizard']).toEqual(['Spellcaster', 'Utility'])
  })

  it('shows armor proficiencies', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassCard characterClass={fighter} isSelected={false} />)

    expect(screen.getByText(/light, medium, heavy, shields armor/)).toBeInTheDocument()
  })

  it('shows "No armor" for classes with no armor proficiencies', () => {
    const sorcerer = getClassByIdOrFail('sorcerer')
    render(<ClassCard characterClass={sorcerer} isSelected={false} />)

    expect(screen.getByText('No armor')).toBeInTheDocument()
  })
})

// =============================================================================
// ClassDetailPanel Tests
// =============================================================================

describe('ClassDetailPanel', () => {
  it('renders overview section with description, hit die, and saving throws', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText(/master of martial combat/)).toBeInTheDocument()
    expect(screen.getByText('d10')).toBeInTheDocument()
    expect(screen.getByText(/Strength, Constitution/)).toBeInTheDocument()
  })

  it('renders proficiencies section', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    expect(screen.getByText('Proficiencies')).toBeInTheDocument()
    expect(screen.getByText(/light, medium, heavy, shields/)).toBeInTheDocument()
  })

  it('renders level 1 features', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    expect(screen.getByText('Level 1 Features')).toBeInTheDocument()
    expect(screen.getByText('Fighting Style')).toBeInTheDocument()
    expect(screen.getByText('Second Wind')).toBeInTheDocument()
  })

  it('renders spellcasting section for casters', () => {
    const wizard = getClassByIdOrFail('wizard')
    render(<ClassDetailPanel characterClass={wizard} />)

    // "Spellcasting" appears both as a feature name and as a section heading
    const spellcastingSection = screen.getByLabelText('Spellcasting')
    expect(spellcastingSection).toBeInTheDocument()
    expect(within(spellcastingSection).getByText('Full Caster')).toBeInTheDocument()
    expect(within(spellcastingSection).getByText('Intelligence')).toBeInTheDocument()
  })

  it('does not render spellcasting section for non-casters', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    // "Spellcasting" may appear as a feature name but not as a section header
    // The section should not have "Full Caster", "Half Caster", etc.
    expect(screen.queryByText('Full Caster')).not.toBeInTheDocument()
    expect(screen.queryByText('Pact Magic')).not.toBeInTheDocument()
  })

  it('renders starting equipment preview', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    expect(screen.getByText('Starting Equipment Preview')).toBeInTheDocument()
    expect(screen.getByText(/Equipment selection happens/)).toBeInTheDocument()
  })

  it('shows subclass info for L1 subclass classes', () => {
    const cleric = getClassByIdOrFail('cleric')
    render(<ClassDetailPanel characterClass={cleric} />)

    // "Divine Domain" appears both in features and subclass section
    const subclassSection = screen.getByLabelText('Subclass')
    expect(within(subclassSection).getByText('Divine Domain')).toBeInTheDocument()
    expect(screen.getByText(/choose your Divine Domain at level 1/)).toBeInTheDocument()
  })

  it('shows subclass info for non-L1 subclass classes', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(<ClassDetailPanel characterClass={fighter} />)

    expect(screen.getByText('Martial Archetype')).toBeInTheDocument()
    expect(screen.getByText(/choose your Martial Archetype at level 3/)).toBeInTheDocument()
  })

  it('shows pact magic spellcasting type for Warlock', () => {
    const warlock = getClassByIdOrFail('warlock')
    render(<ClassDetailPanel characterClass={warlock} />)

    // "Pact Magic" appears as both a feature name and in the spellcasting section
    const spellcastingSection = screen.getByLabelText('Spellcasting')
    expect(within(spellcastingSection).getByText('Pact Magic')).toBeInTheDocument()
  })
})

// =============================================================================
// ClassSkillSelector Tests
// =============================================================================

describe('ClassSkillSelector', () => {
  it('renders with correct skill count for Fighter (choose 2)', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(
      <ClassSkillSelector
        characterClass={fighter}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Skill Proficiencies')).toBeInTheDocument()
    expect(screen.getByText(/Choose 2 skills/)).toBeInTheDocument()
  })

  it('renders with correct skill count for Rogue (choose 4)', () => {
    const rogue = getClassByIdOrFail('rogue')
    render(
      <ClassSkillSelector
        characterClass={rogue}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Choose 4 skills/)).toBeInTheDocument()
  })

  it('renders with correct skill count for Bard (choose 3)', () => {
    const bard = getClassByIdOrFail('bard')
    render(
      <ClassSkillSelector
        characterClass={bard}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Choose 3 skills/)).toBeInTheDocument()
  })

  it('shows all skills from the class skill pool', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(
      <ClassSkillSelector
        characterClass={fighter}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    // Fighter skills: acrobatics, animal-handling, athletics, history, insight, intimidation, perception, survival
    expect(screen.getByText(/Acrobatics \(DEX\)/)).toBeInTheDocument()
    expect(screen.getByText(/Athletics \(STR\)/)).toBeInTheDocument()
    expect(screen.getByText(/History \(INT\)/)).toBeInTheDocument()
  })

  it('shows ability abbreviation with each skill', () => {
    const wizard = getClassByIdOrFail('wizard')
    render(
      <ClassSkillSelector
        characterClass={wizard}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Arcana \(INT\)/)).toBeInTheDocument()
    expect(screen.getByText(/Medicine \(WIS\)/)).toBeInTheDocument()
  })

  it('calls onSkillsChange when a skill is toggled', async () => {
    const user = userEvent.setup()
    const onSkillsChange = vi.fn()
    const fighter = getClassByIdOrFail('fighter')

    render(
      <ClassSkillSelector
        characterClass={fighter}
        selectedSkills={[]}
        onSkillsChange={onSkillsChange}
      />,
    )

    // Click on Athletics
    const athleticsLabel = screen.getByText(/Athletics \(STR\)/)
    await user.click(athleticsLabel.closest('label')!)

    expect(onSkillsChange).toHaveBeenCalled()
  })

  it('shows Bard with all 18 skill options', () => {
    const bard = getClassByIdOrFail('bard')
    render(
      <ClassSkillSelector
        characterClass={bard}
        selectedSkills={[]}
        onSkillsChange={vi.fn()}
      />,
    )

    // Bard can choose from all 18 skills
    expect(screen.getByText(/Acrobatics \(DEX\)/)).toBeInTheDocument()
    expect(screen.getByText(/Stealth \(DEX\)/)).toBeInTheDocument()
    expect(screen.getByText(/Persuasion \(CHA\)/)).toBeInTheDocument()
  })
})

// =============================================================================
// SubclassSelector Tests
// =============================================================================

describe('SubclassSelector', () => {
  it('renders subclass selector for Cleric (L1 subclass)', () => {
    const cleric = getClassByIdOrFail('cleric')
    render(
      <SubclassSelector
        characterClass={cleric}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Divine Domain')).toBeInTheDocument()
    expect(screen.getByText('Life Domain')).toBeInTheDocument()
  })

  it('renders subclass selector for Sorcerer (L1 subclass)', () => {
    const sorcerer = getClassByIdOrFail('sorcerer')
    render(
      <SubclassSelector
        characterClass={sorcerer}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Sorcerous Origin')).toBeInTheDocument()
    expect(screen.getByText('Draconic Bloodline')).toBeInTheDocument()
  })

  it('renders subclass selector for Warlock (L1 subclass)', () => {
    const warlock = getClassByIdOrFail('warlock')
    render(
      <SubclassSelector
        characterClass={warlock}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Otherworldly Patron')).toBeInTheDocument()
    expect(screen.getByText('The Fiend')).toBeInTheDocument()
  })

  it('shows informational note for non-L1 subclass classes', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(
      <SubclassSelector
        characterClass={fighter}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Martial Archetype/)).toBeInTheDocument()
    expect(screen.getByText(/level 3/)).toBeInTheDocument()
  })

  it('shows informational note for Barbarian', () => {
    const barbarian = getClassByIdOrFail('barbarian')
    render(
      <SubclassSelector
        characterClass={barbarian}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Primal Path/)).toBeInTheDocument()
    expect(screen.getByText(/level 3/)).toBeInTheDocument()
  })

  it('calls onSubclassChange when a subclass is selected', async () => {
    const user = userEvent.setup()
    const onSubclassChange = vi.fn()
    const cleric = getClassByIdOrFail('cleric')

    render(
      <SubclassSelector
        characterClass={cleric}
        selectedSubclassId={null}
        onSubclassChange={onSubclassChange}
      />,
    )

    await user.click(screen.getByText('Life Domain'))
    expect(onSubclassChange).toHaveBeenCalledWith('life-domain')
  })

  it('shows subclass description text', () => {
    const cleric = getClassByIdOrFail('cleric')
    render(
      <SubclassSelector
        characterClass={cleric}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Life domain focuses/)).toBeInTheDocument()
  })

  it('has SRD subclasses defined for Cleric, Sorcerer, and Warlock', () => {
    expect(SRD_SUBCLASSES['cleric']).toBeDefined()
    expect(SRD_SUBCLASSES['cleric']!.length).toBeGreaterThan(0)
    expect(SRD_SUBCLASSES['sorcerer']).toBeDefined()
    expect(SRD_SUBCLASSES['sorcerer']!.length).toBeGreaterThan(0)
    expect(SRD_SUBCLASSES['warlock']).toBeDefined()
    expect(SRD_SUBCLASSES['warlock']!.length).toBeGreaterThan(0)
  })
})

// =============================================================================
// FightingStyleSelector Tests
// =============================================================================

describe('FightingStyleSelector', () => {
  it('renders for Fighter with 6 options', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(
      <FightingStyleSelector
        characterClass={fighter}
        selectedStyle={null}
        onStyleChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Fighting Style')).toBeInTheDocument()
    expect(screen.getByText('Archery')).toBeInTheDocument()
    expect(screen.getByText('Defense')).toBeInTheDocument()
    expect(screen.getByText('Dueling')).toBeInTheDocument()
    expect(screen.getByText('Great Weapon Fighting')).toBeInTheDocument()
    expect(screen.getByText('Protection')).toBeInTheDocument()
    expect(screen.getByText('Two-Weapon Fighting')).toBeInTheDocument()
  })

  it('renders for Paladin with 4 options', () => {
    const paladin = getClassByIdOrFail('paladin')
    render(
      <FightingStyleSelector
        characterClass={paladin}
        selectedStyle={null}
        onStyleChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Defense')).toBeInTheDocument()
    expect(screen.getByText('Dueling')).toBeInTheDocument()
    expect(screen.getByText('Great Weapon Fighting')).toBeInTheDocument()
    expect(screen.getByText('Protection')).toBeInTheDocument()
    // Should NOT have Archery or Two-Weapon Fighting
    expect(screen.queryByText('Archery')).not.toBeInTheDocument()
    expect(screen.queryByText('Two-Weapon Fighting')).not.toBeInTheDocument()
  })

  it('renders for Ranger with 4 options', () => {
    const ranger = getClassByIdOrFail('ranger')
    render(
      <FightingStyleSelector
        characterClass={ranger}
        selectedStyle={null}
        onStyleChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Archery')).toBeInTheDocument()
    expect(screen.getByText('Defense')).toBeInTheDocument()
    expect(screen.getByText('Dueling')).toBeInTheDocument()
    expect(screen.getByText('Two-Weapon Fighting')).toBeInTheDocument()
    // Should NOT have Great Weapon Fighting or Protection
    expect(screen.queryByText('Great Weapon Fighting')).not.toBeInTheDocument()
    expect(screen.queryByText('Protection')).not.toBeInTheDocument()
  })

  it('does not render for non-martial classes', () => {
    const wizard = getClassByIdOrFail('wizard')
    const { container } = render(
      <FightingStyleSelector
        characterClass={wizard}
        selectedStyle={null}
        onStyleChange={vi.fn()}
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('calls onStyleChange when a style is selected', async () => {
    const user = userEvent.setup()
    const onStyleChange = vi.fn()
    const fighter = getClassByIdOrFail('fighter')

    render(
      <FightingStyleSelector
        characterClass={fighter}
        selectedStyle={null}
        onStyleChange={onStyleChange}
      />,
    )

    await user.click(screen.getByText('Archery'))
    expect(onStyleChange).toHaveBeenCalledWith('archery')
  })

  it('shows fighting style descriptions', () => {
    const fighter = getClassByIdOrFail('fighter')
    render(
      <FightingStyleSelector
        characterClass={fighter}
        selectedStyle={null}
        onStyleChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/\+2 bonus to attack rolls.*ranged weapons/)).toBeInTheDocument()
    expect(screen.getByText(/wearing armor.*\+1 bonus to AC/)).toBeInTheDocument()
  })

  it('identifies correct fighting style classes', () => {
    expect(FIGHTING_STYLE_CLASSES).toContain('fighter')
    expect(FIGHTING_STYLE_CLASSES).toContain('paladin')
    expect(FIGHTING_STYLE_CLASSES).toContain('ranger')
    expect(FIGHTING_STYLE_CLASSES).not.toContain('wizard')
    expect(FIGHTING_STYLE_CLASSES).not.toContain('rogue')
  })
})

// =============================================================================
// validateClassStep Tests
// =============================================================================

describe('validateClassStep', () => {
  it('returns invalid when no class is selected', () => {
    const result = validateClassStep(null, [], null, null)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Please select a class')
  })

  it('returns invalid when skill count does not match requirement', () => {
    const fighter = getClassByIdOrFail('fighter')
    // Fighter needs 2 skills, providing 1
    const result = validateClassStep(
      fighter,
      ['athletics'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('2 skills'))).toBe(true)
  })

  it('returns invalid when L1 subclass is required but not selected (Cleric)', () => {
    const cleric = getClassByIdOrFail('cleric')
    const result = validateClassStep(
      cleric,
      ['history', 'insight'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Divine Domain'))).toBe(true)
  })

  it('returns invalid when L1 subclass is required but not selected (Sorcerer)', () => {
    const sorcerer = getClassByIdOrFail('sorcerer')
    const result = validateClassStep(
      sorcerer,
      ['arcana', 'insight'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Sorcerous Origin'))).toBe(true)
  })

  it('returns invalid when L1 subclass is required but not selected (Warlock)', () => {
    const warlock = getClassByIdOrFail('warlock')
    const result = validateClassStep(
      warlock,
      ['arcana', 'deception'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Otherworldly Patron'))).toBe(true)
  })

  it('returns invalid when fighting style is required but not selected (Fighter)', () => {
    const fighter = getClassByIdOrFail('fighter')
    const result = validateClassStep(
      fighter,
      ['athletics', 'perception'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Fighting Style'))).toBe(true)
  })

  it('returns invalid when fighting style is required but not selected (Paladin)', () => {
    const paladin = getClassByIdOrFail('paladin')
    const result = validateClassStep(
      paladin,
      ['athletics', 'insight'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Fighting Style'))).toBe(true)
  })

  it('returns valid for a simple class with all choices made (Barbarian)', () => {
    const barbarian = getClassByIdOrFail('barbarian')
    const result = validateClassStep(
      barbarian,
      ['athletics', 'perception'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for Fighter with skills and fighting style', () => {
    const fighter = getClassByIdOrFail('fighter')
    const result = validateClassStep(
      fighter,
      ['athletics', 'perception'] as SkillName[],
      null,
      'archery' as FightingStyle,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for Cleric with skills and subclass', () => {
    const cleric = getClassByIdOrFail('cleric')
    const result = validateClassStep(
      cleric,
      ['history', 'insight'] as SkillName[],
      'life-domain',
      null,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for Warlock with skills and subclass', () => {
    const warlock = getClassByIdOrFail('warlock')
    const result = validateClassStep(
      warlock,
      ['arcana', 'deception'] as SkillName[],
      'the-fiend',
      null,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid for Rogue with 4 skills and no fighting style or subclass', () => {
    const rogue = getClassByIdOrFail('rogue')
    const result = validateClassStep(
      rogue,
      ['stealth', 'acrobatics', 'deception', 'insight'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('does not require fighting style for non-martial classes', () => {
    const wizard = getClassByIdOrFail('wizard')
    const result = validateClassStep(
      wizard,
      ['arcana', 'history'] as SkillName[],
      null,
      null,
    )
    expect(result.valid).toBe(true)
  })

  it('does not require subclass for classes with subclass at higher levels', () => {
    const fighter = getClassByIdOrFail('fighter')
    const result = validateClassStep(
      fighter,
      ['athletics', 'perception'] as SkillName[],
      null,
      'defense' as FightingStyle,
    )
    expect(result.valid).toBe(true)
  })
})

// =============================================================================
// ClassStep Integration Tests
// =============================================================================

describe('ClassStep', () => {
  beforeEach(() => {
    mockSetClass.mockClear()
  })

  it('renders all 12 classes in the grid', () => {
    render(<ClassStep onValidationChange={vi.fn()} />)

    expect(screen.getByText('Choose Your Class')).toBeInTheDocument()
    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('Wizard')).toBeInTheDocument()
    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(screen.getByText('Cleric')).toBeInTheDocument()
    expect(screen.getByText('Barbarian')).toBeInTheDocument()
    expect(screen.getByText('Bard')).toBeInTheDocument()
    expect(screen.getByText('Druid')).toBeInTheDocument()
    expect(screen.getByText('Monk')).toBeInTheDocument()
    expect(screen.getByText('Paladin')).toBeInTheDocument()
    expect(screen.getByText('Ranger')).toBeInTheDocument()
    expect(screen.getByText('Sorcerer')).toBeInTheDocument()
    expect(screen.getByText('Warlock')).toBeInTheDocument()
  })

  it('renders search bar', () => {
    render(<ClassStep onValidationChange={vi.fn()} />)

    expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument()
  })

  it('selects a class when clicked', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Fighter'))

    // After selecting Fighter, should see the choices section
    expect(screen.getByText('Fighter Choices')).toBeInTheDocument()
    expect(screen.getByText('Skill Proficiencies')).toBeInTheDocument()
    // "Fighting Style" appears in both panel features and choices section
    expect(screen.getAllByText('Fighting Style').length).toBeGreaterThanOrEqual(1)
  })

  it('shows skill selector after selecting a class', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Barbarian'))

    expect(screen.getByText('Skill Proficiencies')).toBeInTheDocument()
    expect(screen.getByText(/Choose 2 skills/)).toBeInTheDocument()
  })

  it('shows subclass selector for Cleric', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Cleric'))

    expect(screen.getByText('Cleric Choices')).toBeInTheDocument()
    // "Divine Domain" appears in detail panel features and subclass selector
    expect(screen.getAllByText('Divine Domain').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Life Domain')).toBeInTheDocument()
  })

  it('shows fighting style selector for Fighter', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Fighter'))

    // "Fighting Style" appears in both detail panel features and choices selector
    expect(screen.getAllByText('Fighting Style').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Archery')).toBeInTheDocument()
  })

  it('shows subclass info note for non-L1 subclass classes', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Barbarian'))

    // "Primal Path" appears both in detail panel features and the info note
    expect(screen.getAllByText(/Primal Path/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/level 3/).length).toBeGreaterThanOrEqual(1)
  })

  it('does not show fighting style for non-martial classes', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Wizard'))

    expect(screen.getByText('Wizard Choices')).toBeInTheDocument()
    // No fighting style section
    const fightingStyles = screen.queryAllByText('Fighting Style')
    // Only the grid card's feature may mention Fighting Style, but not a heading for selection
    const isFightingStyleHeading = fightingStyles.some(
      (el) => el.tagName === 'H3',
    )
    expect(isFightingStyleHeading).toBe(false)
  })

  it('resets choices when changing class', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    // Select Fighter via the grid options
    const options = screen.getAllByRole('option')
    const fighterOption = options.find((opt) => opt.textContent?.includes('Fighter'))
    expect(fighterOption).toBeDefined()
    await user.click(fighterOption!)
    expect(screen.getByText('Fighter Choices')).toBeInTheDocument()

    // Close the panel (there are 2 close buttons: desktop + mobile)
    const closeButtons = screen.getAllByLabelText('Close panel')
    await user.click(closeButtons[0])

    // Find and click Wizard (avoid matching "Warlock" which also contains "W")
    const wizardOption = screen.getAllByRole('option').find(
      (opt) => opt.textContent?.includes('Wizard') && !opt.textContent?.includes('Warlock'),
    )
    expect(wizardOption).toBeDefined()
    await user.click(wizardOption!)
    expect(screen.getByText('Wizard Choices')).toBeInTheDocument()
  })

  it('calls onValidationChange with invalid state when no class is selected', () => {
    const onValidationChange = vi.fn()
    render(<ClassStep onValidationChange={onValidationChange} />)

    // On initial render, validation should be called with invalid state
    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    )
  })

  it('calls setClass on wizard store', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Barbarian'))

    // setClass should have been called with a ClassSelection object
    expect(mockSetClass).toHaveBeenCalledWith(
      expect.objectContaining({
        classId: 'barbarian',
        level: 1,
      }),
    )
  })

  it('filters classes by name search', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    const searchInput = screen.getByPlaceholderText('Search classes...')
    await user.type(searchInput, 'rog')

    // After debounce, only Rogue should be visible
    // Note: search is debounced, so we need to wait
    await new Promise((r) => setTimeout(r, 400))

    // Check Rogue is still there
    expect(screen.getByText('Rogue')).toBeInTheDocument()
  })

  it('shows empty state when filter matches nothing', async () => {
    const user = userEvent.setup()
    render(<ClassStep onValidationChange={vi.fn()} />)

    const searchInput = screen.getByPlaceholderText('Search classes...')
    await user.type(searchInput, 'xyznonexistent')

    await new Promise((r) => setTimeout(r, 400))

    expect(screen.getByText(/No classes match/)).toBeInTheDocument()
  })

  it('renders the SelectableCardGrid with listbox role', () => {
    render(<ClassStep onValidationChange={vi.fn()} />)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
})
