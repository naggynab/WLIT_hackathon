# Nepali Pregnancy Companion — Final Features

## Product purpose

The app supports pregnant women in Nepal from early pregnancy through delivery and the postpartum period. It gives simple, localized information, helps families participate in care, connects users to health services, and provides reminders and emergency guidance through the channels they already use.

## 1. Pregnancy journey

- Nine-month pregnancy journey from week 1 to week 40.
- Last-menstrual-period and expected-delivery-date entry.
- Automatic pregnancy week and trimester calculation.
- Weekly information about mother and baby changes.
- Weekly checklist: “What should I do this week?”
- Trimester-specific checkup, nutrition, exercise, and birth-preparation guidance.
- Danger-sign education.
- Birth-preparation checklist.
- Postpartum and newborn-care continuation after delivery.

## 2. Personalized dashboard

- Current pregnancy week and trimester.
- Expected delivery date.
- Next appointment.
- Pending reminders and completed tasks.
- Recent medical-record summary.
- Current food, exercise, video, and health guidance.
- Nearby health-service shortcut.
- Emergency-contact shortcut.
- WhatsApp/SMS communication status.
- Climate-risk banner when an alert affects the user's selected location.

## 3. Medical records and summarization

- Health-post and hospital visit records.
- Blood pressure, weight, symptoms, and test records.
- Ultrasound and document notes.
- Medicines and supplements prescribed by a health professional.
- Doctor or health-worker recommendations.
- Next-appointment record.
- Chronological pregnancy timeline.
- Simple dashboard summary of recent records.
- Future option to export records as a PDF or share selected records with a health worker.

## 4. Nepali AI chatbot

- Nepali and English text chat.
- Questions about pregnancy, food, exercise, checkups, warning signs, and preparation for delivery.
- Guidance based on the user's trimester and saved preferences.
- Answers grounded in curated, trusted pregnancy content.
- Quick commands such as `HELP`, `HOSPITAL`, and `CHECKUP`.
- Links to relevant videos and health-service contacts.
- Clear disclaimer that the chatbot is not a replacement for a doctor.

### Chatbot safety levels

1. **General guidance:** provide educational information.
2. **Health-worker follow-up:** recommend contacting a health worker soon.
3. **Emergency:** display urgent instructions, emergency contacts, and nearby hospitals.

The chatbot must not diagnose conditions or give unsafe medication instructions.

## 5. Voice assistant

- Nepali voice input for users who are not comfortable typing.
- Speech-to-text conversion.
- Audio response using ElevenLabs Nepali text-to-speech.
- Replay, pause, and slower playback controls.
- Large microphone and speaker controls.
- Voice access to the chatbot, reminders, and selected health content.

## 6. Food, exercise, and health education

- Local-food recommendations by trimester.
- Affordable food suggestions using locally available vegetables, grains, pulses, fruit, eggs, and dairy where appropriate.
- Hydration guidance.
- Safe pregnancy exercises.
- Rest and sleep guidance.
- Foods and activities to avoid, based on reviewed health content.
- Ministry of Health video library.
- Videos grouped by trimester and topic.
- Nepali audio or text alternatives for important videos.
- Low-data or cached content for users with limited connectivity.

All medical, nutrition, and exercise content must be reviewed by a qualified health professional before production release.

## 7. Family hub

- Invite trusted family members or neighbours.
- Shared pregnancy-support checklist.
- Family reminders for appointments and preparation tasks.
- “Request help” action for transport or assistance.
- Selected medical or appointment information shared with permission.
- Emergency contact list.
- Role-based access for mother, partner, family member, neighbour, or health worker.
- Mother-controlled sharing and privacy settings.

## 8. Nearby health services

- Directory of health posts, hospitals, clinics, pharmacies, and emergency facilities.
- Name, address, phone, opening hours, and available maternity services.
- Distance or map directions.
- One-tap phone call.
- Ambulance or transport information where available.
- Filter by maternity care, emergency care, laboratory, pharmacy, or health post.
- Small verified demo dataset for the hackathon.

## 9. Reminders and check-ins

- Drink-water reminder.
- Prescribed supplement reminder.
- Health-checkup reminder.
- Test or scan reminder.
- Appointment reminder.
- Weekly pregnancy-content reminder.
- Video suggestion reminder.
- Emergency-bag and birth-preparation reminder.
- Check-in questions such as:
  - “Did you drink water?”
  - “Did you attend your health checkup?”
  - “Do you need help arranging transport?”
- User-controlled reminder time, frequency, and pause option.

## 10. WhatsApp integration

- Opt-in during registration.
- Send Nepali pregnancy reminders.
- Send trimester information and video links.
- Send appointment and checkup reminders.
- Send climate and evacuation alerts.
- Receive simple replies such as `1`, `2`, `HELP`, or `HOSPITAL`.
- Receive questions and route them to the AI chatbot.
- Receive voice messages where supported.
- Send selected family notifications with consent.
- Track sent, delivered, read, and failed statuses.
- Support approved WhatsApp message templates for proactive notifications.

## 11. SMS integration

- Outbound SMS fallback for users without WhatsApp or internet.
- Appointment reminders.
- Checkup reminders.
- Health-post phone numbers and directions.
- Emergency and evacuation messages.
- Links to the app or selected health videos.
- Simple check-in questions where the selected SMS provider supports replies.
- STOP/pause support and communication preferences.
- Delivery-status logging.

For Nepal, test the selected provider carefully because SMS sender IDs, delivery, and two-way reply capability depend on the provider and local network support.

## 12. Climate and emergency support

- Flood-risk warning by selected location.
- Extreme heat and weather guidance.
- Air-quality warning where data is available.
- Yellow, orange, and red alert levels.
- Early evacuation message.
- Nearby health facility and safe-location actions.
- Notify selected family members with permission.
- Emergency call button.
- Simulated alerts for the hackathon demo.

## 13. Government support information

- Health-post visit guidance.
- Antenatal-care schedule information.
- Safe-delivery information.
- Maternity transport or allowance information.
- Required documents and application guidance.
- Contact information for asking about local eligibility.
- Source and last-reviewed date for every government-support entry.

Do not hardcode allowance amounts without checking the current official policy.

## 14. Accessibility and inclusion

- Nepali-first interface.
- English language option.
- Large text and touch targets.
- Voice interaction.
- Simple language and icons.
- High-contrast text.
- Low-data mode.
- Cached educational content.
- Clear error and loading messages.
- Minimal typing requirement.

## 15. Future expansion

- Health-worker/FCHV dashboard.
- Live government or weather-based flood feeds.
- Ambulance dispatch integration.
- Local-language support beyond Nepali and English.
- Secure PDF or QR record sharing.
- Postpartum mental-health screening.
- Newborn vaccination and growth tracking.
- Anonymous feedback and content reporting.
- Production-grade health-data compliance and audits.
