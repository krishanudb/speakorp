import type { Skill, Rubric } from '../types';

/**
 * All 12 trainable skills from Lessons 1–20 (Weeks 1–4).
 * Derived from PRD §6 (Content Spec) and §8 (Feedback Rubric).
 */
export const SKILLS: Skill[] = [
  {
    id: 'vocal.breath_support',
    pillar: 'vocal',
    name: 'Breath Support',
    lessonIntroduced: 1,
  },
  {
    id: 'presence.neutral_posture',
    pillar: 'presence',
    name: 'Neutral Posture',
    lessonIntroduced: 2,
  },
  {
    id: 'storytelling.identify_reveal',
    pillar: 'storytelling',
    name: 'Identify the Reveal',
    lessonIntroduced: 3,
  },
  {
    id: 'vocal.strategic_pausing',
    pillar: 'vocal',
    name: 'Strategic Pausing',
    lessonIntroduced: 6,
  },
  {
    id: 'presence.eliminate_fidgeting',
    pillar: 'presence',
    name: 'Eliminate Fidgeting',
    lessonIntroduced: 7,
  },
  {
    id: 'storytelling.setup_tension_reveal',
    pillar: 'storytelling',
    name: 'Setup → Tension → Reveal',
    lessonIntroduced: 8,
  },
  {
    id: 'vocal.pace_control',
    pillar: 'vocal',
    name: 'Pace Control',
    lessonIntroduced: 11,
  },
  {
    id: 'presence.purposeful_stillness',
    pillar: 'presence',
    name: 'Purposeful Stillness',
    lessonIntroduced: 12,
  },
  {
    id: 'storytelling.build_tension_pacing',
    pillar: 'storytelling',
    name: 'Build Tension via Pacing',
    lessonIntroduced: 13,
  },
  {
    id: 'vocal.pitch_variety',
    pillar: 'vocal',
    name: 'Pitch Variety',
    lessonIntroduced: 16,
  },
  {
    id: 'presence.open_closed_gestures',
    pillar: 'presence',
    name: 'Open vs. Closed Gestures',
    lessonIntroduced: 17,
  },
  {
    id: 'storytelling.dont_lead_conclusion',
    pillar: 'storytelling',
    name: "Don't Lead With the Conclusion",
    lessonIntroduced: 18,
  },
];

/**
 * Deterministic scoring rubrics for each skill (PRD §8).
 * Inputs, metric, bands, and sample feedback are taken verbatim from the PRD.
 */
