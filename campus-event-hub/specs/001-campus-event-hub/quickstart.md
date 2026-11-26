# Quickstart: Campus Event & Club Hub

## Prerequisites

- A modern desktop or mobile browser.
- A local static-file server for consistent localStorage behavior. No application dependencies or build step are required.

## Run Locally

1. From the project root, start a static server, for example with the Python launcher if installed:

   ```powershell
   py -m http.server 8000
   ```

2. Open `http://localhost:8000` in a browser.
3. Stop the server with `Ctrl+C` when finished.

The page can also be opened directly as `index.html`; browser storage behavior for `file:` URLs can vary.

## Validate the MVP

1. **Initial list**: Confirm event cards show title, description, category, date/time, and location, are ordered soonest first, and include at least one event in each category.
2. **Category filtering**: Select Workshop, Social, and Sports and confirm each view contains only matching events. Select All and confirm the full upcoming list returns.
3. **Successful submission**: Submit an event with all required fields and a future date. Confirm it appears as a card and is included in the matching category.
4. **Persistence**: Reload the page in the same browser and confirm the submitted event remains. Open the page in a separate browser profile and confirm the event is not shared there.
5. **Validation**: Try submitting with a required field blank and with a past date. Confirm neither event is added and the form identifies the problem.
6. **Empty result**: In the browser console, create a valid saved list containing only a future Workshop event, then reload and select Social:

   ```javascript
   const tomorrow = new Date(Date.now() + 86400000);
   tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
   localStorage.setItem('campusEventHub.events.v1', JSON.stringify([{
     id: 'workshop-test',
     title: 'Workshop fixture',
     description: 'Empty-state test',
     category: 'Workshop',
     dateTime: tomorrow.toISOString().slice(0, 16),
     location: 'Campus'
   }]));
   location.reload();
   ```

   Confirm a helpful no-matching-events message appears while filters and the form remain available.
7. **Invalid storage**: In the browser console, run `localStorage.setItem('campusEventHub.events.v1', '{invalid')` and reload. Confirm the page uses sample events and reports that saved data could not be restored.
8. **Responsive and keyboard use**: Check a narrow viewport and navigate filters and form controls with the keyboard.

To clear saved test data, run `localStorage.removeItem('campusEventHub.events.v1')` in the browser console and reload.

