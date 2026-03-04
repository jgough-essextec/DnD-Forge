/**
 * Page2Layout Component (Story 18.1)
 *
 * Container layout for Page 2 of the character sheet.
 * Two-column responsive layout:
 * - Left column (~35%): appearance, portrait, allies & organizations
 * - Right column (~65%): backstory, additional features, treasure
 * - Bottom full-width: equipment and currency sections
 */

import { cn } from '@/lib/utils'
import { AppearanceSection } from './AppearanceSection'
import { BackstorySection } from './BackstorySection'
import { EquipmentSection } from './EquipmentSection'
import { CurrencySection } from './CurrencySection'
import { TreasureSection } from './TreasureSection'

export interface Page2LayoutProps {
  className?: string
}

export function Page2Layout({ className }: Page2LayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 p-6 bg-primary text-parchment',
        className
      )}
      data-testid="page2-layout"
    >
      {/* Two-column layout for appearance and backstory */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* Left column: Appearance, Portrait, Allies */}
        <div className="flex flex-col gap-6">
          <AppearanceSection />
        </div>

        {/* Right column: Backstory, Additional Features, Treasure */}
        <div className="flex flex-col gap-6">
          <BackstorySection />
          <TreasureSection />
        </div>
      </div>

      {/* Full-width bottom sections */}
      <div className="flex flex-col gap-6">
        <EquipmentSection />
        <CurrencySection />
      </div>
    </div>
  )
}
