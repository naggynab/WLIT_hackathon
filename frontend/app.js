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
  const profileButton = document.querySelector('.profile-button');
  const togglePin = document.querySelector('#toggle-pin');
  const pinInput = document.querySelector('#pin');
  const toast = document.querySelector('#toast');
  const sidebar = document.querySelector('#sidebar');
  const sideNav = document.querySelector('.side-nav');
  const originalSideNav = sideNav?.innerHTML || '';
  const sidebarSectionLabel = document.querySelector('.sidebar-section-label');
  const supportCard = document.querySelector('.support-card');
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
  const translate = (value) => window.AamaI18n?.t(value) || value;
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
    '/home/health-services': { view: 'services', label: 'Health services' },
    '/home/learn-prepare': { view: 'learn', label: 'Learn & prepare' },
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
    if (!serviceId) return;
    window.MatriSathiGoogleMaps?.select(serviceId, openPopup);
  }

  function initCareMap() {
    window.MatriSathiGoogleMaps?.init(secondaryView);
  }

  function getProfile() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(profileStorageKey) || '{}');
      const user = readAuthUser();
      return {
        name: typeof saved.name === 'string' ? saved.name : user?.name || 'Sita K.',
        phone: typeof saved.phone === 'string' ? saved.phone : user?.phone || '',
        location: typeof saved.location === 'string' ? saved.location : 'Lalitpur',
        age: typeof saved.age === 'string' ? saved.age : '',
        bloodType: typeof saved.bloodType === 'string' ? saved.bloodType : '',
        height: typeof saved.height === 'string' ? saved.height : '',
        prePregnancyWeight: typeof saved.prePregnancyWeight === 'string' ? saved.prePregnancyWeight : '',
      };
    } catch (error) {
      return { name: 'Sita K.', phone: '', location: 'Lalitpur', age: '', bloodType: '', height: '', prePregnancyWeight: '' };
    }
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
    const name = profile.name.trim() || 'Sita K.';
    const avatar = profileInitials(name);
    const nameNode = profileButton?.querySelector('.profile-copy strong');
    const avatarNode = profileButton?.querySelector('.avatar');
    if (nameNode) nameNode.textContent = name;
    if (avatarNode) avatarNode.textContent = avatar;
    const greetingNameNode = document.querySelector('#dashboard-user-name');
    if (greetingNameNode) greetingNameNode.textContent = name.split(/\s+/)[0];
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
  document.addEventListener('aama-language-change', updateDashboardDate);

  function openProfileDialog() {
    const profile = getProfile();
    const name = escapeHtml(profile.name);
    const initials = escapeHtml(profileInitials(profile.name));
    const location = escapeHtml(profile.location);
    const phone = escapeHtml(profile.phone || 'Add a mobile number');
    const age = profile.age ? translate('{count} years', { count: escapeHtml(profile.age) }) : 'Not added';
    const bloodType = escapeHtml(profile.bloodType || 'Not added');
    const height = profile.height ? `${escapeHtml(profile.height)} cm` : 'Not added';
    const weight = profile.prePregnancyWeight ? `${escapeHtml(profile.prePregnancyWeight)} kg` : 'Not added';
    openInteraction(
      'Your account',
      'Your profile',
      `<div class="profile-dialog-summary"><span class="avatar">${initials}</span><div><strong>${name}</strong><span>${phone}</span><span>${location}</span></div></div><div class="profile-health-details"><div><small>Age</small><strong>${age}</strong></div><div><small>Blood type</small><strong>${bloodType}</strong></div><div><small>Height</small><strong>${height}</strong></div><div><small>Pre-pregnancy weight</small><strong>${weight}</strong></div></div><div class="profile-menu-list"><button class="profile-menu-item" type="button" data-action="edit-profile"><span class="profile-menu-icon" aria-hidden="true">✎</span><span><strong>Edit profile</strong><small>Update your personal details</small></span><span class="profile-menu-arrow" aria-hidden="true">→</span></button><button class="profile-menu-item" type="button" data-action="account-settings"><span class="profile-menu-icon" aria-hidden="true">⚙</span><span><strong>Settings</strong><small>Language and care preferences</small></span><span class="profile-menu-arrow" aria-hidden="true">→</span></button><button class="profile-menu-item" type="button" data-action="account-help"><span class="profile-menu-icon" aria-hidden="true">?</span><span><strong>Help &amp; support</strong><small>Ask Aama AI for help</small></span><span class="profile-menu-arrow" aria-hidden="true">→</span></button><button class="profile-menu-item profile-menu-item--signout" type="button" data-action="open-logout"><span class="profile-menu-icon" aria-hidden="true">↪</span><span><strong>Sign out</strong><small>End this session safely</small></span><span class="profile-menu-arrow" aria-hidden="true">→</span></button></div>`,
    );
  }

  function openProfileEditor() {
    const profile = getProfile();
    openInteraction(
      'Your account',
      'Edit profile',
      `<form class="interaction-form profile-edit-form" id="profile-form"><label for="profile-name">Full name</label><input id="profile-name" name="name" value="${escapeHtml(profile.name)}" autocomplete="name" required maxlength="80"><label for="profile-phone">Mobile number <span class="form-label-hint">optional</span></label><input id="profile-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(profile.phone)}" placeholder="Add a mobile number" maxlength="30"><label for="profile-location">Care location</label><input id="profile-location" name="location" value="${escapeHtml(profile.location)}" autocomplete="address-level2" maxlength="80"><div class="profile-edit-grid"><div><label for="profile-age">Age (years) <span class="form-label-hint">optional</span></label><input id="profile-age" name="age" type="number" min="10" max="60" step="1" inputmode="numeric" value="${escapeHtml(profile.age)}"></div><div><label for="profile-blood-type">Blood type <span class="form-label-hint">optional</span></label><select id="profile-blood-type" name="bloodType"><option value="">Select blood type</option>${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => `<option value="${type}" ${profile.bloodType === type ? 'selected' : ''}>${type}</option>`).join('')}</select></div><div><label for="profile-height">Height (cm) <span class="form-label-hint">optional</span></label><input id="profile-height" name="height" type="number" min="80" max="250" step="0.1" inputmode="decimal" value="${escapeHtml(profile.height)}"></div><div><label for="profile-pre-pregnancy-weight">Pre-pregnancy weight (kg) <span class="form-label-hint">optional</span></label><input id="profile-pre-pregnancy-weight" name="prePregnancyWeight" type="number" min="20" max="300" step="0.1" inputmode="decimal" value="${escapeHtml(profile.prePregnancyWeight)}"></div></div><div class="interaction-actions"><button class="button button--outline" type="button" data-action="open-profile">Cancel</button><button class="button button--primary" type="submit">Save profile</button></div></form>`,
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
      <button class="shared-item${task.completed ? ' is-complete' : ''}" type="button" data-action="toggle-shared" data-family-task-id="${escapeHtml(task.id)}">
        <span class="shared-check${task.completed ? ' is-done' : ''}">${task.completed ? '✓' : ''}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <small>${escapeHtml(task.owner || 'Everyone')} · ${escapeHtml(task.completed ? 'Done' : task.time || 'This week')}</small>
      </button>
    `).join('');
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
    updateProfileDisplay(getProfile());
    document.title = translate('MatriSathi · My care dashboard');
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

  function showLogin() {
    dashboardScreen?.classList.add('is-hidden');
    loginScreen?.classList.remove('is-hidden');
    document.title = translate('MatriSathi · Pregnancy companion');
    window.AamaI18n?.translatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDashboardView(view, label) {
    const isHealthPost = view.startsWith('hp-');
    const profileName = profileButton?.querySelector('.profile-copy strong');
    const profileSubtitle = profileButton?.querySelector('.profile-copy small');
    const profileAvatar = profileButton?.querySelector('.avatar');
    if (isHealthPost) {
      if (profileName) profileName.textContent = 'Health Worker';
      if (profileSubtitle) profileSubtitle.textContent = 'Health Post Personnel';
      if (profileAvatar) profileAvatar.textContent = 'HW';
    } else {
      updateProfileDisplay(getProfile());
      if (profileSubtitle) profileSubtitle.textContent = 'My profile';
    }
    if (isHealthPost && sideNav) {
      const items = [
        ['hp-dashboard', '/health-post', '⌂', 'Dashboard'],
        ['hp-mothers', '/health-post/mothers', '♧', 'All Registered Mothers'],
        ['hp-due-soon', '/health-post/due-soon', '◷', 'Due Soon Mothers'],
        ['hp-appointments', '/health-post/appointments', '▦', 'Appointments'],
        ['hp-followups', '/health-post/follow-ups', '↻', 'Follow-ups'],
        ['hp-high-risk', '/health-post/high-risk', '!', 'High-Risk Mothers'],
        ['hp-reports', '/health-post/reports', '▤', 'Reports'],
      ];
      sideNav.innerHTML = items.map(([key, route, icon, text]) => `<a class="nav-item${view === key ? ' is-active' : ''}" data-view="${key}" data-route="${route}" href="${route}"${view === key ? ' aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${text}</span></a>`).join('');
      if (sidebarSectionLabel) sidebarSectionLabel.textContent = 'Health post';
      supportCard?.classList.add('is-hidden');
    } else if (sideNav) {
      sideNav.innerHTML = originalSideNav;
      if (sidebarSectionLabel) sidebarSectionLabel.textContent = 'Your care space';
      supportCard?.classList.remove('is-hidden');
    }
    document.querySelectorAll('.nav-item[data-route]').forEach((nav) => {
      nav.classList.remove('is-active');
      nav.removeAttribute('aria-current');
    });
    const activeNav = document.querySelector(`.nav-item[data-view="${view}"]`);
    activeNav?.classList.add('is-active');
    activeNav?.setAttribute('aria-current', 'page');
    const learnNav = document.querySelector('.nav-item[data-view="learn"]');
    const learnSubnav = document.querySelector('#learn-subnav');
    learnSubnav?.classList.toggle('is-hidden', view !== 'learn');
    learnNav?.setAttribute('aria-expanded', String(view === 'learn'));
    document.querySelectorAll('.learn-subnav-item').forEach((item) => {
      item.classList.remove('is-active');
      item.removeAttribute('aria-current');
    });
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
      if (view === 'family') {
        renderFamilyChecklist();
        updateSharedChecklistSummary();
      }
    }
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = label;
    document.title = isHealthPost ? `MatriSathi · ${label}` : 'MatriSathi · My care dashboard';
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
      `<p>Choose what this person can see and which updates they should receive.</p><form class="permission-form" id="permission-form" data-member="${escapeHtml(memberName)}"><div class="permission-group"><div class="permission-group__heading"><span>Shared access</span><small>Visible in their Family Hub</small></div>${permissionRows.slice(0, 3).join('')}</div><div class="permission-group"><div class="permission-group__heading"><span>Alerts</span><small>Keep them informed when it matters</small></div>${permissionRows.slice(3).join('')}</div><p class="permission-note"><span aria-hidden="true">⌁</span> You can change these permissions at any time.</p><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Save permissions</button></div></form>`
    );
    document.querySelector('#permission-form input')?.focus();
  }

  function handleAction(action, target) {
    if (action === 'open-profile') {
      openProfileDialog();
    } else if (action === 'edit-profile') {
      openProfileEditor();
    } else if (action === 'account-settings') {
      closeInteraction();
      navigate('/home/settings');
    } else if (action === 'account-help') {
      closeInteraction();
      openAssistant();
    } else if (action === 'open-logout') {
      openInteraction('Sign out', 'Leave MatriSathi for now?', '<p>Your dashboard will be closed, but your saved care information will remain safe.</p>', '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="button" data-action="confirm-logout">Sign out</button>');
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
      const rows = tasks.map((task) => `<div class="detail-row"><span>${escapeHtml(task.owner || 'Everyone')} · ${escapeHtml(task.time || 'This week')}</span><strong>${task.completed ? '✓ ' : ''}${escapeHtml(task.title)}</strong></div>`).join('');
      openInteraction('Shared support', 'Everyone knows the next step', `<div class="detail-list">${rows}</div><div class="modal-callout">Your family checklist is saved on this device. Add or update tasks from the Family Hub.</div>`, '<button class="button button--primary" type="button" data-action="close-modal">Close</button>');
    } else if (action === 'show-reminders') {
      openReminders();
    } else if (action === 'add-checklist') {
      openInteraction('Small steps, big care', 'Add a checklist item', '<form class="interaction-form" id="checklist-form"><label for="checklist-title">What do you want to remember?</label><input id="checklist-title" name="title" placeholder="e.g. Take a short walk" required maxlength="80"><label for="checklist-details">Details <span class="form-label-hint">optional</span></label><input id="checklist-details" name="details" placeholder="e.g. Move gently for 10 minutes" maxlength="120"><label for="checklist-time">When?</label><input id="checklist-time" name="time" placeholder="e.g. Today or 4:00 PM" maxlength="30"><div class="interaction-actions"><button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Add to checklist</button></div></form>');
    } else if (action === 'use-location') {
      openInteraction('Nearby care', 'Use your current location?', '<p>Location helps MatriSathi sort health posts and hospitals by distance. You can also keep using the Lalitpur location already selected.</p>', '<button class="button button--outline" type="button" data-action="close-modal">Keep Lalitpur</button><button class="button button--primary" type="button" data-action="location-confirm">Use location</button>');
    } else if (action === 'location-confirm') {
      closeInteraction();
      showToast('Location access will be connected to the service directory.');
    } else if (action === 'service-filter') {
      openInteraction('Health services', 'Filter nearby care', '<div class="interaction-form interaction-form--filters"><label class="filter-option"><input type="checkbox" checked><span>Maternity care</span></label><label class="filter-option"><input type="checkbox"><span>Emergency care</span></label><label class="filter-option"><input type="checkbox"><span>Pharmacy</span></label><label class="filter-option"><input type="checkbox"><span>Open now</span></label></div>', '<button class="button button--primary" type="button" data-action="close-modal">Apply filters</button>');
    } else if (action === 'select-service') {
      secondaryView?.querySelectorAll('.service-card').forEach((card) => card.classList.remove('is-selected'));
      target.classList.add('is-selected');
      focusCareMap(target, true);
      focusCareMap(target, true);
      const service = target.dataset.service || 'Health service';
      openInteraction('Nearby care', service, '<div class="detail-list"><div class="detail-row"><span>Distance</span><strong>2.4 km from you</strong></div><div class="detail-row"><span>Services</span><strong>Maternity care · Emergency</strong></div><div class="detail-row"><span>Phone</span><strong>01-5522295</strong></div></div>', '<button class="button button--outline" type="button" data-toast="Calling the health service">Call</button><button class="button button--primary" type="button" data-toast="Directions opened">Get directions</button>');
    } else if (action === 'topic-filter') {
      const currentWeek = getWeekSnapshot().week;
      openInteraction('Learn & prepare', target.dataset.topic || 'Learning topic', `<p>We will show week ${currentWeek} content, Nepali audio, and trusted videos for this topic.</p>`, '<button class="button button--primary" type="button" data-action="close-modal">Show content</button>');
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
      const response = await fetch(`${apiBaseUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: cleanMessage }) });
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
  healthPostPreview?.addEventListener('click', () => {
    navigate('/health-post');
    showToast('Health Post preview opened with sample records.');
  });
  logoutButton?.addEventListener('click', () => {
    openInteraction(
      'Sign out',
      'Leave MatriSathi for now?',
      '<p>Your dashboard will be closed, but your saved care information will remain safe.</p>',
      '<button class="button button--outline" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="button" data-action="confirm-logout">Sign out</button>'
    );
  });
  profileButton?.addEventListener('click', openProfileDialog);
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
  document.addEventListener('submit', (event) => {
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
  window.addEventListener('aama-language-change', updateSharedChecklistSummary);
  const navigation = window.performance?.getEntriesByType?.('navigation')?.[0];
  const isPageRefresh = navigation?.type === 'reload' || window.performance?.navigation?.type === 1;
  const initialPath = isPageRefresh ? '/login' : window.location.pathname;
  navigate(initialPath, true);
  restoreChecklist();
});
