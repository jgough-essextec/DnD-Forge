import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loading } from '@/components/layout/Loading'

const HomePage = lazy(() => import('@/pages/HomePage'))
const CharacterNewPage = lazy(() => import('@/pages/CharacterNewPage'))
const CharacterSheetPage = lazy(() => import('@/pages/CharacterSheetPage'))
const LevelUpPage = lazy(() => import('@/pages/LevelUpPage'))
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'))
const CampaignDashboardPage = lazy(
  () => import('@/pages/CampaignDashboardPage')
)
const EncounterPage = lazy(() => import('@/pages/EncounterPage'))
const JoinCampaignPage = lazy(() => import('@/pages/JoinCampaignPage'))
const DiceRollerPage = lazy(() => import('@/pages/DiceRollerPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/new" element={<CharacterNewPage />} />
            <Route path="/character/:id" element={<CharacterSheetPage />} />
            <Route path="/character/:id/edit" element={<CharacterSheetPage />} />
            <Route path="/character/:id/levelup" element={<LevelUpPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaign/:id" element={<CampaignDashboardPage />} />
            <Route
              path="/campaign/:id/encounter/:eid"
              element={<EncounterPage />}
            />
            <Route path="/join/:code" element={<JoinCampaignPage />} />
            <Route path="/dice" element={<DiceRollerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
