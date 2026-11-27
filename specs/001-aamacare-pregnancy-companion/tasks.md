# Tasks: MatriSathi Pregnancy Companion

**Input documents:** `specs/001-aamacare-pregnancy-companion/spec.md`, `specs/001-aamacare-pregnancy-companion/plan.md`

**Ordering note:** The specification does not assign priority labels to its user stories, so story phases follow their order in `spec.md`. The implementation plan's vanilla JavaScript, local-only MVP, safety, and no-database constraints apply throughout.

## Phase 1: Setup

- [ ] T001 [P] Add guarded localStorage read/write helpers, stored-value validation, and migration support in `frontend/storage.js`.
- [ ] T002 [P] Add ISO due-date validation and the canonical pregnancy snapshot calculation (completed week, trimester, progress, early/post-due states, and baby-size lookup) in `frontend/pregnancy-state.js`.
- [ ] T003 Load `frontend/storage.js` and `frontend/pregnancy-state.js` in dependency order before their consumers in `frontend/index.html`.

## Phase 2: Foundational

**Goal:** Initialize shared state once and make it available to existing views without changing the app's routes or API contracts.

**Independent test criteria:** On startup, existing routes still render; shared state can be read by the dashboard and secondary views; missing or malformed saved data does not prevent preview use.

- [ ] T004 Initialize validated profile, pregnancy, language, settings, checklist, records, family, and learning state through `frontend/storage.js` in `frontend/app.js`.
- [ ] T005 Connect the existing pregnancy card to the shared snapshot and publish a single week-change notification from `frontend/pregnancy-card.js`.

## Phase 3: User Story 1 - Preview or create a profile without login

**Goal:** Let a person enter MatriSathi in preview mode or create a local demo profile without authentication.

**Independent test criteria:** A new visitor can choose preview or save a profile and reach the dashboard without signing in; profile information remains local.

- [ ] T006 [US1] Add accessible preview and no-login profile setup controls to `frontend/index.html` and `frontend/app.js`.
- [ ] T007 [US1] Save and restore the demo profile through `frontend/storage.js`, and render the selected profile state in `frontend/views.js`.
- [ ] T008 [US1] Add profile form labels, validation/status text, and responsive styling in `frontend/i18n.js` and `frontend/styles.css`.

## Phase 4: User Story 2 - Enter and update an estimated due date

**Goal:** Make the due date editable and prevent invalid changes from replacing a valid saved date.

**Independent test criteria:** A valid date saves and reloads; an invalid or empty date shows an accessible correction message and leaves the previous saved date unchanged.

- [ ] T009 [US2] Connect the due-date form to the shared validation and persistence APIs in `frontend/pregnancy-card.js`.
- [ ] T010 [US2] Add translated due-date labels and validation messages in `frontend/i18n.js`, with visible error and focus states in `frontend/styles.css`.

## Phase 5: User Story 3 - See pregnancy week, trimester, progress, and baby-size guidance

**Goal:** Show accurate pregnancy progress and clear early-pregnancy or post-due-date states.

**Independent test criteria:** The displayed week never falls below zero or above 40; trimester, progress, and baby-size guidance update when the due date changes.

- [ ] T011 [US3] Render completed week, trimester, and progress from the shared snapshot in `frontend/pregnancy-card.js`.
- [ ] T012 [US3] Provide week-specific baby-size labels and localized early/post-due-date messaging in `frontend/content.js` and `frontend/i18n.js`.

## Phase 6: User Story 4 - Keep week information consistent across views

**Goal:** Use one pregnancy snapshot across the dashboard and all week-aware secondary views.

**Independent test criteria:** After changing the due date or opening the app on a later day, the dashboard, journey, weekly guide, checklist, learning content, and milestones show the same week and trimester.

- [ ] T013 [US4] Remove duplicate week calculations and update week-aware rendering to consume the shared state in `frontend/app.js` and `frontend/views.js`.
- [ ] T014 [US4] Refresh the active view and all dashboard week labels when the shared week-change notification fires in `frontend/app.js`.

