(() => {
  const card = document.querySelector('.pregnancy-card');
  if (!card) return;

  const $ = (s) => card.querySelector(s);
  const slider = $('.week-slider');
  const kicker = $('.card-kicker');
  const dueInput = $('.due-date-input');
  const error = $('.due-date-error');
  // Keep the persisted key stable so existing due dates are retained.
  const STORAGE_KEY = 'aamacare-due-date';
  const DAY = 86400000;

  // Approximate fruit/vegetable comparisons for a friendly weekly visual.
  // They are illustrative rather than clinical measurements.
  const babySizes = {
    1:  { en: 'Too early for a size comparison', ne: 'आकार तुलना गर्न अझै चाँडो छ' },
    2:  { en: 'Too early for a size comparison', ne: 'आकार तुलना गर्न अझै चाँडो छ' },
    3:  { en: 'About a poppy seed',              ne: 'खसखसको दानाजत्रो' },
    4:  { en: 'About a poppy seed',              ne: 'खसखसको दानाजत्रो' },
    5:  { en: 'About a sesame seed',             ne: 'तिलको दानाजत्रो' },
    6:  { en: 'About a lentil',                  ne: 'मसुरोको दानाजत्रो' },
    7:  { en: 'About a blueberry',               ne: 'निलबदरीको दानाजत्रो' },
    8:  { en: 'About a raspberry',               ne: 'रास्पबेरीको दानाजत्रो' },
    9:  { en: 'About a cherry',                  ne: 'चेरीको दानाजत्रो' },
    10: { en: 'About a strawberry',              ne: 'स्ट्रबेरीको दानाजत्रो' },
    11: { en: 'About a fig',                     ne: 'अञ्जिरको दानाजत्रो' },
    12: { en: 'About a plum',                    ne: 'आलुबखडाजत्रो' },
    13: { en: 'About a lemon',                   ne: 'कागतीजत्रो' },
    14: { en: 'About a kiwi fruit',              ne: 'किवीफलजत्रो' },
    15: { en: 'About an apple',                  ne: 'स्याउजत्रो' },
    16: { en: 'About an avocado',                ne: 'एभोकाडोजत्रो' },
    17: { en: 'About a pomegranate',             ne: 'अनारजत्रो' },
    18: { en: 'About a bell pepper',             ne: 'भेडेखुर्सानीजत्रो' },
    19: { en: 'About a mango',                   ne: 'आँपजत्रो' },
    20: { en: 'About a banana',                  ne: 'केराजत्रो' },
    21: { en: 'About a carrot',                  ne: 'गाजरजत्रो' },
    22: { en: 'About a papaya',                  ne: 'मेवाजत्रो' },
    23: { en: 'About a grapefruit',              ne: 'भोगटेजत्रो' },
    24: { en: 'About an eggplant',               ne: 'भण्टाजत्रो' },
    25: { en: 'About a cauliflower',             ne: 'काउलीजत्रो' },
    26: { en: 'About a lettuce',                 ne: 'सलादको पातजत्रो' },
    27: { en: 'About a cabbage',                 ne: 'बन्दाकोभीजत्रो' },
    28: { en: 'About a coconut',                 ne: 'नरिवलजत्रो' },
    29: { en: 'About a butternut squash',        ne: 'फर्सीजत्रो' },
    30: { en: 'About a cucumber',                ne: 'काँक्रोजत्रो' },
    31: { en: 'About a coconut',                 ne: 'नरिवलजत्रो' },
    32: { en: 'About a squash',                  ne: 'फर्सीजत्रो' },
    33: { en: 'About a pineapple',               ne: 'भुइँकटहरजत्रो' },
    34: { en: 'About a cantaloupe melon',        ne: 'खरबुजाजत्रो' },
    35: { en: 'About a honeydew melon',          ne: 'पाकेको खरबुजाजत्रो' },
    36: { en: 'About a romaine lettuce',          ne: 'सलादको ठूलो पातजत्रो' },
    37: { en: 'About a bunch of leafy greens',   ne: 'सागको मुठाजत्रो' },
    38: { en: 'About a leek',                    ne: 'लिकको डाँठजत्रो' },
    39: { en: 'About a small watermelon',        ne: 'सानो तरबूजजत्रो' },
    40: { en: 'About a pumpkin',                 ne: 'फर्सीजत्रो' },
  };

  // Dates are handled as whole days to avoid timezone errors
  const toDay = (value) => Date.parse(`${value}T00:00:00Z`) / DAY;
  const toValue = (day) => new Date(day * DAY).toISOString().slice(0, 10);
  const today = () => {
    const d = new Date();
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
  };

  // Allows up to 2 weeks overdue, and up to 280 days ahead
  const isValid = (value) => {
    const diff = toDay(value) - today();
    return diff >= -14 && diff <= 280;
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValid(saved)) return saved;
    } catch (e) {}
    return card.dataset.dueDate;
  }

  let dueDate = load();

  function getActualWeek() {
    const daysPregnant = 280 - (toDay(dueDate) - today());
    return Math.min(40, Math.max(1, Math.floor(daysPregnant / 7) || 1));
  }

  function render(week) {
    const ne = /[\u0900-\u097F]/.test(kicker.textContent);
    const num = (n) => (ne ? String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]) : String(n));
    const weekText = (n) => (ne ? `हप्ता ${num(n)}` : `Week ${n}`);

    const percent = ((week - 1) / 39) * 100;
    const position = `calc(${percent}% + ${14 - percent * 0.28}px)`;
    const t = week <= 13 ? 0 : week <= 27 ? 1 : 2;
    const trimester = ne
      ? `${['पहिलो', 'दोस्रो', 'तेस्रो'][t]} त्रैमासिक`
      : `${['1st', '2nd', '3rd'][t]} trimester`;

    slider.value = week;
    slider.style.setProperty('--fill', position);
    slider.setAttribute('aria-valuetext', weekText(week));

    $('[data-week-title]').textContent = ne
      ? `${num(week)} हप्ता`
      : `${week} ${week === 1 ? 'week' : 'weeks'}`;
    $('[data-trimester]').textContent = `· ${trimester}`;
    const babySize = babySizes[week]?.[ne ? 'ne' : 'en'] || babySizes[week]?.en || '—';
    $('[data-baby-size]').textContent = babySize;

    const journeyState = {
      week,
      dueDate,
      daysRemaining: toDay(dueDate) - today(),
      babySize,
    };
    window.AamaPregnancyJourneyState = journeyState;
    document.dispatchEvent(new CustomEvent('aama-pregnancy-week-change', { detail: journeyState }));

    $('[data-week-label]').textContent = weekText(week);
    $('[data-week-label]').style.left = position;
    $('[data-week-start]').textContent = weekText(1);
    $('[data-week-end]').textContent = weekText(40);
    $('[data-week-start]').style.visibility = week <= 6 ? 'hidden' : 'visible';
    $('[data-week-end]').style.visibility = week >= 35 ? 'hidden' : 'visible';

    document.dispatchEvent(new CustomEvent('aama-week-change', {
      detail: {
        week,
        dueDate,
        trimesterIndex: t,
        trimester,
        babySize: babySizes[week]?.[ne ? 'ne' : 'en'] || babySizes[week]?.en || '—',
        progress: Math.round(((week - 1) / 39) * 100),
        weeksUntilDue: Math.max(0, 40 - week),
        language: ne ? 'ne' : 'en'
      }
    }));
  }

  const reset = () => render(getActualWeek());

  dueInput.min = toValue(today() - 14);
  dueInput.max = toValue(today() + 280);
  dueInput.value = dueDate;

  dueInput.addEventListener('change', () => {
    if (!isValid(dueInput.value)) return;
    dueDate = dueInput.value;
    error.textContent = '';
    try { localStorage.setItem(STORAGE_KEY, dueDate); } catch (e) {}
    reset();
  });

  // checked on leaving the field, so typing isn't interrupted
  dueInput.addEventListener('blur', () => {
    if (isValid(dueInput.value)) return;
    dueInput.value = dueDate;
    error.textContent = /[\u0900-\u097F]/.test(kicker.textContent)
      ? 'सही मिति छान्नुहोस्'
      : 'Choose a valid due date';
  });

  slider.addEventListener('input', () => render(Number(slider.value)));

  let pointerDown = false;
  slider.addEventListener('pointerdown', () => (pointerDown = true));
  ['pointerup', 'pointercancel'].forEach((type) =>
    window.addEventListener(type, () => {
      if (!pointerDown) return;
      pointerDown = false;
      setTimeout(reset, 0);
    })
  );
  slider.addEventListener('blur', reset);

  window.AamaPregnancy = {
    getSnapshot: () => ({
      week: getActualWeek(),
      dueDate,
      trimesterIndex: getActualWeek() <= 13 ? 0 : getActualWeek() <= 27 ? 1 : 2,
      language: /[\u0900-\u097F]/.test(kicker.textContent) ? 'ne' : 'en'
    }),
    getBabySize: (week, language = 'en') => babySizes[week]?.[language] || babySizes[week]?.en || '—'
  };

  // update when the language changes
  new MutationObserver(() => render(Number(slider.value)))
    .observe(kicker, { childList: true, characterData: true, subtree: true });

  // update the week if the tab stays open for days
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) reset();
  });

  reset();
})();
