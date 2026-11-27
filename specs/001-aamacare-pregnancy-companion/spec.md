# MatriSathi Pregnancy Companion Specification

## Overview

MatriSathi is a warm, Nepali-first pregnancy companion for mothers and families in Nepal. The MVP lets a person preview or create a pregnancy profile without signing in, follow week-specific pregnancy guidance, manage care tasks and records, find nearby services, and ask MatriSathi AI general questions in English or Nepali.

The app is informational and organizational. It does not diagnose, prescribe, or replace a qualified health worker. Danger signs must prompt clear direction to qualified health workers or emergency services.

## User Stories

- As an expectant mother, I want to preview MatriSathi or create a pregnancy profile without logging in, so that I can use the app without an account.
- As an expectant mother, I want to enter and update my estimated due date, so that my pregnancy information stays current.
- As an expectant mother, I want to see my current pregnancy week, trimester, progress toward 40 weeks, and baby-size guidance, so that I can understand where I am in my pregnancy.
- As an expectant mother, I want the current week reflected consistently across the dashboard, journey, weekly guide, checklist, learning content, and milestones, so that the app gives me relevant, coherent guidance.
- As an expectant mother, I want weekly care, nutrition, movement, and antenatal-care guidance, so that I can prepare questions and discuss care with a health worker.
- As an expectant mother, I want to manage a daily checklist, so that I can keep track of reminders and care tasks.
- As an expectant mother, I want to view upcoming appointments, health records, and care summaries, so that I can keep my care information organized.
- As an expectant mother, I want to share selected reminders and support tasks with family, so that I can receive practical help while controlling what I share.
- As an expectant mother or family member, I want to find nearby health posts, hospitals, pharmacies, and emergency services, so that I can identify where to seek care.
- As an expectant mother or family member, I want to read pregnancy education and FAQs in English or Nepali, so that I can use the language I understand best.
- As an expectant mother, I want to ask Aama AI general pregnancy questions in English or Nepali, so that I can find understandable educational information while knowing when to contact a health worker.
- As an expectant mother, I want my demo profile, due date, language, settings, checklist, and preferences saved on this device, so that they are available when I return.
- As an expectant mother or family member, I want the app to work with accessible controls on mobile and desktop, so that I can use it across devices and abilities.

## Acceptance Criteria

### Pregnancy profile and due-date setup

Given a person opens MatriSathi without a saved profile
When they choose to preview or create a profile and enter a valid estimated due date
Then they can continue to the dashboard without login and see the profile's pregnancy information.

Given the due-date field is empty or contains an invalid date
When the person tries to save the profile
Then the app explains what needs correction and does not save invalid pregnancy dates.

### Automatic week and trimester calculation

Given a valid estimated due date
When MatriSathi calculates pregnancy progress
Then it derives gestational age from the standard 280-day pregnancy duration, displays the completed week and trimester, and shows progress toward week 40 and week-appropriate baby-size guidance.

Given the due date is more than 280 days away or has passed
When the app calculates pregnancy progress
Then it handles the date boundary without displaying a negative week or a week above 40, and presents an appropriate early-pregnancy or post-due-date state rather than misleading progress.

### Updating the due date

Given a profile has a saved estimated due date
When the person changes it to another valid date and saves
Then MatriSathi recalculates the pregnancy information and persists the new date.

Given the replacement date is invalid
When the person attempts to save it
Then the existing saved date remains unchanged and an accessible validation message is shown.

### Synchronizing week information across the app

Given the due date changes or a new day changes the calculated week
When the pregnancy information is refreshed
Then the dashboard, pregnancy journey, weekly guide, checklist, learning content, and milestone cards all use the same current week and trimester.

Given the app opens with a saved due date
When its views render
Then they derive week information from the shared pregnancy state rather than maintaining conflicting per-view week values.

### Weekly guidance and checklist

Given a current pregnancy week is available
When the person opens the weekly guide
Then they can view week-appropriate care reminders, nutrition and movement suggestions, and antenatal-care information, with a clear reminder to consult a qualified health worker for individual advice.

Given the person checks or unchecks a daily checklist item
When the change is made
Then the completion state and accessible completion summary update, and the task remains saved for that day.

