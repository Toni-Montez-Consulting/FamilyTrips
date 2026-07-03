import type { Trip } from '../../types/trip'

const heroImage = new URL('../../assets/hero.png', import.meta.url).href

// Myrtle Beach, July 4–7, 2026. Toni + Morgan + Tatum + the Goodwins.
// UNLISTED (deliberate): reachable via the /myrtle-beach direct link Toni texts family,
// but OFF the public /trips index and not auto-featured on the home page. Chosen because
// the door/pool codes, address, and full family roster are intentionally shown in-app
// (link-shared with family only) — so keep it off the public browse surfaces.
// Note: those codes/address are owner-approved public via the privacy-scan allowlist.
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
    address: '704 S Ocean Blvd, Myrtle Beach, SC',
    checkIn: 'July 4, 2026 · self check-in from 4:00 PM',
    checkOut: 'July 7, 2026 · time per guidebook',
    amenities: ['6 bedrooms — fits the full group', 'Pool access', 'No pets', 'No smoking'],
    notes:
      'Self check-in opens at 4:00 PM on Jul 4 — the keypad will not work before then, so do not arrive early. ' +
      'When you get there, go straight up to the unit.\n\n' +
      'Door code: 4485# (enter the digits, then press # to unlock, then turn the handle). The code activates at 4:00 PM.\n' +
      'Pool code: 2012#.\n\n' +
      'Flight reservation confirmation is stored privately.',
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
      title: 'Myrtle Beach Villas 302 A (booked)',
      details:
        '6-bedroom condo. Self check-in from 4:00 PM. Full address and entry details are on the Stay tab above.',
      when: '2026-07-04',
      status: 'confirmed',
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
          title: 'Head to the condo · low-key dinner',
          address: '704 S Ocean Blvd, Myrtle Beach, SC',
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
    { id: 'p-toni', name: 'Toni Montez', role: 'Organizer', household_id: 'hh-montez', rsvp: 'going' },
    { id: 'p-morgan', name: 'Morgan Montez', role: 'Wife', household_id: 'hh-montez', rsvp: 'going' },
    { id: 'p-tatum', name: 'Tatum Montez', role: 'Daughter · 18 months · lap infant', household_id: 'hh-montez', rsvp: 'going' },
    { id: 'p-mark', name: 'Mark Goodwin', role: 'Father-in-law', household_id: 'hh-grandparents', rsvp: 'going' },
    { id: 'p-laura', name: 'Laura Goodwin', role: 'Mother-in-law', household_id: 'hh-grandparents', rsvp: 'going' },
    { id: 'p-madison', name: 'Madison Goodwin', role: 'Brother-in-law', household_id: 'hh-madison', rsvp: 'going' },
    { id: 'p-kaitlyn', name: 'Kaitlyn Goodwin', role: 'Sister-in-law', household_id: 'hh-madison', rsvp: 'going' },
    { id: 'p-makayla', name: 'Makayla Goodwin', role: 'Sister-in-law', household_id: 'hh-makayla', rsvp: 'going' },
    { id: 'p-courtney', name: 'Courtney', role: "Makayla's partner", household_id: 'hh-makayla', rsvp: 'going' },
  ],

  households: [
    {
      id: 'hh-montez',
      name: 'The Montez family',
      primaryContactPersonId: 'p-toni',
      notes: 'Flying in from DFW. Tatum is 18 months and this is her first flight.',
    },
    {
      id: 'hh-grandparents',
      name: 'Mark & Laura Goodwin',
      primaryContactPersonId: 'p-mark',
      notes: 'Grandma and Grandpa.',
    },
    {
      id: 'hh-madison',
      name: "Madison & Kaitlyn's family",
      primaryContactPersonId: 'p-madison',
      expectedCount: 2,
      notes: 'Plus their two boys.',
    },
    {
      id: 'hh-makayla',
      name: "Makayla & Courtney's family",
      primaryContactPersonId: 'p-makayla',
      expectedCount: 1,
      notes: 'Plus their daughter.',
    },
    {
      id: 'hh-kids',
      name: 'Nieces & nephews',
      expectedCount: 3,
      notes: 'One girl and two boys joining the group.',
    },
  ],

  travelPlan: [
    {
      id: 'outbound',
      label: 'Outbound',
      date: '2026-07-04',
      route: 'DFW → CLT → MYR',
      beforeYouLeave: [
        { id: 'tl-out-bags', text: 'All bags by the door: 2 checked + 3 personal + car seat in its bag (AirTag on)' },
        { id: 'tl-out-dogs', text: 'Dog food portioned + feeding note out for the neighbors' },
        { id: 'tl-out-diaper', text: 'Diaper bag + plane snacks stocked; movies downloaded' },
        { id: 'tl-out-docs', text: "IDs + a copy of Tatum's proof of age in the diaper bag" },
        { id: 'tl-out-clothes', text: 'Morning travel clothes laid out; car already gassed up' },
        { id: 'tl-out-lights', text: 'On the way out: lights off, thermostat set, doors locked' },
        { id: 'tl-out-keys', text: 'Toni: keys + wallet + backpack (laptop, blankets)' },
        { id: 'tl-out-morgan', text: 'Morgan: keys + purse + diaper bag' },
      ],
      runOfShow: [
        { time: '6:00 AM', title: 'Tatum up, fed, changed, dressed', detail: 'Toni + Morgan get ready.' },
        { time: '6:40 AM', title: 'Leave the house', detail: 'Final sweep: lights off, doors locked, keys / wallet / purse.' },
        { time: '~7:40 AM', title: 'Arrive DFW — Terminal A', detail: 'Drop Morgan + Tatum + bags curbside (departures). Unclip the car seat and bag it.' },
        { title: 'Curbside check-in', detail: 'American skycaps at Terminal A positions A20 / A29 (open 6 AM–1 PM). Check the 2 bags + the car seat (car seats fly free) and get boarding passes. About $4/bag service fee + a couple bucks tip.' },
        { title: 'Park + walk back', detail: 'Toni parks in the Terminal A garage (covered, skybridge to departures, ~$27/day) and walks back to meet Morgan.' },
        { title: 'Security — standard line', detail: 'No PreCheck this trip. Both IDs + Tatum’s proof of age out. Milk/water for Tatum is allowed over 3.4 oz — declare and separate at screening.' },
        { title: 'Gate A34', detail: 'Group 5. Walk Tatum around to burn energy before boarding, not at the gate.' },
        { time: '9:10 AM', title: 'Board (Group 5)', detail: 'Seats 35A / 35B, Tatum as a lap infant.' },
        { time: '9:50 AM', title: 'AA 1857 · DFW → CLT', detail: '2h 41m. Cup or pacifier on takeoff AND landing for her ears. Movies if she’s agreeable — save the tablet for the back half.' },
        { time: '~12:31 PM', title: 'CLT layover (~3 hr)', detail: 'This is your friend: diaper change, real food, let her crawl and walk to tire out, repack the diaper bag.' },
        { time: '3:30 PM', title: 'AA 2212 · CLT → MYR', detail: '~1 hr. Short hop, survival mode. Cup/paci again for the ears.' },
        { time: '~4:32 PM', title: 'Land at MYR', detail: 'Collect the checked car seat + bags. Morgan’s family picks you up and drives to the condo (self check-in from 4 PM).' },
      ],
      carrying: [
        'Morgan: diaper bag + purse',
        'Toni: backpack (laptop, blankets, essentials)',
        '3 personal bags in the cabin',
        'Checked: 2 bags + the car seat (in its bag)',
      ],
      note: 'No stroller this trip. Family picks you up at MYR — no rental car needed.',
    },
    {
      id: 'return',
      label: 'Return',
      date: '2026-07-07',
      route: 'MYR → DFW',
      beforeYouLeave: [
        { id: 'tl-ret-repack', text: 'Jul 6 night: repack everything; travel clothes laid out; pre-pack breakfast + snacks' },
        { id: 'tl-ret-charge', text: 'Jul 6 night: charge devices + download shows; car seat back in its bag (AirTag on)' },
        { id: 'tl-ret-docs', text: 'Documents in one pouch: IDs + Tatum’s proof of age' },
        { id: 'tl-ret-pickup', text: 'Confirm the family drop-off time; set multiple alarms (~3:00 AM)' },
        { id: 'tl-ret-sweep', text: 'Morning: final condo sweep — nothing left behind, trash out, lock up per the guidebook' },
      ],
      runOfShow: [
        { time: '~3:00 AM', title: 'Up, Tatum fed + changed, everyone dressed', detail: 'The 5:33 AM departure is the hard one — treat Jul 6 night as a travel-prep night.' },
        { time: '~3:45 AM', title: 'Family drives you to MYR', detail: 'Aim to be at the airport by ~4:00 AM so it’s calm, not a scramble. (Uber as a backup if needed.)' },
        { time: '~4:00 AM', title: 'Check in at MYR', detail: 'MYR is small — one terminal. Curbside/counter-check the 2 bags + car seat and get boarding passes.' },
        { title: 'Security — standard line', detail: 'IDs + proof of age out. Your gate is posted at check-in (small airport, short walk).' },
        { time: '5:33 AM', title: 'AA 4024 · MYR → DFW', detail: 'Arrives DFW 8:45 AM. Cup/paci for the ears; she may sleep this early leg.' },
        { time: '~8:45 AM', title: 'Land at DFW', detail: 'Collect the car seat + bags. Your car is in the Terminal A garage — take the Skylink if you land at another terminal. Drive home.' },
      ],
      carrying: [
        'Morgan: diaper bag + purse',
        'Toni: backpack',
        'Checked: 2 bags + the car seat',
      ],
      note: 'No stroller. Family drops you at MYR — no rental car.',
    },
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

  // Toni + Morgan's usual family packing list (their template), grouped the way
  // they think about it. Flight-specific prep (car seat, stroller, plane toys,
  // proof of age, ear-relief) lives on the Checklist tab, not here.
  packing: [
    // Tatum
    { id: 'pk-t-outfits', title: 'Outfits', category: 'Tatum: Clothes' },
    { id: 'pk-t-sleepers', title: 'Sleepers', category: 'Tatum: Clothes' },
    { id: 'pk-t-sleepsacks', title: 'Sleep sacks', category: 'Tatum: Clothes' },
    { id: 'pk-t-hats', title: 'Hats', category: 'Tatum: Clothes' },
    { id: 'pk-t-bows', title: 'Bows', category: 'Tatum: Clothes' },
    { id: 'pk-t-socks', title: 'Socks', category: 'Tatum: Clothes' },
    { id: 'pk-t-sunscreen', title: 'Sunscreen', category: 'Tatum: Clothes' },

    { id: 'pk-t-soap', title: 'Bath soap', category: 'Tatum: Bath' },
    { id: 'pk-t-lotion', title: 'Lotion', category: 'Tatum: Bath' },
    { id: 'pk-t-curlcream', title: 'Curl cream', category: 'Tatum: Bath' },
    { id: 'pk-t-spray', title: 'Spray bottle', category: 'Tatum: Bath' },

    { id: 'pk-t-cups', title: 'Straw cups', category: 'Tatum: Kitchen' },
    { id: 'pk-t-chairseat', title: 'Chair seat', category: 'Tatum: Kitchen' },

    { id: 'pk-t-monitor', title: 'Baby monitor on stand', category: 'Tatum: Bedroom' },
    { id: 'pk-t-packnplay', title: 'Pack n play', category: 'Tatum: Bedroom' },
    { id: 'pk-t-soundmachine', title: 'Sound machine', category: 'Tatum: Bedroom' },
    { id: 'pk-t-sleepsack-bed', title: 'Sleep sack', category: 'Tatum: Bedroom' },

    { id: 'pk-t-toys', title: 'Toys', category: 'Tatum: Misc' },
    { id: 'pk-t-books', title: 'Books', category: 'Tatum: Misc' },

    { id: 'pk-t-charger', title: 'Long charger', category: 'Tatum: Main room' },
    { id: 'pk-t-diapers-bag', title: 'Diapers for diaper bag', category: 'Tatum: Main room' },
    { id: 'pk-t-wipes', title: 'Wipes', category: 'Tatum: Main room' },
    { id: 'pk-t-buttcream', title: 'Extra butt creams', category: 'Tatum: Main room' },
    { id: 'pk-t-blankets', title: 'Blankets', category: 'Tatum: Main room' },
    { id: 'pk-t-diaperbag', title: 'Diaper bag', category: 'Tatum: Main room' },

    // Harlow & Scout (the dogs)
    { id: 'pk-d-food', title: 'Dog food', category: 'Harlow & Scout' },
    { id: 'pk-d-bowls', title: 'Dog bowls (food and water)', category: 'Harlow & Scout' },
    { id: 'pk-d-harness', title: 'Back seat harness set up', category: 'Harlow & Scout' },
    { id: 'pk-d-water', title: 'Waters for the road', category: 'Harlow & Scout' },
    { id: 'pk-d-leashes', title: 'Leashes', category: 'Harlow & Scout' },

    // Mommy & Daddy
    { id: 'pk-p-airpods', title: 'AirPods', category: 'Mommy & Daddy' },
    { id: 'pk-p-wallet', title: 'Wallet', category: 'Mommy & Daddy' },
    { id: 'pk-p-rainjacket', title: 'Rain jacket', category: 'Mommy & Daddy' },
    { id: 'pk-p-shampoo', title: 'Shampoo & conditioner', category: 'Mommy & Daddy' },
    { id: 'pk-p-bodywash', title: 'Body wash', category: 'Mommy & Daddy' },
    { id: 'pk-p-leavein', title: 'Leave-in cream', category: 'Mommy & Daddy' },
    { id: 'pk-p-hairspray', title: 'Hairspray', category: 'Mommy & Daddy' },
    { id: 'pk-p-makeup', title: 'Makeup', category: 'Mommy & Daddy' },
    { id: 'pk-p-straightener', title: 'Straightener', category: 'Mommy & Daddy' },
    { id: 'pk-p-clothes', title: 'Clothes', category: 'Mommy & Daddy' },
    { id: 'pk-p-amtbag', title: 'AMT bag', category: 'Mommy & Daddy' },
    { id: 'pk-p-underwear', title: 'Underwear', category: 'Mommy & Daddy' },
    { id: 'pk-p-socks', title: 'Socks / thick socks', category: 'Mommy & Daddy' },
    { id: 'pk-p-workoutclothes', title: 'Workout clothes (4 pairs)', category: 'Mommy & Daddy' },
    { id: 'pk-p-creatine', title: 'Creatine', category: 'Mommy & Daddy' },
    { id: 'pk-p-protein', title: 'Protein powder', category: 'Mommy & Daddy' },
    { id: 'pk-p-lmnt', title: 'LMNT', category: 'Mommy & Daddy' },
    { id: 'pk-p-headphones', title: 'Headphones (both pairs)', category: 'Mommy & Daddy' },
    { id: 'pk-p-laptop', title: 'Laptop', category: 'Mommy & Daddy' },
    { id: 'pk-p-backpack', title: 'Backpack', category: 'Mommy & Daddy' },
    { id: 'pk-p-casualclothes', title: 'Casual clothes', category: 'Mommy & Daddy' },
    { id: 'pk-p-bizcasual', title: 'Two pairs of biz casual clothes', category: 'Mommy & Daddy' },
    { id: 'pk-p-workoutshoes', title: 'Workout shoes (one pair)', category: 'Mommy & Daddy' },
    { id: 'pk-p-casualshoes', title: 'Casual shoes', category: 'Mommy & Daddy' },
    { id: 'pk-p-casualshirts', title: 'Casual shirts', category: 'Mommy & Daddy' },
    { id: 'pk-p-casualshorts', title: 'Casual shorts', category: 'Mommy & Daddy' },
    { id: 'pk-p-fabletics', title: 'Fabletics pants', category: 'Mommy & Daddy' },
    { id: 'pk-p-amthoodie', title: 'AMT hoodie', category: 'Mommy & Daddy' },
    { id: 'pk-p-keys', title: 'Keys', category: 'Mommy & Daddy' },
    { id: 'pk-p-purse', title: 'Purse', category: 'Mommy & Daddy' },
    { id: 'pk-p-journal', title: 'Journal / books', category: 'Mommy & Daddy' },
    { id: 'pk-p-psorite', title: 'Pso-Rite', category: 'Mommy & Daddy' },
    { id: 'pk-p-towels', title: 'Extra workout towels', category: 'Mommy & Daddy' },
    { id: 'pk-p-razor', title: 'Razor', category: 'Mommy & Daddy' },
    { id: 'pk-p-toothbrush', title: 'Toothbrush', category: 'Mommy & Daddy' },
    { id: 'pk-p-toothpaste', title: 'Toothpaste', category: 'Mommy & Daddy' },
    { id: 'pk-p-comb', title: 'Comb', category: 'Mommy & Daddy' },
    { id: 'pk-p-brush', title: 'Brush', category: 'Mommy & Daddy' },
    { id: 'pk-p-floss', title: 'Floss picks', category: 'Mommy & Daddy' },
    { id: 'pk-p-allergy', title: 'Allergy medicine', category: 'Mommy & Daddy' },
    { id: 'pk-p-trashbags', title: 'Trash bags for dirty clothes', category: 'Mommy & Daddy' },
    { id: 'pk-p-curllala', title: 'Curl La La', category: 'Mommy & Daddy' },
    { id: 'pk-p-trintmeds', title: 'Trint meds', category: 'Mommy & Daddy' },

    // Kept from the 302A guidebook: the condo stocks the basics only, so bring these.
    { id: 'pk-302a-coffee', title: 'Coffee + filters (maker is there, coffee is not)', category: 'Condo 302A (bring these)' },
    { id: 'pk-302a-detergent', title: 'Laundry detergent (in-unit washer/dryer)', category: 'Condo 302A (bring these)' },
    { id: 'pk-302a-paper', title: 'Extra toilet paper + paper towels (one-time starter only)', category: 'Condo 302A (bring these)' },
    { id: 'pk-302a-trashbags', title: 'Extra trash bags, Ziplocs, food containers', category: 'Condo 302A (bring these)' },
    { id: 'pk-302a-beachgear', title: 'Beach towels, chairs, and beach toys (none provided)', category: 'Condo 302A (bring these)' },
    { id: 'pk-302a-sunscreen', title: 'Sunscreen for the grown-ups', category: 'Condo 302A (bring these)' },
  ],

  copyBlocks: [
    {
      id: 'cb-tips',
      title: 'Tatum’s first flight — you two have got this',
      body:
        'This is Tatum’s very first time flying, and at 18 months the goal is not a perfect flight, it is a calm one. ' +
        'Toni and Morgan, the real trick is to lower your own expectations and plan around the hard moments, not the whole trip. ' +
        'Build each leg in short blocks: a snack, some movement, a toy, a diaper reset, a nap try, and screen time only when ' +
        'you truly need it. Trade off so one of you is always on and the other gets a real breather. If she melts down, it ' +
        'passes, and every parent on that plane has been exactly where you are. You are more ready than you feel.',
    },
    {
      id: 'cb-firstflight',
      title: 'What actually helps an 18-month-old on a plane',
      body:
        'Ears: give her the straw cup, a pouch, or her pacifier during takeoff AND landing. The sucking clears the pressure. ' +
        'Skip lollipops (choking risk).\n' +
        'Snacks are activities, not just food: keep them in lots of small bags and hand over a “new” one every 20–30 minutes.\n' +
        'Toys: one or two she has never seen, plus stickers and a roll of painter’s tape (weirdly the MVP). Save the tablet for ' +
        'the back half of the long DFW→CLT leg.\n' +
        'Walk her before boarding, not at the gate. Burn the energy first.\n' +
        'The ~3 hour CLT layover is your friend: real food, a diaper change, and let her crawl and walk so the short MYR hop is easier.\n' +
        'The 5:33a return is the hard one. Treat Jul 6 night like a travel-prep night and aim to be at MYR by ~4:00a so the ' +
        'morning is calm instead of a scramble. You’ve got this.',
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
    { id: 'b-stay', name: 'Condo (302A)', total: 0, splitCount: 2, status: 'tbd', notes: 'Handled separately.' },
    { id: 'b-transport', name: 'Ground transport in MYR (estimate)', total: 0, splitCount: 2, status: 'tbd', notes: 'Rental car vs rideshare TBD.' },
    { id: 'b-groceries', name: 'Groceries / food (estimate)', total: 200, splitCount: 2, status: 'estimate', notes: 'Placeholder — tune once meals are planned.' },
  ],
}
