(() => {
  if (!window.lucide?.createIcons) {
    console.error('Lucide could not be loaded.');
    return;
  }

  let renderQueued = false;
  function renderIcons() {
    renderQueued = false;
    window.lucide.createIcons({ attrs: { class: 'ms-icon', 'stroke-width': '1.75' } });
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(renderIcons);
  }

  renderIcons();
  new MutationObserver(queueRender).observe(document.body, { childList: true, subtree: true });
  window.AamaIcons = { render: renderIcons };
})();
