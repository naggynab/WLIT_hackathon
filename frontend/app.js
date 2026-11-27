document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.querySelector('#login-screen');
  const dashboardScreen = document.querySelector('#dashboard-screen');
  const dashboardContent = document.querySelector('.dashboard-content');
  const secondaryView = document.querySelector('#secondary-view');
  const loginForm = document.querySelector('#login-form');
  const demoLogin = document.querySelector('#demo-login');
  const logoutButton = document.querySelector('#logout-button');
  const togglePin = document.querySelector('#toggle-pin');
  const pinInput = document.querySelector('#pin');
  const toast = document.querySelector('#toast');
  const sidebar = document.querySelector('#sidebar');
  const menuButton = document.querySelector('#menu-button');
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
  const customChecklistStorageKey = 'aamacare-custom-checklist';
  let toastTimer;
  let activeRecognition = null;

  const routeMap = {
    '/home': { view: 'overview', label: 'My care dashboard' },
    '/home/pregnancy-journey': { view: 'journey', label: 'Pregnancy journey' },
    '/home/health-records': { view: 'records', label: 'Health records' },
    '/home/family-hub': { view: 'family', label: 'Family hub' },
    '/home/health-services': { view: 'services', label: 'Health services' },
    '/home/learn-prepare': { view: 'learn', label: 'Learn & prepare' },
    '/home/settings': { view: 'settings', label: 'Settings' },
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = translate(message);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showLogin() {
    dashboardScreen?.classList.add('is-hidden');
    loginScreen?.classList.remove('is-hidden');
    document.title = translate('AamaCare · Pregnancy companion');
    window.AamaI18n?.translatePage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    if (interactionContent) interactionContent.innerHTML = '';
  }

  function openInteraction(eyebrow, title, body, actions = '') {
    if (!interactionModal || !interactionContent) return;
    interactionContent.innerHTML = `<p class="card-kicker">${eyebrow}</p><h2 id="interaction-title">${title}</h2>${body}${actions ? `<div class="interaction-actions">${actions}</div>` : ''}`;
    window.AamaI18n?.translatePage();
    interactionModal.classList.remove('is-hidden');
    interactionModal.setAttribute('aria-hidden', 'false');
    interactionClose?.focus();
  }

  function handleAction(action, target) {
    if (action === 'today-plan') {
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
      navigate('/login');
      showToast('You have been signed out safely.');
    }
  }

  function navigate(path, replace = false) {
    const requestedPath = path === '/' ? '/login' : path;
    const destination = requestedPath === '/login' || routeMap[requestedPath] ? requestedPath : '/login';
    if (window.location.pathname !== destination) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({}, '', destination);
    }
    if (destination === '/login') {
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
    navigate('/home');
    showToast('Welcome back, Sita. Your care dashboard is ready.');
  });
  demoLogin?.addEventListener('click', () => {
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
});
