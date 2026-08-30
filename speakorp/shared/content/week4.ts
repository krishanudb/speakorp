import type { Lesson } from '../types';

export const WEEK4_LESSONS: Lesson[] = [
  {
    id: 16,
    week: 4,
    day: 1,
    title: 'Vocal: Pitch Variety',
    dayType: 'isolated',
    skillIds: ['vocal.pitch_variety'],
    warmupCodes: ['W1', 'W5', 'W2', 'W4'],
    concept:
      'A flat pitch reads as bored or disengaged, even when the content is exciting. Varying pitch — rising on key words, dropping for gravity — keeps listeners engaged and signals meaning.',
    drills: [
      'Say the same sentence three ways: monotone, then with a pitch rise on the key word, then with a pitch drop on the key word. Compare.',
      'Practice: "Our biggest win this quarter was [pitch UP] landing Acme Corp."',
      'Practice: "This is [pitch DOWN, slower] a serious situation."',
      'Free practice with your own sentence, marking where pitch should shift.',
    ],
    appliedScenario:
      "Deliver: 'We closed the deal.' Say it three times with visibly different pitch patterns, then pick the one that best fits excitement and deliver it with full commitment.",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 17,
    week: 4,
    day: 2,
    title: 'Presence: Open vs. Closed Gestures',
    dayType: 'isolated',
    skillIds: ['presence.open_closed_gestures'],
    warmupCodes: ['W3', 'W6', 'W8', 'W1'],
    concept:
      'Open gestures (palms visible, arms away from the body) read as confident and transparent. Closed gestures (crossed arms, hands hidden) read as defensive — even when unintentional.',
    drills: [
      'Deliver a sentence with arms crossed, then again with an open palm gesture. Compare playback.',
      "Practice one open gesture that matches a key word (e.g., an open \"presenting\" gesture on \"here's what we found\").",
      'Practice recovering from an accidental closed posture (arms crossing) back to open, mid-sentence.',
    ],
    appliedScenario:
      "Deliver: 'Here's what we're proposing.' Use one clear open gesture on the word 'proposing.'",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 18,
    week: 4,
    day: 3,
    title: "Storytelling: Don't Lead With the Conclusion",
    dayType: 'isolated',
    skillIds: ['storytelling.dont_lead_conclusion'],
    warmupCodes: ['W7', 'W2', 'W5', 'W4'],
    concept:
      "It's tempting to open with your conclusion to 'save time' — but this kills the tension that makes people actually listen to your reasoning. Save the conclusion for last.",
    drills: [
      'Take a conclusion ("we should delay the launch") and draft 2 supporting points that lead up to it instead of starting with it.',
      'Deliver conclusion-first, then deliver setup→reasoning→conclusion. Compare engagement.',
      'Practice with your own example.',
    ],
    appliedScenario:
      'Deliver a 30-second recommendation to delay a launch by one week — reasoning first, conclusion last.',
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 19,
    week: 4,
    day: 4,
    title: 'Combo: Pitch Variety + Open Gestures',
    dayType: 'combo',
    skillIds: ['vocal.pitch_variety', 'presence.open_closed_gestures'],
    warmupCodes: ['W8', 'W1', 'W3', 'W6'],
    concept:
      'Combine pitch variety and open gestures — use pitch shifts to emphasize key words, and pair them with confident, transparent gestures for maximum impact.',
    drills: [],
    appliedScenario:
      "Deliver: 'This is the opportunity in front of us.' Pitch rises on 'opportunity,' paired with one open gesture on the same word.",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 20,
    week: 4,
    day: 5,
    title: "Integration: Pitch Variety + Open Gestures + Don't Lead With Conclusion",
    dayType: 'integration',
    skillIds: ['vocal.pitch_variety', 'presence.open_closed_gestures', 'storytelling.dont_lead_conclusion'],
    warmupCodes: ['W1', 'W3', 'W5', 'W7'],
    concept:
      'All three pillars come together in this capstone: pitch variety keeps energy up, open gestures demonstrate confidence, and structuring your pitch to reveal the conclusion last builds persuasive momentum.',
    drills: [],
    appliedScenario:
      'Pitch a new idea to your team, cold — no one has heard it before. Build your reasoning first, land your recommendation as the reveal at the end, use varied pitch to keep energy up, and use open gestures throughout. 45–60 seconds.',
    fullyScored: true,
    requiresVideo: true,
    isMonthOneCapstone: true,
  },
];
