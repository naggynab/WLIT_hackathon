# User Interface Contract

## Event Discovery

- The page shows upcoming events as cards with title, description, category, date and time, and location.
- Cards are ordered from soonest to latest.
- Category controls include `All`, `Workshop`, `Social`, and `Sports`.
- Selecting a category shows only matching upcoming events; `All` restores all upcoming events.
- An empty list or a category with no matching events shows a clear message without hiding the filter controls or submission form.
- The page is usable at mobile and desktop widths and can be operated with a keyboard.

## Event Submission

- The form has required title, description, category, date/time, and location fields.
- The category choices are limited to Workshop, Social, and Sports.
- Invalid or past event dates and missing required details prevent submission and produce actionable field-level feedback.
- A valid submission is confirmed and added to the current browser's event list; it remains available after reload when localStorage is available.
- When browser storage cannot be read or written, the interface explains that new submissions may not persist and remains usable for the current page session.
- No sign-in, account creation, or external service is part of the user flow.

