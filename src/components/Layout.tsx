import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import BottomNav from './BottomNav'
import { trips } from '../data/trips'
import { TripContext } from '../context/tripContextCore'
import { OwnerEditProvider } from '../context/ownerEdit'
import { useResolvedTrip, useTripWithOverride } from '../hooks/useTripOverrides'

function TripRouteStatus({ status }: { status: 'loading' | 'error' }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-6">
      <div className="max-w-sm rounded-[8px] bg-surface border border-rule p-5 text-center space-y-3">
        <p className="text-3xl" aria-hidden>
          {status === 'loading' ? '🧳' : '⚠️'}
        </p>
        <h1 className="text-xl font-semibold">
          {status === 'loading' ? 'Loading trip...' : 'Trip unavailable'}
        </h1>
        {status === 'error' && (
          <p className="text-sm text-slate-600">
            Dynamic trips need Supabase to be configured and reachable.
          </p>
        )}
        {status === 'error' && (
          <Link to="/" className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Back to trips
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Layout() {
  const { tripSlug } = useParams<{ tripSlug: string }>()
  const location = useLocation()
  const seedTrip = tripSlug ? trips[tripSlug] : undefined
  const staticResult = useTripWithOverride(seedTrip)
  const dynamicResult = useResolvedTrip(seedTrip ? undefined : tripSlug)
  const trip = seedTrip ? staticResult.trip : dynamicResult.trip
  const status = seedTrip ? staticResult.status : dynamicResult.status

  if (!tripSlug) return <Navigate to="/" replace />
  if (!trip && (status === 'loading' || status === 'offline')) return <TripRouteStatus status="loading" />
  if (!trip && status === 'error') return <TripRouteStatus status="error" />
  if (!trip) return <Navigate to="/" replace />

  const basePath = `/${trip.slug}`
  const isManageRoute = location.pathname.replace(/\/+$/, '').endsWith('/manage')

  // Only seed trips are override-backed today, so inline editing is scoped to them.
  const canEdit = Boolean(seedTrip)
  const editVersion = seedTrip ? staticResult.row?.version : undefined
  const editRefresh = seedTrip ? staticResult.refresh : async () => {}

  const navOrder =
    trip.kind === 'event'
      ? [
          { r: '', l: 'Home' }, { r: 'trip', l: 'Plan' }, { r: 'stay', l: 'Place' },
          { r: 'people', l: 'People' }, { r: 'prep', l: 'Prep' },
        ]
      : [
          { r: '', l: 'Home' }, { r: 'travel', l: 'Travel' }, { r: 'trip', l: 'Plan' }, { r: 'stay', l: 'Stay' },
          { r: 'people', l: 'People' }, { r: 'prep', l: 'Prep' },
        ]
  const cleanPath = location.pathname.replace(/\/+$/, '')
  const sub = cleanPath === basePath ? '' : cleanPath.slice(basePath.length + 1)
  const navIdx = navOrder.findIndex((x) => x.r === sub)
  const prevPage = navIdx > 0 ? navOrder[navIdx - 1] : null
  const nextPage = navIdx >= 0 && navIdx < navOrder.length - 1 ? navOrder[navIdx + 1] : null
  const pageHref = (r: string) => `${basePath}${r ? `/${r}` : ''}`

  return (
    <TripContext.Provider value={trip}>
      <OwnerEditProvider trip={trip} canEdit={canEdit} version={editVersion} refresh={editRefresh}>
      <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded-md focus:border focus:border-slate-300"
        >
          Skip to content
        </a>
        <main id="main" className={`mx-auto w-full max-w-2xl px-5 pt-5 sm:px-6 ${isManageRoute ? 'pb-10' : 'pb-28'}`}>
          <Link
            to="/trips"
            className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink mb-3"
          >
            <span aria-hidden>←</span>
            <span>All trips</span>
          </Link>
          <Outlet />
          {!isManageRoute && navIdx >= 0 && (prevPage || nextPage) && (
            <nav
              aria-label="Page navigation"
              className="mt-8 flex items-center justify-between gap-3 border-t border-rule pt-4"
            >
              {prevPage ? (
                <Link to={pageHref(prevPage.r)} className="text-sm text-ink-soft hover:text-ink">
                  ← {prevPage.l}
                </Link>
              ) : (
                <span />
              )}
              {nextPage ? (
                <Link to={pageHref(nextPage.r)} className="text-sm text-ink-soft hover:text-ink">
                  {nextPage.l} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </main>
        {!isManageRoute && <BottomNav basePath={basePath} kind={trip.kind} />}
      </div>
      </OwnerEditProvider>
    </TripContext.Provider>
  )
}
