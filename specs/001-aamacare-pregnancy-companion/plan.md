# AamaCare Pregnancy Companion Implementation Plan

## 1. Technical Context

- **Current frontend:** static HTML/CSS and vanilla JavaScript in `frontend/`. `index.html` loads `config.js`, `i18n.js`, `views.js`, `app.js`, and `pregnancy-card.js` as browser scripts. There is no frontend package manifest or build step.
- **Current navigation:** `app.js` maps `/home` routes and renders secondary views from `window.AamaViews`; `vercel.json` and Express route fallbacks serve `index.html` for dashboard paths.
- **Current pregnancy state:** `pregnancy-card.js` owns the due date and week calculation, persists `aamacare-due-date`, and dispatches `aama-week-change`. `app.js` listens and updates week-related labels in all rendered views.
- **Current localization:** `i18n.js` owns English/Nepali translations and persists `aamacare-language`.
- **Current local persistence:** checklist, custom checklist, settings, and read-aloud preference are saved separately by `app.js`.
- **Current API:** Express in `backend/server.mjs` serves the frontend and provides `GET /api/health` and `POST /api/chat`. Chat accepts `{ message }` and returns `{ reply, audio, mimeType }`; Gemini and ElevenLabs are optional server-side integrations with a text fallback.
- **Decision:** retain the vanilla frontend for the MVP. A shared state/storage layer addresses the identified synchronization and persistence needs without adding a framework, build pipeline, or rewriting the existing screens. Reconsider React only if the feature work demonstrates that view/state complexity cannot be maintained cleanly with these small modules.

## 2. Design

### Component and responsibility boundaries

| Area | Responsibility | Planned location |
|---|---|---|
| Application shell and navigation | Preview entry, dashboard shell, route changes, dialogs, mobile navigation, and event delegation | `frontend/index.html`, `frontend/app.js` |
| Persistence adapter | Read/write localStorage, validate stored shapes, handle storage failures, and migrate current keys without data loss | New `frontend/storage.js` |
| Pregnancy state | Validate due dates, derive pregnancy week/trimester/progress/baby size, expose one snapshot, and notify views on updates | New `frontend/pregnancy-state.js`; integrate `frontend/pregnancy-card.js` |
| Views and content | Render profile, weekly guidance, checklist, records, family, services, and learning views from shared state and clearly identified demo content | `frontend/views.js`; new `frontend/content.js` for seeded content if separation is useful |
| Localization | Preserve existing translation lookup and language controls; translate new form, empty, error, and safety states | `frontend/i18n.js` |
| Styling and responsive behavior | Reuse current tokens, panels, and layout; refine focus, touch targets, dialog, and small-screen behavior | `frontend/styles.css` |
| AI and voice boundary | Keep provider credentials and calls on the server; preserve existing request/response contract and optional voice fallback | `backend/server.mjs`; `frontend/app.js`, `frontend/config.js` |

Keep the current classic-script integration initially: expose only the small shared interfaces needed on `window` and load new scripts before their consumers. Avoid an app-wide rewrite or mixing React and direct DOM ownership on the same screen.

### Shared pregnancy state and data flow

1. On startup, the storage adapter loads and validates the demo profile, due date, language, settings, checklist, appointments/records, family sharing preferences, and saved learning preferences.
2. The pregnancy-state module calculates one snapshot from the saved due date and current local calendar day. Views read the same snapshot; they do not calculate their own week or trimester.
3. Updating the due date validates and persists it, recomputes the snapshot, then publishes the existing `aama-week-change` event (or a compatible replacement) for the dashboard and active secondary view.
4. Changing language persists the selection and updates text from the existing translation system. It must not reset profile or pregnancy state.
5. Checklist and content views derive week-specific recommendations from the shared snapshot. Checklist completion is stored by local date so yesterday's completion does not count as today's.
6. Existing routes, visual style, and Express behavior remain in place throughout the work.

### Pregnancy calculation rules

- Treat an estimated due date as an ISO calendar date (`YYYY-MM-DD`), not a local-time timestamp.
- Calculate gestational age from a 280-day pregnancy duration using whole calendar days to avoid timezone drift.
- Display completed weeks, trimester, progress toward 40 weeks, and a week-specific baby-size label from a maintained content map.
- Define trimester boundaries once (weeks 1-13, 14-27, and 28-40) and use the same helper everywhere.
- Clamp or represent early and post-due-date states explicitly; never display a negative week or a week above 40 as the current pregnancy week. Keep the saved due date unchanged when an edit is invalid.
- The week slider is a preview/control affordance, not a second source of actual gestational age. Clarify its semantics and restore the calculated week when the user leaves the preview.

### localStorage keys

Retain existing keys for compatibility and add only what the MVP requires:

