(function () {
  const origin = { lat: 27.6683, lng: 85.3204 };
  let loadPromise = null;
  let activeState = null;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  function getCoordinates(location) {
    if (!location) return null;
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  }

  function distanceInKilometres(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const earthRadius = 6371;
    const latitudeDelta = radians(to.lat - from.lat);
    const longitudeDelta = radians(to.lng - from.lng);
    const a = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getDisplayName(place) {
    return String(place?.displayName || place?.name || 'Nearby care service').replace(/^places\//, '');
  }

  function getTypeLabel(place) {
    const type = place?.primaryType || place?.types?.[0] || 'health service';
    return String(type).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getOpeningLabel(place) {
    if (place?.regularOpeningHours?.openNow === true) return 'Open now';
    if (place?.regularOpeningHours?.openNow === false) return 'Closed now';
    return 'Hours unavailable';
  }

  function getPhotoData(place) {
    const photo = place?.photos?.[0];
    if (!photo) return null;
    try {
      return {
        url: photo.getURI({ maxWidth: 640, maxHeight: 480 }),
        attribution: photo.authorAttributions?.[0]?.displayName || '',
      };
    } catch (error) {
      console.warn('A Google place photo could not be loaded.', error);
      return null;
    }
  }

  async function getConfiguredApiKey() {
    const configuredKey = String(window.MATRI_SATHI_GOOGLE_MAPS_API_KEY || '').trim();
    if (configuredKey) return configuredKey;
    const apiBase = String(window.AAMA_API_URL || '').replace(/\/$/, '');
    try {
      const response = await fetch(`${apiBase}/api/maps/config`);
      if (!response.ok) return '';
      const data = await response.json();
      return String(data.apiKey || '').trim();
    } catch {
      return '';
    }
  }

  async function loadGoogleMaps() {
    if (window.google?.maps?.importLibrary) return window.google.maps;
    if (loadPromise) return loadPromise;

    loadPromise = getConfiguredApiKey().then((apiKey) => {
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured.');
      }
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-matrisathi-google-maps]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.google.maps), { once: true });
          existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load.')), { once: true });
          return;
        }
        const script = document.createElement('script');
        const params = new URLSearchParams({ key: apiKey, v: 'weekly', loading: 'async' });
        script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        script.async = true;
        script.defer = true;
        script.dataset.matrisathiGoogleMaps = 'true';
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps failed to load. Check the API key and enabled APIs.'));
        document.head.appendChild(script);
      });
    }).catch((error) => {
      loadPromise = null;
      throw error;
    });
    return loadPromise;
  }

  function cleanup() {
    if (!activeState) return;
    activeState.infoWindow?.close();
    activeState.markers?.forEach((marker) => { marker.map = null; });
    activeState = null;
  }

  function showMapStatus(root, title, message) {
    const mapElement = root.querySelector('#care-map');
    if (!mapElement) return;
    mapElement.replaceChildren();
    const status = document.createElement('div');
    status.className = 'map-unavailable';
    status.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    mapElement.appendChild(status);
  }

  function createPlaceCard(place, distance, index, root) {
    const id = place.id || place.name || `place-${index}`;
    const name = getDisplayName(place);
    const address = place.formattedAddress || 'Address unavailable';
    const type = getTypeLabel(place);
    const hours = getOpeningLabel(place);
    const rating = Number(place.rating) > 0 ? ` · ★ ${Number(place.rating).toFixed(1)}` : '';
    const photo = getPhotoData(place);
    const card = document.createElement('button');
    card.className = `service-card${index === 0 ? ' is-selected' : ''}`;
    card.type = 'button';
    card.dataset.action = 'select-service';
    card.dataset.service = id;
    card.setAttribute('aria-pressed', String(index === 0));

    if (photo?.url) {
      const image = document.createElement('img');
      image.className = 'service-card__photo';
      image.src = photo.url;
      image.alt = `${name} photo`;
      image.loading = 'lazy';
      card.appendChild(image);
      if (photo.attribution) card.dataset.photoAttribution = photo.attribution;
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'service-card__photo service-card__photo--fallback';
      fallback.textContent = '✚';
      fallback.setAttribute('aria-hidden', 'true');
      card.appendChild(fallback);
    }

    const copy = document.createElement('span');
    copy.className = 'service-card__copy';
    copy.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(type)} · ${escapeHtml(hours)}${escapeHtml(rating)}</span><small>${escapeHtml(address)}</small>`;
    card.appendChild(copy);

    const distanceNode = document.createElement('span');
    distanceNode.className = 'service-distance';
    distanceNode.textContent = `${distance.toFixed(1)} km`;
    card.appendChild(distanceNode);
    card.addEventListener('click', () => selectPlace(id));
    return card;
  }

  function renderPlaces(root, places) {
    const list = root.querySelector('[data-service-list]');
    const count = root.querySelector('[data-service-count]');
    if (!list) return;
    list.replaceChildren();
    if (!places.length) {
      if (count) count.textContent = '0 places';
      const empty = document.createElement('div');
      empty.className = 'service-loading';
      empty.textContent = 'No nearby hospitals or health services were found.';
      list.appendChild(empty);
      return;
    }
    if (count) count.textContent = `${places.length} places`;
    places.forEach(({ place, distance }, index) => list.appendChild(createPlaceCard(place, distance, index, root)));
  }

  function infoContent(place, distance) {
    const name = getDisplayName(place);
    const address = place.formattedAddress || 'Address unavailable';
    const phone = place.nationalPhoneNumber ? `<div>${escapeHtml(place.nationalPhoneNumber)}</div>` : '';
    const rating = Number(place.rating) > 0 ? `<div>★ ${Number(place.rating).toFixed(1)}${place.userRatingCount ? ` · ${Number(place.userRatingCount).toLocaleString()} reviews` : ''}</div>` : '';
    const photoCredit = getPhotoData(place)?.attribution;
    return `<div class="google-map-info"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(address)}</span><span>${escapeHtml(getOpeningLabel(place))} · ${distance.toFixed(1)} km away</span>${phone}${rating}${photoCredit ? `<small>Photo: ${escapeHtml(photoCredit)}</small>` : ''}</div>`;
  }

  function selectPlace(id, openInfo = true) {
    const state = activeState;
    const entry = state?.placesById?.get(id);
    if (!entry) return;
    state.root.querySelectorAll('.service-card').forEach((card) => {
      const selected = card.dataset.service === id;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    state.map.panTo(entry.position);
    if (openInfo) {
      state.map.setZoom(Math.max(state.map.getZoom() || 14, 15));
      state.infoWindow.setContent(infoContent(entry.place, entry.distance));
      state.infoWindow.open({ map: state.map, anchor: entry.marker });
    }
  }

  async function init(root) {
    cleanup();
    const mapElement = root?.querySelector('#care-map');
    if (!mapElement) return;
    try {
      const maps = await loadGoogleMaps();
      const [{ Map }, { AdvancedMarkerElement }, { Place, SearchNearbyRankPreference }] = await Promise.all([
        maps.importLibrary('maps'),
        maps.importLibrary('marker'),
        maps.importLibrary('places'),
      ]);
      if (!root.isConnected) return;
      const map = new Map(mapElement, {
        center: origin,
        zoom: 14,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      const infoWindow = new google.maps.InfoWindow();
      const response = await Place.searchNearby({
        fields: ['id', 'displayName', 'formattedAddress', 'location', 'primaryType', 'types', 'photos', 'rating', 'userRatingCount', 'nationalPhoneNumber', 'regularOpeningHours'],
        locationRestriction: { center: origin, radius: 9000 },
        includedPrimaryTypes: ['hospital', 'medical_clinic', 'pharmacy'],
        maxResultCount: 8,
        rankPreference: SearchNearbyRankPreference.DISTANCE,
        language: 'en',
        region: 'NP',
      });
      const places = (response.places || [])
        .map((place) => ({ place, position: getCoordinates(place.location) }))
        .filter((entry) => entry.position)
        .map((entry) => ({ ...entry, distance: distanceInKilometres(origin, entry.position) }));
      const markers = new Map();
      const placesById = new Map();
      activeState = { root, map, infoWindow, markers, placesById };
      renderPlaces(root, places);
      places.forEach(({ place, position, distance }, index) => {
        const id = place.id || place.name || `place-${index}`;
        const markerContent = document.createElement('div');
        markerContent.className = 'google-care-marker';
        const markerSymbol = document.createElement('span');
        markerSymbol.textContent = index === 0 ? '✚' : '＋';
        markerContent.appendChild(markerSymbol);
        const marker = new AdvancedMarkerElement({ map, position, title: getDisplayName(place), content: markerContent });
        marker.addListener('click', () => selectPlace(id));
        markers.set(id, marker);
        placesById.set(id, { place, position, distance, marker });
      });
      if (places.length) selectPlace(places[0].place.id || places[0].place.name || 'place-0', false);
    } catch (error) {
      console.error('Google Maps could not load nearby care data.', error);
      showMapStatus(root, 'Google Maps is not connected yet', 'Add a browser-restricted Google Maps API key in config.js or GOOGLE_MAPS_API_KEY in .env, then refresh this page.');
      const list = root.querySelector('[data-service-list]');
      if (list) {
        list.replaceChildren();
        const message = document.createElement('div');
        message.className = 'service-loading';
        message.textContent = 'Live hospital data will appear here after Google Maps is configured.';
        list.appendChild(message);
      }
      const count = root.querySelector('[data-service-count]');
      if (count) count.textContent = 'Setup needed';
    }
  }

  window.MatriSathiGoogleMaps = { init, cleanup, select: selectPlace };
})();
