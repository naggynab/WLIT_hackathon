# Research: Campus Event & Club Hub

## Scope and Unknowns

The feature and implementation constraints are specified. No external service, framework choice, or unresolved product decision requires additional research.

## Decisions

### Plain static web application

- **Decision**: Use semantic HTML5, CSS3 with Flexbox/Grid, and vanilla ES6+ JavaScript, separated into the three requested root files.
- **Rationale**: This directly satisfies the requested stack and keeps the MVP understandable and dependency-free.
- **Alternatives considered**: A framework, a build system, or a backend. All add complexity or violate the stated constraints without providing required MVP behavior.

### Event state and persistence

- **Decision**: Keep sample events in a JavaScript array. Use the `campusEventHub.events.v1` localStorage key for the current browser's event list, including submitted events.
- **Rationale**: This makes the sample list available immediately and keeps student submissions after reloads without a server or database.
- **Alternatives considered**: Page-session-only state, which loses submissions after reload; a database or remote service, which is explicitly out of scope.

### Storage failure behavior

- **Decision**: Validate data read from localStorage. If it is malformed or unavailable, use the sample array for the current page and display a clear non-blocking notice that changes may not persist. If a save fails, keep the current page usable and tell the student persistence failed.
- **Rationale**: Browser storage can be disabled, quota-limited, or contain invalid data; an explicit notice avoids implying that a submission was saved when it was not.
- **Alternatives considered**: Silently treating storage errors as success, which would mislead students; blocking all browsing when storage is unavailable, which is unnecessary for this MVP.

### Validation approach

- **Decision**: Verify the user flows manually in a modern browser using the scenarios in `quickstart.md`.
- **Rationale**: The application has no build step, dependencies, or existing test tooling, and its visible behavior can be checked directly.
- **Alternatives considered**: Adding a test runner or browser automation dependency, which is not justified for the requested three-file MVP.

