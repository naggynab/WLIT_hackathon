document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.querySelector('#login-screen');
  const dashboardScreen = document.querySelector('#dashboard-screen');
  const dashboardContent = document.querySelector('.dashboard-content');
  const secondaryView = document.querySelector('#secondary-view');
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  const phoneInput = document.querySelector('#phone');
  const signupPhoneInput = document.querySelector('#signup-phone');
  const signupDueDateInput = document.querySelector('#signup-due-date');
  const rememberInput = document.querySelector('#remember');
  const signupView = document.querySelector('#signup-view');
  const loginCopy = document.querySelector('.auth-panel > .auth-copy');
  const loginFooter = document.querySelector('.auth-panel > .auth-footer');
  const showSignupLink = document.querySelector('#show-signup');
  const showLoginLink = document.querySelector('#show-login');
  const demoLogin = document.querySelector('#demo-login');
  const logoutButton = document.querySelector('#logout-button');
  const togglePin = document.querySelector('#toggle-pin');
  const pinInput = document.querySelector('#pin');
  const toast = document.querySelector('#toast');
  const sidebar = document.querySelector('#sidebar');
  const menuButton = document.querySelector('#menu-button');
  const languageButton = document.querySelector('.language-button');
  const forgotLink = document.querySelector('#forgot-link');
  const alertClose = document.querySelector('.alert-close');
  const breadcrumbCurrent = document.querySelector('.breadcrumb strong');
  const assistantOverlay = document.querySelector('#assistant-overlay');
  const assistantClose = document.querySelector('#assistant-close');
  const assistantInput = document.querySelector('#assistant-input');
  const assistantSend = document.querySelector('#assistant-send');
  const assistantVoice = document.querySelector('#assistant-voice');
  const assistantStatus = document.querySelector('#assistant-status');
  const assistantMessages = document.querySelector('#assistant-messages');
  const interactionModal = document.querySelector('#interaction-modal');
  const interactionContent = document.querySelector('#interaction-content');
  const interactionClose = document.querySelector('#interaction-close');
  const views = window.AamaViews || {};
  const apiBaseUrl = String(window.AAMA_API_URL || '').replace(/\/$/, '');
  const translate = (value) => window.AamaI18n?.t(value) || value;
  const checklistStorageKey = 'aamacare-checklist';
  const authTokenKey = 'aamacare-auth-token';
  const authUserKey = 'aamacare-auth-user';
  const customChecklistStorageKey = 'aamacare-custom-checklist';
  let toastTimer;
  let activeRecognition = null;

// ---------- Language ----------
const LANGUAGE_KEY = 'aamacare-lang';
const TRANSLATED_ATTRIBUTES = ['placeholder', 'aria-label', 'content', 'data-toast'];
const locales = {};
let messages = {};
let currentLanguage = 'en';

// Text that only this script uses (not in en.json / ne.json).
const SCRIPT_TEXT = {
  en: {
    'msg.welcome': "Welcome back, Sita. Your care dashboard is ready.",
    'msg.preview': "Preview mode started. No account was created.",
    'msg.signedOut': "You have been signed out safely.",
    'msg.pinRecovery': "PIN recovery will be connected to SMS in the next build.",
    'msg.navPending': "{page} is ready for the next build.",
    'msg.taskDone': "Task marked complete.",
    'msg.taskUndone': "Task added back to your list.",
    'msg.alertDismissed': "Weather alert dismissed for now.",
    'a11y.hidePassword': "Hide password",
  },
  ne: {
    'msg.welcome': "फेरि स्वागत छ, सीता। तपाईंको हेरचाह ड्यासबोर्ड तयार छ।",
    'msg.preview': "पूर्वावलोकन सुरु भयो। कुनै खाता बनाइएको छैन।",
    'msg.signedOut': "तपाईं सुरक्षित रूपमा साइन आउट हुनुभयो।",
    'msg.pinRecovery': "अर्को संस्करणमा PIN पुनःप्राप्ति SMS सँग जोडिनेछ।",
    'msg.navPending': "{page} अर्को संस्करणका लागि तयार छ।",
    'msg.taskDone': "कार्य पूरा भएको चिन्ह लगाइयो।",
    'msg.taskUndone': "कार्य फेरि तपाईंको सूचीमा थपियो।",
    'msg.alertDismissed': "मौसम चेतावनी अहिलेका लागि हटाइयो।",
    'a11y.hidePassword': "पासवर्ड लुकाउनुहोस्",
  },
};

