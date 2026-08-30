import type { Lesson } from '../types';

export const WEEK2_LESSONS: Lesson[] = [
  {
    id: 6,
    week: 2,
    day: 1,
    title: 'Vocal: Strategic Pausing',
    dayType: 'isolated',
    skillIds: ['vocal.strategic_pausing'],
    warmupCodes: ['W1', 'W4', 'W6', 'W8'],
    concept:
      'A pause right before your key point makes the listener lean in. A pause right after it lets it land. Pausing is a tool, not a mistake to avoid.',
    drills: [
      'Say: "The number we\'re most proud of is [pause] forty percent growth." Hold the pause 1 full second.',
      'Say the same line with no pause — compare on playback.',
      'Practice pausing *after* the key line instead: "We hit forty percent growth. [pause] That\'s double our target."',
      'Free practice: pick any sentence with a number in it, insert a pre-pause.',
    ],
    appliedScenario:
      "Deliver: 'I want to flag one number from this quarter: our churn rate dropped to three percent.' Insert a deliberate pause directly before 'three percent.'",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 7,
    week: 2,
    day: 2,
    title: 'Presence: Eliminate Fidgeting',
    dayType: 'isolated',
    skillIds: ['presence.eliminate_fidgeting'],
    warmupCodes: ['W2', 'W5', 'W7', 'W3'],
    concept:
      'Fidgeting — tapping, shifting weight, touching your face or hair — reads as nervousness even when you don\'t feel nervous. Today\'s skill is noticing and interrupting the habit.',
    drills: [
      'Record 20 seconds speaking on any topic without trying to control anything — establish your personal fidget baseline.',
      'Review and identify your specific tell (hands, feet, weight-shifting, etc.).',
      'Repeat the same 20 seconds, consciously suppressing that specific tell.',
      'Practice the "controlled return to neutral" — if you catch yourself fidgeting mid-sentence, calmly return to ready posture rather than freezing up.',
    ],
    appliedScenario:
      'Deliver a 20-second update on any current project, on camera, actively suppressing your identified fidget tell.',
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 8,
    week: 2,
    day: 3,
    title: 'Storytelling: Setup → Tension → Reveal',
    dayType: 'isolated',
    skillIds: ['storytelling.setup_tension_reveal'],
    warmupCodes: ['W6', 'W8', 'W1', 'W4'],
    concept:
      'Yesterday you found your reveal. Today you build the two pieces before it: a setup (context) and tension (the obstacle or stakes) that make the reveal land.',
    drills: [
      'Take last week\'s reveal ("client renewed for 2 years") and add one setup sentence: "This client almost churned in Q2."',
      'Add a tension sentence: "We had three weeks to turn the relationship around."',
      'Say all three parts in order: setup → tension → reveal.',
      'Repeat with a new example of your own.',
    ],
    appliedScenario:
      "Tell a 30-second story with this reveal: 'we shipped two days early.' Include a setup and a tension beat before it.",
    fullyScored: false,
    requiresVideo: false,
  },
  {
    id: 9,
    week: 2,
    day: 4,
    title: 'Combo: Strategic Pausing + Eliminate Fidgeting',
    dayType: 'combo',
    skillIds: ['vocal.strategic_pausing', 'presence.eliminate_fidgeting'],
    warmupCodes: ['W3', 'W5', 'W7', 'W2'],
    concept:
      'Now combine what you\'ve built: strategic pausing focuses the listener\'s attention, controlled posture maintains your presence. Together, they\'re what makes your key moments land with impact.',
    drills: [
      'Deliver a 2-sentence update with a pre-pause on the key phrase, while holding still.',
      'Deliberately fidget through the pause, then redo it controlled — compare how much weaker the pause reads when paired with fidgeting.',
    ],
    appliedScenario:
      "Deliver: 'Before I get into the roadmap, I want to share something — [pause] we just closed our biggest deal this year.' Full stillness through the pause.",
    fullyScored: false,
    requiresVideo: true,
  },
  {
    id: 10,
    week: 2,
    day: 5,
    title: 'Integration: Pausing + No Fidgeting + Setup-Tension-Reveal',
    dayType: 'integration',
    skillIds: ['vocal.strategic_pausing', 'presence.eliminate_fidgeting', 'storytelling.setup_tension_reveal'],
    warmupCodes: ['W1', 'W3', 'W5', 'W7'],
    concept:
      "Today all three pillars come together for the first time at this level. Use strategic pausing on your key reveal, maintain composed posture throughout, and structure your update as setup → tension → reveal.",
    drills: [],
    appliedScenario:
      'Deliver a 60–90 second status update about a project that hit a serious obstacle mid-way but recovered. Structure it as setup → tension → reveal, use at least one deliberate pre-reveal pause, and hold composed, fidget-free posture throughout.',
    fullyScored: true,
    requiresVideo: true,
  },
];
