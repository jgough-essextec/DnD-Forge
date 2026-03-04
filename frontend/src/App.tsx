import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/AuthContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loading } from '@/components/layout/Loading'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
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
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public-only routes (redirect to home if already logged in) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Main layout with protected routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/character/new"
                element={
                  <ProtectedRoute>
                    <CharacterNewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/character/:id"
                element={
                  <ProtectedRoute>
                    <CharacterSheetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/character/:id/edit"
                element={
                  <ProtectedRoute>
                    <CharacterSheetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/character/:id/levelup"
                element={
                  <ProtectedRoute>
                    <LevelUpPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <ProtectedRoute>
                    <CampaignsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaign/:id"
                element={
                  <ProtectedRoute>
                    <CampaignDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaign/:id/encounter/:eid"
                element={
                  <ProtectedRoute>
                    <EncounterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/join/:code"
                element={
                  <ProtectedRoute>
                    <JoinCampaignPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dice"
                element={
                  <ProtectedRoute>
                    <DiceRollerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