Given the date changes to a new day
When the checklist is opened
Then daily completion state is shown for the correct date rather than incorrectly carrying forward as today's progress.

### Health records and appointments

Given demo health records or appointments exist
When the person opens the health records view
Then they can see appointment timing and care summaries in a clear chronological or upcoming-first presentation.

Given no records or appointments exist
When the person opens the view
Then MatriSathi shows an understandable empty state and does not imply that care has been received or scheduled.

### Family hub and sharing controls

Given the person opens the family hub
When they choose a reminder or support task to share
Then only the selected item is shown as shared, with its recipient or sharing state made clear.

Given the person has not selected an item for sharing
When family tasks or reminders are displayed
Then personal profile and health-record details are not exposed by default.

Given the person changes or withdraws a sharing selection
When they save the change
Then the local sharing preference is updated and visible in the family hub.

### Nearby health services

Given the person opens health services
When nearby service entries are available
Then they can identify health posts, hospitals, pharmacies, and emergency services by type and view available contact or location details.

Given location permission is not granted or live location data is unavailable
When the person searches for care
Then the app does not block access to the directory and explains when displayed locations or distance are demo or approximate information.

### English/Nepali language switching

Given the app is displayed in English or Nepali
When the person uses the language toggle
Then supported interface labels, guidance, and FAQs change to the selected language without resetting profile or checklist data.

Given the person selects a language
When they reload or revisit the app
Then the selected language remains active on that device.

### Aama AI safety behavior

Given the person asks a general pregnancy question in English or Nepali
When Aama AI responds
Then it provides general educational information, avoids diagnosis and medication instructions, and states that it does not replace a qualified health worker.

Given the question mentions a possible danger sign
When Aama AI responds
Then it clearly advises prompt contact with a qualified health worker or emergency services, prioritizes urgent care over general information, and does not delay escalation with follow-up questions.

Given the AI service is unavailable or returns an error
When the person submits a question
Then the app explains that Aama AI is unavailable and continues to show appropriate health-worker and emergency-care guidance.

### localStorage persistence

Given the person saves profile data, due date, language, settings, checklist items, or preferences
When they reload the app in the same browser
Then those values are restored from localStorage without a login or database.

Given localStorage contains missing, malformed, or incompatible data
When MatriSathi starts
Then it handles the invalid stored value safely, provides a usable preview or recovery path, and does not present corrupted data as valid medical information.

### Responsive and accessible interactions

Given the app is opened on a mobile, tablet, or desktop viewport
When the person navigates its existing dashboard views
Then the layout remains usable without unintended horizontal scrolling and retains the current navigation and visual style.

Given the person uses a keyboard, screen reader, or touch input
When they navigate forms, dialogs, language controls, checklist items, and navigation
Then controls have accessible names, visible focus, appropriate semantic roles and labels, and usable touch targets; validation and status changes are announced.

Given a dialog or mobile navigation menu is opened
When the person interacts with it or closes it
Then focus is managed accessibly and the page remains operable.

## Functional Requirements

- The frontend uses the existing project structure, MatriSathi visual style, responsive layout, and dashboard navigation. Use the existing plain HTML, CSS, and vanilla JavaScript approach; do not introduce React solely for this MVP.
- No authentication system or database is required. Profile and demo care data are local to the browser.
- A single shared pregnancy state is the source of truth for the due date and calculated week across all relevant views.
- Educational content must be clear, localized for Nepal, and reviewed by qualified health professionals before production use. Demo content must not be presented as a personalized medical instruction.
- Health-service listings must indicate when data is sample, approximate, or unverified. Do not invent emergency contact details.
- The existing Express backend may be used only for optional AI and voice integrations. The app must remain usable for profile, pregnancy guidance, checklist, and local demo data if those integrations are unavailable.
- Provider credentials must remain server-side and must not be included in frontend code or committed files.

## Constraints and Out of Scope

- No login, database, production medical-record storage, or server-side profile persistence in the MVP.
- No diagnosis, prescription, or replacement of professional medical advice.
- No implication that demo appointment, health-record, family, or health-service data is real.
- No live emergency dispatch or guarantee of service availability.
- AI and voice features are optional integrations and are not prerequisites for using the core app.
