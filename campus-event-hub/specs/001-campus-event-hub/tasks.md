# Tasks: Campus Event & Club Hub

**Input**: Design documents from `specs/001-campus-event-hub/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated test tooling or test tasks are required for this dependency-free static MVP. Validate manually with `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with another task touching different files and having no incomplete dependencies.
- **[Story]**: Maps a task to its user story.
- All implementation tasks name their application file paths.

## Phase 1: Setup

**Purpose**: Project initialization.

No separate setup task is required; this is a dependency-free static web app and its requested application files are created in the first user-story task.

---

## Phase 2: Foundational

**Purpose**: Blocking shared infrastructure.

No foundational task is required; the app has no backend, database, authentication, package dependencies, or build step.

---

## Phase 3: User Story 1 - Browse Upcoming Events (Priority: P1) - MVP

**Goal**: Show campus events as readable cards so students can browse upcoming activities.

**Independent Test**: Open `index.html` in a browser and confirm three event cards are visible with event details and basic styling.

### Implementation for User Story 1

- [x] T001 [US1] Create the basic static page in `index.html` and card layout in `styles.css` with exactly three placeholder event cards; do not add JavaScript behavior.
- [ ] T002 [P] [US1] Add responsive card-grid and narrow-screen layout rules in `styles.css`.
- [ ] T003 [US1] Add a sample event array with at least one event per category using dates relative to the current date, render it in `app.js`, then connect `app.js` from `index.html`.

**Checkpoint**: The static cards are independently viewable after T001; the complete browse story is data-driven after T002-T003.

---

## Phase 4: User Story 2 - Filter Events by Category (Priority: P2)

**Goal**: Let students filter upcoming cards by Workshop, Social, or Sports.

**Independent Test**: Select each category and confirm only matching upcoming event cards appear; select All to restore the full list.

### Implementation for User Story 2

- [ ] T004 [US2] Add All and category filter controls plus a no-results message to `index.html`, with matching control and message styles in `styles.css`.
- [ ] T005 [US2] Implement category filtering and empty-result behavior in `app.js`.

**Checkpoint**: All category controls filter the current upcoming event list and All restores it.

---

## Phase 5: User Story 3 - Submit a New Event (Priority: P2)

**Goal**: Let students submit events without login and keep valid submissions in the current browser.

**Independent Test**: Submit a valid future event and reload in the same browser to verify it remains visible; verify invalid submissions are rejected with actionable feedback.

### Implementation for User Story 3

- [ ] T006 [US3] Add the required event submission form and field-level feedback containers to `index.html`, with responsive form styles in `styles.css`.
- [ ] T007 [US3] Validate and submit events, update the displayed list, and persist the list to localStorage in `app.js`; enforce the `data-model.md` definitions for `Event.id`, `Event.title`, `Event.description`, `Event.category`, `Event.dateTime`, and `Event.location`.

**Checkpoint**: Valid submissions persist in the current browser; invalid entries are not added and provide correction guidance.

---

## Phase 6: Polish and Cross-Cutting Validation

**Purpose**: Verify the finished user flows and responsive presentation.

- [ ] T008 Run the scenarios in `quickstart.md` and correct verified issues in `index.html`, `styles.css`, or `app.js`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup and Foundational phases have no implementation tasks for this static app.
- User Story 1 can begin immediately.
- User Story 2 depends on the event list from User Story 1.
- User Story 3 depends on the User Story 1 event list; it can be implemented without User Story 2 and integrated with filtering afterward.
- Polish validation follows the stories being validated.

### User Story Dependencies

- **User Story 1 (P1)**: No prerequisite story; T001 is the initial static layout task.
- **User Story 2 (P2)**: Depends on the event list established by T003.
- **User Story 3 (P2)**: Depends on T003 for the shared event list; it does not depend on category filtering to be independently implemented or tested.

### Within Each User Story

- Complete tasks in listed order when they touch the same files or depend on prior markup/state.
- T002 and T003 can run in parallel after T001 because they modify different files.
- The current request is limited to T001; all other tasks remain out of scope until separately requested.

## Parallel Opportunities

- After T001, T002 (`styles.css`) and T003 (`app.js` plus the script link in `index.html`) can run in parallel because their file changes do not overlap.
- T004 and T005 are sequential because the filter behavior needs the controls in `index.html`.
- T006 and T007 are sequential because submission behavior needs the form in `index.html`.

### User Story 1

After T001 is complete, T002 and T003 can run in parallel: one updates `styles.css`, and the other adds `app.js` and its script link in `index.html`.

### User Story 2

No parallel pair; T004 adds the controls and T005 implements their behavior.

### User Story 3

No parallel pair; T006 adds the form and T007 implements submission and persistence.

## Implementation Strategy

1. Deliver the static three-card layout in T001 as the first independently viewable increment.
2. Complete T002-T003 for the full P1 browse experience.
3. Add category filtering in T004-T005.
4. Add event submission and browser persistence in T006-T007.
5. Run quickstart validation in T008.

