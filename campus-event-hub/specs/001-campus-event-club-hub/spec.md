# Campus Event & Club Hub Specification

## Overview

Build a simple MVP web app where students can discover upcoming campus events and clubs. The first implementation is intentionally static: it establishes the visual layout with three placeholder event cards before behavior is added.

## User Stories

- As a student, I want to see upcoming campus events in cards so that I can quickly decide what to attend.
- As a student, I want to filter events by Workshop, Social, or Sports so that I can find relevant activities.
- As a student, I want to submit a new event so that other students can discover it.

## Acceptance Criteria

### View upcoming events

Given the Campus Event & Club Hub is open
When the page loads
Then the student sees three event cards with a title, category, date, location, and short description.

### Filter by category

Given the page contains events from multiple categories
When the student selects Workshop, Social, or Sports
Then only matching events are shown.

### Submit a new event

Given the student opens the new-event form
When they provide the required event details and submit
Then the new event appears in the event list and remains available after refresh.

## Constraints

- No login or database is required for the MVP.
- Use plain HTML5, CSS3 with Flexbox/Grid, and vanilla ES6+ JavaScript only.
- Store mock data and submitted events in JavaScript/localStorage in later tasks.
- Task 1 is limited to the static HTML/CSS shell and three placeholder cards.