export const RUBRICS: Rubric[] = [
  {
    skillId: 'vocal.breath_support',
    inputs: 'word-timestamps, pause list',
    metric: 'syllables-per-breath-group (gap >0.4s between words treated as a breath point); consistency of breath-group length across the recording',
    bands: '90–100 = full target sentence in one breath group with no strain marker (no trailing pitch drop/volume fade); 60–89 = one unplanned mid-sentence breath; <60 = multiple unplanned breaks',
    sampleFeedback: 'You took a breath mid-sentence around 0:07 — try starting with a fuller inhale so you can carry the whole line.',
  },
  {
    skillId: 'presence.neutral_posture',
    inputs: 'pose landmarks (shoulder position variance, head/torso sway over time)',
    metric: 'shoulder-level variance and torso-sway amplitude across the clip',
    bands: '90–100 = minimal sway, level shoulders throughout; 60–89 = brief sway or shoulder asymmetry; <60 = persistent swaying/slouching',
    sampleFeedback: 'Solid stillness in the first half — some swaying crept in around 0:12, worth a rewatch.',
  },
  {
    skillId: 'storytelling.identify_reveal',
    inputs: 'transcript, lesson\'s known target reveal phrase/fact',
    metric: 'LLM judgment — is the target fact positioned in the final third of the delivery, and is it clearly stated (not buried in a longer clause)?',
    bands: 'LLM returns a 0–100 "reveal-placement" score with rationale',
    sampleFeedback: 'Nice — you saved \'the client renewed for two years\' for the very end, which gave it real weight.',
  },
  {
    skillId: 'vocal.strategic_pausing',
    inputs: 'pause list, transcript, LLM-identified key phrase for the lesson',
    metric: 'is there a pause of ≥0.6s immediately before (or after, per lesson) the key phrase?',
    bands: '90–100 = pause present, correctly placed, appropriate length (0.6–1.5s); 60–89 = pause present but mistimed or too short/long; <60 = no meaningful pause',
    sampleFeedback: 'Good pause before \'three percent\' — right length, right spot.',
  },
  {
    skillId: 'presence.eliminate_fidgeting',
    inputs: 'pose landmarks over time (hand/foot movement frequency outside of intentional gesture zones)',
    metric: 'count of repetitive small movements (taps, weight shifts) per 10 seconds',
    bands: '90–100 = ≤1 per 10s; 60–89 = 2–3 per 10s; <60 = 4+ per 10s',
    sampleFeedback: 'Noticed some hand-tapping around 0:05–0:10 — that\'s your fidget tell to watch.',
  },
  {
    skillId: 'storytelling.setup_tension_reveal',
    inputs: 'transcript',
    metric: 'LLM classifies each sentence as setup / tension / reveal / other, checks correct ordering and presence of all three',
    bands: '90–100 = all three present, correctly ordered; 60–89 = present but ordering/blending is muddled; <60 = one or more elements missing',
    sampleFeedback: 'Clear setup and reveal, but the tension beat was pretty brief — give the obstacle one more sentence to breathe.',
  },
  {
    skillId: 'vocal.pace_control',
    inputs: 'word-timestamps',
    metric: 'words-per-minute computed per sentence/clause, compared against the lesson\'s expected slow/fast segments',
    bands: '90–100 = clear, appropriate contrast (≥25% WPM difference between slow and fast segments); 60–89 = some contrast but muted; <60 = flat pace throughout',
    sampleFeedback: 'Good slowdown on the risk sentence — the recovery line could pick up more energy to contrast it.',
  },
  {
    skillId: 'presence.purposeful_stillness',
    inputs: 'pose landmarks',
    metric: 'movement amplitude specifically during the lesson\'s designated "stillness" sentence, compared to baseline movement elsewhere in the clip',
    bands: '90–100 = movement during target sentence is near zero and clearly lower than surrounding segments; 60–89 = some movement bleeds in; <60 = no discernible difference',
    sampleFeedback: 'You held stillness well on the key line — that contrast is what makes it land.',
  },
  {
    skillId: 'storytelling.build_tension_pacing',
    inputs: 'transcript + WPM per classified segment (from storytelling classifier + pace metric)',
    metric: 'is the "tension" segment measurably slower than the "setup" segment?',
    bands: '90–100 = clear pace drop (≥20%) during tension; 60–89 = slight drop; <60 = no pace differentiation',
    sampleFeedback: 'Try slowing down even more once you hit the obstacle — right now the pace barely shifts.',
  },
  {
    skillId: 'vocal.pitch_variety',
    inputs: 'pitch contour (Hz/semitones over time)',
    metric: 'pitch standard deviation across the clip, and presence of a clear pitch shift on the LLM-identified key word',
    bands: '90–100 = healthy overall pitch variance + clear shift on key word; 60–89 = some variance but flat on the key word; <60 = largely monotone',
    sampleFeedback: 'Nice energy overall — but \'opportunity\' stayed flat where a pitch lift would\'ve sold it more.',
  },
  {
    skillId: 'presence.open_closed_gestures',
    inputs: 'pose landmarks (arm position relative to torso, hand visibility)',
    metric: 'classify gesture state per second as open/closed/neutral; check for an open-gesture moment aligned with the key word\'s timestamp',
    bands: '90–100 = open gesture present and aligned with key word; 60–89 = open gesture present but mistimed; <60 = closed or absent',
    sampleFeedback: 'Good open gesture, just a beat late — try landing it exactly on \'proposing.\'',
  },
  {
    skillId: 'storytelling.dont_lead_conclusion',
    inputs: 'transcript, LLM-identified conclusion statement',
    metric: 'position of the conclusion sentence within the delivery (should fall in final third)',
    bands: '90–100 = conclusion in final third, reasoning precedes it; 60–89 = conclusion appears mid-way; <60 = conclusion-first',
    sampleFeedback: 'You still opened with the recommendation — try holding it back until after you\'ve made the case.',
  },
];

/**
 * Look up a skill by its id.
 */
export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

/**
 * Look up a rubric by its skillId.
 */
export function getRubric(skillId: string): Rubric | undefined {
  return RUBRICS.find((rubric) => rubric.skillId === skillId);
}
