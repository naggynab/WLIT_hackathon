(() => {
  const card = document.querySelector('.pregnancy-card');
  if (!card) return;

  const $ = (s) => card.querySelector(s);
  const slider = $('.week-slider');
  const kicker = $('.card-kicker');
  const dueInput = $('.due-date-input');
  const error = $('.due-date-error');
  const STORAGE_KEY = 'aamacare-due-date';
  const DAY = 86400000;

  // Add other weeks from a verified source
  const babySizes = {
    24: { en: 'About an eggplant', ne: 'भण्टाजत्रो' },
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
    $('[data-baby-size]').textContent = babySizes[week]?.[ne ? 'ne' : 'en'] || '—';

    $('[data-week-label]').textContent = weekText(week);
    $('[data-week-label]').style.left = position;
    $('[data-week-start]').textContent = weekText(1);
    $('[data-week-end]').textContent = weekText(40);
    $('[data-week-start]').style.visibility = week <= 6 ? 'hidden' : 'visible';
    $('[data-week-end]').style.visibility = week >= 35 ? 'hidden' : 'visible';
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

  // update when the language changes
  new MutationObserver(() => render(Number(slider.value)))
    .observe(kicker, { childList: true, characterData: true, subtree: true });

  // update the week if the tab stays open for days
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) reset();
  });

  reset();
})();