## Phase 7: User Story 5 - Read weekly care guidance

**Goal:** Present week-appropriate educational care, nutrition, movement, and antenatal-care guidance without implying individualized medical advice.

**Independent test criteria:** The weekly guide follows the shared pregnancy week, includes a health-worker disclaimer, and renders usable empty or fallback content if guidance is unavailable.

- [ ] T015 [US5] Add clearly identified English and Nepali weekly guidance content in `frontend/content.js`.
- [ ] T016 [US5] Render the current week's guidance and the health-worker disclaimer in `frontend/views.js` and `frontend/i18n.js`.

## Phase 8: User Story 6 - Manage a daily checklist

**Goal:** Track daily task completion by local calendar date and retain it across reloads.

**Independent test criteria:** Checking and unchecking a task updates its completion state and summary; a new day does not inherit yesterday's completion.

- [ ] T017 [US6] Store checklist completion by local date and migrate the existing flat completion map without losing its values in `frontend/storage.js`.
- [ ] T018 [US6] Connect checklist controls, custom tasks, completion summaries, and empty states to date-scoped storage in `frontend/app.js` and `frontend/views.js`.

## Phase 9: User Story 7 - View health records and appointments

**Goal:** Organize local demo appointments and care summaries while distinguishing sample data from real records.

**Independent test criteria:** Existing demo entries appear in a clear chronological or upcoming-first order; no-record state is understandable and does not imply care was received.

- [ ] T019 [US7] Define clearly labeled demo appointment and record entries in `frontend/content.js`.
- [ ] T020 [US7] Render records, appointments, and their empty state in `frontend/views.js`, labeling all seeded information as demo data.
- [ ] T021 [US7] Add local create/view interactions for appointments and records through `frontend/app.js` and `frontend/storage.js`.

## Phase 10: User Story 8 - Share selected reminders and support tasks with family

**Goal:** Allow granular, reversible sharing while keeping profile and health-record information private by default.

**Independent test criteria:** Only selected items show as shared; the recipient or sharing state is clear; withdrawing a selection updates the family view and persisted preference.

- [ ] T022 [US8] Add family task selection, recipient/status display, and accessible share controls in `frontend/views.js`.
- [ ] T023 [US8] Persist and revoke only explicit family-sharing selections in `frontend/app.js` and `frontend/storage.js`, defaulting all personal and health details to private.

## Phase 11: User Story 9 - Find nearby health services

**Goal:** Keep a useful services directory available even without location permission, live location data, or map tiles.

**Independent test criteria:** Users can identify and search service types without granting location access; approximate or demo listings are labeled and no unverified emergency contact details are presented.

- [ ] T024 [US9] Provide categorized, appropriately sourced service entries in `frontend/content.js`.
- [ ] T025 [US9] Render service type/search controls and location/contact details in `frontend/views.js`, with explicit demo/approximate labels and a no-location fallback.
- [ ] T026 [US9] Add translated service-directory labels and fallback messages in `frontend/i18n.js`.

## Phase 12: User Story 10 - Read education and FAQs in English or Nepali

**Goal:** Switch supported interface and learning content languages without resetting user data.

**Independent test criteria:** Switching languages updates supported labels, guidance, and FAQs; reloading preserves the selected language and existing profile/checklist state.

- [ ] T027 [US10] Add or complete English and Nepali educational content and FAQ entries in `frontend/content.js`.
- [ ] T028 [US10] Translate new interface, empty, validation, and status strings in `frontend/i18n.js`.
- [ ] T029 [US10] Persist language selection and update rendered content without resetting profile, route, or checklist state in `frontend/app.js`.

## Phase 13: User Story 11 - Ask Aama AI safely

**Goal:** Provide general educational AI responses with urgent-care escalation and a clear failure path.

**Independent test criteria:** Normal responses state their limits; danger-sign responses prioritize contacting a qualified health worker or emergency services; API failure is explicit and does not block the rest of the app.

