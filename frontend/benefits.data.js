// Preview-only mother data until benefits progress is supplied by the backend.
window.AamaBenefitsMock = {
  mother: {
    name: 'Sita K.',
    pregnancyWeek: 24,
    dueDate: '2027-03-15',
    district: 'Lalitpur',
    region: 'Hill',
    regionNeedsVerification: true,
  },
  checkups: [
    { month: 4, status: 'done', date: '2026-07-15' },
    { month: 6, status: 'upcoming', date: '2026-12-03', time: '10:30 AM' },
    { month: 8, status: 'locked', date: '' },
    { month: 9, status: 'locked', date: '' },
  ],
  delivery: { status: 'not-started' },
  postnatal: { status: 'not-started' },
};
