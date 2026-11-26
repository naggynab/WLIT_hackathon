# Nepali Pregnancy Companion — Implementation Plan

## 1. Project goal

Build a Nepali pregnancy companion that supports a woman throughout her nine-month journey and connects her with family members, nearby health services, health workers, and emergency support.

The product should make important care information easier to understand and act on through a dashboard, Nepali text and voice interaction, reminders, WhatsApp/SMS communication, and climate-risk alerts.

## 2. Three-day delivery target

The three-day target is a working MVP with one complete user journey:

1. A user creates a pregnancy profile.
2. The app calculates her pregnancy week and trimester.
3. The dashboard shows weekly guidance, tasks, medical-record summary, and nearby care.
4. She asks a question in Nepali by text or voice.
5. The assistant responds safely in Nepali and can speak the answer aloud.
6. The app sends a reminder through WhatsApp or SMS.
7. A simulated climate-risk alert is shown and can notify selected family members.

## 3. Team division

### Member 1 — Frontend, UX, and accessibility

- Set up the application layout and navigation.
- Build onboarding and pregnancy-profile screens.
- Build the dashboard and nine-month journey view.
- Build medical-record timeline and summary display.
- Build food, exercise, video, and government-support pages.
- Build the family hub, emergency buttons, and health-service directory UI.
- Ensure the interface works well in Nepali, on mobile screens, and with large touch targets.

### Member 2 — Backend, database, reminders, and location

- Set up Supabase authentication and PostgreSQL.
- Create tables for profiles, records, family members, services, alerts, content, and messages.
- Build APIs for medical records, pregnancy calculations, nearby facilities, and alerts.
- Build reminder scheduling and delivery-status tracking.
- Connect WhatsApp webhooks and SMS provider webhooks.
- Seed verified demo data for hospitals, health posts, videos, and climate alerts.

### Member 3 — AI, Nepali language, and voice

- Prepare a clinician-reviewed Nepali pregnancy FAQ/content set.
- Build the chatbot prompt and retrieval flow.
- Add emergency and escalation rules for danger signs.
- Add speech-to-text for Nepali voice input.
- Integrate ElevenLabs for Nepali text-to-speech.
- Build record summarization using structured data first, with AI used only for readable summaries.
- Test Nepali spelling, pronunciation, and common user questions.

### Shared responsibility

- Review health content for safety and clarity.
- Test the complete user journey.
- Prepare the final presentation and demo.

## 4. Day-by-day schedule

### Day 1 — Foundation and core screens

- Confirm the MVP scope and user journey.
- Create the repository structure and environment variables.
- Set up Supabase and the initial database schema.
- Build the shared design system using the project colors.
- Create onboarding, dashboard, journey, and navigation screens.
- Prepare the first Nepali FAQ and health-content dataset.
- Create sample health-service, family-contact, message, and alert records.

### Day 2 — Feature implementation and integrations

- Complete pregnancy-week and trimester calculations.
- Add medical-record creation and timeline display.
- Add family hub and emergency-contact flow.
- Add health-service directory and call/directions actions.
- Connect the chatbot to the frontend.
- Add voice input and ElevenLabs audio output.
- Add reminder scheduling.
- Connect WhatsApp and SMS provider APIs or their approved test environments.
- Add a simulated flood/climate alert.

### Day 3 — Integration, safety, testing, and demo

- Connect all screens to real database data.
- Test Nepali text, voice, message delivery, and reply handling.
- Test emergency-response flows and escalation messages.
- Add loading, empty, error, and offline states.
- Check mobile responsiveness and accessibility.
- Use only safe demo data; do not use real medical records.
- Prepare the final demo scenario and presentation.

## 5. Recommended technology stack

- Frontend: Next.js with React
- Styling: Tailwind CSS
- Backend/database: Supabase Auth, PostgreSQL, Edge Functions, and Storage
- AI chatbot: OpenAI or Gemini API with curated Nepali content
- Speech-to-text: Whisper, Google Speech-to-Text, or a tested Nepali-capable provider
- Text-to-speech: ElevenLabs
- WhatsApp: Meta WhatsApp Business Cloud API
- SMS: Nepal-compatible SMS gateway; Twilio may be used for outbound testing if suitable
- Scheduling: Supabase Cron or a server-side scheduled job
- Maps: OpenStreetMap/Google Maps links
- Deployment: Vercel

Keep all provider keys on the server. The frontend must never contain WhatsApp, SMS, or AI secret keys.

## 6. Messaging plan

### Outbound messages

- Daily water or wellbeing check-in.
- Prescribed supplement reminder.
- Health-checkup and appointment reminders.
- Weekly pregnancy guidance.
- Trimester-specific food, exercise, and video suggestions.
- Weather, flood, heat, or evacuation alerts.
- Family notification when the user explicitly enables it.

### Inbound messages

- The user can reply to a check-in with simple options such as `1` or `2`.
- The user can ask a pregnancy question in Nepali.
- The user can send a voice message through supported channels.
- Keywords such as `HELP`, `HOSPITAL`, and `CHECKUP` can trigger quick actions.

### Messaging safeguards

- Obtain clear opt-in consent for each channel.
- Store consent time, channel, and message preference.
- Support pause, unsubscribe, and preference changes.
- Do not put detailed medical information in an SMS preview.
- Use generic notification text and direct the user to the secure app when appropriate.
- Escalate emergency symptoms to a health service or emergency contact, not to an AI-only answer.

## 7. Safety and privacy requirements

- Clearly state that the AI provides information and does not replace a doctor.
- Use clinician-reviewed content for nutrition, exercise, warning signs, and medicines.
- Show emergency guidance for severe symptoms.
- Obtain consent before sharing information with family members or health workers.
- Allow the mother to choose what each family member can see.
- Use test data for the hackathon demonstration.
- Keep API keys and personal health data out of client-side logs.
- Provide a way to delete or export user data in the future version.

## 8. Demo scenario

Show a woman in her second trimester who receives a Nepali WhatsApp check-in. She replies that she has not completed her checkup, asks the AI a question by voice, receives an audio answer, sees a nearby health post, and receives a simulated flood-risk warning. She then shares an evacuation reminder with a selected family member.

## 9. Scope boundaries

The hackathon version should use seeded or simulated climate alerts and a small verified directory. Live nationwide flood prediction, production SMS sender registration, nationwide hospital availability, and clinical diagnosis are future expansion work.
