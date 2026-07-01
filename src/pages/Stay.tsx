import { useTrip } from '../context/tripContextCore'
import Section from '../components/Section'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import { formatBooking, formatStay, mapsLink } from '../utils/formatters'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-rule last:border-0">
      <span className="text-sm text-ink-soft sm:w-32 shrink-0">{label}</span>
      <span className="text-ink break-words">{children}</span>
    </div>
  )
}

export default function Stay() {
  const trip = useTrip()
  const stay = trip.stay
  const isEvent = trip.kind === 'event'

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{isEvent ? 'Location & Details' : 'Stay & Bookings'}</h1>
        <p className="text-ink-soft">
          {isEvent ? 'Where it is, when it starts, and any reservations.' : 'Where we’re staying and every reservation in one place.'}
        </p>
      </header>

      <Section
        title={isEvent ? 'Location' : 'Where we’re staying'}
        icon={isEvent ? '📍' : '🏠'}
        copyText={formatStay(stay, trip)}
        copyLabel={isEvent ? 'Copy location' : 'Copy stay details'}
      >
        <InfoRow label="Name">{stay.name}</InfoRow>
        <InfoRow label="Address">
          <a
            href={mapsLink(stay.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-live underline underline-offset-2"
          >
            {stay.address}
          </a>
        </InfoRow>
        <InfoRow label={isEvent ? 'Starts' : 'Check-in'}>{stay.checkIn}</InfoRow>
        <InfoRow label={isEvent ? 'Ends' : 'Check-out'}>{stay.checkOut}</InfoRow>
        {stay.wifiSsid && (
          <InfoRow label="Wi-Fi">
            <span className="font-mono bg-paper border border-rule rounded px-2 py-0.5 inline-block">
              {stay.wifiSsid}
              {stay.wifiPassword ? ` / ${stay.wifiPassword}` : ''}
            </span>
          </InfoRow>
        )}
        {stay.hostName && (
          <InfoRow label="Host">
            {stay.hostName}
            {stay.hostPhone && (
              <>
                {' · '}
                <a href={`tel:${stay.hostPhone.replace(/\s+/g, '')}`} className="text-live underline underline-offset-2">
                  {stay.hostPhone}
                </a>
              </>
            )}
          </InfoRow>
        )}
        {stay.confirmation && <InfoRow label="Confirmation">{stay.confirmation}</InfoRow>}
        {stay.bookingLink && (
          <InfoRow label="Booking link">
            <a
              href={stay.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-live underline underline-offset-2 break-all"
            >
              View reservation →
            </a>
          </InfoRow>
        )}
        {stay.notes && (
          <div className="mt-4 rounded-[8px] border border-rule border-l-4 border-l-live bg-surface p-4">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-live mb-2">Getting in</p>
            <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{stay.notes}</p>
          </div>
        )}
      </Section>

      {stay.amenities.length > 0 && (
        <Section title="Amenities" icon="✨">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stay.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2 text-ink">
                <span aria-hidden className="text-open">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Bookings" icon="🎟️">
        {trip.bookings.length === 0 && (
          <EmptyState
            icon="🎟️"
            title={isEvent ? 'No reservations yet' : 'No bookings yet'}
            body={isEvent ? 'Venue, rentals, or other reservations will show up here.' : 'Flights, cars, and reservations will show up here.'}
          />
        )}
        <ul className="space-y-3">
          {trip.bookings.map((b) => {
            const icon =
              b.kind === 'flight' ? '✈️' :
              b.kind === 'car' ? '🚗' :
              b.kind === 'stay' ? '🏠' :
              b.kind === 'activity' ? '🎟️' : '📌'
            return (
              <li key={b.id} className="rounded-[8px] border border-rule p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink flex items-center gap-2">
                      <span aria-hidden className="text-2xl">{icon}</span>
                      <span>{b.title}</span>
                    </p>
                    {b.details && <p className="text-sm text-ink-soft mt-1">{b.details}</p>}
                    {b.confirmation && (
                      <p className="text-sm text-ink-soft mt-1">
                        Confirmation:{' '}
                        <span className="font-mono bg-paper border border-rule rounded px-2 py-0.5">{b.confirmation}</span>
                      </p>
                    )}
                    {b.link && (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-live underline underline-offset-2 break-all text-sm"
                      >
                        Open reservation →
                      </a>
                    )}
                  </div>
                  <CopyButton text={formatBooking(b)} label="Copy" />
                </div>
              </li>
            )
          })}
        </ul>
      </Section>

      {trip.map?.embedUrl && (
        <Section title="Map" icon="🗺️">
          <div className="aspect-video rounded-[8px] overflow-hidden border border-rule">
            <iframe
              title="Trip map"
              src={trip.map.embedUrl}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </Section>
      )}
    </div>
  )
}
