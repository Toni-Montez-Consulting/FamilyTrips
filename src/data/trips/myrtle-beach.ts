import type { Trip } from '../../types/trip'

const heroImage = new URL('../../assets/hero.png', import.meta.url).href

// Myrtle Beach, July 4–7, 2026. Toni + Morgan + Tatum (18 months).
// Built unlisted: lives at /myrtle-beach as a direct link, hidden from the public index.
// Privacy convention (same as stpete): the reservation PNR and exact addresses are
// kept OUT of this public seed. Anything written here ships in the public JS bundle.
export const myrtleBeach: Trip = {
  slug: 'myrtle-beach',
  name: 'Myrtle Beach Family Trip',
  location: 'Myrtle Beach, SC',
  startDate: '2026-07-04',
  endDate: '2026-07-07',
  visibility: 'unlisted',
  heroImage,
  currency: '$',
  tagline: 'Toddler-mode beach long weekend with Tatum',

  stay: {
    name: 'Myrtle Beach Villas 302 A (6-bedroom condo)',
    address: 'Shared privately with the group',
    checkIn: 'July 4, 2026 · 4:00 PM–8:30 PM',
    checkOut: 'July 7, 2026 · time per guidebook',
    amenities: ['6 bedrooms — fits the full group', 'No pets', 'No smoking'],
    notes:
      'Managed by MB Vacation Home Rentals · check-in window 4:00–8:30 PM.\n\n' +
      'Entry, internet, parking, and checkout details live in the property guidebook, ' +
      'shared privately with the group — kept off this public page on purpose. ' +
      'Flight reservation confirmation is also stored privately.',
  },

  bookings: [
    {
      id: 'flight-out-1',
      kind: 'flight',
      title: 'Outbound 1 — AA 1857 · DFW → CLT',
      details:
        'Sat Jul 4 · 9:50 AM – 12:31 PM (local) · Dallas/Fort Worth → Charlotte Douglas. ' +
        'Then ~2 hr 59 min layover in CLT. Reservation confirmation stored privately.',
      when: '2026-07-04',
      status: 'confirmed',
    },
    {
      id: 'flight-out-2',
      kind: 'flight',
      title: 'Outbound 2 — AA 2212 · CLT → MYR',
      details:
        'Sat Jul 4 · 3:30 PM – 4:32 PM (local) · Charlotte → Myrtle Beach. ' +
        'Short hop after the layover — the "she is already tired" leg.',
      when: '2026-07-04',
      status: 'confirmed',
    },
    {
      id: 'flight-return',
      kind: 'flight',
      title: 'Return — AA 4024 · MYR → DFW',
      details:
        'Tue Jul 7 · 5:33 AM – 8:45 AM (local) · Myrtle Beach → Dallas/Fort Worth. ' +
        'Pre-dawn departure: treat Jul 6 night as a travel-prep night. Aim to be at MYR by ~4:00 AM.',
      when: '2026-07-07',
      status: 'confirmed',
    },
    {
      id: 'stay-pending',
      kind: 'stay',
      title: 'Airbnb — Myrtle Beach (pending)',
      details:
        'Listing, exact address, check-in/out, and cost pending. Exact address kept private (group chat only) once known.',
      when: '2026-07-04',
      status: 'needs-confirmation',
    },
    {
      id: 'ground-transport',
      kind: 'car',
      title: 'Ground transport in Myrtle Beach (TBD)',
      details:
        'Rental car vs rideshare not yet decided. Either way you need an infant car seat on the destination side — ' +
        'plan to counter-check your own car seat in a padded travel bag rather than rely on a rideshare seat.',
      when: '2026-07-04',
      status: 'needs-confirmation',
    },
  ],

  itinerary: [
    {
      date: '2026-07-04',
      title: 'Travel day — DFW → CLT → MYR',
      items: [
        {
          time: '~7:20 AM',
          title: 'Arrive at DFW',
          notes:
            'Target ~2.5 hr before a 9:50 AM departure with a toddler + car seat/stroller. ' +
            'Tell TSA at the start of screening about toddler liquids (pouches, milk, water) and separate them for inspection.',
        },
        {
          time: '9:50 AM',
          title: 'AA 1857 · DFW → CLT (lands 12:31 PM)',
          notes:
            'The "get settled" flight. Diaper change + let her walk before boarding. ' +
            'Straw cup or pouch at takeoff for ear pressure. First ~20 min: snacks. Then rotate toys every 10–15 min. ' +
            'Hold the tablet for the second half unless she is already melting down.',
        },
        {
          time: '12:31 – 3:30 PM',
          title: 'CLT layover (~3 hrs) — movement reset',
          address: 'Charlotte Douglas International (CLT)',
          notes:
            'Mission is to reset her body, not sit quietly: real food, diaper change, walking, let her climb where safe, ' +
            'refill water, repack the diaper bag, check the next gate. Do NOT spend the whole layover parked at the gate.',
        },
        {
          time: '3:30 PM',
          title: 'AA 2212 · CLT → MYR (lands 4:32 PM)',
          notes:
            'Short but emotionally harder — survival mode. Highest-value items: favorite snack, suction/window toy, ' +
            'stickers, downloaded show if needed, soft blanket/pacifier if she naps.',
        },
        {
          time: '~4:45 PM',
          title: 'Collect gate-checked stroller + counter-checked car seat',
          notes: 'Grab the stroller at the jet bridge; pick up the car seat at baggage claim. Add an AirTag if you have one.',
        },
        {
          title: 'Head to the Airbnb · low-key dinner',
          address: 'Airbnb address shared privately with the group',
          notes: 'Grocery/essentials run if needed. Early night — long travel day for everyone.',
        },
      ],
    },
    {
      date: '2026-07-05',
      title: 'Beach day',
      items: [
        { title: 'Slow morning at the Airbnb', notes: 'Let everyone reset after travel day.' },
        { title: 'Beach + pool', notes: 'Beach shade/tent, swim diapers, baby sunscreen, hats. Work around Tatum’s nap window.' },
        { title: 'Easy dinner', notes: 'Keep it simple — toddler-friendly and close.' },
      ],
    },
    {
      date: '2026-07-06',
      title: 'Beach day + pre-departure prep',
      items: [
        { title: 'Beach or boardwalk in the morning', notes: 'Best energy window for Tatum is early.' },
        {
          title: 'Treat tonight as a travel-prep night (not a normal vacation night)',
          notes:
            'Return flight is 5:33 AM. Pack every bag, lay out travel clothes, pre-pack breakfast/snacks, confirm ' +
            'car seat/stroller plan, charge devices, download shows, put documents in one pouch, set multiple alarms. ' +
            'See the "Day before the 5:33 AM return" checklist + copy block.',
        },
      ],
    },
    {
      date: '2026-07-07',
      title: 'Pre-dawn departure — MYR → DFW',
      items: [
        { time: '~3:00 AM', title: 'Wake + final pack-out', notes: 'Everything should already be packed from the night before. Goal: no panic.' },
        { time: '~4:00 AM', title: 'Arrive at MYR', notes: 'Earlier if checking the car seat. Counter-check car seat, gate-check stroller.' },
        { time: '5:33 AM', title: 'AA 4024 · MYR → DFW (lands 8:45 AM)', notes: 'Protect sleep, simplify everything. Pouch/straw cup at takeoff.' },
        { time: '8:45 AM', title: 'Land at DFW', notes: 'Home.' },
      ],
    },
  ],

  thingsToDo: [
    { id: 'td-beach', name: 'The beach (right there)', category: 'Beach', notes: 'The main event. Shade, swim diapers, baby sunscreen, nap timing.' },
    { id: 'td-boardwalk', name: 'Myrtle Beach Boardwalk & Promenade', category: 'Sightseeing', notes: 'Stroller-friendly oceanfront walk. Confirm current hours/parking before going.' },
    { id: 'td-state-park', name: 'Myrtle Beach State Park', category: 'Family', notes: 'Calmer, less crowded beach + shade. Confirm entrance fee/hours.' },
    { id: 'td-aquarium', name: 'Ripley’s Aquarium of Myrtle Beach', category: 'Family', notes: 'Good toddler + rainy-day option. Confirm current hours/prices/tickets.' },
    { id: 'td-broadway', name: 'Broadway at the Beach', category: 'Family', notes: 'Walkable shops/food; some toddler-friendly stops. Confirm hours before going.' },
  ],

  people: [
    { id: 'p-toni', name: 'Toni Montez', role: 'Organizer' },
    { id: 'p-morgan', name: 'Morgan Montez', role: 'Wife' },
    { id: 'p-tatum', name: 'Tatum Montez', role: 'Daughter · 18 months · lap infant' },
  ],

  contacts: [
    { id: 'c-emerg', label: 'Emergency (US)', value: '911', kind: 'phone' },
    { id: 'c-aa', label: 'American Airlines', value: 'https://www.aa.com/', kind: 'url', notes: 'App for boarding passes; reservation confirmation stored privately.' },
    { id: 'c-aa-children', label: 'AA — traveling with children', value: 'https://www.aa.com/i18n/travel-info/special-assistance/traveling-children.jsp', kind: 'url', notes: 'Lap-infant, stroller, and car seat rules.' },
    { id: 'c-tsa-kids', label: 'TSA — traveling with children', value: 'https://www.tsa.gov/travel/tsa-cares/traveling-children', kind: 'url', notes: 'Toddler liquids/food rules — declare and separate at screening.' },
    { id: 'c-myr', label: 'Myrtle Beach International Airport (MYR)', value: 'https://www.flymyrtlebeach.com/', kind: 'url' },
    { id: 'c-host', label: 'Airbnb host', value: 'Pending — store privately once booked', kind: 'text' },
  ],

  checklist: [
    // Documents
    { id: 'ck-doc-1', title: 'Bring Tatum’s proof of age (birth certificate copy)', category: 'Documents', done: false, notes: 'AA may ask for proof of age for children under 18. Bring a copy or original to avoid friction.' },
    { id: 'ck-doc-2', title: 'Adult photo IDs', category: 'Documents', done: false },
    { id: 'ck-doc-3', title: 'Boarding passes downloaded in AA app', category: 'Documents', done: false },
    { id: 'ck-doc-4', title: 'Reservation confirmation saved privately', category: 'Documents', done: false, notes: 'Keep the PNR out of the public planner.' },

    // Flights
    { id: 'ck-fl-1', title: 'Confirm Tatum is on the reservation as a lap infant', category: 'Flights', done: false, notes: 'AA: only one lap infant per ticketed adult, and the infant must be on the reservation.' },
    { id: 'ck-fl-2', title: 'Select seats so the three of you sit together', category: 'Flights', done: false, notes: 'Watch for Basic Economy seat-assignment limits on this fare.' },
    { id: 'ck-fl-3', title: 'Check baggage + carry-on allowance', category: 'Flights', done: false },
    { id: 'ck-fl-4', title: 'Decide: car seat onboard vs gate/counter check', category: 'Flights', done: false, notes: 'FAA recommends an approved car seat in her own seat for under-2; if used onboard it needs the aircraft-approval label.' },

    // Gear
    { id: 'ck-gear-1', title: 'Travel stroller (gate-check)', category: 'Gear', done: false },
    { id: 'ck-gear-2', title: 'Car seat + padded car seat travel bag (counter-check)', category: 'Gear', done: false, notes: 'AA: 1 stroller + 1 car seat free. Counter-check the car seat unless using it onboard.' },
    { id: 'ck-gear-3', title: 'AirTag in the checked car seat bag', category: 'Gear', done: false },
    { id: 'ck-gear-4', title: 'Diaper backpack', category: 'Gear', done: false },

    // Diapering
    { id: 'ck-dia-1', title: 'Diapers + wipes + changing pad', category: 'Diapering', done: false },
    { id: 'ck-dia-2', title: 'Diaper cream + wet bag', category: 'Diapering', done: false },
    { id: 'ck-dia-3', title: 'Change of clothes for Tatum + a shirt for each parent', category: 'Diapering', done: false },

    // Food
    { id: 'ck-food-1', title: 'Snacks split into several small bags (not one big bag)', category: 'Food', done: false, notes: 'A "new" snack every 20–30 min works better than the whole stash at once.' },
    { id: 'ck-food-2', title: 'Pouches, leak-proof straw cup, toddler water bottle', category: 'Food', done: false },
    { id: 'ck-food-3', title: 'Empty adult water bottles (fill past security)', category: 'Food', done: false },
    { id: 'ck-food-4', title: 'Tell TSA about toddler liquids/food at screening', category: 'Food', done: false, notes: 'Pouches, milk, water can exceed 3.4 oz — declare and separate them.' },

    // Entertainment
    { id: 'ck-ent-1', title: 'Plane toy kit packed', category: 'Entertainment', done: false, notes: 'Suction spinners, puffy stickers, reusable sticker book, Water Wow, pop-it, buckle toy, board books, busy book, animal figurines, painter’s tape, toy safety straps.' },
    { id: 'ck-ent-2', title: '1–2 brand-new toys she has never seen', category: 'Entertainment', done: false },
    { id: 'ck-ent-3', title: 'Shows downloaded on tablet/phone (save for second half)', category: 'Entertainment', done: false },

    // Sleep & medical
    { id: 'ck-med-1', title: 'Small blanket / sleep sack + pacifier', category: 'Sleep & medical', done: false },
    { id: 'ck-med-2', title: 'Children’s Tylenol/Motrin (if pediatrician-approved)', category: 'Sleep & medical', done: false },
    { id: 'ck-med-3', title: 'Hand sanitizer + disinfectant wipes', category: 'Sleep & medical', done: false },
    { id: 'ck-med-4', title: 'NO lollipops for takeoff/landing — choking risk', category: 'Sleep & medical', done: true, notes: 'Use a straw cup, pouch, pacifier, sippy cup, applesauce pouch, teether, or soft snack instead.' },

    // Day before the 5:33 AM return (Jul 6 night)
    { id: 'ck-db-1', title: 'Pack every bag the night before', category: 'Day before return', done: false },
    { id: 'ck-db-2', title: 'Lay out travel clothes for everyone', category: 'Day before return', done: false },
    { id: 'ck-db-3', title: 'Pre-pack breakfast + snacks', category: 'Day before return', done: false },
    { id: 'ck-db-4', title: 'Charge all devices + download shows', category: 'Day before return', done: false },
    { id: 'ck-db-5', title: 'Documents in one pouch', category: 'Day before return', done: false },
    { id: 'ck-db-6', title: 'Set multiple alarms (~3:00 AM)', category: 'Day before return', done: false },
    { id: 'ck-db-7', title: 'Confirm car seat/stroller plan + airport arrival ~4:00 AM', category: 'Day before return', done: false },

    // Home
    { id: 'ck-home-1', title: 'Dog/house care arranged for Jul 4–7', category: 'Home', done: false },
  ],

  packing: [
    { id: 'pk-stroller', title: 'Travel stroller', category: 'Baby gear', assignedTo: 'Tatum' },
    { id: 'pk-carseat', title: 'Car seat + padded travel bag', category: 'Baby gear', assignedTo: 'Tatum' },
    { id: 'pk-diaperbag', title: 'Diaper backpack', category: 'Baby gear' },
    { id: 'pk-diapers', title: 'Diapers + wipes + changing pad', category: 'Diapering', assignedTo: 'Tatum' },
    { id: 'pk-cream', title: 'Diaper cream + wet bags', category: 'Diapering' },
    { id: 'pk-tatum-clothes', title: 'Change of clothes for Tatum', category: 'Clothes', assignedTo: 'Tatum' },
    { id: 'pk-parent-shirts', title: 'Spare shirt for each parent', category: 'Clothes' },
    { id: 'pk-swim', title: 'Swim diapers, baby sunscreen, hats', category: 'Beach / Pool', assignedTo: 'Tatum' },
    { id: 'pk-shade', title: 'Beach shade / tent', category: 'Beach / Pool' },
    { id: 'pk-cup', title: 'Leak-proof straw cup + toddler water bottle', category: 'Food', assignedTo: 'Tatum' },
    { id: 'pk-snacks', title: 'Snacks in several small bags + pouches', category: 'Food', notes: 'Puffs, Cheerios, yogurt melts, crackers, applesauce pouches, cut fruit, cheese sticks (keep cool).' },
    { id: 'pk-bottles', title: 'Empty adult water bottles', category: 'Food' },
    { id: 'pk-toys', title: 'Plane toy kit + 1–2 brand-new toys', category: 'Entertainment', assignedTo: 'Tatum' },
    { id: 'pk-tablet', title: 'Tablet with downloaded shows + headphones', category: 'Entertainment' },
    { id: 'pk-blanket', title: 'Small blanket / sleep sack + pacifier', category: 'Sleep' },
    { id: 'pk-meds', title: 'Children’s Tylenol/Motrin + sanitizer + wipes', category: 'Medical' },
    { id: 'pk-docs', title: 'IDs, boarding passes, Tatum proof of age', category: 'Documents' },
    { id: 'pk-chargers', title: 'Chargers + portable battery', category: 'Tech' },
    { id: 'pk-bags', title: 'Plastic / wet bags', category: 'Parent backup' },
    { id: 'pk-airtag', title: 'AirTag for the car seat bag', category: 'Parent backup' },
  ],

  copyBlocks: [
    {
      id: 'cb-tips',
      title: 'Smart tips — traveling with an 18-month-old',
      body:
        'Traveling with a toddler is less about one perfect trick and more about reducing friction. Plan around the ' +
        'hardest moments: security, boarding, takeoff, layovers, diaper changes, and sleep disruption. Build the day in ' +
        'short blocks — food, movement, toy rotation, diaper reset, sleep attempt, emergency screen time. The goal is not ' +
        'a perfect flight; it is enough structure that the rough parts do not surprise you.',
    },
    {
      id: 'cb-flights',
      title: 'Flight-by-flight plan',
      body:
        'OUT Sat Jul 4: AA 1857 DFW→CLT 9:50a–12:31p (be at DFW ~7:20a) → ~3 hr CLT layover (movement reset) → ' +
        'AA 2212 CLT→MYR 3:30p–4:32p (survival mode).\n' +
        'RETURN Tue Jul 7: AA 4024 MYR→DFW 5:33a–8:45a (be at MYR ~4:00a). Gate-check stroller, counter-check car seat. ' +
        'Pouch/straw cup at every takeoff and landing.',
    },
    {
      id: 'cb-daybefore',
      title: 'Day before the 5:33 AM return (Jul 6 night)',
      body:
        'Pack every bag. Lay out travel clothes. Pre-pack breakfast + snacks. Charge devices + download shows. ' +
        'Documents in one pouch. Confirm car seat/stroller plan. Set multiple alarms (~3:00a). Arrive MYR ~4:00a.',
    },
    {
      id: 'cb-risks',
      title: 'Risk flags for this trip',
      body:
        'Early 5:33a return from MYR · connection with a toddler (DFW→CLT→MYR) · car seat/stroller logistics · ' +
        'possible Basic Economy seat limits · ear pressure at takeoff/landing · TSA screening of toddler liquids/food.',
    },
  ],

  budget: [
    { id: 'b-flights', name: 'Flights (AA — already booked)', total: 0, splitCount: 2, status: 'tbd', notes: 'Enter the actual fare once handy. Confirmation stored privately.' },
    { id: 'b-stay', name: 'Airbnb (pending)', total: 0, splitCount: 2, status: 'tbd', notes: 'Add total once the Airbnb is confirmed.' },
    { id: 'b-transport', name: 'Ground transport in MYR (estimate)', total: 0, splitCount: 2, status: 'tbd', notes: 'Rental car vs rideshare TBD.' },
    { id: 'b-groceries', name: 'Groceries / food (estimate)', total: 200, splitCount: 2, status: 'estimate', notes: 'Placeholder — tune once meals are planned.' },
  ],
}
