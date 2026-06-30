import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Trip = lazy(() => import('./pages/Trip'))
const Stay = lazy(() => import('./pages/Stay'))
const People = lazy(() => import('./pages/People'))
const Prep = lazy(() => import('./pages/Prep'))
const Budget = lazy(() => import('./pages/Budget'))
const ManageTrip = lazy(() => import('./pages/ManageTrip'))
const NewTrip = lazy(() => import('./pages/NewTrip'))
const TripsIndex = lazy(() => import('./pages/TripsIndex'))
const Landing = lazy(() => import('./pages/Landing'))
const MothersDay2026 = lazy(() => import('./pages/MothersDay2026'))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center p-6">
      <p className="text-sm">Loading...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/trips" element={<TripsIndex />} />
          <Route path="/trips/new" element={<NewTrip />} />
          <Route path="/mothers-day-2026" element={<MothersDay2026 />} />
          <Route path="/:tripSlug" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="trip" element={<Trip />} />
            <Route path="stay" element={<Stay />} />
            <Route path="people" element={<People />} />
            <Route path="prep" element={<Prep />} />
            <Route path="checklist" element={<Navigate to="../prep?list=todo" replace />} />
            <Route path="packing" element={<Navigate to="../prep?list=pack" replace />} />
            <Route path="budget" element={<Budget />} />
            <Route path="manage" element={<ManageTrip />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
