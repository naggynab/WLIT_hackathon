document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.querySelector('#login-screen');
  const dashboardScreen = document.querySelector('#dashboard-screen');
  const dashboardContent = document.querySelector('.dashboard-content');
  const secondaryView = document.querySelector('#secondary-view');
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  const loginRole = document.querySelector('#login-role');
  const signupRole = document.querySelector('#signup-role');
  const signupUserFields = document.querySelector('.signup-user-fields');
  const signupWorkerFields = document.querySelector('.signup-worker-fields');
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
  const profileButton = document.querySelector('.profile-button');
  const togglePin = document.querySelector('#toggle-pin');
  const pinInput = document.querySelector('#pin');
  const toast = document.querySelector('#toast');
  const sidebar = document.querySelector('#sidebar');
  const sideNav = document.querySelector('.side-nav');
  const originalSideNav = sideNav?.innerHTML || '';
  const sidebarSectionLabel = document.querySelector('.sidebar-section-label');
  const supportCard = document.querySelector('.support-card');
  const maternalSettingsItem = document.querySelector('.sidebar-bottom .nav-item[data-view="settings"]');
  const notificationButton = document.querySelector('.notification-button');
  const healthPostPreview = document.querySelector('#health-post-preview');
  const menuButton = document.querySelector('#menu-button');
  const forgotLink = document.querySelector('#forgot-link');
  const alertClose = document.querySelector('.alert-close');
  const breadcrumbCurrent = document.querySelector('.breadcrumb strong');
  const assistantOverlay = document.querySelector('#assistant-overlay');
  const assistantClose = document.querySelector('#assistant-close');
  const assistantInput = document.querySelector('#assistant-input');
  const assistantSend = document.querySelector('#assistant-send');
  const assistantVoice = document.querySelector('#assistant-voice');
  const assistantReadAloud = document.querySelector('#assistant-read-aloud');
  const assistantStatus = document.querySelector('#assistant-status');
  const assistantMessages = document.querySelector('#assistant-messages');
  const interactionModal = document.querySelector('#interaction-modal');
  const interactionContent = document.querySelector('#interaction-content');
  const interactionClose = document.querySelector('#interaction-close');
  const views = window.AamaViews || {};
  const apiBaseUrl = String(window.AAMA_API_URL || '').replace(/\/$/, '');
  const translate = (value, values) => window.AamaI18n?.t(value, values) || value;
  window.AamaBenefits?.renderTeaser();
  // Keep the existing storage keys so saved user data survives the rebrand.
  const checklistStorageKey = 'aamacare-checklist';
  const customChecklistStorageKey = 'aamacare-custom-checklist';
  const familyPermissionsStorageKey = 'matrisathi-family-permissions';
  const authTokenKey = 'aamacare-auth-token';
  const authUserKey = 'aamacare-auth-user';
  const defaultFamilyPermissions = {
    'Tasks and appointments': true,
    'Pregnancy journey': true,
    'Health records': false,
    'Emergency alerts': true,
  };
  const profileStorageKey = 'aamacare-profile';
  const weatherLocationStorageKey = 'matrisathi-weather-location';
  const defaultWeatherLocation = { label: 'Lalitpur', latitude: 27.6588, longitude: 85.3247 };
  const weatherState = { data: null, location: { ...defaultWeatherLocation }, loading: false };
  const communityState = { posts: [], plans: [], filter: 'all', loaded: false };
  let toastTimer;
  let activeRecognition = null;
  let latestAssistantReply = null;
  let currentAssistantAudio = null;
  let interactionReturnFocus = null;

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

  function readAuthUser() {
    for (const getStorage of [() => window.localStorage, () => window.sessionStorage]) {
      try {
        const user = JSON.parse(getStorage().getItem(authUserKey) || 'null');
        if (user?.name) return user;
      } catch (error) {
        console.warn('Could not read the saved sign-in session.', error);
      }
    }
    return null;
  }

  function storeAuthSession(token, user) {
    clearAuthSession();
    const storageGetter = rememberInput?.checked ? () => window.localStorage : () => window.sessionStorage;
    try {
      const storage = storageGetter();
      storage.setItem(authTokenKey, token);
      storage.setItem(authUserKey, JSON.stringify(user));
    } catch (error) {
      if (!rememberInput?.checked) {
        console.error('Could not save the sign-in session.', error);
        throw new Error('Your account was verified, but this browser could not save the sign-in session.');
      }
      console.warn('Persistent sign-in is unavailable; using a temporary session instead.', error);
      try {
        window.sessionStorage.setItem(authTokenKey, token);
        window.sessionStorage.setItem(authUserKey, JSON.stringify(user));
      } catch (storageError) {
        console.error('Could not save the sign-in session.', storageError);
        throw new Error('Your account was verified, but this browser could not save the sign-in session.');
      }
    }
  }

  function clearAuthSession() {
    for (const getStorage of [() => window.localStorage, () => window.sessionStorage]) {
      try {
        getStorage().removeItem(authTokenKey);
        getStorage().removeItem(authUserKey);
      } catch (error) {
        console.warn('Could not clear the saved sign-in session.', error);
      }
    }
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
      const data = contentType.includes('application/json') ? await response.json() : {};
      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (HTTP ${response.status}). Please try again.`);
      }
      if (!data.token || !data.user) throw new Error('The server returned an incomplete sign-in response.');

      storeAuthSession(data.token, data.user);
      if (endpoint === 'signup' && data.user.role !== 'health_worker') {
        try {
          window.localStorage.setItem(profileStorageKey, JSON.stringify({
            name: data.user.name,
            phone: data.user.phone,
            age: data.user.age ?? payload.age,
            weightKg: data.user.weightKg ?? payload.weightKg,
            height: data.user.height ?? payload.height,
            bloodType: data.user.bloodType || payload.bloodType,
            healthNotes: data.user.healthNotes ?? payload.healthNotes,
            location: 'Lalitpur',
          }));
        } catch (error) {
          console.warn('Health profile could not be saved on this device.', error);
        }
      }
      const dueDate = payload.dueDate || data.user.dueDate?.slice?.(0, 10);
      if (dueDate) {
        try {
          window.localStorage.setItem('aamacare-due-date', dueDate);
        } catch (error) {
          console.warn('The estimated due date could not be saved on this device.', error);
        }
        const dueDateInput = document.querySelector('.due-date-input');
        if (dueDateInput) {
          dueDateInput.value = dueDate;
          dueDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      navigate(data.user.role === 'health_worker' ? '/health-post' : '/home');
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

  function getWeekSnapshot() {
    const source = window.AamaPregnancy?.getSnapshot?.() || {};
    const week = Math.min(40, Math.max(1, Number(source.week) || 1));
    const language = window.AamaI18n?.getLanguage?.() || source.language || 'en';
    const trimesterIndex = week <= 13 ? 0 : week <= 27 ? 1 : 2;
    const trimesterNames = language === 'ne'
      ? ['पहिलो त्रैमासिक', 'दोस्रो त्रैमासिक', 'तेस्रो त्रैमासिक']
      : ['1st trimester', '2nd trimester', '3rd trimester'];
    const babySize = window.AamaPregnancy?.getBabySize?.(week, language) || '—';
    const progress = Math.round(((week - 1) / 39) * 100);
    const weeksUntilDue = Math.max(0, 40 - week);
    return {
      week,
      language,
      trimester: trimesterNames[trimesterIndex],
      babySize,
      progress,
      weeksUntilDue,
      dueDate: source.dueDate || ''
    };
  }

  function weekLabel(week, language) {
    if (language === 'ne') return `हप्ता ${String(week).replace(/\d/g, (digit) => '०१२३४५६७८९'[digit])}`;
    return `Week ${week}`;
  }

  function syncWeekReferences(snapshot = getWeekSnapshot()) {
    const { week, language, trimester, babySize, progress, weeksUntilDue } = snapshot;
    const label = weekLabel(week, language);
    const number = language === 'ne' ? String(week).replace(/\d/g, (digit) => '०१२३४५६७८९'[digit]) : String(week);
    const progressText = `${progress}%`;
    const trimesterText = language === 'ne'
      ? `पोषण · ${trimester}`
      : `Nutrition · ${trimester}`;
    const movementText = language === 'ne'
      ? `भिडियो · ०४ मिनेट · ${trimester}`
      : `Video · 04 min · ${trimester}`;
    const taskMovementText = language === 'ne'
      ? `${trimester} मा चालचलन र आराम`
      : `Movement and comfort in ${trimester}`;
    const babyText = language === 'ne'
      ? `${babySize} जत्रो`
      : babySize.toLowerCase().startsWith('about ') ? babySize.toLowerCase() : `about ${babySize.toLowerCase()}`;

    document.querySelectorAll('[data-current-week-heading]').forEach((element) => { element.textContent = label; });
    document.querySelectorAll('[data-current-baby-size]').forEach((element) => { element.textContent = babyText; });
    document.querySelectorAll('[data-journey-progress]').forEach((element) => { element.textContent = progressText; });
    document.querySelectorAll('[data-weeks-until-due]').forEach((element) => {
      element.textContent = language === 'ne' ? `${number} हप्ता बाँकी` : `${weeksUntilDue} weeks`;
    });
    document.querySelectorAll('[data-journey-week-of]').forEach((element) => {
      element.textContent = language === 'ne' ? `४० मध्ये हप्ता ${number}` : `${label} of 40`;
    });
    document.querySelectorAll('[data-week-guide]').forEach((element) => {
      element.textContent = language === 'ne' ? `हप्ता ${number} का लागि तयार` : `Made for week ${week}`;
    });
    document.querySelectorAll('[data-week-trimester]').forEach((element) => { element.textContent = movementText; });
    document.querySelectorAll('[data-week-task-trimester]').forEach((element) => { element.textContent = taskMovementText; });
    document.querySelectorAll('[data-learning-week]').forEach((element) => {
      element.textContent = language === 'ne' ? `हप्ता ${number} का लागि सिफारिस` : `Recommended for week ${week}`;
    });
    document.querySelectorAll('[data-video-week]').forEach((element) => {
      element.textContent = language === 'ne' ? `स्वास्थ्य मन्त्रालय · हप्ता ${number}` : `Ministry of Health · Week ${week}`;
    });
    document.querySelectorAll('[data-video-trimester]').forEach((element) => { element.textContent = trimesterText; });

    const progressBar = secondaryView?.querySelector('.mini-progress span');
    if (progressBar) progressBar.style.width = progressText;

    const weekGrid = secondaryView?.querySelector('[data-week-grid]');
    if (weekGrid) {
      secondaryView.querySelectorAll('.trimester-tab').forEach((tab, index) => {
        tab.classList.toggle('is-active', index === (week <= 13 ? 0 : week <= 27 ? 1 : 2));
      });
      const start = Math.max(1, Math.min(37, week - 1));
      weekGrid.innerHTML = Array.from({ length: 4 }, (_, index) => start + index).map((itemWeek) => {
        const state = itemWeek < week ? (language === 'ne' ? 'सम्पन्न' : 'Done')
          : itemWeek === week ? (language === 'ne' ? 'हाल' : 'Current')
            : (language === 'ne' ? 'आउँदैछ' : 'Coming up');
        const title = itemWeek === week
          ? (language === 'ne' ? 'तपाईंको अहिलेको हेरचाह' : 'Care for this week')
          : itemWeek < week
            ? (language === 'ne' ? 'तपाईंको प्रगति' : 'Finding your rhythm')
            : (language === 'ne' ? 'अर्को चरणको तयारी' : 'A little more movement');
        const description = itemWeek === week
          ? (language === 'ne' ? 'पानी पिउनुहोस् र आफ्नो अर्को जाँचका लागि तयार हुनुहोस्।' : 'Keep hydrated and prepare for your next checkup.')
          : (language === 'ne' ? 'यस हप्ताका परिवर्तन र हेरचाहका कुरा हेर्नुहोस्।' : 'Explore the changes and care reminders for this week.');
        return `<article class="week-card${itemWeek === week ? ' is-current' : ''}" data-action="week-card" data-week="${itemWeek}"><div class="week-card__top"><span class="week-number">${itemWeek}</span><span class="week-state">${state}</span></div><strong>${title}</strong><small>${description}</small></article>`;
      }).join('');
    }
  }

  document.addEventListener('aama-week-change', (event) => syncWeekReferences(event.detail));
  document.addEventListener('aama-language-change', () => syncWeekReferences());

  function getAssistantSpeechText(text) {
    return String(text || '')
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/^\s*\d+[.)]\s+/gm, '')
      .replace(/[ \t]+(?=[*-]\s+(?:\*\*|__))/g, ' ')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  }

  function stopAssistantAudio() {
    window.speechSynthesis?.cancel();
    if (currentAssistantAudio) {
      currentAssistantAudio.pause();
      currentAssistantAudio.currentTime = 0;
      currentAssistantAudio = null;
    }
  }

  function speakWithBrowser(text) {
    if (!('speechSynthesis' in window)) {
      if (assistantStatus) assistantStatus.textContent = translate('Audio playback is not available in this browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(getAssistantSpeechText(text));
    utterance.lang = window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.94;
    utterance.onstart = () => {
      if (assistantStatus) assistantStatus.textContent = translate('Reading latest answer aloud.');
    };
    utterance.onend = () => {
      if (assistantReadAloud?.checked && assistantStatus) assistantStatus.textContent = translate('Read-aloud is on.');
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function speakAssistantReply(reply) {
    if (!assistantReadAloud?.checked || !reply?.text) return;
    stopAssistantAudio();
    if (!reply.audio) {
      speakWithBrowser(reply.text);
      return;
    }
    currentAssistantAudio = new Audio(`data:${reply.mimeType || 'audio/mpeg'};base64,${reply.audio}`);
    currentAssistantAudio.onended = () => {
      currentAssistantAudio = null;
      if (assistantReadAloud?.checked && assistantStatus) assistantStatus.textContent = translate('Read-aloud is on.');
    };
    try {
      if (assistantStatus) assistantStatus.textContent = translate('Reading latest answer aloud.');
      await currentAssistantAudio.play();
    } catch (error) {
      currentAssistantAudio = null;
      speakWithBrowser(reply.text);
      console.warn('Audio response could not play; used browser speech instead.', error);
    }
  }

  const routeMap = {
    '/home': { view: 'overview', label: 'My care dashboard' },
    '/home/pregnancy-journey': { view: 'journey', label: 'Pregnancy journey' },
    '/home/health-records': { view: 'records', label: 'Health records' },
    '/home/family-hub': { view: 'family', label: 'Family hub' },
    '/home/community-hub': { view: 'community', label: 'Community hub' },
    '/home/health-services': { view: 'services', label: 'Health services' },
    '/home/learn-prepare': { view: 'learn', label: 'Learn & prepare' },
    '/home/learn-prepare/benefits': { view: 'benefits', label: 'Nepal Government Incentives' },
    '/home/settings': { view: 'settings', label: 'Settings' },
    '/health-post': { view: 'hp-dashboard', label: 'Health Post Dashboard' },
    '/health-post/mothers': { view: 'hp-mothers', label: 'All Registered Mothers' },
    '/health-post/due-soon': { view: 'hp-due-soon', label: 'Due Soon Mothers' },
    '/health-post/appointments': { view: 'hp-appointments', label: 'Appointments' },
    '/health-post/follow-ups': { view: 'hp-followups', label: 'Follow-ups' },
    '/health-post/high-risk': { view: 'hp-high-risk', label: 'High-Risk Mothers' },
    '/health-post/reports': { view: 'hp-reports', label: 'Reports' },
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = translate(message);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function setupScrollReveal() {
    if (!dashboardContent) return;

    const targets = dashboardContent.querySelectorAll(
      '.welcome-row, .alert-banner, .overview-grid > .panel, .quick-actions, .content-grid > .main-column > .panel, .content-grid > .side-column > .panel, .dashboard-footer',
    );
    targets.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 55, 220)}ms`);
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-revealed'));
      return;
    }

    if (!window.aamaScrollRevealObserver) {
      window.aamaScrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }

    targets.forEach((element) => window.aamaScrollRevealObserver.observe(element));
  }

  function focusCareMap(card, openPopup = false) {
    const serviceId = card?.dataset.service;
    if (!serviceId) return null;
    return window.MatriSathiGoogleMaps?.select(serviceId, openPopup) || null;
  }

  function initCareMap() {
    window.MatriSathiGoogleMaps?.init(secondaryView);
  }

  function getProfile() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(profileStorageKey) || '{}');
      const user = readAuthUser();
      return {
        name: typeof saved.name === 'string' ? saved.name : user?.name || '',
        phone: typeof saved.phone === 'string' ? saved.phone : user?.phone || '',
        location: typeof saved.location === 'string' ? saved.location : 'Lalitpur',
        age: String(saved.age ?? '').trim() || (user?.age != null ? String(user.age) : ''),
        bloodType: String(saved.bloodType || user?.bloodType || ''),
        weightKg: String(saved.weightKg ?? '').trim() || (user?.weightKg != null ? String(user.weightKg) : ''),
        healthNotes: String(saved.healthNotes || user?.healthNotes || ''),
        height: String(saved.height ?? '').trim() || (user?.height != null ? String(user.height) : ''),
        prePregnancyWeight: typeof saved.prePregnancyWeight === 'string' ? saved.prePregnancyWeight : '',
      };
    } catch (error) {
      return { name: readAuthUser()?.name || '', phone: '', location: 'Lalitpur', age: '', bloodType: '', height: '', prePregnancyWeight: '' };
    }
  }

  function readWeatherLocation() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(weatherLocationStorageKey) || 'null');
      if (saved && Number.isFinite(Number(saved.latitude)) && Number.isFinite(Number(saved.longitude))) {
        return {
          label: String(saved.label || 'Your location'),
          latitude: Number(saved.latitude),
          longitude: Number(saved.longitude),
        };
      }
    } catch (error) {
      console.warn('Saved weather location could not be restored.', error);
    }
    return { ...defaultWeatherLocation, label: getProfile().location || defaultWeatherLocation.label };
  }

  function saveWeatherLocation(location) {
    weatherState.location = { ...location };
    try {
      window.localStorage.setItem(weatherLocationStorageKey, JSON.stringify(weatherState.location));
    } catch (error) {
      console.warn('Weather location could not be saved locally.', error);
    }
  }

  function weatherNumber(value, suffix = '') {
    return Number.isFinite(Number(value)) ? `${Math.round(Number(value))}${suffix}` : '—';
  }

  function formatWeatherDate(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat(window.AamaI18n?.getLanguage?.() === 'ne' ? 'ne-NP' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }

  function updateWeatherBanner(data, location) {
    const title = document.querySelector('[data-weather-title]');
    const summary = document.querySelector('[data-weather-summary]');
    const icon = document.querySelector('[data-weather-icon]');
    if (!title || !summary || !icon) return;

    const current = data?.current;
    if (!current) {
      title.textContent = `Weather watch for ${location.label}`;
      summary.textContent = 'Weather data is unavailable right now. Tap to try again.';
      icon.textContent = '!';
      return;
    }

    const rainy = Number(current.precipitationMm) > 0 || /rain|drizzle|thunderstorm/i.test(current.condition || '');
    const rainChance = data.forecast?.[0]?.precipitationProbability;
    title.textContent = rainy || Number(rainChance) >= 50
      ? `Weather watch for ${location.label}`
      : `${current.condition} in ${location.label}`;
    summary.textContent = `${weatherNumber(current.temperatureC, '°C')} · ${current.condition}. Rain chance up to ${weatherNumber(rainChance, '%')} today.`;
    icon.textContent = current.icon || (rainy ? '🌧' : '☀');
  }

  async function refreshWeather(location = readWeatherLocation()) {
    if (weatherState.loading) return weatherState.data;
    weatherState.loading = true;
    updateWeatherBanner(null, location);
    try {
      const query = new URLSearchParams({ lat: String(location.latitude), lon: String(location.longitude) });
      const response = await fetch(`${apiBaseUrl}/api/weather?${query.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Weather data is unavailable.');
      weatherState.data = data;
      weatherState.location = location;
      updateWeatherBanner(data, location);
      return data;
    } catch (error) {
      weatherState.data = null;
      updateWeatherBanner(null, location);
      console.warn('Weather could not be loaded.', error);
      return null;
    } finally {
      weatherState.loading = false;
    }
  }

  function weatherDetailsMarkup(data, location) {
    const current = data?.current || {};
    const forecast = Array.isArray(data?.forecast) ? data.forecast : [];
    const forecastRows = forecast.map((day) => `<div class="weather-forecast-row"><div><strong>${escapeHtml(formatWeatherDate(day.date))}</strong><small>${escapeHtml(day.condition || 'Conditions unavailable')}</small></div><span class="weather-forecast-icon" aria-hidden="true">${escapeHtml(day.icon || '•')}</span><strong>${weatherNumber(day.temperatureMaxC, '°')} <small>${weatherNumber(day.temperatureMinC, '°')}</small></strong><span class="weather-rain">${weatherNumber(day.precipitationProbability, '%')} rain</span></div>`).join('');
    const fetchedAt = data?.fetchedAt ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(data.fetchedAt)) : '—';
    return `<div class="weather-current"><span class="weather-current-icon" aria-hidden="true">${escapeHtml(current.icon || '•')}</span><div><strong>${weatherNumber(current.temperatureC, '°C')}</strong><span>${escapeHtml(current.condition || 'Conditions unavailable')}</span><small>Feels like ${weatherNumber(current.apparentTemperatureC, '°C')}</small></div><span class="weather-current-place">${escapeHtml(location.label)}</span></div><div class="weather-metrics"><div><small>Humidity</small><strong>${weatherNumber(current.relativeHumidityPct, '%')}</strong></div><div><small>Wind</small><strong>${weatherNumber(current.windKph, ' km/h')}</strong></div><div><small>Rain now</small><strong>${weatherNumber(current.rainMm, ' mm')}</strong></div></div><div class="weather-forecast"><div class="weather-forecast-heading"><strong>4-day outlook</strong><small>Updated ${escapeHtml(fetchedAt)}</small></div>${forecastRows || '<p class="weather-empty">Forecast is not available right now.</p>'}</div><p class="weather-source">Weather data provided by Open-Meteo · Forecasts are approximate and should not replace local emergency guidance.</p>`;
  }

  async function openWeatherDetails() {
    const location = weatherState.location || readWeatherLocation();
    openInteraction('Weather watch', 'Your local weather', '<p>Checking the latest conditions for your selected location…</p>', '<button class="button button--outline" type="button" data-action="close-modal">Close</button>');
    const data = await refreshWeather(location);
    if (!data) {
      openInteraction('Weather watch', 'Weather unavailable', '<p>We could not load weather data right now. Check your connection and try again.</p>', '<button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="button" data-action="weather-refresh">Try again</button>');
      return;
    }
    openInteraction('Weather watch', `Weather for ${escapeHtml(location.label)}`, weatherDetailsMarkup(data, location), '<div class="weather-modal-actions"><button class="button button--outline" type="button" data-action="weather-use-location">Use my location</button><button class="button button--soft" type="button" data-action="weather-refresh">Refresh</button><button class="button button--primary" type="button" data-action="close-modal">Close</button></div>');
  }

  function useCurrentWeatherLocation() {
    if (!navigator.geolocation) {
      showToast('Location is not available in this browser.');
      return;
    }
    openInteraction('Weather watch', 'Use your current location?', '<p>MaatriSaathi will use your location to retrieve local weather. Your precise coordinates stay on this device.</p><p id="weather-location-status" class="weather-location-status" role="status">Waiting for location permission…</p>', '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button>');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { label: 'Your location', latitude: coords.latitude, longitude: coords.longitude };
      saveWeatherLocation(location);
      await openWeatherDetails();
    }, (error) => {
      const status = document.querySelector('#weather-location-status');
      const message = error.code === error.PERMISSION_DENIED
        ? 'Location permission was not granted. You can continue using Lalitpur.'
        : 'We could not find your location. Please try again.';
      if (status) status.textContent = message;
      showToast(message);
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function profileInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'SK';
  }

  function updateProfileDisplay(profile) {
    const isHealthPost = window.location.pathname.startsWith('/health-post');
    const account = readAuthUser();
    const worker = account?.role === 'health_worker' ? account : null;
    const name = isHealthPost ? worker?.name || 'Saraswati K.C.' : profile.name.trim() || 'Sita K.';
    const avatar = profileInitials(name);
    const nameNode = profileButton?.querySelector('.profile-copy strong');
    const subtitleNode = profileButton?.querySelector('.profile-copy small');
    const avatarNode = profileButton?.querySelector('.avatar');
    if (nameNode) nameNode.textContent = name;
    if (subtitleNode) subtitleNode.textContent = isHealthPost ? worker?.facilityName || (worker ? 'Health worker' : 'Health Assistant') : 'My profile';
    if (avatarNode) avatarNode.textContent = avatar;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const welcomeGreeting = document.querySelector('[data-welcome-greeting]');
    if (welcomeGreeting) {
      const firstName = String(profile.name || '').trim().split(/\s+/)[0];
      welcomeGreeting.textContent = firstName ? `${translate(greeting)}, ${firstName}` : translate(greeting);
    }
    updateDashboardDate();
  }

  function updateDashboardDate() {
    const dateNode = document.querySelector('#dashboard-current-date');
    if (!dateNode) return;
    const language = window.AamaI18n?.getLanguage() || 'en';
    dateNode.textContent = new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());
  }
  updateProfileDisplay(getProfile());
  document.addEventListener('aama-language-change', () => updateProfileDisplay(getProfile()));

  function openProfileDialog() {
    if (window.location.pathname.startsWith('/health-post')) {
      const account = readAuthUser();
      if (account?.role === 'health_worker') {
        const name = escapeHtml(account.name || 'Health Worker');
        const initials = escapeHtml(profileInitials(account.name || 'Health Worker'));
        const phone = escapeHtml(account.phone || 'Not added');
        const facility = escapeHtml(account.facilityName || 'Not added');
        openInteraction(
          'Health worker account',
          'My profile',
          `<div class="profile-dialog-summary"><span class="avatar">${initials}</span><div><strong>${name}</strong><span>Health worker</span><span>${phone}</span></div></div><div class="profile-health-details"><div><small>Role</small><strong>Health worker</strong></div><div><small>Health post or facility</small><strong>${facility}</strong></div><div><small>Mobile number</small><strong>${phone}</strong></div></div>`,
          '<button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="button" data-action="open-logout">Sign out</button>',
        );
        return;
      }
      openInteraction(
        'Health Post Personnel',
        'Assistant profile',
        '<div class="profile-dialog-summary"><span class="avatar">SK</span><div><strong>Saraswati K.C.</strong><span>Health Assistant</span><span>Lagankhel Health Post · Lalitpur</span></div></div><div class="hp-assistant-profile"><div><small>Staff contact</small><strong>9800000401</strong></div><div><small>Account type</small><strong>Health Post Personnel · Preview</strong></div></div><p class="hp-profile-note">This is a fictional assistant profile for the dashboard preview.</p>',
        '<button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="button" data-action="open-logout">Sign out</button>',
      );
      return;
    }
    const profile = getProfile();
    const name = escapeHtml(profile.name);
    const initials = escapeHtml(profileInitials(profile.name));
    const location = escapeHtml(profile.location);
    const phone = escapeHtml(profile.phone || 'Add a mobile number');
    const age = profile.age ? translate('{count} years', { count: escapeHtml(profile.age) }) : 'Not added';
    const bloodType = escapeHtml(profile.bloodType || 'Not added');
    const height = profile.height ? `${escapeHtml(profile.height)} cm` : 'Not added';
    const weight = profile.prePregnancyWeight ? `${escapeHtml(profile.prePregnancyWeight)} kg` : 'Not added';
    const currentWeight = profile.weightKg ? `${escapeHtml(profile.weightKg)} kg` : 'Not added';
    const healthNotes = escapeHtml(profile.healthNotes || 'Not added');
    openInteraction(
      'Your account',
      'Your profile',
      `<div class="profile-dialog-summary"><span class="avatar">${initials}</span><div><strong>${name}</strong><span>${phone}</span><span>${location}</span></div></div><div class="profile-health-details"><div><small>Age</small><strong>${age}</strong></div><div><small>Blood type</small><strong>${bloodType}</strong></div><div><small>Current weight</small><strong>${currentWeight}</strong></div><div><small>Health conditions</small><strong>${healthNotes}</strong></div><div><small>Height</small><strong>${height}</strong></div><div><small>Pre-pregnancy weight</small><strong>${weight}</strong></div></div><div class="profile-menu-list"><button class="profile-menu-item" type="button" data-action="edit-profile"><span class="profile-menu-icon"><i data-lucide="pencil" aria-hidden="true"></i></span><span><strong>Edit profile</strong><small>Update your personal details</small></span><i class="profile-menu-arrow" data-lucide="arrow-right" aria-hidden="true"></i></button><button class="profile-menu-item" type="button" data-action="account-settings"><span class="profile-menu-icon"><i data-lucide="settings" aria-hidden="true"></i></span><span><strong>Settings</strong><small>Language and care preferences</small></span><i class="profile-menu-arrow" data-lucide="arrow-right" aria-hidden="true"></i></button><button class="profile-menu-item" type="button" data-action="account-help"><span class="profile-menu-icon"><i data-lucide="circle-help" aria-hidden="true"></i></span><span><strong>Help &amp; support</strong><small>Ask Aama AI for help</small></span><i class="profile-menu-arrow" data-lucide="arrow-right" aria-hidden="true"></i></button><button class="profile-menu-item profile-menu-item--signout" type="button" data-action="open-logout"><span class="profile-menu-icon"><i data-lucide="log-out" aria-hidden="true"></i></span><span><strong>Sign out</strong><small>End this session safely</small></span><i class="profile-menu-arrow" data-lucide="arrow-right" aria-hidden="true"></i></button></div>`,
    );
  }

  function openProfileEditor() {
    const profile = getProfile();
    openInteraction(
      'Your account',
      'Edit profile',
      `<form class="interaction-form profile-edit-form" id="profile-form"><label for="profile-name">Full name</label><input id="profile-name" name="name" value="${escapeHtml(profile.name)}" autocomplete="name" required maxlength="80"><label for="profile-phone">Mobile number <span class="form-label-hint">optional</span></label><input id="profile-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(profile.phone)}" placeholder="Add a mobile number" maxlength="30"><label for="profile-location">Care location</label><input id="profile-location" name="location" value="${escapeHtml(profile.location)}" autocomplete="address-level2" maxlength="80"><div class="profile-edit-grid"><div><label for="profile-age">Age (years) <span class="form-label-hint">optional</span></label><input id="profile-age" name="age" type="number" min="10" max="60" step="1" inputmode="numeric" value="${escapeHtml(profile.age)}"></div><div><label for="profile-blood-type">Blood type <span class="form-label-hint">optional</span></label><select id="profile-blood-type" name="bloodType"><option value="">Select blood type</option>${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => `<option value="${type}" ${profile.bloodType === type ? 'selected' : ''}>${type}</option>`).join('')}<option value="Unknown" ${profile.bloodType === 'Unknown' ? 'selected' : ''}>I don't know</option></select></div><div><label for="profile-current-weight">Current weight (kg) <span class="form-label-hint">optional</span></label><input id="profile-current-weight" name="weightKg" type="number" min="20" max="300" step="0.1" inputmode="decimal" value="${escapeHtml(profile.weightKg)}"></div><div><label for="profile-height">Height (cm) <span class="form-label-hint">optional</span></label><input id="profile-height" name="height" type="number" min="80" max="250" step="0.1" inputmode="decimal" value="${escapeHtml(profile.height)}"></div><div><label for="profile-pre-pregnancy-weight">Pre-pregnancy weight (kg) <span class="form-label-hint">optional</span></label><input id="profile-pre-pregnancy-weight" name="prePregnancyWeight" type="number" min="20" max="300" step="0.1" inputmode="decimal" value="${escapeHtml(profile.prePregnancyWeight)}"></div></div><label for="profile-health-notes">Health conditions <span class="form-label-hint">optional</span></label><textarea id="profile-health-notes" name="healthNotes" maxlength="500">${escapeHtml(profile.healthNotes)}</textarea><div class="interaction-actions"><button class="button button--outline" type="button" data-action="open-profile">Cancel</button><button class="button button--primary" type="submit">Save profile</button></div></form>`,
    );
    document.querySelector('#profile-name')?.focus();
  }

  function getChecklistTasks() {
    return Array.from(document.querySelectorAll('.task-row input[type="checkbox"]'));
  }

  function updateChecklistSummary() {
    const tasks = getChecklistTasks();
    const completed = tasks.filter((task) => task.checked).length;
    document.querySelectorAll('.checklist-panel .completion-pill').forEach((pill) => {
      pill.textContent = `${completed} of ${tasks.length} done`;
    });
  }

  function updateSharedChecklistSummary() {
    const tasks = Array.from(document.querySelectorAll('.shared-panel .shared-item'));
    const completed = tasks.filter((task) => task.querySelector('.shared-check')?.classList.contains('is-done')).length;
    const pill = document.querySelector('.shared-panel .completion-pill');
    if (pill) pill.textContent = translate(`${completed} of ${tasks.length} done`);
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

  function getFamilyPermissions(member) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(familyPermissionsStorageKey) || '{}');
      return { ...defaultFamilyPermissions, ...(saved[member] || {}) };
    } catch (error) {
      console.warn('Family permissions could not be restored.', error);
      return { ...defaultFamilyPermissions };
    }
  }

  function saveFamilyPermissions(member, permissions) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(familyPermissionsStorageKey) || '{}');
      saved[member] = permissions;
      window.localStorage.setItem(familyPermissionsStorageKey, JSON.stringify(saved));
    } catch (error) {
      console.warn('Family permissions could not be saved locally.', error);
    }
  }

  const familyChecklistStorageKey = 'matrisathi-family-checklist';
  const defaultFamilyChecklist = [
    { id: 'transport', title: 'Confirm transport for checkup', owner: 'Ram', time: 'Done', completed: true },
    { id: 'contacts', title: 'Keep emergency contacts updated', owner: 'Asha', time: 'Done', completed: true },
    { id: 'rain-prep', title: 'Share heavy-rain preparation tips', owner: 'Everyone', time: 'Today', completed: false },
    { id: 'care-bag', title: 'Prepare a small care bag', owner: 'Sita', time: 'This week', completed: false },
  ];

  function getFamilyChecklistItems() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(familyChecklistStorageKey) || 'null');
      return Array.isArray(saved) && saved.length ? saved : defaultFamilyChecklist.map((task) => ({ ...task }));
    } catch (error) {
      console.warn('Family checklist could not be restored.', error);
      return defaultFamilyChecklist.map((task) => ({ ...task }));
    }
  }

  function saveFamilyChecklistItems(items) {
    try {
      window.localStorage.setItem(familyChecklistStorageKey, JSON.stringify(items));
    } catch (error) {
      console.warn('Family checklist could not be saved.', error);
    }
  }

  function renderFamilyChecklist() {
    const list = secondaryView?.querySelector('[data-family-checklist]');
    if (!list) return;
    const tasks = getFamilyChecklistItems();
    const completed = tasks.filter((task) => task.completed).length;
    const progress = secondaryView.querySelector('[data-family-progress]');
    if (progress) progress.textContent = `${completed} of ${tasks.length} done`;
    list.innerHTML = tasks.map((task) => `
      <button class="shared-item${task.completed ? ' is-complete' : ''}" type="button" aria-pressed="${String(Boolean(task.completed))}" data-action="toggle-shared" data-family-task-id="${escapeHtml(task.id)}">
        <span class="shared-check${task.completed ? ' is-done' : ''}">${task.completed ? '<i data-lucide="check" aria-hidden="true"></i>' : ''}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <small>${escapeHtml(task.owner || 'Everyone')} · ${escapeHtml(task.completed ? 'Done' : task.time === 'Done' ? 'Today' : task.time || 'This week')}</small>
      </button>
    `).join('');
  }

  const communityDemoPosts = [
    { id: 'demo-post-1', type: 'question', title: 'What helped with morning sickness around week 12?', body: 'I can manage small meals, but mornings are still difficult. What gentle routines helped you?', topic: 'Morning sickness', location: 'Lalitpur', authorName: 'Maya R.', authorInitials: 'MR', createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), replies: 18, replyItems: [] },
    { id: 'demo-post-2', type: 'story', title: 'A small win from my antenatal visit', body: 'I was nervous about asking questions today, but writing them down first made the visit feel much easier. Sharing in case it helps someone else.', topic: 'Care visits', location: 'Kupondole', authorName: 'Sarita K.', authorInitials: 'SK', createdAt: new Date(Date.now() - 1000 * 60 * 145).toISOString(), replies: 9, replyItems: [] },
    { id: 'demo-post-3', type: 'tip', title: 'Free prenatal stretch session this Saturday', body: 'The community room near Jawalakhel has a gentle session at 8:00 AM. Bring water and a mat if you have one.', topic: 'Movement', location: 'Jawalakhel', authorName: 'Prakriti L.', authorInitials: 'PL', createdAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(), replies: 6, replyItems: [] },
  ];

  const communityDemoPlans = [
    { id: 'demo-plan-1', title: 'Easy evening walk', description: 'A slow, friendly walk before sunset. Everyone can take breaks.', location: 'Jawalakhel Park gate', startsAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), spots: 8, attendeeCount: 5, joined: false, hostName: 'Maya R.', hostInitials: 'MR' },
    { id: 'demo-plan-2', title: 'Prenatal stretch & tea', description: 'Gentle movement followed by tea and a little chat.', location: 'Kupondole community room', startsAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), spots: 10, attendeeCount: 7, joined: false, hostName: 'Prakriti L.', hostInitials: 'PL' },
  ];

  function getStoredAuthToken() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        const token = storage.getItem(authTokenKey);
        if (token) return token;
      } catch (error) {
        console.warn('Community session could not be read.', error);
      }
    }
    return '';
  }

  async function communityRequest(path, options = {}) {
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
    const token = getStoredAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${apiBaseUrl}/api/community${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};
    if (!response.ok) throw new Error(data.error || `Community request failed (HTTP ${response.status}).`);
    return data;
  }

  function getLocalCommunity() {
    try {
      const saved = JSON.parse(window.localStorage.getItem('matrisathi-community-preview') || '{}');
      return {
        posts: Array.isArray(saved.posts) ? saved.posts : [],
        plans: Array.isArray(saved.plans) ? saved.plans : [],
      };
    } catch (error) {
      console.warn('Community preview could not be restored.', error);
      return { posts: [], plans: [] };
    }
  }

  function saveLocalCommunity() {
    try {
      window.localStorage.setItem('matrisathi-community-preview', JSON.stringify({ posts: communityState.posts, plans: communityState.plans }));
    } catch (error) {
      console.warn('Community preview could not be saved.', error);
    }
  }

  function communityRelativeTime(value) {
    const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return translate('just now');
    const count = new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(minutes);
    if (minutes < 60) return translate('{count}m ago', { count });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return translate('{count}h ago', { count: new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(hours) });
    return translate('{count}d ago', { count: new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(Math.floor(hours / 24)) });
  }

  function communityPlanDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return translate('Date to be confirmed');
    const locale = window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en-US';
    return new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  }

  function renderCommunityFeed() {
    const list = secondaryView?.querySelector('[data-community-posts]');
    if (!list) return;
    const filtered = communityState.filter === 'all' ? communityState.posts : communityState.posts.filter((post) => communityState.filter === 'story' ? post.type !== 'question' : post.type === communityState.filter);
    const labels = { question: 'Question', story: 'Story', tip: 'Tip' };
    const count = secondaryView.querySelector('[data-community-post-count]');
    if (count) count.textContent = new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(Math.max(24, communityState.posts.length));
    list.innerHTML = filtered.length ? filtered.map((post) => `
      <article class="community-post-card">
        <div class="community-post-card__top"><span class="member-avatar member-avatar--${post.type === 'question' ? 'one' : post.type === 'story' ? 'two' : 'three'}">${escapeHtml(post.authorInitials || 'Y')}</span><div><strong>${escapeHtml(post.authorName || 'Neighbour')}</strong><small>${escapeHtml(post.location || 'Nearby')} · ${escapeHtml(communityRelativeTime(post.createdAt))}</small></div><span class="community-post-type community-post-type--${escapeHtml(post.type)}">${labels[post.type] || 'Post'}</span></div>
        <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body)}</p><div class="community-post-card__footer"><span>#${escapeHtml(post.topic || 'General')}</span><button class="community-post-reply" type="button" data-action="community-post-detail" data-community-post-id="${escapeHtml(post.id)}">${escapeHtml(translate(post.replies === 1 ? '{count} reply' : '{count} replies', { count: new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(post.replies || 0) }))} <span>→</span></button></div>
      </article>
    `).join('') : '<div class="community-empty"><strong>No posts in this view yet.</strong><span>Start the conversation with women nearby.</span></div>';
    window.AamaI18n?.translatePage();
  }

  function renderCommunityPlans() {
    const list = secondaryView?.querySelector('[data-community-plans]');
    if (!list) return;
    const count = secondaryView.querySelector('[data-community-plan-count]');
    if (count) count.textContent = new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(Math.max(communityState.plans.length, 6));
    list.innerHTML = communityState.plans.length ? communityState.plans.slice(0, 3).map((plan) => {
      const full = Number(plan.attendeeCount) >= Number(plan.spots);
      const numberLocale = window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en';
      const attendance = translate('{count}/{total} women joined', { count: new Intl.NumberFormat(numberLocale).format(Number(plan.attendeeCount || 0)), total: new Intl.NumberFormat(numberLocale).format(Number(plan.spots || 8)) });
      return `<article class="community-plan"><div class="community-plan__date"><strong>${escapeHtml(communityPlanDate(plan.startsAt).split(',')[0])}</strong><small>${escapeHtml(communityPlanDate(plan.startsAt).split(',').slice(1).join(',').trim())}</small></div><div class="community-plan__copy"><strong>${escapeHtml(plan.title)}</strong><small>${escapeHtml(plan.location)}</small><span>${escapeHtml(attendance)}</span></div><button class="community-plan__join${plan.joined ? ' is-joined' : ''}" type="button" data-action="community-join-plan" data-community-plan-id="${escapeHtml(plan.id)}"${full && !plan.joined ? ' disabled' : ''}>${plan.joined ? 'Joined' : full ? 'Full' : 'Join'}</button></article>`;
    }).join('') : '<div class="community-empty"><strong>No plans yet.</strong><span>Be the first to plan a gentle get-together.</span></div>';
    window.AamaI18n?.translatePage();
  }

  function renderCommunityHub() {
    renderCommunityFeed();
    renderCommunityPlans();
  }

  document.addEventListener('aama-language-change', () => {
    if (window.location.pathname === '/home/community-hub') renderCommunityHub();
  });

  async function initCommunityHub() {
    const local = getLocalCommunity();
    communityState.posts = [...local.posts, ...communityDemoPosts];
    communityState.plans = [...local.plans, ...communityDemoPlans];
    renderCommunityHub();
    try {
      const [postData, planData] = await Promise.all([communityRequest('/posts?limit=30'), communityRequest('/plans?limit=20')]);
      communityState.posts = postData.posts || [];
      communityState.plans = planData.plans || [];
      communityState.loaded = true;
      renderCommunityHub();
    } catch (error) {
      console.warn('Community API unavailable; showing local preview.', error);
    }
  }

  function openCommunityPost(post) {
    if (!post) return;
    const replies = (post.replyItems || []).map((reply) => `<div class="community-reply"><strong>${escapeHtml(reply.authorName)}</strong><p>${escapeHtml(reply.body)}</p></div>`).join('');
    openInteraction('Community hub', post.title, `<p>${escapeHtml(post.body)}</p><div class="community-reply-list">${replies || '<p class="community-empty">No replies yet. Be the first to respond kindly.</p>'}</div><form class="interaction-form" id="community-reply-form" data-post-id="${escapeHtml(post.id)}"><label for="community-reply-body">Add a thoughtful reply</label><textarea id="community-reply-body" name="body" maxlength="1200" placeholder="Share what helped you…" required></textarea><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="submit">Reply</button></div></form>`);
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
    check.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>';

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
      return `<div class="detail-row"><span>${escapeHtml(time)}</span><strong>${task.checked ? '<i data-lucide="check" aria-hidden="true"></i> ' : ''}${escapeHtml(title)}</strong></div>`;
    }).join('');
    openInteraction('Small steps, big care', 'Your reminders', `<div class="detail-list">${taskRows}</div><div class="modal-callout">Tap a checklist item on your dashboard whenever you finish it. Your progress is saved on this device.</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Back to checklist</button>');
  }

  function showDashboard() {
    loginScreen?.classList.add('is-hidden');
    dashboardScreen?.classList.remove('is-hidden');
    updateProfileDisplay(getProfile());
    void refreshWeather();
    document.title = translate('MaatriSaathi · My care dashboard');
    window.AamaI18n?.translatePage();
    syncWeekReferences();
    setupScrollReveal();
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

  function updateSignupRoleFields() {
    const isHealthWorker = signupRole?.value === 'health_worker';
    [[signupUserFields, !isHealthWorker], [signupWorkerFields, isHealthWorker]].forEach(([container, enabled]) => {
      if (!container) return;
      container.hidden = !enabled;
      container.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = !enabled; });
    });
  }
  signupRole?.addEventListener('change', updateSignupRoleFields);
  updateSignupRoleFields();

  function showLogin() {
    dashboardScreen?.classList.add('is-hidden');
    loginScreen?.classList.remove('is-hidden');
    document.title = translate('MaatriSaathi · Pregnancy companion');
    window.AamaI18n?.translatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDashboardView(view, label) {
    const isHealthPost = view.startsWith('hp-');
    updateProfileDisplay(getProfile());
    if (isHealthPost && sideNav) {
      const items = [
        ['hp-dashboard', '/health-post', 'layout-dashboard', 'Dashboard'],
        ['hp-mothers', '/health-post/mothers', 'heart-pulse', 'All Registered Mothers'],
        ['hp-due-soon', '/health-post/due-soon', 'calendar-clock', 'Due Soon Mothers'],
        ['hp-appointments', '/health-post/appointments', 'calendar-days', 'Appointments'],
        ['hp-followups', '/health-post/follow-ups', 'rotate-cw', 'Follow-ups'],
        ['hp-high-risk', '/health-post/high-risk', 'triangle-alert', 'High-Risk Mothers'],
        ['hp-reports', '/health-post/reports', 'chart-no-axes-column-increasing', 'Reports'],
      ];
      sideNav.innerHTML = items.map(([key, route, icon, text]) => `<a class="nav-item${view === key ? ' is-active' : ''}" data-view="${key}" data-route="${route}" href="${route}"${view === key ? ' aria-current="page"' : ''}><span class="nav-icon"><i data-lucide="${icon}" aria-hidden="true"></i></span><span>${text}</span></a>`).join('');
      if (sidebarSectionLabel) sidebarSectionLabel.textContent = 'Health post';
      supportCard?.classList.add('is-hidden');
      maternalSettingsItem?.classList.add('is-hidden');
      notificationButton?.classList.add('is-hidden');
    } else if (sideNav) {
      sideNav.innerHTML = originalSideNav;
      if (!sideNav.querySelector('[data-view="community"]')) {
        const communityNav = document.createElement('button');
        communityNav.className = 'nav-item';
        communityNav.type = 'button';
        communityNav.dataset.view = 'community';
        communityNav.dataset.route = '/home/community-hub';
        communityNav.innerHTML = '<span class="nav-icon"><i data-lucide="heart" aria-hidden="true"></i></span><span>Community hub</span>';
        const servicesNav = sideNav.querySelector('[data-view="services"]');
        sideNav.insertBefore(communityNav, servicesNav || null);
        window.lucide?.createIcons?.();
      }
      if (sidebarSectionLabel) sidebarSectionLabel.textContent = 'Your care space';
      supportCard?.classList.remove('is-hidden');
      maternalSettingsItem?.classList.remove('is-hidden');
      notificationButton?.classList.remove('is-hidden');
    }
    document.querySelectorAll('.nav-item[data-route]').forEach((nav) => {
      nav.classList.remove('is-active');
      nav.removeAttribute('aria-current');
    });
    const activeNav = document.querySelector(`.nav-item[data-view="${view === 'benefits' ? 'learn' : view}"]`);
    activeNav?.classList.add('is-active');
    activeNav?.setAttribute('aria-current', 'page');
    const learnNav = document.querySelector('.nav-item[data-view="learn"]');
    const learnSubnav = document.querySelector('#learn-subnav');
    const learnExpanded = view === 'learn' || view === 'benefits';
    learnSubnav?.classList.toggle('is-hidden', !learnExpanded);
    learnNav?.setAttribute('aria-expanded', String(learnExpanded));
    document.querySelectorAll('.learn-subnav-item').forEach((item) => {
      item.classList.remove('is-active');
      item.removeAttribute('aria-current');
    });
    if (view === 'benefits') {
      const benefitsNav = learnSubnav?.querySelector('[data-route="/home/learn-prepare/benefits"]');
      benefitsNav?.classList.add('is-active');
      benefitsNav?.setAttribute('aria-current', 'page');
    }
    sidebar?.classList.remove('is-open');
    if (view === 'overview') {
      dashboardContent?.classList.remove('is-hidden');
      secondaryView?.classList.add('is-hidden');
    } else if (isHealthPost && secondaryView) {
      dashboardContent?.classList.add('is-hidden');
      try {
        const healthPostView = view === 'hp-dashboard'
          ? window.AamaHealthPost.dashboard()
          : window.AamaHealthPost.section(view.replace(/^hp-/, ''));
        secondaryView.innerHTML = healthPostView;
      } catch (error) {
        console.error('Health Post preview could not be rendered.', error);
        secondaryView.innerHTML = '<div class="hp-error" role="alert"><strong>Preview could not load</strong><p>There was a problem displaying the sample dashboard.</p><button class="button button--primary" type="button" data-route="/health-post">Try again</button></div>';
      }
      secondaryView.classList.remove('is-hidden');
    } else if (views[view] && secondaryView) {
      dashboardContent?.classList.add('is-hidden');
      secondaryView.innerHTML = views[view];
      secondaryView.classList.remove('is-hidden');
      if (view === 'settings') restoreSettings();
      if (view === 'learn') window.AamaLearn?.init(secondaryView);
      if (view === 'benefits') window.AamaBenefits?.render(secondaryView);
      if (view === 'family') {
        renderFamilyChecklist();
        updateSharedChecklistSummary();
      }
      if (view === 'community') void initCommunityHub();
    }
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = label;
    document.querySelector('.breadcrumb')?.classList.toggle('breadcrumb--benefits', view === 'benefits');
    document.querySelector('.breadcrumb-learn')?.classList.toggle('is-hidden', view !== 'benefits');
    document.querySelector('.breadcrumb-learn-separator')?.classList.toggle('is-hidden', view !== 'benefits');
    document.title = isHealthPost ? `MaatriSaathi · ${label}` : 'MaatriSaathi · My care dashboard';
    window.AamaI18n?.translatePage();
    if (view === 'journey' && window.AamaPregnancyJourneyState) applyJourneyCalendar(window.AamaPregnancyJourneyState);
    syncWeekReferences();
    if (view === 'services') initCareMap();
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

  document.addEventListener('aama-language-change', () => {
    updateProfileDisplay(getProfile());
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

  function saveSettings() {
    const language = secondaryView?.querySelector('.settings-row select');
    const settings = { language: language?.value || 'English' };
    secondaryView?.querySelectorAll('.settings-row input[type="checkbox"]').forEach((input) => {
      const key = input.getAttribute('aria-label');
      if (key) settings[key] = input.checked;
    });
    try {
      window.localStorage.setItem('aamacare-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Settings could not be saved locally.', error);
    }
    showToast('Your settings have been saved');
  }

  function closeInteraction() {
    interactionModal?.classList.add('is-hidden');
    interactionModal?.setAttribute('aria-hidden', 'true');
    profileButton?.setAttribute('aria-expanded', 'false');
    if (interactionContent) interactionContent.innerHTML = '';
    if (interactionReturnFocus?.isConnected) interactionReturnFocus.focus();
    interactionReturnFocus = null;
  }

  function openInteraction(eyebrow, title, body, actions = '') {
    if (!interactionModal || !interactionContent) return;
    interactionReturnFocus = document.activeElement;
    interactionContent.innerHTML = `<p class="card-kicker">${eyebrow}</p><h2 id="interaction-title">${title}</h2>${body}${actions ? `<div class="interaction-actions">${actions}</div>` : ''}`;
    window.AamaI18n?.translatePage();
    interactionModal.classList.remove('is-hidden');
    interactionModal.setAttribute('aria-hidden', 'false');
    profileButton?.setAttribute('aria-expanded', String(document.activeElement === profileButton));
    interactionClose?.focus();
  }

  function openEmergencyHelplines() {
    const contacts = [
      ['Ambulance Service', 'Emergency ambulance service', '102'],
      ['Patan Hospital', 'Hospital · Emergency department', '01-5522295'],
      ['Lagankhel Health Post', 'Health post · Lalitpur', '01-5537711'],
    ];
    const rows = contacts.map(([name, type, phone]) => `
      <article class="helpline-row">
        <span class="helpline-row__icon"><i data-lucide="phone-call" aria-hidden="true"></i></span>
        <div class="helpline-row__details"><strong>${name}</strong><span>${type}</span></div>
        <a class="helpline-call" href="tel:${phone}" aria-label="Call ${name} at ${phone}"><i data-lucide="phone" aria-hidden="true"></i>${phone}</a>
      </article>
    `).join('');
    openInteraction(
      translate('Emergency support'),
      translate('Nearby emergency helplines'),
      `<div class="helpline-list">${rows}</div>`,
      `<button class="button button--primary" type="button" data-action="close-modal">${translate('Close')}</button>`
    );
  }

  function openPermissionEditor(member) {
    const memberName = member || 'Circle member';
    const permissions = getFamilyPermissions(memberName);
    const rows = [
      ['Tasks and appointments', 'See shared tasks and upcoming visits.'],
      ['Pregnancy journey', 'View your weekly care updates and progress.'],
      ['Health records', 'View records you choose to share with your circle.'],
      ['Emergency alerts', 'Receive important safety and emergency updates.'],
    ];

    const permissionRows = rows.map(([label, description]) => {
      const inputId = `permission-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      return `
        <label class="permission-row" for="${inputId}">
          <span class="permission-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(description)}</small></span>
          <span class="permission-switch">
            <input id="${inputId}" name="${escapeHtml(label)}" type="checkbox"${permissions[label] ? ' checked' : ''}>
            <span class="permission-switch__track" aria-hidden="true"></span>
          </span>
        </label>
      `;
    });

    openInteraction(
      'Family hub',
      `Edit permissions for ${escapeHtml(memberName)}`,
      `<p>Choose what this person can see and which updates they should receive.</p><form class="permission-form" id="permission-form" data-member="${escapeHtml(memberName)}"><div class="permission-group"><div class="permission-group__heading"><span>Shared access</span><small>Visible in their Family Hub</small></div>${permissionRows.slice(0, 3).join('')}</div><div class="permission-group"><div class="permission-group__heading"><span>Alerts</span><small>Keep them informed when it matters</small></div>${permissionRows.slice(3).join('')}</div><p class="permission-note"><i data-lucide="shield-check" aria-hidden="true"></i> You can change these permissions at any time.</p><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Save permissions</button></div></form>`
    );
    document.querySelector('#permission-form input')?.focus();
  }

  async function handleAction(action, target) {
    if (action === 'toggle-patient-contact') {
      const isRevealed = target.getAttribute('aria-pressed') === 'true';
      const value = target.querySelector('[data-contact-value]');
      const actionLabel = target.querySelector('[data-contact-action]');
      target.setAttribute('aria-pressed', String(!isRevealed));
      target.setAttribute('aria-label', `${isRevealed ? 'Show' : 'Hide'} contact number for ${target.dataset.contactName || 'mother'}`);
      if (value) value.textContent = isRevealed ? target.dataset.masked : target.dataset.phone;
      if (actionLabel) actionLabel.textContent = isRevealed ? 'Show' : 'Hide';
    } else if (action === 'open-profile') {
      openProfileDialog();
    } else if (action === 'weather-details') {
      void openWeatherDetails();
    } else if (action === 'weather-refresh') {
      void openWeatherDetails();
    } else if (action === 'weather-use-location') {
      useCurrentWeatherLocation();
    } else if (action === 'edit-profile') {
      openProfileEditor();
    } else if (action === 'account-settings') {
      closeInteraction();
      navigate('/home/settings');
    } else if (action === 'account-help') {
      closeInteraction();
      openAssistant();
    } else if (action === 'open-logout') {
      openInteraction('Sign out', 'Leave MaatriSaathi for now?', '<p>Your dashboard will be closed, but your saved care information will remain safe.</p>', '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="button" data-action="confirm-logout">Sign out</button>');
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
      const member = target.dataset.member || 'Circle member';
      const permissions = getFamilyPermissions(member);
      openInteraction('Family hub', member, '<p>This person can receive the permissions you choose.</p><div class="detail-list"><div class="detail-row"><span>Shared access</span><strong>Tasks and appointments</strong></div><div class="detail-row"><span>Emergency alerts</span><strong>' + (permissions['Emergency alerts'] ? 'Enabled' : 'Disabled') + '</strong></div></div>', `<button class="button button--outline" type="button" data-action="close-modal">Close</button><button class="button button--primary" type="button" data-action="edit-permissions" data-member="${escapeHtml(member)}">Edit permissions</button>`);
    } else if (action === 'edit-permissions') {
      openPermissionEditor(target.dataset.member || 'Circle member');
    } else if (action === 'family-options') {
      openInteraction('Family hub', 'Family permissions', '<p>Review who can see tasks, appointments, and selected care updates.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Review access</button>');
    } else if (action === 'community-compose') {
      openInteraction('Community hub', 'Share with nearby women', '<form class="interaction-form" id="community-post-form"><label for="community-post-type">What would you like to share?</label><select id="community-post-type" name="type"><option value="question">Ask a question</option><option value="story">Share a story</option><option value="tip">Share a helpful tip</option></select><label for="community-post-title">Title</label><input id="community-post-title" name="title" maxlength="140" placeholder="e.g. What helped with back pain?" required><label for="community-post-body">Your message</label><textarea id="community-post-body" name="body" maxlength="2000" placeholder="Write with as much detail as feels comfortable…" required></textarea><label for="community-post-topic">Topic <span class="form-label-hint">optional</span></label><input id="community-post-topic" name="topic" maxlength="60" placeholder="e.g. Movement, nutrition, newborn care"><label for="community-post-location">Nearby area <span class="form-label-hint">optional</span></label><input id="community-post-location" name="location" maxlength="80" value="Lalitpur" placeholder="e.g. Jawalakhel"><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Publish post</button></div></form>');
    } else if (action === 'community-create-plan') {
      const minimumDate = new Date(Date.now() + 60 * 60 * 1000);
      const dateValue = new Date(minimumDate.getTime() - minimumDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      openInteraction('Community hub', 'Plan time together', `<form class="interaction-form" id="community-plan-form"><label for="community-plan-title">What are you planning?</label><input id="community-plan-title" name="title" maxlength="120" placeholder="e.g. Easy evening walk" required><label for="community-plan-location">Where should people meet?</label><input id="community-plan-location" name="location" maxlength="120" placeholder="e.g. Jawalakhel Park gate" required><label for="community-plan-starts">Date and time</label><input id="community-plan-starts" name="startsAt" type="datetime-local" min="${dateValue}" required><label for="community-plan-spots">How many women can join?</label><input id="community-plan-spots" name="spots" type="number" min="2" max="50" value="8" required><label for="community-plan-description">A few details <span class="form-label-hint">optional</span></label><textarea id="community-plan-description" name="description" maxlength="500" placeholder="Keep it gentle, friendly, and clear."></textarea><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Create plan</button></div></form>`);
    } else if (action === 'community-filter') {
      communityState.filter = target.dataset.filter || 'all';
      secondaryView?.querySelectorAll('.community-tab').forEach((tab) => {
        const active = tab.dataset.filter === communityState.filter;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      renderCommunityFeed();
    } else if (action === 'community-post-detail') {
      openCommunityPost(communityState.posts.find((post) => String(post.id) === String(target.dataset.communityPostId)));
    } else if (action === 'community-join-plan') {
      const plan = communityState.plans.find((item) => String(item.id) === String(target.dataset.communityPlanId));
      if (!plan) return;
      const wasJoined = Boolean(plan.joined);
      plan.joined = !wasJoined;
      plan.attendeeCount = Math.max(0, Number(plan.attendeeCount || 0) + (wasJoined ? -1 : 1));
      renderCommunityPlans();
      try {
        if (!String(plan.id).startsWith('demo-')) {
          const data = await communityRequest(`/plans/${encodeURIComponent(plan.id)}/join`, { method: 'POST' });
          Object.assign(plan, data.plan);
          renderCommunityPlans();
        } else {
          saveLocalCommunity();
        }
        showToast(plan.joined ? 'You joined the community plan.' : 'You left the community plan.');
      } catch (error) {
        plan.joined = wasJoined;
        plan.attendeeCount = Math.max(0, Number(plan.attendeeCount || 0) + (wasJoined ? 1 : -1));
        renderCommunityPlans();
        showToast(error.message || 'The plan could not be updated.');
      }
    } else if (action === 'community-view-plans') {
      openInteraction('Community hub', 'Plans near you', `<div class="detail-list">${communityState.plans.map((plan) => `<div class="detail-row"><span>${escapeHtml(communityPlanDate(plan.startsAt))}</span><strong>${escapeHtml(plan.title)} · ${escapeHtml(plan.location)}</strong></div>`).join('')}</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'community-say-hello') {
      showToast(`A hello is ready for ${target.dataset.name || 'your neighbour'}.`);
    } else if (action === 'community-options') {
      openInteraction('Community hub', 'A safe space for support', '<p>Keep your posts kind and general. Do not share passwords, private medical records, or your exact home address.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Got it</button>');
    } else if (action === 'community-neighbours') {
      openInteraction('Community hub', 'Meet women nearby', '<p>We only show approximate areas and shared interests. You decide when and how to connect.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'toggle-shared') {
      const taskId = target.dataset.familyTaskId;
      if (!taskId) return;
      const tasks = getFamilyChecklistItems().map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
      saveFamilyChecklistItems(tasks);
      renderFamilyChecklist();
      const task = tasks.find((item) => item.id === taskId);
      target.setAttribute('aria-pressed', String(Boolean(task?.completed)));
      showToast(task?.completed ? 'Family task marked complete.' : 'Family task added back.');
    } else if (action === 'add-family-task') {
      openInteraction('Shared support', 'Add a family task', '<form class="interaction-form" id="family-task-form"><label for="family-task-title">Task</label><input id="family-task-title" name="title" maxlength="90" placeholder="e.g. Pack hospital documents" required><label for="family-task-owner">Who is responsible?</label><select id="family-task-owner" name="owner"><option>Everyone</option><option>Sita</option><option>Ram</option><option>Asha</option></select><label for="family-task-time">When?</label><input id="family-task-time" name="time" maxlength="30" placeholder="e.g. Today or This week"><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Add task</button></div></form>');
    } else if (action === 'shared-checklist') {
      const tasks = getFamilyChecklistItems();
      const rows = tasks.map((task) => `<div class="detail-row"><span>${escapeHtml(task.owner || 'Everyone')} · ${escapeHtml(task.time || 'This week')}</span><strong>${task.completed ? '<i data-lucide="check" aria-hidden="true"></i> ' : ''}${escapeHtml(task.title)}</strong></div>`).join('');
      openInteraction('Shared support', 'Everyone knows the next step', `<div class="detail-list">${rows}</div><div class="modal-callout">Your family checklist is saved on this device. Add or update tasks from the Family Hub.</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'show-reminders') {
      openReminders();
    } else if (action === 'add-checklist') {
      openInteraction('Small steps, big care', 'Add a checklist item', '<form class="interaction-form" id="checklist-form"><label for="checklist-title">What do you want to remember?</label><input id="checklist-title" name="title" placeholder="e.g. Take a short walk" required maxlength="80"><label for="checklist-details">Details <span class="form-label-hint">optional</span></label><input id="checklist-details" name="details" placeholder="e.g. Move gently for 10 minutes" maxlength="120"><label for="checklist-time">When?</label><input id="checklist-time" name="time" placeholder="e.g. Today or 4:00 PM" maxlength="30"><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Add to checklist</button></div></form>');
    } else if (action === 'use-location') {
      window.MatriSathiGoogleMaps?.useCurrentLocation(secondaryView);
    } else if (action === 'service-filter') {
      openInteraction('Health services', 'Filter nearby care', '<div class="interaction-form interaction-form--filters"><label class="filter-option"><input type="checkbox" checked><span>Maternity care</span></label><label class="filter-option"><input type="checkbox"><span>Emergency care</span></label><label class="filter-option"><input type="checkbox"><span>Pharmacy</span></label><label class="filter-option"><input type="checkbox"><span>Open now</span></label></div>', '<button class="button button--primary" type="button" data-action="close-modal">Apply filters</button>');
    } else if (action === 'select-service') {
      secondaryView?.querySelectorAll('.service-card').forEach((card) => card.classList.remove('is-selected'));
      target.classList.add('is-selected');
      const selectedPlace = focusCareMap(target, true);
      const place = selectedPlace?.place;
      const position = selectedPlace?.position;
      const distance = Number.isFinite(selectedPlace?.distance) ? `${selectedPlace.distance.toFixed(1)} km away` : 'Distance unavailable';
      const serviceType = String(place?.primaryType || place?.types?.[0] || 'Health service').replaceAll('_', ' ');
      const details = [
        ['Distance', distance],
        ['Type', serviceType],
        ['Address', place?.formattedAddress || 'Address unavailable'],
        ...(place?.nationalPhoneNumber ? [['Phone', place.nationalPhoneNumber]] : []),
      ];
      const detailsMarkup = `<div class="detail-list">${details.map(([label, value]) => `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`;
      const phone = place?.nationalPhoneNumber ? `<a class="button button--outline" href="tel:${escapeHtml(place.nationalPhoneNumber.replace(/[^\d+]/g, ''))}">Call</a>` : '';
      const directions = position
        ? `<a class="button button--primary" href="https://www.google.com/maps/dir/?api=1&amp;destination=${position.lat},${position.lng}" target="_blank" rel="noopener noreferrer">Get directions</a>`
        : '<button class="button button--primary" type="button" data-action="close-modal">Close</button>';
      openInteraction('Nearby care', place?.displayName || target.dataset.service || 'Health service', detailsMarkup, `${phone}${directions}`);
    } else if (action === 'topic-filter') {
      const currentWeek = getWeekSnapshot().week;
      openInteraction('Learn & prepare', target.dataset.topic || 'Learning topic', `<p>We will show week ${currentWeek} content, Nepali audio, and trusted videos for this topic.</p>`, '<button class="button button--primary" type="button" data-action="close-modal">Show content</button>');
    } else if (action === 'play-learning') {
      openInteraction('Learn & prepare', target.dataset.title || 'Recommended learning', '<div class="video-player-placeholder"><span>▶</span><p>Preview player</p></div><p>This video placeholder is ready for the Ministry of Health media URL.</p>', '<button class="button button--primary" type="button" data-action="close-modal">Close player</button>');
    } else if (action === 'close-modal') {
      closeInteraction();
    } else if (action === 'benefits-retry') {
      window.AamaBenefits?.render(secondaryView);
    } else if (action === 'benefits-ask-ai') {
      openAssistant();
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
      setAuthMode(destination === '/sign' ? 'signup' : 'login');
      showLogin();
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

  function appendAssistantInlineContent(parent, value) {
    const text = String(value || '');
    const boldPattern = /(\*\*|__)(.+?)\1/g;
    let cursor = 0;
    let match;

    while ((match = boldPattern.exec(text))) {
      if (match.index > cursor) parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      const strong = document.createElement('strong');
      strong.textContent = match[2];
      parent.appendChild(strong);
      cursor = match.index + match[0].length;
    }

    if (cursor < text.length) parent.appendChild(document.createTextNode(text.slice(cursor)));
  }

  function renderAssistantReply(message, reply) {
    if (!message) return;
    message.replaceChildren();

    const normalizedReply = String(reply || '')
      .replace(/\r\n?/g, '\n')
      // Some model responses place Markdown bullets on one line. Split only
      // clear list markers before bold labels, leaving italic text untouched.
      .replace(/[ \t]+(?=[*-]\s+(?:\*\*|__))/g, '\n')
      .replace(/[ \t]+(?=\d+[.)]\s+)/g, '\n');
    const lines = normalizedReply.split('\n');
    let paragraphLines = [];
    let activeList = null;

    const flushParagraph = () => {
      if (!paragraphLines.length) return;
      const paragraph = document.createElement('p');
      appendAssistantInlineContent(paragraph, paragraphLines.join(' '));
      message.appendChild(paragraph);
      paragraphLines = [];
    };

    const flushList = () => {
      if (!activeList) return;
      const list = document.createElement(activeList.type);
      activeList.items.forEach((item) => {
        const listItem = document.createElement('li');
        appendAssistantInlineContent(listItem, item);
        list.appendChild(listItem);
      });
      message.appendChild(list);
      activeList = null;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
      const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
      const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);

      if (headingMatch) {
        flushParagraph();
        flushList();
        const heading = document.createElement('h4');
        appendAssistantInlineContent(heading, headingMatch[1]);
        message.appendChild(heading);
        return;
      }

      if (orderedMatch || unorderedMatch) {
        flushParagraph();
        const type = orderedMatch ? 'ol' : 'ul';
        const item = (orderedMatch || unorderedMatch)[1];
        if (!activeList || activeList.type !== type) {
          flushList();
          activeList = { type, items: [] };
        }
        activeList.items.push(item);
        return;
      }

      if (activeList) flushList();
      paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushList();
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
      const response = await fetch(`${apiBaseUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: cleanMessage, language: window.AamaI18n?.getLanguage() === 'ne' ? 'ne' : 'en' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      renderAssistantReply(thinkingMessage, data.reply);
      latestAssistantReply = { text: data.reply, audio: data.audio, mimeType: data.mimeType };
      await speakAssistantReply(latestAssistantReply);
    } catch (error) {
      renderAssistantReply(thinkingMessage, translate('I could not connect right now. Please try again.'));
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
      role: loginRole?.value || 'user',
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
    const role = signupRole?.value || 'user';
    const payload = {
      role,
      name: document.querySelector('#signup-name')?.value.trim(),
      phone: signupPhoneInput?.value.trim(),
      password: document.querySelector('#signup-password')?.value || '',
      preferredLanguage: window.AamaI18n?.getLanguage() || 'ne',
    };
    if (role === 'health_worker') {
      payload.facilityName = document.querySelector('#signup-facility')?.value.trim() || '';
    } else {
      payload.dueDate = signupDueDateInput?.value;
      payload.age = Number(document.querySelector('#signup-age')?.value);
      payload.weightKg = Number(document.querySelector('#signup-weight')?.value);
      payload.height = Number(document.querySelector('#signup-height')?.value);
      payload.bloodType = document.querySelector('#signup-blood-type')?.value;
      payload.healthNotes = document.querySelector('#signup-health-notes')?.value.trim() || '';
    }
    submitAuthForm('signup', payload, signupForm, 'Account created successfully.');
  });
  demoLogin?.addEventListener('click', () => {
    clearAuthSession();
    navigate('/home');
    showToast('Preview mode started. No account was created.');
  });
  healthPostPreview?.addEventListener('click', () => {
    navigate('/health-post');
    showToast('Health Post preview opened with sample records.');
  });
  logoutButton?.addEventListener('click', () => {
    openInteraction(
      'Sign out',
      'Leave MaatriSaathi for now?',
      '<p>Your dashboard will be closed, but your saved care information will remain safe.</p>',
      '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="button" data-action="confirm-logout">Sign out</button>'
    );
  });
  profileButton?.addEventListener('click', openProfileDialog);
  notificationButton?.addEventListener('click', openEmergencyHelplines);
  togglePin?.addEventListener('click', () => {
    if (!pinInput) return;
    const isPassword = pinInput.type === 'password';
    pinInput.type = isPassword ? 'text' : 'password';
    togglePin.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;
    togglePin.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
  forgotLink?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('PIN recovery will be connected to SMS in the next build.');
  });
  assistantReadAloud?.addEventListener('change', () => {
    const enabled = assistantReadAloud.checked;
    try { window.localStorage.setItem('aamacare-read-aloud', enabled ? 'on' : 'off'); } catch { /* preference is session-only */ }
    if (assistantStatus) assistantStatus.textContent = translate(enabled ? 'Read-aloud is on.' : 'Read-aloud is off.');
    if (enabled) speakAssistantReply(latestAssistantReply);
    else stopAssistantAudio();
  });
  try {
    if (window.localStorage.getItem('aamacare-read-aloud') === 'on' && assistantReadAloud) assistantReadAloud.checked = true;
  } catch { /* preference is session-only */ }
  document.querySelectorAll('.ai-launcher').forEach((button) => button.addEventListener('click', openAssistant));
  document.addEventListener('click', (event) => {
    const learnNavItem = event.target.closest('[data-learn-nav]');
    if (learnNavItem) {
      const openBranch = () => {
        window.AamaLearn?.open(secondaryView, learnNavItem.dataset.learnNav);
        document.querySelectorAll('.learn-subnav-item').forEach((item) => {
          const selected = item === learnNavItem;
          item.classList.toggle('is-active', selected);
          if (selected) item.setAttribute('aria-current', 'page');
          else item.removeAttribute('aria-current');
        });
      };
      if (window.location.pathname !== '/home/learn-prepare') {
        navigate('/home/learn-prepare');
        openBranch();
      } else openBranch();
      return;
    }
    const learnTopic = event.target.closest('[data-learn-page]');
    if (learnTopic) {
      window.AamaLearn?.open(secondaryView, learnTopic.dataset.learnPage);
      document.querySelectorAll('.learn-subnav-item').forEach((item) => {
        const selected = item.dataset.learnNav === learnTopic.dataset.learnPage;
        item.classList.toggle('is-active', selected);
        if (selected) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      return;
    }
    if (event.target.closest('[data-learn-back]')) {
      window.AamaLearn?.back(secondaryView);
      document.querySelectorAll('.learn-subnav-item').forEach((item) => {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });
      return;
    }
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      event.preventDefault();
      navigate(routeButton.dataset.route);
      return;
    }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      if (actionButton.dataset.action === 'learn-use-location') { window.AamaLearn?.locate(secondaryView); return; }
      handleAction(actionButton.dataset.action, actionButton);
      return;
    }
    const toastButton = event.target.closest('[data-toast]');
    if (toastButton) showToast(toastButton.dataset.toast);
    if (event.target.closest('.ai-launcher')) openAssistant();
  });
  interactionClose?.addEventListener('click', closeInteraction);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && interactionModal && !interactionModal.classList.contains('is-hidden')) closeInteraction();
  });
  interactionModal?.addEventListener('click', (event) => {
    if (event.target === interactionModal) closeInteraction();
  });
  document.addEventListener('submit', async (event) => {
    if (event.target.id === 'permission-form') {
      event.preventDefault();
      const form = event.target;
      const permissions = {};
      form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        permissions[input.name] = input.checked;
      });
      saveFamilyPermissions(form.dataset.member || 'Circle member', permissions);
      closeInteraction();
      showToast('Permissions saved for your family member.');
      return;
    }
    if (event.target.id === 'profile-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const profile = {
        name: String(formData.get('name') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        location: String(formData.get('location') || '').trim(),
        age: String(formData.get('age') || '').trim(),
        bloodType: String(formData.get('bloodType') || '').trim(),
        weightKg: String(formData.get('weightKg') || '').trim(),
        healthNotes: String(formData.get('healthNotes') || '').trim(),
        height: String(formData.get('height') || '').trim(),
        prePregnancyWeight: String(formData.get('prePregnancyWeight') || '').trim(),
      };
      if (!profile.name) return;
      try {
        window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      } catch (error) {
        console.warn('Profile could not be saved locally.', error);
        showToast('Profile could not be saved on this device.');
        return;
      }
      updateProfileDisplay(profile);
      closeInteraction();
      showToast('Your profile has been updated.');
    }
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
    if (event.target.id === 'family-task-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const title = String(formData.get('title') || '').trim();
      if (!title) return;
      const tasks = getFamilyChecklistItems();
      tasks.push({
        id: `family-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        owner: String(formData.get('owner') || 'Everyone'),
        time: String(formData.get('time') || '').trim() || 'This week',
        completed: false,
      });
      saveFamilyChecklistItems(tasks);
      closeInteraction();
      renderFamilyChecklist();
      showToast('Family task added.');
    }
    if (event.target.id === 'community-post-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const payload = {
        type: String(formData.get('type') || 'question'),
        title: String(formData.get('title') || '').trim(),
        body: String(formData.get('body') || '').trim(),
        topic: String(formData.get('topic') || 'General').trim() || 'General',
        location: String(formData.get('location') || 'Nearby').trim() || 'Nearby',
      };
      if (!payload.title || !payload.body) return;
      const profile = getProfile();
      const localPost = { ...payload, id: `local-post-${Date.now()}`, authorName: profile.name || 'You', authorInitials: (profile.name || 'You').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(), createdAt: new Date().toISOString(), replies: 0, replyItems: [] };
      try {
        const data = await communityRequest('/posts', { method: 'POST', body: payload });
        communityState.posts.unshift(data.post);
        communityState.loaded = true;
        closeInteraction();
        renderCommunityFeed();
        showToast('Your post is now shared with the community.');
      } catch (error) {
        communityState.posts.unshift(localPost);
        saveLocalCommunity();
        closeInteraction();
        renderCommunityFeed();
        showToast('Saved on this device while the community server is unavailable.');
        console.warn('Community post could not be published.', error);
      }
    }
    if (event.target.id === 'community-plan-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const payload = {
        title: String(formData.get('title') || '').trim(),
        location: String(formData.get('location') || '').trim(),
        startsAt: String(formData.get('startsAt') || ''),
        spots: Number(formData.get('spots') || 8),
        description: String(formData.get('description') || '').trim(),
      };
      if (!payload.title || !payload.location || !payload.startsAt) return;
      const profile = getProfile();
      const localPlan = { ...payload, id: `local-plan-${Date.now()}`, attendeeCount: 1, joined: true, hostName: profile.name || 'You', hostInitials: (profile.name || 'You').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() };
      try {
        const data = await communityRequest('/plans', { method: 'POST', body: payload });
        communityState.plans.unshift(data.plan);
        communityState.loaded = true;
        closeInteraction();
        renderCommunityPlans();
        showToast('Your community plan is ready.');
      } catch (error) {
        communityState.plans.unshift(localPlan);
        saveLocalCommunity();
        closeInteraction();
        renderCommunityPlans();
        showToast('Saved on this device while the community server is unavailable.');
        console.warn('Community plan could not be created.', error);
      }
    }
    if (event.target.id === 'community-reply-form') {
      event.preventDefault();
      const form = event.target;
      const body = String(new FormData(form).get('body') || '').trim();
      const post = communityState.posts.find((item) => String(item.id) === String(form.dataset.postId));
      if (!post || !body) return;
      try {
        if (!String(post.id).startsWith('demo-') && !String(post.id).startsWith('local-')) {
          const data = await communityRequest(`/posts/${encodeURIComponent(post.id)}/replies`, { method: 'POST', body: { body } });
          Object.assign(post, data.post);
        } else {
          const profile = getProfile();
          post.replyItems = [...(post.replyItems || []), { id: `local-reply-${Date.now()}`, authorName: profile.name || 'You', body, createdAt: new Date().toISOString() }];
          post.replies = Number(post.replies || 0) + 1;
          saveLocalCommunity();
        }
        closeInteraction();
        renderCommunityFeed();
        showToast('Your reply was added.');
      } catch (error) {
        showToast(error.message || 'Your reply could not be added.');
      }
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
      assistantVoice.innerHTML = '<i data-lucide="square" aria-hidden="true"></i> Stop';
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
      assistantVoice.innerHTML = '<i data-lucide="mic" aria-hidden="true"></i> Speak';
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
  window.addEventListener('aama-language-change', updateSharedChecklistSummary);
  const navigation = window.performance?.getEntriesByType?.('navigation')?.[0];
  const isPageRefresh = navigation?.type === 'reload' || window.performance?.navigation?.type === 1;
  const initialPath = isPageRefresh ? '/login' : window.location.pathname;
  navigate(initialPath, true);
  restoreChecklist();
});
