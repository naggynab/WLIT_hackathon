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
    if (place?.openingHours) return `Hours: ${place.openingHours}`;
    return 'Hours unavailable';
  }

  function getPhotoData(place) {
    if (place?.photoUrl) return { url: place.photoUrl, attribution: place.photoAttribution || '' };
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

  async function findWikimediaPhoto(place) {
    if (place.photoUrl) return;
    const stopWords = new Set(['hospital', 'clinic', 'pharmacy', 'medical', 'health', 'centre', 'center', 'the', 'and']);
    const tokens = getDisplayName(place).toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3 && !stopWords.has(token));
    if (!tokens.length) return;
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrnamespace: '6',
        gsrsearch: `${getDisplayName(place)} Lalitpur Nepal`,
        gsrlimit: '3',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: '640',
        format: 'json',
        origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) return;
      const data = await response.json();
      const pages = Object.values(data.query?.pages || {});
      const match = pages.find((page) => {
        const title = String(page.title || '').toLowerCase();
        return tokens.length > 0 && tokens.some((token) => title.includes(token));
      });
      const image = match?.imageinfo?.[0];
      if (!image?.thumburl && !image?.url) return;
      const metadata = image.extmetadata || {};
      const attribution = String(metadata.Artist?.value || metadata.Credit?.value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 90);
      const license = String(metadata.LicenseShortName?.value || '').replace(/<[^>]*>/g, '').trim();
      place.photoUrl = image.thumburl || image.url;
      place.photoAttribution = ['Wikimedia Commons', attribution, license].filter(Boolean).join(' · ');
    } catch (error) {
      console.warn(`No Wikimedia photo found for ${getDisplayName(place)}.`, error);
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

  async function loadGoogleMaps(configuredApiKey = '') {
    if (window.google?.maps?.importLibrary) return window.google.maps;
    if (loadPromise) return loadPromise;

    loadPromise = Promise.resolve(configuredApiKey || getConfiguredApiKey()).then((apiKey) => {
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
    activeState.markers?.forEach((marker) => {
      if (activeState.provider === 'leaflet') marker.remove();
      else marker.map = null;
    });
    activeState.map?.remove?.();
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
    const rating = Number(place.rating) > 0 ? ` · <i data-lucide="star" aria-hidden="true"></i> ${Number(place.rating).toFixed(1)}` : '';
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
      fallback.innerHTML = '<i data-lucide="heart-pulse" aria-hidden="true"></i>';
      fallback.setAttribute('aria-hidden', 'true');
      card.appendChild(fallback);
    }

    const copy = document.createElement('span');
    copy.className = 'service-card__copy';
    copy.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(type)} · ${escapeHtml(hours)}${escapeHtml(rating)}</span><small>${escapeHtml(address)}</small>`;
    if (photo?.attribution) {
      const credit = document.createElement('small');
      credit.className = 'service-photo-credit';
      credit.textContent = `Photo: ${photo.attribution}`;
      copy.appendChild(credit);
    }
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
    const rating = Number(place.rating) > 0 ? `<div><i data-lucide="star" aria-hidden="true"></i> ${Number(place.rating).toFixed(1)}${place.userRatingCount ? ` · ${Number(place.userRatingCount).toLocaleString()} reviews` : ''}</div>` : '';
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
    if (state.provider === 'leaflet') {
      state.map.setView([entry.position.lat, entry.position.lng], 16, { animate: true });
      if (openInfo) entry.marker.openPopup();
      return;
    }
    state.map.panTo(entry.position);
    if (openInfo) {
      state.map.setZoom(Math.max(state.map.getZoom() || 14, 15));
      state.infoWindow.setContent(infoContent(entry.place, entry.distance));
      state.infoWindow.open({ map: state.map, anchor: entry.marker });
    }
  }

  function osmPlace(element) {
    const tags = element.tags || {};
    const position = getCoordinates({
      lat: element.lat ?? element.center?.lat,
      lng: element.lon ?? element.center?.lon,
    });
    if (!position) return null;
    const name = tags.name || tags['name:en'] || 'Nearby health service';
    const type = tags.amenity || tags.healthcare || 'health service';
    const address = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'] || tags['addr:city'],
    ].filter(Boolean).join(', ') || 'Address unavailable';
    const photoUrl = /^https?:\/\//i.test(tags.image || '') ? tags.image : '';
    return {
      id: `osm-${element.type}-${element.id}`,
      displayName: name,
      formattedAddress: address,
      location: position,
      primaryType: type,
      nationalPhoneNumber: tags.phone || tags['contact:phone'] || '',
      openingHours: tags.opening_hours || '',
      photoUrl,
      photoAttribution: photoUrl ? 'OpenStreetMap listing' : '',
    };
  }

  function nominatimPlace(result, category) {
    const position = getCoordinates({ lat: result.lat, lng: result.lon });
    if (!position) return null;
    const extra = result.extratags || {};
    const address = result.display_name || 'Address unavailable';
    const photoUrl = /^https?:\/\//i.test(extra.image || '') ? extra.image : '';
    return {
      id: `osm-${result.osm_type || 'place'}-${result.osm_id || result.place_id}`,
      displayName: result.name || `${category} near Lalitpur`,
      formattedAddress: address,
      location: position,
      primaryType: result.type || category,
      nationalPhoneNumber: extra.phone || extra['contact:phone'] || '',
      openingHours: extra.opening_hours || '',
      photoUrl,
      photoAttribution: photoUrl ? 'OpenStreetMap listing' : '',
    };
  }

  async function fetchFreeHealthPlaces() {
    // Nominatim is used only for the user opening this page and requests are
    // spaced out to respect its public-service limit of one request per second.
    const categories = ['hospital', 'clinic', 'pharmacy'];
    const results = [];
    for (const [index, category] of categories.entries()) {
      if (index) await new Promise((resolve) => window.setTimeout(resolve, 1100));
      const params = new URLSearchParams({
        format: 'jsonv2',
        addressdetails: '1',
        extratags: '1',
        limit: '8',
        q: `${category} Lalitpur Nepal`,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`OpenStreetMap search returned ${response.status}.`);
      const healthResults = (await response.json()).filter((result) => {
        const type = String(result.type || '').toLowerCase();
        return ['hospital', 'clinic', 'doctors', 'pharmacy', 'chemist', 'health_centre', 'health_center', 'healthcare'].some((allowed) => type.includes(allowed));
      });
      results.push(...healthResults.map((result) => nominatimPlace(result, category)).filter(Boolean));
    }
    const unique = new Map();
    results.forEach((place) => {
      if (!unique.has(place.displayName)) unique.set(place.displayName, place);
    });
    const nearbyPlaces = Array.from(unique.values())
      .map((place) => ({ place, position: getCoordinates(place.location) }))
      .map((entry) => ({ ...entry, distance: distanceInKilometres(origin, entry.position) }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 8);
    await Promise.all(nearbyPlaces.map(({ place }) => findWikimediaPhoto(place)));
    return nearbyPlaces;
  }

  async function initOpenStreetMap(root) {
    if (!window.L) throw new Error('The free map library is not available.');
    const mapElement = root?.querySelector('#care-map');
    if (!mapElement) return;
    mapElement.replaceChildren();
    const map = window.L.map(mapElement, { scrollWheelZoom: false, zoomControl: true }).setView([origin.lat, origin.lng], 14);
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    let places;
    try {
      places = await fetchFreeHealthPlaces();
    } catch (error) {
      map.remove();
      throw error;
    }
    if (!root.isConnected) {
      map.remove();
      return;
    }
    const markers = new Map();
    const placesById = new Map();
    activeState = { provider: 'leaflet', root, map, markers, placesById };
    renderPlaces(root, places);
    places.forEach(({ place, position, distance }) => {
      const marker = window.L.marker([position.lat, position.lng]).addTo(map);
      marker.bindPopup(infoContent(place, distance));
      marker.on('click', () => selectPlace(place.id));
      markers.set(place.id, marker);
      placesById.set(place.id, { place, position, distance, marker });
    });
    const credit = root.querySelector('.map-credit');
    if (credit) credit.textContent = 'Map and place data © OpenStreetMap contributors.';
    if (places.length) selectPlace(places[0].place.id, false);
  }

  async function init(root) {
    cleanup();
    const mapElement = root?.querySelector('#care-map');
    if (!mapElement) return;
    try {
      const includePhotos = Boolean(window.MATRI_SATHI_GOOGLE_MAPS_INCLUDE_PHOTOS);
      const configuredApiKey = await getConfiguredApiKey();
      if (!configuredApiKey) {
        await initOpenStreetMap(root);
        return;
      }
      const maps = await loadGoogleMaps(configuredApiKey);
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
      const fields = ['id', 'displayName', 'formattedAddress', 'location', 'primaryType', 'types', 'nationalPhoneNumber', 'regularOpeningHours'];
      if (includePhotos) fields.push('photos', 'rating', 'userRatingCount');
      const response = await Place.searchNearby({
        fields,
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
        markerSymbol.innerHTML = `<i data-lucide="${index === 0 ? 'heart-pulse' : 'map-pin'}" aria-hidden="true"></i>`;
        markerContent.appendChild(markerSymbol);
        const marker = new AdvancedMarkerElement({ map, position, title: getDisplayName(place), content: markerContent });
        marker.addListener('click', () => selectPlace(id));
        markers.set(id, marker);
        placesById.set(id, { place, position, distance, marker });
      });
      if (places.length) selectPlace(places[0].place.id || places[0].place.name || 'place-0', false);
    } catch (error) {
      console.error('Google Maps could not load nearby care data.', error);
      try {
        await initOpenStreetMap(root);
      } catch (freeMapError) {
        console.error('The free OpenStreetMap fallback could not load nearby care data.', freeMapError);
        showMapStatus(root, 'Map data is temporarily unavailable', 'Please check your internet connection and refresh the page.');
        const list = root.querySelector('[data-service-list]');
        if (list) {
          list.replaceChildren();
          const message = document.createElement('div');
          message.className = 'service-loading';
          message.textContent = 'Nearby health services could not be loaded right now.';
          list.appendChild(message);
        }
        const count = root.querySelector('[data-service-count]');
        if (count) count.textContent = 'Unavailable';
      }
    }
  }

  window.MatriSathiGoogleMaps = { init, cleanup, select: selectPlace };
})();
