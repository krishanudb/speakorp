import type { Lesson } from '../types';

export const WEEK3_LESSONS: Lesson[] = [
  {
    id: 11,
    week: 3,
    day: 1,
    title: 'Vocal: Pace Control',
    dayType: 'isolated',
    skillIds: ['vocal.pace_control'],
    warmupCodes: ['W1', 'W2', 'W6', 'W4'],
    concept:
      'Pace is a dial, not a fixed speed. Slow down for weight and gravity; speed up for energy and momentum — within the same message.',
    drills: [
      'Read a neutral sentence at your natural pace, then again 30% slower, then again 30% faster. Notice the emotional shift each creates.',
      'Say: "This is a serious issue" — deliberately slow.',
      'Say: "This is exciting news" — deliberately faster, more energy.',
      'Combine: one sentence slow, next sentence fast, in a single take.',
    ],
    appliedScenario:
      "Deliver: 'I want to flag a risk on the timeline. [slow] We may miss the launch date by a week. [faster, upbeat] But the good news is, the fix is already in progress.' Contrast pace clearly between the two halves.",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 12,
    week: 3,
    day: 2,
    title: 'Presence: Purposeful Stillness',
    dayType: 'isolated',
    skillIds: ['presence.purposeful_stillness'],
    warmupCodes: ['W3', 'W5', 'W7', 'W8'],
    concept:
      "Stillness isn't freezing — it's choosing not to move because the moment doesn't call for it, which reads as calm authority.",
    drills: [
      'Deliver one sentence with zero gesture or movement — hold it fully.',
      'Compare against the same sentence with natural gesture — notice when stillness lands *stronger* (e.g., on a serious point).',
      'Practice transitioning from a gesture into deliberate stillness right before a key line.',
    ],
    appliedScenario:
      "Deliver: 'I want to be direct with you about where we stand.' Full stillness, no gestures, for the entire line.",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 13,
    week: 3,
    day: 3,
    title: 'Storytelling: Build Tension via Pacing',
    dayType: 'isolated',
    skillIds: ['storytelling.build_tension_pacing'],
    warmupCodes: ['W6', 'W1', 'W4', 'W2'],
    concept:
      "Slowing your pace during the 'tension' beat of a story physically makes the listener feel the stakes rise — this links directly back to your pace-control skill.",
    drills: [
      'Take a setup-tension-reveal example from Week 2 and deliver the tension beat noticeably slower than the setup.',
      'Speed back up on the reveal to convey resolution/relief.',
      'Try the reverse (fast tension, slow reveal) and notice how it lands differently.',
    ],
    appliedScenario:
      'Tell a 30-second story: setup (normal pace) → tension (slowed pace) → reveal (pace picks back up): a launch that was at risk but shipped on time.',
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 14,
    week: 3,
    day: 4,
    title: 'Combo: Pace Control + Purposeful Stillness',
    dayType: 'combo',
    skillIds: ['vocal.pace_control', 'presence.purposeful_stillness'],
    warmupCodes: ['W7', 'W8', 'W3', 'W5'],
    concept: '',
    drills: [],
    appliedScenario:
      'Deliver a 30-second update where you slow your pace and go fully still on the one sentence that matters most.',
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 15,
    week: 3,
    day: 5,
    title: 'Integration: Pace + Stillness + Tension-via-Pacing',
    dayType: 'integration',
    skillIds: ['vocal.pace_control', 'presence.purposeful_stillness', 'storytelling.build_tension_pacing'],
    warmupCodes: ['W1', 'W3', 'W5', 'W7'],
    concept: '',
    drills: [],
    appliedScenario:
      "Deliver a 60–90 second 'bad news' update to a manager: a slower pace and held stillness through the tension section, picking up pace and easing posture as you land the resolution.",
    fullyScored: true,
    requiresVideo: true,
  },
];