| Key | Planned value |
|---|---|
| `aamacare-profile` | JSON demo profile, such as preferred name and selected location; no authentication identifiers |
| `aamacare-due-date` | Existing ISO date string; the canonical due-date value |
| `aamacare-language` | Existing `en` or `ne` value |
| `aamacare-settings` | Existing JSON settings object for reminder and privacy preferences |
| `aamacare-checklist` | JSON completion map scoped by date, with a one-time migration from the current flat task-id map |
| `aamacare-custom-checklist` | Existing JSON custom checklist items; include day association if the UI treats them as daily tasks |
| `aamacare-records` | JSON demo health records and appointment entries, clearly presented as local demo data |
| `aamacare-family-preferences` | JSON selected support tasks/recipients and explicit sharing flags; default to private |
| `aamacare-learning-preferences` | JSON saved learning items or preferences, if the existing UI persists them |
| `aamacare-read-aloud` | Existing `on`/`off` preference |

Validate parsed values before rendering. Keep fallback behavior visible and understandable when storage is unavailable or malformed; do not silently treat corrupt records as verified health information. Do not store AI conversations or real medical documents as part of this demo plan.

### API boundaries

- Keep all AI-provider and voice-provider credentials in the Express process. Frontend requests use the configured same-origin API by default; `AAMA_API_URL` remains only for separate frontend deployments.
- Preserve `POST /api/chat` input validation, 2,000-character limit, JSON response shape, and optional audio. Display a useful error when the service is unreachable.
- Continue to treat AI output as general education, not diagnosis or treatment. Review emergency-language coverage in both English and Nepali and make urgent-care guidance prominent. A model or keyword classifier must not be the only safeguard.
- Keep health records, profile, checklist, family preferences, and nearby-service demo data client-side; do not add API endpoints for these in the MVP.
- Keep `GET /api/health` behavior and existing Express static/route handling intact.

## 3. Files

### New files

- `frontend/storage.js` — shared, guarded localStorage access, shape validation, and legacy-key migration.
- `frontend/pregnancy-state.js` — date validation, pregnancy calculations, single snapshot and change notification.
- `frontend/content.js` — optional small English/Nepali seed data for week-specific guidance, FAQs, baby sizes, and demo health services; add only if keeping this out of `views.js` improves clarity.
- `specs/001-aamacare-pregnancy-companion/tasks.md` — implementation task breakdown after this plan is approved.

### Modified files

- `frontend/index.html` — preserve page shell and routes; load new modules in dependency order and add/adjust accessible profile controls only where required.
- `frontend/app.js` — initialize shared state, connect profile/settings/forms, persist checklist by day, bind records/family/service interactions, and consume API errors without duplicating pregnancy calculations.
- `frontend/pregnancy-card.js` — transition due-date UI and slider to the shared pregnancy-state interface; remove duplicate calculation ownership once integration is verified.
- `frontend/views.js` — bind existing secondary views to saved demo data and shared week state; retain current navigation routes and visual patterns.
- `frontend/i18n.js` — add translations for new labels, validation, empty/error states, and safety guidance.
- `frontend/styles.css` — reuse existing styles and refine responsive forms, focus indicators, dialogs, validation, and accessible target sizes.
- `backend/server.mjs` — only if safety behavior or API error consistency requires a narrowly scoped change; preserve existing Express routes and optional integrations.
- `frontend/vercel.json` — modify only if new deep-link routes are introduced; current `/home` rewrite should remain valid.

Do not modify the unrelated `campus-event-hub/` application or introduce a database/authentication package.

## 4. Implementation Phases

### Phase 0 — Baseline and integration safeguards

- Record current dashboard routes, styles, script order, API health/chat behavior, and mobile behavior.
- Confirm which visible records, appointments, family members, and services are demo fixtures.
- Define pregnancy-date boundaries and localStorage shapes before changing their owners.

**Exit:** current app and backend contracts are documented; no unrelated project files are in scope.

### Phase 1 — Shared storage and pregnancy state

- Add the storage adapter and shared pregnancy-state module.
- Preserve `aamacare-due-date` and current settings/language/read-aloud keys.
- Migrate the current flat checklist completion map to a date-scoped representation without losing existing completion values.
- Move week, trimester, progress, and baby-size calculations out of view-specific logic and publish one consistent snapshot.
- Connect the existing pregnancy card and verify dashboard, journey, weekly guide, checklist labels, learning recommendations, and milestones all update from one due-date change.

**Exit:** date edits persist, invalid dates do not overwrite valid data, and all current week references agree after edit, reload, language switch, and next-day refresh.

### Phase 2 — Profile, language, weekly guidance, and checklist

- Add or complete no-login profile preview/setup using local demo data.
- Ensure due-date editing is discoverable and validated with accessible inline errors.
- Complete English/Nepali labels for newly added profile and weekly content while preserving current toggle behavior.
- Store checklist completion by day and custom tasks locally; display accurate completion counts and empty states.
- Ensure weekly nutrition, movement, care reminders, and ANC information are education and direct individualized advice to a health worker.

