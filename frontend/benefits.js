(() => {
  const translate = (value, values) => window.AamaI18n?.t(value, values) || value;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const numberFormat = () => new Intl.NumberFormat(window.AamaI18n?.getLanguage?.() === 'ne' ? 'ne-NP' : 'en-US');
  const npr = (amount) => translate('NPR {amount}', { amount: numberFormat().format(amount) });

  function formatDate(value, withWeekday = false) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00Z`);
    return new Intl.DateTimeFormat(window.AamaI18n?.getLanguage?.() === 'ne' ? 'ne-NP' : 'en-GB', {
      ...(withWeekday ? { weekday: 'short' } : {}),
      day: 'numeric', month: 'long', ...(withWeekday ? {} : { year: 'numeric' }), timeZone: 'UTC',
    }).format(date);
  }

  function renderTeaser() {
    const root = document.querySelector('[data-benefits-teaser]');
    if (!root) return;
    try {
      const config = window.AamaBenefitsConfig;
      const data = window.AamaBenefitsMock;
      if (!config || !data) throw new Error('Benefits preview data is unavailable.');
      const total = config.checkupSupport.visitMonths.length;
      const done = data.checkups.filter((item) => item.status === 'done').length;
      const percent = Math.round(done / total * 100);
      const summary = translate('Checkups {done} of {total} · {support} support when you complete all {total}', {
        done: numberFormat().format(done),
        total: numberFormat().format(total),
        support: npr(config.checkupSupport.amountNpr),
      });
      root.innerHTML = `<span class="benefits-teaser__meter" role="progressbar" aria-label="${escapeHtml(translate('Antenatal checkup progress'))}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${percent}%"></span></span><span class="benefits-teaser__copy">${escapeHtml(summary)}</span><a class="benefits-teaser__link" href="/home/learn-prepare/benefits" data-route="/home/learn-prepare/benefits">${escapeHtml(translate('See your benefits'))}<span aria-hidden="true"> →</span></a>`;
      root.dataset.state = 'ready';
    } catch (error) {
      root.textContent = translate('Checkup support details are unavailable right now.');
      root.dataset.state = 'error';
      console.error('Benefits dashboard teaser could not be rendered.', error);
    }
  }

  function renderLoading() {
    return `<div class="service-loading benefits-state" role="status"><span class="benefits-state__spinner" aria-hidden="true"></span><strong>${escapeHtml(translate('Loading your support details…'))}</strong></div>`;
  }

  function renderEmpty() {
    return `<div class="learn-empty benefits-state"><span class="benefits-state__icon" aria-hidden="true">♡</span><h2>${escapeHtml(translate('Your checkup progress will appear here'))}</h2><p>${escapeHtml(translate('When your visits are recorded, you can follow each step here.'))}</p></div>`;
  }

  function renderError() {
    return `<div class="service-loading benefits-state" role="alert"><span class="benefits-state__icon" aria-hidden="true">!</span><h2>${escapeHtml(translate('Support details could not load'))}</h2><p>${escapeHtml(translate('Please try again in a moment. Your care team can also help with programme questions.'))}</p><button class="button button--outline" type="button" data-action="benefits-retry">${escapeHtml(translate('Try again'))}</button></div>`;
  }

  function renderProgress(config, data) {
    const done = data.checkups.filter((item) => item.status === 'done').length;
    const total = config.checkupSupport.visitMonths.length;
    const percent = Math.round(done / total * 100);
    const statusLabels = { done: 'Done', upcoming: 'Upcoming', locked: 'Locked' };
    const checkups = config.checkupSupport.visitMonths.map((month) => {
      const item = data.checkups.find((checkup) => checkup.month === month);
      const status = item?.status || 'locked';
      const label = `${month}th-month checkup`;
      const date = item?.date ? `<small>${escapeHtml(formatDate(item.date, Boolean(item.time)))}${item.time ? ` · ${escapeHtml(item.time)}` : ''}</small>` : '';
      return `<li class="benefit-step benefit-step--${escapeHtml(status)}"><span class="benefit-step__mark" aria-hidden="true">${status === 'done' ? '✓' : status === 'upcoming' ? '·' : '○'}</span><span class="benefit-step__copy"><strong>${escapeHtml(translate(label))}</strong>${date}</span><span class="benefit-step__status">${escapeHtml(translate(statusLabels[status] || 'Locked'))}</span></li>`;
    }).join('');
    const careSteps = [
      ['Deliver at a health facility', data.delivery.status],
      ['Postnatal checkup', data.postnatal.status],
    ].map(([label, status]) => `<li class="benefit-step benefit-step--not-started"><span class="benefit-step__mark" aria-hidden="true">○</span><span class="benefit-step__copy"><strong>${escapeHtml(translate(label))}</strong></span><span class="benefit-step__status">${escapeHtml(translate(status === 'done' ? 'Done' : 'Not started'))}</span></li>`).join('');
    return `<section class="panel benefits-panel" aria-labelledby="benefits-progress-title"><div class="panel-heading"><div><p class="card-kicker">${escapeHtml(translate('Your progress'))}</p><h2 id="benefits-progress-title">${escapeHtml(translate('Your care milestones'))}</h2></div><span class="completion-pill">${escapeHtml(translate('{done} of {total} checkups done', { done: numberFormat().format(done), total: numberFormat().format(total) }))}</span></div><div class="benefits-progress-meter" role="progressbar" aria-label="${escapeHtml(translate('Antenatal checkup progress'))}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${percent}%"></span></div><ol class="benefit-steps">${checkups}${careSteps}</ol><p class="benefits-support-note">${escapeHtml(translate(config.checkupSupport.paymentNote))} <strong>${escapeHtml(npr(config.checkupSupport.amountNpr))}</strong></p></section>`;
  }

  function renderReceivables(config) {
    const checkup = config.checkupSupport;
    const delivery = config.deliveryCare;
    const newborn = config.newbornCare;
    return `<section class="panel benefits-panel" aria-labelledby="benefits-receive-title"><div class="benefits-section-heading"><p class="card-kicker">${escapeHtml(translate('What you can receive'))}</p><h2 id="benefits-receive-title">${escapeHtml(translate('Support for each part of your care'))}</h2></div><div class="benefits-receive-grid"><article class="benefits-receive-item"><span class="benefits-item-icon" aria-hidden="true">♡</span><div><h3>${escapeHtml(translate(checkup.title))}</h3><p>${escapeHtml(translate(checkup.paymentNote))}</p><strong>${escapeHtml(npr(checkup.amountNpr))}</strong></div></article><article class="benefits-receive-item"><span class="benefits-item-icon" aria-hidden="true">✚</span><div><h3>${escapeHtml(translate(delivery.title))}</h3><p>${escapeHtml(translate(delivery.description))}</p><small>${escapeHtml(delivery.types.map((type) => translate(type)).join(' · '))}</small><small>${escapeHtml(delivery.facilities.map((facility) => translate(facility)).join(' · '))}</small></div></article><article class="benefits-receive-item"><span class="benefits-item-icon" aria-hidden="true">⌖</span><div><h3>${escapeHtml(translate('Travel support after delivery'))}</h3><p>${escapeHtml(translate('Paid after institutional delivery, based on your district region.'))}</p></div></article><article class="benefits-receive-item"><span class="benefits-item-icon" aria-hidden="true">✦</span><div><h3>${escapeHtml(translate(newborn.title))}</h3><p>${escapeHtml(translate(newborn.description))}</p></div></article></div><p class="benefits-eligibility">${escapeHtml(translate('Eligible mothers are {eligibility}; bring your {proof}.', { eligibility: translate(config.eligibility.citizenship), proof: translate(config.eligibility.proof) }))}</p></section>`;
  }

  function renderTravel(config, data) {
    const currentRegion = config.travelSupport.find((region) => region.region === data.mother.region);
    const rows = config.travelSupport.map((region) => `<li class="travel-region${region.region === data.mother.region ? ' is-current' : ''}"><span>${escapeHtml(translate(region.region))}${region.region === data.mother.region ? `<small>${escapeHtml(translate('Your district'))}</small>` : ''}</span><strong>${escapeHtml(npr(region.amountNpr))}</strong></li>`).join('');
    const verification = data.mother.regionNeedsVerification ? `<p class="benefits-region-note">${escapeHtml(translate('{district} is shown as {region} in this preview. Please confirm the district classification with your facility.', { district: translate(data.mother.district), region: translate(data.mother.region) }))}</p>` : '';
    return `<section class="panel benefits-panel" aria-labelledby="benefits-travel-title"><div class="benefits-section-heading"><p class="card-kicker">${escapeHtml(translate('Travel support by region'))}</p><h2 id="benefits-travel-title">${escapeHtml(translate('Support for the trip home'))}</h2><p>${escapeHtml(translate('Paid right after institutional delivery. The amount depends on your district region.'))}</p></div><ul class="travel-region-list">${rows}</ul><p class="benefits-current-district">${escapeHtml(translate('Your district'))}: <strong>${escapeHtml(translate(data.mother.district))} · ${escapeHtml(translate(currentRegion?.region || data.mother.region))}</strong></p>${verification}</section>`;
  }

  function renderClaim(config) {
    const steps = config.claimSteps.map((step) => `<li><span aria-hidden="true">✓</span><p>${escapeHtml(translate(step))}</p></li>`).join('');
    return `<section class="panel benefits-panel" aria-labelledby="benefits-claim-title"><div class="benefits-section-heading"><p class="card-kicker">${escapeHtml(translate('How to claim'))}</p><h2 id="benefits-claim-title">${escapeHtml(translate('A few things to bring and ask'))}</h2></div><ol class="benefits-claim-list">${steps}</ol><p class="benefits-claim-note">${escapeHtml(translate('Not received your support? Ask the facility staff first.'))}</p><button class="button button--soft" type="button" data-action="benefits-ask-ai">${escapeHtml(translate('Ask Aama AI'))}<span aria-hidden="true">↗</span></button></section>`;
  }

  function renderDisclaimer(config) {
    return `<p class="benefits-disclaimer">${escapeHtml(translate('Amounts and rules come from the Government of Nepal’s Aama programme and can change. Please confirm with your health facility.'))} <span>${escapeHtml(translate('Last reviewed'))}: ${escapeHtml(formatDate(config.lastReviewed))}.</span></p>`;
  }

  function render(root) {
    const page = root.querySelector('[data-benefits-root]');
    if (!page) return;
    page.innerHTML = renderLoading();
    try {
      const config = window.AamaBenefitsConfig;
      const data = window.AamaBenefitsMock;
      if (!config || !data || !Array.isArray(config.checkupSupport?.visitMonths) || !Array.isArray(data.checkups)) {
        throw new Error('Benefits configuration or preview data is missing.');
      }
      if (!data.checkups.length) {
        page.innerHTML = renderEmpty();
        return;
      }
      const mother = data.mother;
      page.innerHTML = `<div class="benefits-page"><header class="page-heading benefits-heading"><div><p class="eyebrow">${escapeHtml(translate('Learn & prepare'))}</p><h1>${escapeHtml(translate('Support for you and your baby'))}</h1><p>${escapeHtml(translate('Free care and cash support from the Aama programme. Every checkup you complete helps keep you and your baby safe.'))}</p><small class="benefits-mother-context">${escapeHtml(translate('{name} · Week {week} · Due {date}', { name: mother.name, week: numberFormat().format(mother.pregnancyWeek), date: formatDate(mother.dueDate) }))}</small></div><a class="button button--primary" href="/home/health-services" data-route="/home/health-services">${escapeHtml(translate('Find an eligible facility'))}<span aria-hidden="true">→</span></a></header>${renderProgress(config, data)}${renderReceivables(config)}${renderTravel(config, data)}${renderClaim(config)}${renderDisclaimer(config)}</div>`;
    } catch (error) {
      console.error('Benefits page could not be rendered.', error);
      page.innerHTML = renderError();
    }
  }

  window.AamaBenefits = { render, renderTeaser };
  document.addEventListener('aama-language-change', () => {
    renderTeaser();
    const secondaryView = document.querySelector('#secondary-view');
    if (secondaryView && !secondaryView.classList.contains('is-hidden') && secondaryView.querySelector('[data-benefits-root]')) render(secondaryView);
  });
})();
