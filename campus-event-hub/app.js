const STORAGE_KEY = 'campus-hub-submitted-events';

const seedEvents = [
  {
    id: 'design-portfolio',
    title: 'Design your first portfolio',
    category: 'Workshop',
    date: '2026-12-02',
    time: '16:00',
    location: 'Innovation Lab',
    organizer: 'Creative Computing Club',
    description: 'Bring your ideas and learn practical ways to present your work with confidence.',
    icon: '✦',
    tone: 'lavender'
  },
  {
    id: 'tea-talk',
    title: 'Tea, talk & new friends',
    category: 'Social',
    date: '2026-12-04',
    time: '17:30',
    location: 'Student Courtyard',
    organizer: 'Campus Connect',
    description: 'A relaxed evening for meeting people from different clubs and courses.',
    icon: '♡',
    tone: 'peach'
  },
  {
    id: 'futsal-cup',
    title: 'Interfaculty futsal cup',
    category: 'Sports',
    date: '2026-12-06',
    time: '07:00',
    location: 'Main Ground',
    organizer: 'Student Sports Council',
    description: 'Bring your team spirit and cheer for your faculty at the first campus cup.',
    icon: '✚',
    tone: 'mint'
  }
];

const state = { events: [], filter: 'All' };
const elements = {
  grid: document.querySelector('#event-grid'),
  emptyState: document.querySelector('#empty-state'),
  summary: document.querySelector('#results-summary'),
  modal: document.querySelector('#event-modal'),
  modalContent: document.querySelector('#modal-content'),
  toast: document.querySelector('#toast')
};

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

function readSubmittedEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveSubmittedEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function formatTime(time) {
  return timeFormatter.format(new Date(`2000-01-01T${time}`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function visibleEvents() {
  return state.filter === 'All' ? state.events : state.events.filter((event) => event.category === state.filter);
}

function renderEvents() {
  const events = visibleEvents();
  elements.grid.innerHTML = events.map((event) => `
    <article class="event-card event-card--${escapeHtml(event.tone || 'lavender')}" data-event-id="${escapeHtml(event.id)}">
      <div class="event-card-top">
        <span class="category-pill">${escapeHtml(event.category)}</span>
        <time class="event-date" datetime="${escapeHtml(event.date)}">${escapeHtml(formatDate(event.date))}</time>
      </div>
      <div class="event-icon" aria-hidden="true">${escapeHtml(event.icon || '✦')}</div>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description)}</p>
      <div class="event-meta">
        <span>◷ ${escapeHtml(formatTime(event.time))}</span>
        <span>▣ ${escapeHtml(event.location)}</span>
      </div>
      <button class="card-link" type="button" data-view-event="${escapeHtml(event.id)}">View details <span aria-hidden="true">→</span></button>
    </article>
  `).join('');

  elements.emptyState.classList.toggle('is-hidden', events.length > 0);
  elements.summary.textContent = `${events.length} ${events.length === 1 ? 'event' : 'events'} ${state.filter === 'All' ? 'on the calendar' : `in ${state.filter}`}`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 3200);
}

function openModal(content) {
  elements.modalContent.innerHTML = content;
  elements.modal.classList.remove('is-hidden');
  document.body.classList.add('modal-open');
  elements.modal.querySelector('.modal').focus();
}

function closeModal() {
  elements.modal.classList.add('is-hidden');
  document.body.classList.remove('modal-open');
  elements.modalContent.innerHTML = '';
}

function openEventDetails(id) {
  const event = state.events.find((item) => item.id === id);
  if (!event) return;
  openModal(`
    <p class="eyebrow">${escapeHtml(event.category)} event</p>
    <h2 id="modal-title">${escapeHtml(event.title)}</h2>
    <p class="modal-description">${escapeHtml(event.description)}</p>
    <dl class="detail-list">
      <div><dt>When</dt><dd>${escapeHtml(formatDate(event.date))} · ${escapeHtml(formatTime(event.time))}</dd></div>
      <div><dt>Where</dt><dd>${escapeHtml(event.location)}</dd></div>
      <div><dt>Hosted by</dt><dd>${escapeHtml(event.organizer || 'Campus community')}</dd></div>
    </dl>
  `);
}

function openForm() {
  openModal(`
    <p class="eyebrow">Share with your campus</p>
    <h2 id="modal-title">Submit an event</h2>
    <form class="event-form" id="event-form">
      <div class="form-field form-field--wide">
        <label for="event-title">Event title <span aria-hidden="true">*</span></label>
        <input id="event-title" name="title" type="text" maxlength="80" required placeholder="e.g. Intro to Photography">
      </div>
      <div class="form-field">
        <label for="event-category">Category <span aria-hidden="true">*</span></label>
        <select id="event-category" name="category" required>
          <option value="">Choose one</option>
          <option>Workshop</option>
          <option>Social</option>
          <option>Sports</option>
        </select>
      </div>
      <div class="form-field">
        <label for="event-date">Date <span aria-hidden="true">*</span></label>
        <input id="event-date" name="date" type="date" required>
      </div>
      <div class="form-field">
        <label for="event-time">Time <span aria-hidden="true">*</span></label>
        <input id="event-time" name="time" type="time" required>
      </div>
      <div class="form-field">
        <label for="event-location">Location <span aria-hidden="true">*</span></label>
        <input id="event-location" name="location" type="text" maxlength="80" required placeholder="e.g. Library Hall">
      </div>
      <div class="form-field form-field--wide">
        <label for="event-organizer">Hosted by</label>
        <input id="event-organizer" name="organizer" type="text" maxlength="80" placeholder="Your club or name">
      </div>
      <div class="form-field form-field--wide">
        <label for="event-description">Short description <span aria-hidden="true">*</span></label>
        <textarea id="event-description" name="description" rows="4" maxlength="220" required placeholder="What should students know?"></textarea>
        <span class="field-hint">Keep it clear and welcoming (220 characters max).</span>
      </div>
      <div class="form-actions form-field--wide">
        <button class="button button--secondary" type="button" data-close-modal>Cancel</button>
        <button class="button button--primary" type="submit">Publish event</button>
      </div>
    </form>
  `);
  const dateInput = document.querySelector('#event-date');
  dateInput.min = new Date().toISOString().slice(0, 10);
  document.querySelector('#event-title').focus();
}

function handleFormSubmit(form) {
  const formData = new FormData(form);
  const event = {
    id: `submitted-${Date.now()}`,
    title: formData.get('title').trim(),
    category: formData.get('category'),
    date: formData.get('date'),
    time: formData.get('time'),
    location: formData.get('location').trim(),
    organizer: formData.get('organizer').trim() || 'Campus community',
    description: formData.get('description').trim(),
    icon: formData.get('category') === 'Workshop' ? '✦' : formData.get('category') === 'Social' ? '♡' : '✚',
    tone: formData.get('category') === 'Workshop' ? 'lavender' : formData.get('category') === 'Social' ? 'peach' : 'mint'
  };
  const submitted = readSubmittedEvents();
  saveSubmittedEvents([...submitted, event]);
  state.events = [...seedEvents, ...readSubmittedEvents()];
  state.filter = 'All';
  document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('is-active', button.dataset.filter === 'All'));
  renderEvents();
  closeModal();
  showToast('Your event was published and saved on this device.');
  document.querySelector('#events').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('click', (event) => {
  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('is-active', button === filterButton));
    renderEvents();
    return;
  }

  const viewButton = event.target.closest('[data-view-event]');
  if (viewButton) openEventDetails(viewButton.dataset.viewEvent);
  if (event.target.closest('.js-open-form')) openForm();
  if (event.target.closest('[data-close-modal]') || event.target === elements.modal) closeModal();
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'event-form') return;
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  handleFormSubmit(event.target);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !elements.modal.classList.contains('is-hidden')) closeModal();
});

state.events = [...seedEvents, ...readSubmittedEvents()];
renderEvents();