**Exit:** user can preview/create a profile, update the due date, change language, and persist day-specific checklist progress across reloads.

### Phase 3 — Records, appointments, family hub, and local services

- Replace static-only appointment and record interactions with local demo entries and usable create/view flows.
- Make missing-data and sample-data states explicit; do not show fabricated data as a user's actual care history.
- Persist family tasks and granular sharing preferences; default all personal/health information to unshared.
- Keep the seeded nearby services directory usable without geolocation or map availability; label approximate/demo information and provide only verified contact links.
- Retain current routes and Leaflet map behavior as an enhancement, not as the only way to find services.

**Exit:** records and appointments remain local, family sharing is opt-in and reversible, and directory access works without location permission or map CDN.

### Phase 4 — Aama AI, emergency behavior, and accessibility

- Preserve the current `/api/chat` contract and optional speech output; keep AI/voice optional.
- Review urgent-symptom handling in English and Nepali, including backend fallback behavior and UI escalation messaging. Clearly instruct users to contact a qualified health worker or emergency services for danger signs.
- Add clear loading, empty, server-error, and unsupported-voice states; never present service failure as a successful answer.
- Verify semantic headings/labels, keyboard operation, visible focus, focus return for dialogs, screen-reader announcements, responsive reflow, and contrast.

**Exit:** normal AI requests remain general and clearly qualified; danger-sign responses prioritize urgent care; unavailable AI does not block the rest of the app.

### Phase 5 — Verification and release readiness

- Run focused unit tests for pure date calculations, trimester boundaries, due-date validation, localStorage migration, date-scoped checklist behavior, and emergency-response cases.
- Run backend route tests for `/api/health` and `/api/chat` input/error/optional-service behavior without live provider credentials.
- Perform browser smoke checks for all routes, refresh/deep links, localStorage restoration, language switching, mobile layouts, keyboard-only flows, and map failure.
- Review demo content for Nepal localization, source accuracy, and clear medical disclaimers before presenting it as production guidance.

**Exit:** all acceptance criteria in the feature specification pass, no frontend build tooling or database is required for the vanilla-first path, and no secret is exposed to client code.

## 5. Conditional React/Vite Migration Strategy

React is not required for the initial implementation. If phases 1-3 show that vanilla event delegation and string-template views are creating repeated state or lifecycle bugs, migrate incrementally rather than replacing the app wholesale:

1. Add a frontend `package.json`, Vite configuration, and a React entry point under `frontend/src/`; keep the existing static app as the fallback during the pilot.
2. Extract pure date, storage, and API services first so both the current app and React pilot use the same contracts.
3. Pilot one bounded view (prefer the checklist or pregnancy card) as React, using a defined mount point in the existing shell. Do not let React and vanilla code both mutate that view's DOM.
4. Migrate one route at a time: profile/pregnancy state, checklist, then secondary views. Preserve route URLs, CSS class names/design tokens, localization behavior, localStorage keys, and API request/response formats.
5. Keep `backend/server.mjs` serving the built Vite assets and the existing API routes; update development scripts and deployment rewrites only after both local development and deep links are verified.
6. Remove old view code and script tags only after feature parity, accessibility checks, localStorage migration, and route smoke tests pass. Do not migrate the unrelated campus hub.

**React migration gate:** proceed only when the team can identify concrete repeated defects or complexity that the isolated React pilot resolves, and when adding the package/build/deployment maintenance is acceptable.

## 6. Testing Requirements

### Pure logic

- Due-date validation at the allowed earliest/latest date and invalid calendar dates.
- Week calculations around day 0, week/trimester boundaries, due date, and post-due-date state.
- Progress calculation and baby-size fallback for every displayed week.
- Legacy checklist migration and date rollover without losing custom tasks.
- Invalid/missing localStorage JSON and storage access denied.

### Browser behavior

- Preview without login; profile and due-date save/edit/reload.
- Shared week updates in overview and every secondary route.
- English/Nepali switching preserves the current profile, selected route, and checklist.
- Checklist updates, custom task handling, and day rollover.
- Create/view records and appointments; persist family tasks and revoke sharing.
- Services remain searchable and understandable without geolocation, network map tiles, or location permission.
- Aama AI loading, valid response, server error, absent API configuration, and urgent symptom guidance.
- Responsive layouts at narrow mobile, tablet, and desktop sizes; keyboard navigation, dialog focus, screen-reader labels/status, and reduced-motion behavior where animation is used.

### Regression

- Existing Express static hosting, `/login` and `/home/*` route fallbacks, `/api/health`, `/api/chat`, and optional voice behavior.
- Existing visual tokens, dashboard navigation, and Vercel rewrites.
- No request to add a database, authentication, or real medical-record transmission.