function t(key, fallback) {
  return messages[key] ?? fallback;
}

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'ne' ? 'ne' : 'en';
  } catch {
    return 'en';
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage is blocked: the choice lasts until refresh.
  }
}

  function storeAuthSession(token, user) {
    try {
      window.localStorage.removeItem(authTokenKey);
      window.localStorage.removeItem(authUserKey);
      window.sessionStorage.removeItem(authTokenKey);
      window.sessionStorage.removeItem(authUserKey);
      const storage = rememberInput?.checked ? window.localStorage : window.sessionStorage;
      storage.setItem(authTokenKey, token);
      storage.setItem(authUserKey, JSON.stringify(user));
    } catch (error) {
      try {
        window.sessionStorage.setItem(authTokenKey, token);
        window.sessionStorage.setItem(authUserKey, JSON.stringify(user));
      } catch (storageError) {
        console.error('Could not save the sign-in session.', storageError);
      }
    }
  }

  function clearAuthSession() {
    try {
      window.localStorage.removeItem(authTokenKey);
      window.localStorage.removeItem(authUserKey);
      window.sessionStorage.removeItem(authTokenKey);
      window.sessionStorage.removeItem(authUserKey);
    } catch (error) {}
  }

  function readAuthUser() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        const user = JSON.parse(storage.getItem(authUserKey) || 'null');
        if (user?.name) return user;
      } catch (error) {}
    }
    return null;
  }

  function renderWelcome(user = readAuthUser()) {
    const hour = new Date().getHours();
    const greetingKey = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = String(user?.name || '').trim().split(/\s+/)[0];
    const greeting = document.querySelector('[data-welcome-greeting]');
    const currentDate = document.querySelector('[data-current-date]');
    if (greeting) greeting.textContent = firstName ? `${translate(greetingKey)}, ${firstName}` : translate(greetingKey);
    if (currentDate) {
      const language = window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP-u-ca-gregory' : 'en-GB';
      currentDate.textContent = new Intl.DateTimeFormat(language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function renderProfileSummary(user = readAuthUser()) {
    const profileButton = document.querySelector('.profile-button');
    if (!profileButton) return;
    const name = String(user?.name || '').trim();
    const nameParts = name.split(/\s+/).filter(Boolean);
    const initials = nameParts.length > 1
      ? `${Array.from(nameParts[0])[0]}${Array.from(nameParts[nameParts.length - 1])[0]}`
      : (Array.from(nameParts[0] || 'AC').slice(0, 2).join(''));
    const lastInitial = nameParts.length > 1 ? ` ${Array.from(nameParts[nameParts.length - 1])[0]}.` : '';
    const displayName = name ? `${nameParts[0]}${lastInitial}` : translate('My profile');
    const nameElement = profileButton.querySelector('[data-profile-name]');
    const initialsElement = profileButton.querySelector('[data-profile-initials]');
    if (nameElement) nameElement.textContent = displayName;
    if (initialsElement) initialsElement.textContent = initials.toLocaleUpperCase();
    profileButton.setAttribute('aria-label', name ? `${translate('Open profile for')} ${name}` : translate('Open profile menu'));
  }

  function showUserProfile() {
    const user = readAuthUser();
    if (!user) {
      openInteraction(
        'My profile',
        'Preview profile',
        `<p>${translate('Sign in or create an account to view your personal details.')}</p>`,
        '<button class="button button--primary" type="button" data-action="close-modal">Close</button>'
      );
      return;
    }

    const dueDateValue = user.dueDate ? String(user.dueDate).slice(0, 10) : '';
    const dueDate = dueDateValue
      ? new Intl.DateTimeFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP-u-ca-gregory' : 'en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      }).format(new Date(`${dueDateValue}T00:00:00`))
      : translate('Not provided');
    const language = user.preferredLanguage === 'ne' ? 'नेपाली' : 'English';
    const rows = [
      ['Full name', user.name || ''],
      ['Mobile number', user.phone || ''],
      ['Estimated due date', dueDate],
      ['Language', language],
    ].map(([label, value]) => `<div class="detail-row"><span>${translate(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    openInteraction(
      'Account profile',
      'My profile',
      `<p>${translate('Your personal details are saved with your account.')}</p><div class="detail-list">${rows}</div>`,
      '<button class="button button--primary" type="button" data-action="close-modal">Close</button>'
    );
  }

  async function submitAuthForm(endpoint, payload, form, successMessage) {
    const button = form?.querySelector('button[type="submit"]');
    if (!button) return;
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : {};
      if (!response.ok) {
        const message = data.error || (response.status === 404
          ? 'Authentication API was not found. Check the backend URL and restart the backend.'
          : `Authentication failed (HTTP ${response.status}). Please try again.`);
        throw new Error(message);
      }
      if (!data.token || !data.user) throw new Error('The server returned an incomplete sign-in response.');

      storeAuthSession(data.token, data.user);
      const dueDate = payload.dueDate || data.user.dueDate?.slice?.(0, 10);
      if (dueDate) {
        try { window.localStorage.setItem('aamacare-due-date', dueDate); } catch (error) {}
        const dueDateInput = document.querySelector('.due-date-input');
        if (dueDateInput) {
          dueDateInput.value = dueDate;
          dueDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      navigate('/home');
      showToast(successMessage);
    } catch (error) {
      const message = error instanceof TypeError
        ? translate('Could not connect to the server. Try again.')
        : error.message || translate('Could not connect to the server. Try again.');
      showToast(message);
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.innerHTML = originalContent;
    }
  }

  if (signupDueDateInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateValue = (date) => {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 10);
    };
    const earliestDueDate = new Date(today);
    earliestDueDate.setDate(earliestDueDate.getDate() - 14);
    const latestDueDate = new Date(today);
    latestDueDate.setDate(latestDueDate.getDate() + 280);
    signupDueDateInput.min = dateValue(earliestDueDate);
    signupDueDateInput.max = dateValue(latestDueDate);
  }

  function getChecklistTasks() {
    return Array.from(document.querySelectorAll('.task-row input[type="checkbox"]'));
  }

// Replaces only the element's own text, so icons, arrows and links inside it remain.
function setText(element, value) {
  const node = [...element.childNodes].find((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
  if (!node) return;
  const [, before, after] = node.textContent.match(/^(\s*)[\s\S]*?(\s*)$/);
  node.textContent = before + value + after;
}

function updateTitle() {
  document.title = dashboardScreen.classList.contains('is-hidden')
    ? t('meta.title', 'AamaCare · Pregnancy companion')
    : `AamaCare · ${t('top.myDashboard', 'My care dashboard')}`;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = messages[element.dataset.i18n];
    if (value !== undefined) setText(element, value);
  });
  TRANSLATED_ATTRIBUTES.forEach((attribute) => {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
      const value = messages[element.getAttribute(`data-i18n-${attribute}`)];
      if (value !== undefined) element.setAttribute(attribute, value);
    });
  });
}

function restoreChecklist() {
    getCustomChecklistItems().forEach((item) => createChecklistRow(item));
    try {
      const savedTasks = JSON.parse(window.localStorage.getItem(checklistStorageKey) || '{}');
      getChecklistTasks().forEach((task) => {
        if (typeof savedTasks[task.dataset.taskId] === 'boolean') task.checked = savedTasks[task.dataset.taskId];
        task.closest('.task-row')?.classList.toggle('is-complete', task.checked);
      });
    } catch (error) {
      console.warn('Saved checklist could not be restored.', error);
    }
    updateChecklistSummary();
  }

  function saveChecklist() {
    const savedTasks = {};
    getChecklistTasks().forEach((task) => {
      if (task.dataset.taskId) savedTasks[task.dataset.taskId] = task.checked;
    });
    try {
      window.localStorage.setItem(checklistStorageKey, JSON.stringify(savedTasks));
    } catch (error) {
      console.warn('Checklist could not be saved locally.', error);
    }
  }

  function getCustomChecklistItems() {
    try {
      const savedItems = JSON.parse(window.localStorage.getItem(customChecklistStorageKey) || '[]');
      return Array.isArray(savedItems) ? savedItems : [];
    } catch (error) {
      console.warn('Custom checklist items could not be restored.', error);
      return [];
    }
  }

  function saveCustomChecklistItems(items) {
    try {
      window.localStorage.setItem(customChecklistStorageKey, JSON.stringify(items));
    } catch (error) {
      console.warn('Custom checklist items could not be saved.', error);
    }
  }

  function createChecklistRow(item) {
    const row = document.createElement('label');
    row.className = 'task-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.taskId = item.id;
    input.checked = Boolean(item.completed);

    const check = document.createElement('span');
    check.className = 'task-check';

    const copy = document.createElement('span');
    copy.className = 'task-copy';

    const title = document.createElement('strong');
    title.textContent = item.title;
    const details = document.createElement('small');
    details.textContent = item.details || 'Personal reminder';
    copy.append(title, details);

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = item.time || 'Today';

    row.append(input, check, copy, time);
    row.classList.toggle('is-complete', input.checked);
    document.querySelector('.checklist')?.appendChild(row);
  }

  function addChecklistItem(item) {
    createChecklistRow(item);
    saveChecklist();
    updateChecklistSummary();
  }

  function openReminders() {
    const tasks = getChecklistTasks();
    const taskRows = tasks.map((task) => {
      const row = task.closest('.task-row');
      const title = row?.querySelector('.task-copy strong')?.textContent || 'Care reminder';
      const time = row?.querySelector('.task-time')?.textContent || 'Today';
      const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
      return `<div class="detail-row"><span>${escapeHtml(time)}</span><strong>${task.checked ? '✓ ' : ''}${escapeHtml(title)}</strong></div>`;
    }).join('');
    openInteraction('Small steps, big care', 'Your reminders', `<div class="detail-list">${taskRows}</div><div class="modal-callout">Tap a checklist item on your dashboard whenever you finish it. Your progress is saved on this device.</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Back to checklist</button>');
  }

  function showDashboard() {
    loginScreen?.classList.add('is-hidden');
    dashboardScreen?.classList.remove('is-hidden');
    document.title = translate('AamaCare · My care dashboard');
    window.AamaI18n?.translatePage();
    renderWelcome();
    renderProfileSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showLogin() {
    dashboardScreen?.classList.add('is-hidden');
    loginScreen?.classList.remove('is-hidden');
    document.title = translate('AamaCare · Pregnancy companion');
    window.AamaI18n?.translatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setAuthMode(mode) {
    const signingUp = mode === 'signup';
    loginCopy?.classList.toggle('is-hidden', signingUp);
    loginForm?.classList.toggle('is-hidden', signingUp);
    loginFooter?.classList.toggle('is-hidden', signingUp);
    signupView?.classList.toggle('is-hidden', !signingUp);
    loginScreen?.setAttribute('aria-labelledby', signingUp ? 'signup-title' : 'login-title');
  }

  function renderDashboardView(view, label) {
    document.querySelectorAll('.nav-item[data-route]').forEach((nav) => {
      nav.classList.remove('is-active');
      nav.removeAttribute('aria-current');
    });
    const activeNav = document.querySelector(`.nav-item[data-view="${view}"]`);
    activeNav?.classList.add('is-active');
    activeNav?.setAttribute('aria-current', 'page');
    sidebar?.classList.remove('is-open');
    if (view === 'overview') {
      dashboardContent?.classList.remove('is-hidden');
      secondaryView?.classList.add('is-hidden');
    } else if (views[view] && secondaryView) {
      dashboardContent?.classList.add('is-hidden');
      secondaryView.innerHTML = views[view];
      secondaryView.classList.remove('is-hidden');
      if (view === 'settings') restoreSettings();
    }
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = label;
    window.AamaI18n?.translatePage();
    if (view === 'journey' && window.AamaPregnancyJourneyState) applyJourneyCalendar(window.AamaPregnancyJourneyState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyJourneyCalendar(state) {
    if (!state || !secondaryView) return;
    const week = Math.min(40, Math.max(1, Number(state.week) || 1));
    const ne = window.AamaI18n?.getLanguage() === 'ne';
    const digits = (value) => ne ? String(value).replace(/\d/g, (digit) => '०१२३४५६७८९'[digit]) : String(value);
    const weekLabel = ne ? `हप्ता ${digits(week)}` : `Week ${week}`;
    const progress = Math.round((week / 40) * 100);
    const days = Number(state.daysRemaining) || 0;
    const until = days === 0
      ? (ne ? 'आज प्रसूति मिति' : 'Due today')
      : days > 0
        ? (ne ? `${digits(days)} दिन बाँकी` : `${days} ${days === 1 ? 'day' : 'days'}`)
        : (ne ? `${digits(Math.abs(days))} दिन ढिला` : `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`);

    const setText = (selector, value) => {
      const element = secondaryView.querySelector(selector);
      if (element) element.textContent = value;
    };
    setText('[data-journey-week]', weekLabel);
    const babySize = state.babySize || '';
    const sizeDescription = ne
      ? `बच्चाको आकार: ${babySize}। यस हप्ता हल्का चालचलन, पर्याप्त पानी र अर्को गर्भ जाँचमा ध्यान दिनुहोस्।`
      : babySize.startsWith('About ')
        ? `Your baby is about the size of ${babySize.slice(6)}. This week, focus on gentle movement, hydration, and your next antenatal visit.`
        : 'A size comparison is not available this early. This week, focus on gentle movement, hydration, and your next antenatal visit.';
    setText('[data-journey-description]', sizeDescription);
    setText('[data-journey-progress]', `${digits(progress)}%`);
    setText('[data-journey-side-progress]', `${digits(progress)}%`);
    setText('[data-journey-until]', until);
    setText('[data-journey-count]', ne ? `४० मध्ये ${digits(week)} हप्ता` : `Week ${week} of 40`);
    const progressBar = secondaryView.querySelector('.mini-progress span');
    if (progressBar) progressBar.style.width = `${progress}%`;

    const trimester = week <= 13 ? 0 : week <= 27 ? 1 : 2;
    secondaryView.querySelectorAll('[data-journey-trimester]').forEach((tab) => {
      const active = Number(tab.dataset.journeyTrimester) === trimester;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'step');
      else tab.removeAttribute('aria-current');
    });

    const grid = secondaryView.querySelector('[data-journey-milestones]');
    if (!grid) return;
    grid.replaceChildren();
    const firstWeek = Math.min(Math.max(1, week - 2), 37);
    for (let index = 0; index < 4; index += 1) {
      const milestoneWeek = firstWeek + index;
      const current = milestoneWeek === week;
      const status = current ? (ne ? 'हाल' : 'Current') : milestoneWeek < week ? (ne ? 'पूरा' : 'Done') : (ne ? 'आउँदैछ' : 'Coming up');
      const article = document.createElement('article');
      article.className = `week-card${current ? ' is-current' : ''}`;
      article.dataset.action = 'week-card';
      article.dataset.week = String(milestoneWeek);
      article.innerHTML = `<div class="week-card__top"><span class="week-number">${digits(milestoneWeek)}</span><span class="week-state">${status}</span></div><strong>${current ? (ne ? 'यो हप्ताको हेरचाह' : 'Care for this week') : (ne ? 'साप्ताहिक हेरचाह' : 'Weekly care milestone')}</strong><small>${current ? (ne ? 'आफ्नो अर्को जाँचको तयारी गर्नुहोस्।' : 'Focus on your wellbeing and prepare for your next checkup.') : (ne ? 'आफ्नो गर्भावस्था हेरचाहका लागि यो हप्ताको मार्गदर्शन हेर्नुहोस्।' : 'Explore care guidance for this week of your pregnancy.')}</small>`;
      grid.appendChild(article);
    }
  }

  document.addEventListener('aama-pregnancy-week-change', (event) => {
    window.AamaPregnancyJourneyState = event.detail;
    if (!secondaryView?.classList.contains('is-hidden')) applyJourneyCalendar(event.detail);
  });

async function setLanguage(language) {
  try {
    if (!locales[language]) {
      const response = await fetch(`locales/${language}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      locales[language] = await response.json();
    }
    messages = { ...locales[language], ...SCRIPT_TEXT[language] };
    currentLanguage = language;
    translatePage();
    document.documentElement.lang = currentLanguage;
    setText(languageButton, currentLanguage === 'en' ? 'ने' : 'EN');
    languageButton.querySelector('span').textContent = currentLanguage === 'en' ? 'EN' : 'ने';
    updateTitle();
    saveLanguage(language);
  } catch (error) {
    console.error(`Could not load the "${language}" language file.`, error);
  }
}

document.addEventListener('aama-language-change', () => {
    renderWelcome();
    renderProfileSummary();
    if (window.AamaPregnancyJourneyState && !secondaryView?.classList.contains('is-hidden')) {
      applyJourneyCalendar(window.AamaPregnancyJourneyState);
    }
  });
function restoreSettings() {
  try {
    const savedSettings = JSON.parse(window.localStorage.getItem('aamacare-settings') || '{}');
    const language = secondaryView?.querySelector('.settings-row select');
    if (language && savedSettings.language) language.value = savedSettings.language;
    secondaryView?.querySelectorAll('.settings-row input[type="checkbox"]').forEach((input) => {
      const key = input.getAttribute('aria-label');
      if (key && typeof savedSettings[key] === 'boolean') input.checked = savedSettings[key];
    });
  } catch (error) {
    console.warn('Saved settings could not be restored.', error);
  }
}

languageButton.addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'ne' : 'en'));

// ---------- App ----------
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function handleAction(action, target) {
    if (action === 'open-profile') {
      showUserProfile();
    } else if (action === 'today-plan') {
      openInteraction("Today's plan", 'Your care plan for today', '<div class="detail-list"><div class="detail-row"><span>Morning</span><strong>Hydrate and take your prescribed supplement</strong></div><div class="detail-row"><span>Afternoon</span><strong>Watch your weekly movement video</strong></div><div class="detail-row"><span>Evening</span><strong>Keep emergency contacts close during heavy rain</strong></div></div>', '<button class="button button--primary" type="button" data-action="close-modal">Got it</button>');
    } else if (action === 'appointment-detail') {
      openInteraction('Next up', 'Routine antenatal visit', '<div class="detail-list"><div class="detail-row"><span>Date</span><strong>Thursday, 3 December 2026</strong></div><div class="detail-row"><span>Time</span><strong>10:30 AM</strong></div><div class="detail-row"><span>Location</span><strong>Patan Hospital · Outpatient wing</strong></div></div><div class="modal-callout">Bring your previous records and write down any questions you want to ask your health worker.</div>', '<button class="button button--soft" type="button" data-action="appointment-reminder">Remind me</button><button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'appointment-reminder') {
      closeInteraction();
      showToast('Reminder set for your next antenatal visit.');
    } else if (action === 'journey-tab') {
      secondaryView?.querySelectorAll('.trimester-tab').forEach((tab) => tab.classList.remove('is-active'));
      target.classList.add('is-active');
      showToast(`${target.textContent} guidance selected.`);
    } else if (action === 'week-card') {
      const week = target.dataset.week;
      openInteraction(`Week ${week}`, week === '24' ? 'Care for both of you' : `Your week ${week} focus`, `<p>${week === '24' ? 'Keep hydrated, notice how you are feeling, and prepare for your upcoming antenatal checkup.' : 'Explore the changes, questions, and care reminders for this week of your pregnancy journey.'}</p><div class="modal-callout">This educational information supports your care plan and does not replace advice from your health worker.</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Continue journey</button>');
    } else if (action === 'export-records') {
      showToast('Your record summary is being prepared for export.');
    } else if (action === 'add-record') {
      openInteraction('Health records', 'Add a new record', '<form class="interaction-form" id="record-form"><label for="record-type">Record type</label><select id="record-type" required><option value="visit">Health visit</option><option value="test">Test or scan</option><option value="note">Health worker note</option></select><label for="record-place">Hospital or health post</label><input id="record-place" placeholder="e.g. Patan Hospital" required><label for="record-note">Notes</label><textarea id="record-note" placeholder="What would you like to remember?"></textarea><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Save record</button></div></form>');
    } else if (action === 'record-detail') {
      openInteraction('Health record', target.dataset.record || 'Selected record', '<div class="detail-list"><div class="detail-row"><span>Saved by</span><strong>Sita K.</strong></div><div class="detail-row"><span>Shared with</span><strong>Mother and health worker</strong></div><div class="detail-row"><span>Status</span><strong>Saved securely</strong></div></div>', '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'record-options') {
      openInteraction('Health records', 'Manage your records', '<p>Choose what you want to do with your saved records.</p>', '<button class="button button--outline" type="button" data-action="export-records">Export summary</button><button class="button button--primary" type="button" data-action="add-record">Add record</button>');
    } else if (action === 'record-timeline') {
      openInteraction('Health records', 'Full care timeline', '<div class="detail-list"><div class="detail-row"><span>16 Nov</span><strong>Routine antenatal visit</strong></div><div class="detail-row"><span>02 Nov</span><strong>Ultrasound report added</strong></div><div class="detail-row"><span>21 Oct</span><strong>Health worker note</strong></div></div>', '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'share-records') {
      openInteraction('Share safely', 'Choose who can view this summary', '<p>Your health record stays private until you choose a person.</p><div class="detail-list"><div class="detail-row"><span>Family hub</span><strong>Ram K. and Asha M.</strong></div><div class="detail-row"><span>Health worker</span><strong>Not shared yet</strong></div></div>', '<button class="button button--primary" type="button" data-action="share-confirm">Share summary</button>');
    } else if (action === 'share-confirm') {
      closeInteraction();
      showToast('Your selected summary was shared with the care circle.');
    } else if (action === 'invite-member') {
      openInteraction('Family hub', 'Invite someone you trust', '<form class="interaction-form" id="invite-form"><label for="invite-name">Name</label><input id="invite-name" placeholder="e.g. Ram K." required><label for="invite-relation">Relationship</label><select id="invite-relation"><option>Partner</option><option>Family member</option><option>Neighbour</option><option>Health worker</option></select><label for="invite-phone">Mobile number</label><input id="invite-phone" type="tel" placeholder="98XXXXXXXX" required><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Send invite</button></div></form>');
    } else if (action === 'member-detail') {
      openInteraction('Family hub', target.dataset.member || 'Circle member', '<p>This person can receive the permissions you choose.</p><div class="detail-list"><div class="detail-row"><span>Shared access</span><strong>Tasks and appointments</strong></div><div class="detail-row"><span>Emergency alerts</span><strong>Enabled</strong></div></div>', '<button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="button" data-toast="Permission editor opened">Edit permissions</button>');
    } else if (action === 'family-options') {
      openInteraction('Family hub', 'Family permissions', '<p>Review who can see tasks, appointments, and selected care updates.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Review access</button>');
    } else if (action === 'toggle-shared') {
      const check = target.querySelector('.shared-check');
      check?.classList.toggle('is-done');
      if (check) check.textContent = check.classList.contains('is-done') ? '✓' : '';
      showToast(check?.classList.contains('is-done') ? 'Family task marked complete.' : 'Family task added back.');
    } else if (action === 'shared-checklist') {
      openInteraction('Shared support', 'Everyone knows the next step', '<p>Your family checklist keeps transport, emergency preparation, and shared support visible to the people you trust.</p><div class="modal-callout">You can pause family notifications or change sharing permissions at any time.</div>', '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'show-reminders') {
      openReminders();
    } else if (action === 'add-checklist') {
      openInteraction('Small steps, big care', 'Add a checklist item', '<form class="interaction-form" id="checklist-form"><label for="checklist-title">What do you want to remember?</label><input id="checklist-title" name="title" placeholder="e.g. Take a short walk" required maxlength="80"><label for="checklist-details">Details <span class="form-label-hint">optional</span></label><input id="checklist-details" name="details" placeholder="e.g. Move gently for 10 minutes" maxlength="120"><label for="checklist-time">When?</label><input id="checklist-time" name="time" placeholder="e.g. Today or 4:00 PM" maxlength="30"><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Add to checklist</button></div></form>');
    } else if (action === 'use-location') {
      openInteraction('Nearby care', 'Use your current location?', '<p>Location helps AamaCare sort health posts and hospitals by distance. You can also keep using the Lalitpur location already selected.</p>', '<button class="button button--outline" type="button" data-action="close-modal">Keep Lalitpur</button><button class="button button--primary" type="button" data-action="location-confirm">Use location</button>');
    } else if (action === 'location-confirm') {
      closeInteraction();
      showToast('Location access will be connected to the service directory.');
    } else if (action === 'service-filter') {
      openInteraction('Health services', 'Filter nearby care', '<div class="interaction-form"><label><input type="checkbox" checked> Maternity care</label><label><input type="checkbox"> Emergency care</label><label><input type="checkbox"> Pharmacy</label><label><input type="checkbox"> Open now</label></div>', '<button class="button button--primary" type="button" data-action="close-modal">Apply filters</button>');
    } else if (action === 'select-service') {
      secondaryView?.querySelectorAll('.service-card').forEach((card) => card.classList.remove('is-selected'));
      target.classList.add('is-selected');
      const service = target.dataset.service || 'Health service';
      openInteraction('Nearby care', service, '<div class="detail-list"><div class="detail-row"><span>Distance</span><strong>2.4 km from you</strong></div><div class="detail-row"><span>Services</span><strong>Maternity care · Emergency</strong></div><div class="detail-row"><span>Phone</span><strong>01-5522295</strong></div></div>', '<button class="button button--outline" type="button" data-toast="Calling the health service">Call</button><button class="button button--primary" type="button" data-toast="Directions opened">Get directions</button>');
    } else if (action === 'topic-filter') {
      openInteraction('Learn & prepare', target.dataset.topic || 'Learning topic', '<p>We will show week 24 content, Nepali audio, and trusted videos for this topic.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Show content</button>');
    } else if (action === 'play-learning') {
      openInteraction('Learn & prepare', target.dataset.title || 'Recommended learning', '<div class="video-player-placeholder"><span>▶</span><p>Preview player</p></div><p>This video placeholder is ready for the Ministry of Health media URL.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Close player</button>');
    } else if (action === 'close-modal') {
      closeInteraction();
    } else if (action === 'save-settings') {
      saveSettings();
    } else if (action === 'confirm-logout') {
      closeInteraction();
      clearAuthSession();
      navigate('/login');
      showToast('You have been signed out safely.');
    }
  }

  function navigate(path, replace = false) {
    const requestedPath = path === '/' ? '/login' : path;
    const destination = requestedPath === '/login' || requestedPath === '/sign' || routeMap[requestedPath] ? requestedPath : '/login';
    if (window.location.pathname !== destination) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({}, '', destination);
    }
    if (destination === '/login' || destination === '/sign') {
      showLogin();
      setAuthMode(destination === '/sign' ? 'signup' : 'login');
      return;
    }
    showDashboard();
    renderDashboardView(routeMap[destination].view, routeMap[destination].label);
  }

  function openAssistant() {
    assistantOverlay?.classList.remove('is-hidden');
    assistantOverlay?.setAttribute('aria-hidden', 'false');
    assistantInput?.focus();
  }

  function closeAssistant() {
    assistantOverlay?.classList.add('is-hidden');
    assistantOverlay?.setAttribute('aria-hidden', 'true');
  }

  function addAssistantMessage(text, type = 'user') {
    if (!assistantMessages) return null;
    const message = document.createElement('div');
    message.className = `assistant-message assistant-message--${type}`;
    message.textContent = text;
    assistantMessages.appendChild(message);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
    return message;
  }

  async function askAssistant(message) {
    const cleanMessage = message.trim();
    if (!cleanMessage || !assistantSend) return;
    activeRecognition?.stop();
    activeRecognition = null;
    addAssistantMessage(cleanMessage, 'user');
    if (assistantInput) assistantInput.value = '';
    assistantSend.disabled = true;
    if (assistantVoice) assistantVoice.disabled = true;
    const thinkingMessage = addAssistantMessage(translate('Thinking…'), 'bot');
    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: cleanMessage }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      if (thinkingMessage) thinkingMessage.textContent = data.reply;
      if (data.audio) {
        const audio = new Audio(`data:${data.mimeType};base64,${data.audio}`);
        await audio.play();
      }
    } catch (error) {
      if (thinkingMessage) thinkingMessage.textContent = translate('I could not connect right now. Please try again.');
      console.error(error);
    } finally {
      assistantSend.disabled = false;
      if (assistantVoice) assistantVoice.disabled = false;
    }
  }

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuthForm('login', {
      phone: phoneInput?.value.trim(),
      password: pinInput?.value || '',
    }, loginForm, 'Signed in successfully.');
  });
  showSignupLink?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('/sign');
  });
  showLoginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('/login');
  });
  signupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuthForm('signup', {
      name: document.querySelector('#signup-name')?.value.trim(),
      phone: signupPhoneInput?.value.trim(),
      dueDate: signupDueDateInput?.value,
      password: document.querySelector('#signup-password')?.value || '',
      preferredLanguage: window.AamaI18n?.getLanguage() || 'ne',
    }, signupForm, 'Account created successfully.');
  });
  demoLogin?.addEventListener('click', () => {
    clearAuthSession();
    navigate('/home');
    showToast('Preview mode started. No account was created.');
  });
  logoutButton?.addEventListener('click', () => {
    openInteraction(
      'Sign out',
      'Leave AamaCare for now?',
      '<p>Your dashboard will be closed, but your saved care information will remain safe.</p>',
      '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="button" data-action="confirm-logout">Sign out</button>'
    );
  });
  togglePin?.addEventListener('click', () => {
    if (!pinInput) return;
    const isPassword = pinInput.type === 'password';
    pinInput.type = isPassword ? 'text' : 'password';
    togglePin.textContent = isPassword ? '◌' : '◉';
    togglePin.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
  forgotLink?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('PIN recovery will be connected to SMS in the next build.');
  });
  document.querySelectorAll('.ai-launcher').forEach((button) => button.addEventListener('click', openAssistant));
  document.addEventListener('click', (event) => {
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      event.preventDefault();
      navigate(routeButton.dataset.route);
      return;
    }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      handleAction(actionButton.dataset.action, actionButton);
      return;
    }
    const toastButton = event.target.closest('[data-toast]');
    if (toastButton) showToast(toastButton.dataset.toast);
    if (event.target.closest('.ai-launcher')) openAssistant();
  });
  interactionClose?.addEventListener('click', closeInteraction);
  interactionModal?.addEventListener('click', (event) => {
    if (event.target === interactionModal) closeInteraction();
  });
  document.addEventListener('submit', (event) => {
    if (event.target.id === 'checklist-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const title = String(formData.get('title') || '').trim();
      if (!title) return;
      const item = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        details: String(formData.get('details') || '').trim(),
        time: String(formData.get('time') || '').trim() || 'Today',
        completed: false,
      };
      const customItems = getCustomChecklistItems();
      customItems.push(item);
      saveCustomChecklistItems(customItems);
      addChecklistItem(item);
      closeInteraction();
      showToast('Checklist item added.');
    }
    if (event.target.id === 'record-form') {
      event.preventDefault();
      closeInteraction();
      showToast('Health record saved to your timeline.');
    }
    if (event.target.id === 'invite-form') {
      event.preventDefault();
      closeInteraction();
      showToast('Family invitation prepared.');
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('.settings-row select')) {
      window.AamaI18n?.setLanguage(event.target.value === 'नेपाली' ? 'ne' : 'en');
      return;
    }
    const task = event.target.closest('.task-row input');
    if (task) {
      task.closest('.task-row')?.classList.toggle('is-complete', task.checked);
      updateChecklistSummary();
      saveChecklist();
      showToast(task.checked ? 'Task marked complete.' : 'Task added back to your list.');
    }
  });
  assistantClose?.addEventListener('click', closeAssistant);
  assistantOverlay?.addEventListener('click', (event) => {
    if (event.target === assistantOverlay) closeAssistant();
  });
  assistantSend?.addEventListener('click', () => askAssistant(assistantInput?.value || ''));
  assistantInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      askAssistant(assistantInput.value);
    }
  });
  assistantVoice?.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (assistantStatus) assistantStatus.textContent = 'Voice input is not supported here. Please use Chrome or Edge on localhost.';
      showToast('Voice input is not supported in this browser.');
      return;
    }

    if (activeRecognition) {
      activeRecognition.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    recognition.lang = 'ne-NP';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      assistantVoice.textContent = '■ Stop';
      assistantVoice.classList.add('is-listening');
      if (assistantStatus) assistantStatus.textContent = 'Listening… speak now.';
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      if (assistantInput && transcript) assistantInput.value = transcript;
      if (assistantStatus) assistantStatus.textContent = event.results[event.results.length - 1].isFinal
        ? 'Transcript ready. Press Send when you are ready.'
        : 'Hearing you…';
    };
    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone permission was blocked. Allow microphone access and try again.',
        'service-not-allowed': 'Browser speech recognition is blocked. Try Chrome or Edge on localhost.',
        'no-speech': 'No speech was detected. Please try again and speak closer to the microphone.',
        'audio-capture': 'No microphone was found. Check your microphone connection.'
      };
      const message = messages[event.error] || 'I could not hear that. Please try again.';
      if (assistantStatus) assistantStatus.textContent = message;
      showToast(message);
    };
    recognition.onend = () => {
      activeRecognition = null;
      assistantVoice.textContent = '🎙 Speak';
      assistantVoice.classList.remove('is-listening');
    };

    try {
      recognition.start();
    } catch (error) {
      activeRecognition = null;
      if (assistantStatus) assistantStatus.textContent = 'Microphone could not start. Please try again.';
      console.error(error);
    }
  });
  alertClose?.addEventListener('click', (event) => {
    event.currentTarget.closest('.alert-banner')?.remove();
    showToast('Weather alert dismissed for now.');
  });
  menuButton?.addEventListener('click', () => sidebar?.classList.toggle('is-open'));
  window.addEventListener('popstate', () => navigate(window.location.pathname, true));
  navigate(window.location.pathname, true);
  restoreChecklist();
  setLanguage(readSavedLanguage());
});