(() => {
  const storageKey = 'aamacare-learn-plan-v1';
  const areas = [
    { name: 'Lalitpur', region: 'valley', lat: 27.6588, lon: 85.3247 },
    { name: 'Kathmandu', region: 'valley', lat: 27.7172, lon: 85.3240 },
    { name: 'Bhaktapur', region: 'valley', lat: 27.6710, lon: 85.4298 },
    { name: 'Pokhara / Kaski', region: 'hills', lat: 28.2096, lon: 83.9856 },
    { name: 'Chitwan', region: 'terai', lat: 27.5291, lon: 84.3542 },
    { name: 'Janakpur / Dhanusha', region: 'terai', lat: 26.7288, lon: 85.9263 },
    { name: 'Jumla', region: 'mountains', lat: 29.2747, lon: 82.1838 },
  ];
  // Each preference contains complete meal ideas, rather than a generic meal with swaps.
  const meals = {
    valley: {
      'non-veg': [
        ['Breakfast', 'Chiura, egg, and seasonal fruit', 'Beaten rice with a fully cooked egg and washed seasonal fruit.'],
        ['Main meal', 'Dal bhat, saag, and chicken', 'Rice, lentils, cooked greens, and thoroughly cooked chicken.'],
        ['Light meal', 'Kwati with roti', 'Well-cooked mixed beans with roti and washed tomato or lemon.'],
      ],
      veg: [
        ['Breakfast', 'Chiura, curd, and seasonal fruit', 'Beaten rice with pasteurized-milk curd and washed seasonal fruit.'],
        ['Main meal', 'Dal bhat, saag, and paneer', 'Rice, lentils, cooked greens, and cooked paneer made from pasteurized milk.'],
        ['Light meal', 'Kwati, roti, and curd', 'Well-cooked mixed beans with roti and a side of pasteurized-milk curd.'],
      ],
      vegan: [
        ['Breakfast', 'Chiura, chickpeas, and seasonal fruit', 'Beaten rice with well-cooked chickpeas and washed seasonal fruit.'],
        ['Main meal', 'Dal bhat, saag, and beans', 'Rice, lentils, cooked greens, and well-cooked beans, prepared with oil.'],
        ['Light meal', 'Kwati with dairy-free roti', 'Well-cooked mixed beans with roti prepared without milk or ghee, and washed tomato or lemon.'],
      ],
    },
    hills: {
      'non-veg': [
        ['Breakfast', 'Kodo porridge with egg and fruit', 'Millet porridge with a fully cooked egg and washed seasonal fruit.'],
        ['Main meal', 'Dhido, dal, saag, and chicken', 'Millet or maize dhido with lentils, cooked greens, and thoroughly cooked chicken.'],
        ['Light meal', 'Chickpea and potato bowl with egg', 'Well-cooked chickpeas and potatoes with a fully cooked egg, washed tomato, and lemon.'],
      ],
      veg: [
        ['Breakfast', 'Milk kodo porridge with fruit', 'Millet porridge made with pasteurized milk and served with washed seasonal fruit.'],
        ['Main meal', 'Dhido, dal, saag, and paneer', 'Millet or maize dhido with lentils, cooked greens, and cooked paneer made from pasteurized milk.'],
        ['Light meal', 'Chickpea and potato bowl with curd', 'Well-cooked chickpeas and potatoes with pasteurized-milk curd, washed tomato, and lemon.'],
      ],
      vegan: [
        ['Breakfast', 'Plant-based kodo porridge with fruit', 'Millet porridge made with water or fortified plant milk and served with washed seasonal fruit.'],
        ['Main meal', 'Dhido, dal, and seasonal greens', 'Millet or maize dhido with lentils and cooked greens, prepared with oil.'],
        ['Light meal', 'Chickpea and potato bowl', 'Well-cooked chickpeas and potatoes with washed tomato and lemon, prepared with oil.'],
      ],
    },
    terai: {
      'non-veg': [
        ['Breakfast', 'Roti, egg, and seasonal fruit', 'Whole-wheat roti with a fully cooked egg and washed seasonal fruit.'],
        ['Main meal', 'Dal, rice, tarkari, and fish', 'Lentils and rice with cooked vegetables and thoroughly cooked fish.'],
        ['Light meal', 'Vegetable khichdi with egg', 'Rice and moong dal cooked with pumpkin or available vegetables, with a fully cooked egg.'],
      ],
      veg: [
        ['Breakfast', 'Roti, curd, and seasonal fruit', 'Whole-wheat roti with pasteurized-milk curd and washed seasonal fruit.'],
        ['Main meal', 'Dal, rice, tarkari, and paneer', 'Lentils and rice with cooked vegetables and cooked paneer made from pasteurized milk.'],
        ['Light meal', 'Vegetable khichdi with curd', 'Rice and moong dal cooked with pumpkin or available vegetables, with pasteurized-milk curd.'],
      ],
      vegan: [
        ['Breakfast', 'Dairy-free roti, chickpeas, and fruit', 'Whole-wheat roti made without milk or ghee, with well-cooked chickpeas and washed seasonal fruit.'],
        ['Main meal', 'Dal, rice, and seasonal tarkari', 'Lentils and rice with cooked seasonal vegetables, prepared with oil.'],
        ['Light meal', 'Plant-based vegetable khichdi', 'Rice and moong dal cooked with pumpkin or available vegetables, using oil instead of ghee.'],
      ],
    },
    mountains: {
      'non-veg': [
        ['Breakfast', 'Buckwheat roti, egg, and fruit', 'Buckwheat roti with a fully cooked egg and washed seasonal fruit.'],
        ['Main meal', 'Barley, rajma, and chicken', 'Barley or rice with well-cooked kidney beans, cooked greens, and thoroughly cooked chicken.'],
        ['Light meal', 'Lentil and vegetable soup with egg', 'Lentils simmered with potatoes and carrots, served with a fully cooked egg.'],
      ],
      veg: [
        ['Breakfast', 'Buckwheat roti, curd, and fruit', 'Buckwheat roti with pasteurized-milk curd and washed seasonal fruit.'],
        ['Main meal', 'Barley, rajma, and paneer', 'Barley or rice with well-cooked kidney beans, cooked greens, and cooked paneer made from pasteurized milk.'],
        ['Light meal', 'Lentil soup with paneer', 'Lentils simmered with potatoes and carrots, with cooked paneer made from pasteurized milk.'],
      ],
      vegan: [
        ['Breakfast', 'Dairy-free buckwheat roti with fruit', 'Buckwheat roti made without milk or ghee, served with washed seasonal fruit.'],
        ['Main meal', 'Barley or rice with rajma', 'Barley or rice with well-cooked kidney beans and cooked greens, prepared with oil.'],
        ['Light meal', 'Plant-based lentil and vegetable soup', 'Lentils simmered with potatoes, carrots, or available vegetables, using oil instead of ghee.'],
      ],
    },
  };
  const plans = {
    early: ['Start with care and support. You do not need to buy everything at once.', [['care','Arrange antenatal care','Keep records together and write down questions for your health worker.'],['support','Choose someone you can count on','Discuss help with meals, appointments, household tasks, and emotional support.'],['budget','Start a simple baby budget','List essentials and ask your health facility about delivery costs and support.']]],
    middle: ['Discuss where you will give birth and who can help you get there.', [['birth-place','Discuss your birth preferences','Ask about a suitable facility, support during labour, and who can accompany you.'],['transport','Plan transport and a backup','Save the facility contact and arrange a route, driver, and emergency funds.'],['essentials','Make an essentials list','Plan a few baby clothes, nappies, and a safe sleep space.']]],
    late: ['Keep essentials easy to reach and share this plan with your support person.', [['bag','Pack your care bag','Bring maternity records, ID, prescribed medicines, comfortable clothes, pads, and a charger.'],['baby-bag','Pack a few things for baby','Bring clean clothes, nappies, and a blanket. Ask what your facility provides.'],['sleep','Prepare a safe sleep space','Use a firm, flat mattress and clear cot; place baby on their back without pillows or loose bedding.'],['help','Arrange support after birth','Ask for help with meals and chores; discuss feeding and follow-up care.'],['contacts','Save care contacts','Ask about labour signs and urgent symptoms; keep the health team number accessible.']]],
  };
  let location = null;
  let saved = {};
  const boundRoots = new WeakSet();
  const t = (copy, values) => window.AamaI18n?.t(copy, values) || copy;
  const number = value => new Intl.NumberFormat(window.AamaI18n?.getLanguage() === 'ne' ? 'ne-NP' : 'en').format(value);
  // Fresh text nodes keep the page translator's original English keys current.
  const setText = (node, copy) => node?.replaceChildren(document.createTextNode(copy));
  const refreshLanguage = () => window.AamaI18n?.translatePage();
  const locationMessages = new WeakMap();
  const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function movementVideo(id, title) {
    const link = window.AAMA_MOVEMENT_VIDEOS?.[id]?.trim();
    let videoId = '';
    try {
      const url = new URL(link);
      const host = url.hostname.toLowerCase();
      if (['https:', 'http:'].includes(url.protocol)) {
        if (host === 'youtu.be') videoId = url.pathname.split('/')[1];
        if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
          videoId = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1];
        }
      }
    } catch { /* Empty or invalid links keep the placeholder visible. */ }
    const content = /^[\w-]{11}$/.test(videoId || '')
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1" title="${escape(t(title))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : `<div class="learn-video-placeholder"><span class="learn-video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 5 11 7-11 7Z"/></svg></span><span>Video coming soon</span></div>`;
    return `<div class="learn-video-frame"><div class="learn-movement-video">${content}</div></div>`;
  }
  function init(root) {
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { saved = {}; }
    location = saved.location || null;
    const stage = root.querySelector('[data-birth-stage]');
    if (stage) stage.value = plans[saved.stage] ? saved.stage : 'early';
    root.querySelectorAll('[data-movement-week]').forEach(select => { select.innerHTML = Array.from({length:42},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join(''); select.value = saved.week || 24; });
    render(root);
    if (boundRoots.has(root)) return;
    boundRoots.add(root);
    document.addEventListener('aama-language-change', () => {
      if (!root.isConnected) return;
      render(root);
      const status = locationMessages.get(root);
      if (status) locationStatus(root, status.message, status.values);
    });
    root.addEventListener('change', event => {
      if (event.target.id === 'learn-diet') { saved.diet = event.target.value; save(); render(root); }
      if (event.target.matches('[data-birth-stage]')) { saved.stage = event.target.value; save(); renderPlan(root); }
      if (event.target.matches('[data-plan-task]')) { saved.completed ||= {}; saved.completed[event.target.dataset.planTask] = event.target.checked; save(); updateProgress(root); }
      if (event.target.matches('[data-movement-done]')) { saved.movement ||= {}; saved.movement[event.target.dataset.movementDone] = event.target.checked; save(); }
      if (event.target.matches('[data-support-question]')) { saved.questions ||= {}; saved.questions[event.target.dataset.supportQuestion] = event.target.checked; save(); updateQuestions(root); }
      if (event.target.matches('[data-save-meal]')) { saved.meals ||= {}; saved.meals[event.target.dataset.saveMeal] = event.target.checked; save(); }
    });
    root.addEventListener('click', event => {
      if (event.target.closest('[data-download-plan]')) {
        const text = Object.entries(plans).map(([key, [tip, tasks]]) => `${t({early: 'Early pregnancy', middle: 'Middle pregnancy', late: 'Late pregnancy'}[key])}\n${t(tip)}\n${tasks.map(([id,title,copy]) => `${saved.completed?.[id] ? '[x]' : '[ ]'} ${t(title)}\n    ${t(copy)}`).join('\n')}`).join('\n\n');
        const url = URL.createObjectURL(new Blob([t('AamaCare · My birth preparation checklist') + '\n\n' + text], {type:'text/plain;charset=utf-8'}));
        const link = document.createElement('a'); link.href = url; link.download = 'aamacare-birth-checklist.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
  }
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* The current session remains usable. */ } }
  function open(root, page) {
    root.querySelectorAll('[data-learn-overview]').forEach(section => section.classList.add('is-hidden'));
    root.querySelector('#learn-topic-shell')?.classList.add('is-hidden');
    root.querySelectorAll('.learn-subpage').forEach(section => section.classList.toggle('is-hidden', section.id !== `learn-subpage-${page}`));
    root.querySelector('#learn-subpage-'+page)?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function back(root) {
    root.querySelectorAll('.learn-subpage').forEach(section => section.classList.add('is-hidden'));
    root.querySelectorAll('[data-learn-overview]').forEach(section => section.classList.remove('is-hidden'));
    root.querySelector('#learn-topic-shell')?.classList.remove('is-hidden');
    root.querySelector('#learn-topic-shell')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function render(root) {
    const foodContext = root.querySelector('#learn-food-context');
    const foods = root.querySelector('#learn-foods');
    if (foodContext) setText(foodContext, location ? `${location.demo ? t('Demo · ') : ''}${t('Meal ideas near {area}. Sample regional meals; seasonal availability may vary.', {area: t(location.name)})}` : t('Use your location to see regional meal ideas.'));
    if (foods) {
      const region = location?.region;
      const preference = ['non-veg', 'veg', 'vegan'].includes(saved.diet) ? saved.diet : 'non-veg';
      const ideas = meals[region]?.[preference] || [];
      foods.innerHTML = ideas.map(([type, title, desc], index) => {
        const mealId = `${region}-${preference}-${index}`;
        return `<article class="learn-meal"><span class="learn-meal-label">${type}</span><h3>${title}</h3><p>${desc}</p><label class="learn-save-meal"><input type="checkbox" data-save-meal="${mealId}" ${saved.meals?.[mealId] ? 'checked' : ''}> Save this meal idea</label></article>`;
      }).join('') || '<p class="learn-empty">A little inspiration for your next meal. Use your location to get started.</p>';
      const select = root.querySelector('#learn-diet'); if (select) select.value = preference;
    }
    const movements=root.querySelector('#learn-movements');
    if(movements) movements.innerHTML=[
      ['walking','Comfortable walking','Start with a short, easy walk on level ground. Build up gradually if it feels comfortable; take breaks and drink water.'],
      ['pelvic','Pelvic floor practice','Gently tighten the muscles around your vagina and back passage, hold briefly while breathing normally, then fully relax. Ask your midwife for help if unsure.'],
      ['mobility','Gentle mobility','Try relaxed shoulder rolls, ankle circles, or a supported stretch. Keep movements pain-free and avoid overheating or fall risks.']
    ].map(([id,title,copy])=>`<article class="learn-movement">${movementVideo(id, title)}<div class="learn-movement-copy"><h3>${title}</h3><details><summary>Explore this activity</summary><p>${copy}</p></details><label class="learn-activity-done"><input type="checkbox" data-movement-done="${id}" ${saved.movement?.[id] ? 'checked' : ''}> Save to my activities</label></div></article>`).join('');
    root.querySelectorAll('[data-support-question]').forEach(input => { input.checked = Boolean(saved.questions?.[input.dataset.supportQuestion]); });
    updateQuestions(root);
    renderPlan(root);
    refreshLanguage();
  }
  function updateQuestions(root) {
    const count = root.querySelector('[data-support-count]');
    const total = root.querySelectorAll('[data-support-question]:checked').length;
    if (count) setText(count, t('{count} questions saved for your next conversation · Saved on this device', {count: number(total)}));
  }
  function renderPlan(root) {
    const stage=root.querySelector('[data-birth-stage]'); const key=stage?.value || 'early';
    const [tip,tasks]=plans[key];
    const tipNode=root.querySelector('[data-birth-tip]'); if(tipNode) setText(tipNode, tip);
    const list=root.querySelector('[data-birth-tasks]');
    if(list) list.innerHTML=tasks.map(([id,title,copy])=>`<label class="learn-prep-task"><input type="checkbox" data-plan-task="${id}" ${saved.completed?.[id]?'checked':''}><span><strong>${title}</strong><small>${copy}</small></span></label>`).join('');
    updateProgress(root);
    refreshLanguage();
  }
  function updateProgress(root) {
    const key = root.querySelector('[data-birth-stage]')?.value || 'early';
    const tasks = plans[key][1]; const done = tasks.filter(([id]) => saved.completed?.[id]).length;
    const count = root.querySelector('[data-birth-count]'); if (count) setText(count, `${t('{done} of {total} ready', {done: number(done), total: number(tasks.length)})} · ${t(done === tasks.length ? 'All set for this stage!' : 'One step at a time')}`);
    const progress = root.querySelector('#birth-progress'); if (progress) { progress.max = tasks.length; progress.value = done; }
  }
  function locationStatus(root, message, values) {
    locationMessages.set(root, {message, values});
    const translatedValues = values ? Object.fromEntries(Object.entries(values).map(([key, value]) => [key, t(value)])) : undefined;
    root.querySelectorAll('#learn-location-status, [data-food-location-status]').forEach(status => { setText(status, t(message, translatedValues)); });
  }
  function locate(root) {
    const status = { set textContent(message) { locationStatus(root, message); } };
    if(!navigator.geolocation){status.textContent='Location is unavailable. You can still explore the other topics.';return;}
    const buttons = root.querySelectorAll('[data-action="learn-use-location"]');
    if (Array.from(buttons).some(button => button.disabled)) return;
    buttons.forEach(button => { button.disabled = true; });
    const finish = () => buttons.forEach(button => { button.disabled = false; });
    status.textContent='Finding your location…';
    navigator.geolocation.getCurrentPosition(({coords})=>{
      finish();
      const {latitude:lat,longitude:lon}=coords;
      const near=areas.map(a=>({...a,d:Math.hypot((lat-a.lat)*111,(lon-a.lon)*100)})).sort((a,b)=>a.d-b.d)[0];
      if(lat<26||lat>31||lon<80||lon>89){status.textContent='Your location appears to be outside Nepal. Regional food suggestions are tailored for Nepal.';return;}
      location={name:near.d<120?near.name:'Nepal',region:near.d<120?near.region:(lat>28.7?'mountains':lat>28?'hills':'terai')};
      saved.location=location;save();locationStatus(root, 'Food ideas updated for {area}. Precise coordinates are not stored.', {area: location.name});render(root);
    },error=>{finish();status.textContent=error.code===1?'Location permission was not granted. Allow location access and try again.':'Could not find your location. Please try again.';},{timeout:12000,maximumAge:300000});
  }
  window.AamaLearn={init,open,back,locate};
})();
