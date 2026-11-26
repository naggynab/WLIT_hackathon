# Data Model: Campus Event & Club Hub

## Event

Represents an upcoming campus activity displayed in the event list.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `id` | String | Yes | Unique within the event list; generated for submitted events. |
| `title` | String | Yes | Must contain non-whitespace text. |
| `description` | String | Yes | Must contain non-whitespace text. |
| `category` | String | Yes | One of `Workshop`, `Social`, or `Sports`. |
| `dateTime` | Local date-time string | Yes | Must parse as a valid local date and time later than the current time. |
| `location` | String | Yes | Must contain non-whitespace text. |

## State and Persistence

- `app.js` defines a small sample-event array with at least one future event per category. Sample dates are generated relative to the current date so they remain upcoming.
- The complete event list is serialized as JSON in localStorage under `campusEventHub.events.v1`.
- On startup, use a valid saved event list when present; otherwise use the sample-event array and save the initial list when storage is available.
- A valid submission is added to the event list and saved. The page then renders it like any other event.
- Event records are local to the browser profile and are not synchronized across devices or browsers.
- If saved data cannot be read or validated, use the in-page sample data and clearly notify the student that saved events could not be restored. Invalid saved records must not be presented as successfully restored events.
- If saving fails, keep the current in-memory event list usable for the page session and clearly notify the student that the submission will not persist.
- The selected category is transient UI state and does not need to be persisted.

## Derived Behavior

- Upcoming events are ordered by `dateTime`, earliest first.
- The visible list contains only upcoming events and is then narrowed by the selected category, if any.
- A successful submission is included in the currently selected category when it matches; otherwise, the list remains filtered and the student receives confirmation.

