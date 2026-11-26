const loginScreen = document.querySelector('#login-screen');
const dashboardScreen = document.querySelector('#dashboard-screen');
const loginForm = document.querySelector('#login-form');
const demoLogin = document.querySelector('#demo-login');
const logoutButton = document.querySelector('#logout-button');
const togglePin = document.querySelector('#toggle-pin');
const pinInput = document.querySelector('#pin');
const toast = document.querySelector('#toast');
const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('#menu-button');
const languageButton = document.querySelector('.language-button');
let toastTimer;

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
  document.documentElement.lang = currentLanguage;
  // The <span> shows the current language; the plain text shows the other one.
  setText(languageButton, currentLanguage === 'en' ? 'ने' : 'EN');
  languageButton.querySelector('span').textContent = currentLanguage === 'en' ? 'EN' : 'ने';
  updateTitle();
}

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
    saveLanguage(language);
  } catch (error) {
    console.error(`Could not load the "${language}" language file.`, error);
  }
}

languageButton.addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'ne' : 'en'));

// ---------- App ----------
function showDashboard() {
  loginScreen.classList.add('is-hidden');
  dashboardScreen.classList.remove('is-hidden');
  updateTitle();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLogin() {
  dashboardScreen.classList.add('is-hidden');
  loginScreen.classList.remove('is-hidden');
  updateTitle();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  showDashboard();
  showToast(t('msg.welcome', 'Welcome back, Sita. Your care dashboard is ready.'));
});

demoLogin.addEventListener('click', () => {
  showDashboard();
  showToast(t('msg.preview', 'Preview mode started. No account was created.'));
});

logoutButton.addEventListener('click', () => {
  showLogin();
  showToast(t('msg.signedOut', 'You have been signed out safely.'));
});

togglePin.addEventListener('click', () => {
  const isPassword = pinInput.type === 'password';
  pinInput.type = isPassword ? 'text' : 'password';
  togglePin.textContent = isPassword ? '◌' : '◉';
  // Update the key too, so switching language keeps the correct label.
  const key = isPassword ? 'a11y.hidePassword' : 'a11y.showPassword';
  togglePin.setAttribute('data-i18n-aria-label', key);
  togglePin.setAttribute('aria-label', t(key, isPassword ? 'Hide password' : 'Show password'));
});

document.querySelector('#forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  showToast(t('msg.pinRecovery', 'PIN recovery will be connected to SMS in the next build.'));
});

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

document.querySelectorAll('.nav-item:not(.nav-item--quiet)').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item:not(.nav-item--quiet)').forEach((nav) => nav.classList.remove('is-active'));
    item.classList.add('is-active');
    const page = item.querySelector('span:last-child').textContent;
    showToast(t('msg.navPending', '{page} is ready for the next build.').replace('{page}', page));
    sidebar.classList.remove('is-open');
  });
});

document.querySelectorAll('.task-row input').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('.task-row').classList.toggle('is-complete', input.checked);
    showToast(input.checked
      ? t('msg.taskDone', 'Task marked complete.')
      : t('msg.taskUndone', 'Task added back to your list.'));
  });
});

document.querySelector('.alert-close').addEventListener('click', (event) => {
  event.currentTarget.closest('.alert-banner').remove();
  showToast(t('msg.alertDismissed', 'Weather alert dismissed for now.'));
});

menuButton.addEventListener('click', () => sidebar.classList.toggle('is-open'));

setLanguage(readSavedLanguage());