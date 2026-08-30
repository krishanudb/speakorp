import { Lesson } from '../types';

export const WEEK1_LESSONS: Lesson[] = [
  {
    id: 1,
    week: 1,
    day: 1,
    title: 'Vocal: Diaphragmatic Breath Support',
    dayType: 'isolated',
    skillIds: ['vocal.breath_support'],
    warmupCodes: ['W1', 'W2', 'W4', 'W5'],
    concept:
      'Most speakers run out of breath mid-sentence and either gasp audibly or rush the end of the thought. Diaphragmatic breathing gives you a deeper, steadier air supply so your voice stays supported through a full sentence.',
    drills: [
      'Lie/sit with hand on stomach, inhale for 4 counts feeling the stomach (not chest) rise. Exhale for 8 on "shhh." ×4.',
      'Read aloud: "Our Q3 results show strong growth across every region we operate in." — take one breath before starting, don\'t breathe again until the period.',
      'Repeat with a longer sentence: "This quarter, revenue grew twelve percent, driven primarily by our enterprise segment, which now represents nearly half of total bookings." One breath, full sentence.',
      'Self-check: record 15 seconds of continuous speech (any topic) and count how many breaths were taken; aim to reduce breath count by 1 vs. an unscripted baseline.',
    ],
    appliedScenario:
      "You're opening a team meeting. In one breath, deliver: 'Good morning everyone, thanks for joining — I want to walk you through where we landed on the Q3 numbers.'",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 2,
    week: 1,
    day: 2,
    title: 'Presence: Neutral "Ready" Posture',
    dayType: 'isolated',
    skillIds: ['presence.neutral_posture'],
    warmupCodes: ['W2', 'W3', 'W6', 'W8'],
    concept:
      'Before you say a word, your posture has already communicated confidence or nervousness. Neutral ready posture — feet grounded, shoulders relaxed and level, hands at rest — is the default state you return to between gestures.',
    drills: [
      'Stand, feet shoulder-width apart, weight even. Hold for 15 sec, self-check no swaying.',
      'Practice the "reset": say one sentence with a gesture, then consciously return hands to neutral rest position.',
      'Record 20 seconds introducing yourself, reviewing playback specifically for shoulder tension or swaying (checklist, not AI-scored yet at this stage — camera on).',
      'Repeat the intro, this time deliberately holding neutral posture for the first and last 3 seconds of the clip.',
    ],
    appliedScenario:
      "On camera, deliver a 15-second self-introduction ('Hi, I'm ___, I work on ___') starting and ending in neutral ready posture.",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 3,
    week: 1,
    day: 3,
    title: 'Storytelling: Identify the Reveal',
    dayType: 'isolated',
    skillIds: ['storytelling.identify_reveal'],
    warmupCodes: ['W4', 'W5', 'W7', 'W1'],
    concept:
      "Every update has a 'reveal' — the one fact the listener actually needs. Most speakers bury it in the middle. Today's skill is simply identifying what your reveal is before you start talking.",
    drills: [
      'Given a messy paragraph of project notes, underline (mentally or on paper) the single most important fact.',
      'Say the paragraph aloud in the order given — notice how the reveal gets lost.',
      'Say it again, moving the reveal to the very end, building toward it.',
      'Practice with your own example: pick any recent work update and identify its one-sentence reveal out loud before saying anything else.',
    ],
    appliedScenario:
      "You have one fact to deliver: 'the client renewed for 2 years.' Build a 20-second update that leads up to that as the reveal, rather than opening with it.",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 4,
    week: 1,
    day: 4,
    title: 'Combo: Breath Support + Neutral Posture',
    dayType: 'combo',
    skillIds: ['vocal.breath_support', 'presence.neutral_posture'],
    warmupCodes: ['W1', 'W6', 'W8', 'W2'],
    concept:
      'Now combine what you\'ve built: breath support gives your voice control, neutral posture gives your body control. Together, they\'re what "calm and prepared" looks and sounds like.',
    drills: [
      'Deliver a 2-sentence update from neutral posture, one breath per sentence.',
      'Deliberately break posture (fidget) partway through a sentence and notice how it affects breath/pace; then repeat correctly.',
      'Record on camera: 20-second update, self-review for both breath control and posture together.',
    ],
    appliedScenario:
      "Deliver: 'I wanted to give you a quick update on the migration — we're on track for the Friday deadline, and QA sign-off is expected by Wednesday.' Full breath support, neutral posture throughout.",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 5,
    week: 1,
    day: 5,
    title: 'Integration: Breath + Posture + Identify the Reveal',
    dayType: 'integration',
    skillIds: ['vocal.breath_support', 'presence.neutral_posture', 'storytelling.identify_reveal'],
    warmupCodes: ['W3', 'W5', 'W7', 'W2'],
    concept:
      "Today's the first time all three pillars come together. This is the shape every future integration day will take.",
    drills: [],
    appliedScenario:
      "You're opening a 90-second stand-up. Deliver an update about a project that had a rocky start but is now back on track — end on that as your reveal. Use full breath support, and hold neutral, composed posture throughout.",
    fullyScored: true,
    requiresVideo: true,
    isBaselineRecording: true,
  },
];
