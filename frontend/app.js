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
let toastTimer;

function showDashboard() {
  loginScreen.classList.add('is-hidden');
  dashboardScreen.classList.remove('is-hidden');
  document.title = 'AamaCare · My care dashboard';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLogin() {
  dashboardScreen.classList.add('is-hidden');
  loginScreen.classList.remove('is-hidden');
  document.title = 'AamaCare · Pregnancy companion';
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
  showToast('Welcome back, Sita. Your care dashboard is ready.');
});

demoLogin.addEventListener('click', () => {
  showDashboard();
  showToast('Preview mode started. No account was created.');
});

logoutButton.addEventListener('click', () => {
  showLogin();
  showToast('You have been signed out safely.');
});

togglePin.addEventListener('click', () => {
  const isPassword = pinInput.type === 'password';
  pinInput.type = isPassword ? 'text' : 'password';
  togglePin.textContent = isPassword ? '◌' : '◉';
  togglePin.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});

document.querySelector('#forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  showToast('PIN recovery will be connected to SMS in the next build.');
});

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

document.querySelectorAll('.nav-item:not(.nav-item--quiet)').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item:not(.nav-item--quiet)').forEach((nav) => nav.classList.remove('is-active'));
    item.classList.add('is-active');
    showToast(`${item.querySelector('span:last-child').textContent} is ready for the next build.`);
    sidebar.classList.remove('is-open');
  });
});

document.querySelectorAll('.task-row input').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('.task-row').classList.toggle('is-complete', input.checked);
    showToast(input.checked ? 'Task marked complete.' : 'Task added back to your list.');
  });
});

document.querySelector('.alert-close').addEventListener('click', (event) => {
  event.currentTarget.closest('.alert-banner').remove();
  showToast('Weather alert dismissed for now.');
});

menuButton.addEventListener('click', () => sidebar.classList.toggle('is-open'));
