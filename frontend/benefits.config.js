// Programme rules and amounts live here so they can be updated in one place.
// References: DoHS Annual Report 2075/76 (Aama provisions, including FY 2018/19
// doubled incentives): https://elibrary.nhrc.gov.np/bitstream/20.500.14356/2826/1/75_76.pdf
// NHSSP, Review of Aama Surakshya Programme in Nepal (Jan 2020), Table 1:
// https://www.nhssp.org.np/Resources/PPFM/Review%20of%20Aama%20Surakshya%20Programme%20in%20Nepal%20-%20January%202020.pdf
// Current cross-check: https://english.khabaree.com/health/2026/09/15/despite-mother-s-safety-program-women-forced-to-deliver-at-hospital-gates-and-roadsides.html
// The MoHP programme page has older rates; this config follows the amounts
// documented after the FY 2018/19 budget increase. Confirm local implementation.
window.AamaBenefitsConfig = {
  lastReviewed: '2026-11-27',
  checkupSupport: {
    amountNpr: 800,
    visitMonths: [4, 6, 8, 9],
    title: 'Antenatal checkups',
    paymentNote: 'Complete every protocol visit and present your ANC card; the programme also links support to facility delivery and postnatal care.',
  },
  travelSupport: [
    { region: 'Mountain', amountNpr: 3000 },
    { region: 'Hill', amountNpr: 2000 },
    { region: 'Tarai', amountNpr: 1000 },
  ],
  deliveryCare: {
    free: true,
    types: ['Normal delivery', 'Complicated delivery', 'C-section'],
    facilities: ['Government facility', 'Enrolled community or private facility'],
    title: 'Free delivery care',
    description: 'Care is free for these delivery types at eligible facilities.',
  },
  newbornCare: {
    free: true,
    title: 'Care for your newborn',
    description: 'Free basic care for sick newborns',
  },
  eligibility: {
    citizenship: 'Nepali citizens',
    proof: 'Nepali citizenship card',
  },
  claimSteps: [
    'Carry your Nepali citizenship card.',
    'Bring your ANC card and ask staff to record each visit.',
    'Deliver at a government or enrolled community/private facility.',
    'Ask facility staff about the Aama programme at delivery.',
  ],
};