- [ ] T030 [US11] Review and narrowly update emergency-symptom handling and explicit API errors, if needed, while preserving the existing `/api/chat` contract in `backend/server.mjs`.
- [ ] T031 [US11] Render urgent-care guidance, AI loading/error states, and the unavailable-service fallback in `frontend/app.js` and `frontend/i18n.js`.

## Phase 14: User Story 12 - Restore saved demo data on this device

**Goal:** Restore supported local preferences safely and provide a usable path when stored values are malformed or storage is unavailable.

**Independent test criteria:** Valid profile, due date, language, settings, checklist, and preference values survive reload; malformed or inaccessible storage does not appear as valid medical information or prevent preview use.

- [ ] T032 [US12] Complete startup hydration, storage-failure reporting, and a user-visible recovery/preview path in `frontend/storage.js` and `frontend/app.js`.
- [ ] T033 [US12] Confirm saved profile, language, settings, checklist, family, records, and learning preferences use only their documented local keys in `frontend/app.js` and `frontend/storage.js`.

## Phase 15: User Story 13 - Use the app accessibly on mobile and desktop

**Goal:** Preserve existing navigation and visual style while supporting keyboard, screen-reader, touch, and responsive use.

**Independent test criteria:** Forms, dialogs, language controls, checklist, and navigation have accessible names and visible focus; status changes are announced; dialogs return focus; narrow layouts do not introduce unintended horizontal scrolling.

- [ ] T034 [US13] Add or refine semantic labels, keyboard interactions, status announcements, and dialog/mobile-menu focus handling in `frontend/index.html`, `frontend/app.js`, and `frontend/views.js`.
- [ ] T035 [US13] Refine responsive reflow, focus indicators, contrast, and touch target sizing in `frontend/styles.css`.

## Phase 16: Polish and cross-cutting verification

**Goal:** Verify the feature against the acceptance criteria and preserve existing app behavior.

- [ ] T036 Smoke-check preview/profile, due-date boundaries, shared week updates, checklist day rollover, local persistence, family privacy, services without location, language switching, and AI error/escalation flows in the browser using `frontend/index.html`.
- [ ] T037 Verify existing dashboard routes, deep links, `GET /api/health`, `POST /api/chat`, and optional voice fallback remain compatible in `backend/server.mjs` and `frontend/`.
- [ ] T038 Review visible educational and service demo content for Nepal localization, health-worker disclaimers, and clear sample/approximate labeling in `frontend/content.js`, `frontend/views.js`, and `frontend/i18n.js`.

## Dependencies

- Setup tasks T001 and T002 are independent; T003 depends on both.
- Foundational tasks T004 and T005 depend on T001-T003.
- User Story 1 depends on T001-T005. User Stories 2-5 build on the profile and shared pregnancy state; US4 depends on US2 and US3, and US5 depends on US4.
- US6, US7, and US8 depend on T001 and T004 for safe local persistence. US9 and US10 depend on T003; US10 also depends on the localization behavior established in earlier story work.
- US11 depends on the existing backend API and T003. US12 consolidates persistence behavior across US1-US11. US13 applies to the interfaces delivered by US1-US12.
- Phase 16 depends on the implementation phases being complete.

## Parallel execution examples

- Setup: T001 and T002 can be implemented in parallel because they define separate modules; T003 follows both.
- US7: T019 and initial view rendering in T020 can proceed in parallel if they use the planned demo-data shape; T021 integrates persistence after both.
- US9: T024 and the translated labels in T026 can proceed in parallel; T025 integrates the directory content and fallback behavior.

## Implementation strategy

1. Complete setup and foundational state integration before building feature views.
2. Deliver profile and pregnancy progress first, then week-aware guidance and checklist.
3. Add records, family sharing, services, localization, and AI safety as independently verifiable increments.
4. Finish persistence recovery and accessibility before the cross-cutting browser/API regression checks.

**Suggested MVP scope:** Setup, foundational state, and User Stories 1-6: no-login profile, due-date and progress state, synchronized weekly guidance, and a date-scoped checklist.
