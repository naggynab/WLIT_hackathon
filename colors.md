# Nepali Pregnancy Companion — Color System

## 1. Core palette

The interface uses the three supplied pink and purple colors as its primary brand palette. White is used as the main background and contrast color. Dark neutral colors are used for readable text.

| Token | Color | Hex | Main use |
|---|---|---|---|
| Primary Pink | Pink | `#E149A0` | Primary buttons, active navigation, important highlights |
| Soft Pink | Pink | `#E774B9` | Secondary buttons, cards, progress indicators, hover states |
| Lavender Accent | Purple | `#DD7AD8` | Voice features, chatbot sections, tags, informational accents |
| White | White | `#FFFFFF` | Main background, button text on dark brand colors, cards |

## 2. Text colors

| Token | Color | Hex | Main use |
|---|---|---|---|
| Text Primary | Deep plum | `#2B1F2A` | Headings and important body text |
| Text Secondary | Muted plum | `#4A3746` | Supporting text and descriptions |
| Text Muted | Gray plum | `#6B5A68` | Captions, metadata, helper text |
| Text On Brand | White | `#FFFFFF` | Text placed on primary, soft-pink, or lavender buttons when readable |

## 3. Supporting status colors

These colors are not brand colors. Use them only for status and safety meaning.

| Token | Color | Hex | Main use |
|---|---|---|---|
| Success | Green | `#2E8B57` | Completed checkups, completed reminders, success messages |
| Warning | Amber | `#D99000` | Upcoming task, caution, moderate climate warning |
| Emergency | Red | `#C62828` | Danger signs, urgent medical or evacuation warning |
| Information | Blue | `#2F6F9F` | Neutral information and help messages |
| Border | Light plum-gray | `#E8DDE6` | Card borders, dividers, input outlines |
| Surface | Very light pink | `#FFF7FC` | Soft page sections and selected backgrounds |

## 4. Recommended usage

- Use `#E149A0` for the most important action on a screen.
- Use `#E774B9` for secondary actions and supportive visual elements.
- Use `#DD7AD8` for chatbot, voice-assistant, and educational-content areas.
- Use white for the main page background and card surfaces.
- Use deep plum rather than black for headings and body text.
- Use red only for genuine danger or emergency states.
- Use green only for completed or positive states.
- Keep the screen visually calm; do not use all three brand colors at full strength in every component.

## 5. Suggested UI combinations

### Primary action

- Background: `#E149A0`
- Text: `#FFFFFF`
- Hover/pressed: darken the primary color slightly

### Secondary action

- Background: `#E774B9`
- Text: `#FFFFFF` or `#2B1F2A` after contrast testing

### Voice and chatbot card

- Background: `#DD7AD8`
- Text: `#FFFFFF`
- Secondary surface: `#FFF7FC`

### Standard content card

- Background: `#FFFFFF`
- Heading: `#2B1F2A`
- Body: `#4A3746`
- Border: `#E8DDE6`

### Emergency alert

- Background: light red tint
- Border and icon: `#C62828`
- Heading: `#2B1F2A`
- Action button: `#C62828`
- Action text: `#FFFFFF`

## 6. Example CSS variables

```css
:root {
  --color-primary: #e149a0;
  --color-secondary: #e774b9;
  --color-accent: #dd7ad8;
  --color-white: #ffffff;

  --color-text-primary: #2b1f2a;
  --color-text-secondary: #4a3746;
  --color-text-muted: #6b5a68;
  --color-border: #e8dde6;
  --color-surface: #fff7fc;

  --color-success: #2e8b57;
  --color-warning: #d99000;
  --color-emergency: #c62828;
  --color-information: #2f6f9f;
}
```

## 7. Design direction

The visual style should feel warm, caring, trustworthy, and easy to use. Use rounded cards, clear icons, generous spacing, large buttons, and restrained gradients. The pink and purple palette should support the experience without making emergency information look decorative or unclear.
