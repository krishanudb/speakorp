import { Warmup } from '../types';

/** Shared warmup bank (W1–W8) — reused across all lessons. */
export const WARMUPS: Warmup[] = [
  {
    code: 'W1',
    name: 'Diaphragmatic breathing',
    script: 'Inhale for 4 counts (belly expands), exhale for 8 counts on a soft "shhh." Repeat ×4.',
  },
  {
    code: 'W2',
    name: 'Lip trills',
    script: 'Relax lips, blow air through them ("brrr" motorboat sound), sliding pitch low→high→low. Repeat ×5.',
  },
  {
    code: 'W3',
    name: 'Humming resonance',
    script: 'Hum a comfortable 5-note scale up and down, keeping the sound forward and easy. Repeat ×3.',
  },
  {
    code: 'W4',
    name: 'Tongue twisters',
    script: '"Red leather, yellow leather" ×5, increasing speed each rep.',
  },
  {
    code: 'W5',
    name: 'Pitch glide / siren',
    script: 'Slide voice smoothly from lowest to highest comfortable pitch on "ng," then back down. Repeat ×3.',
  },
  {
    code: 'W6',
    name: 'Pen exercise',
    script: 'Hold a pen horizontally between the teeth, read 2 sentences aloud, forcing over-articulation.',
  },
  {
    code: 'W7',
    name: 'Jaw & tongue release',
    script: 'Loosen jaw with gentle circular motion; move tongue in a full circle inside closed mouth ×5 each direction.',
  },
  {
    code: 'W8',
    name: 'Rapid consonants',
    script: 'Repeat "Ka-Ta-Pa" rapid-fire for 20 seconds, staying crisp not sloppy.',
  },
];

/**
 * Return warmups for the given codes, in the order of `codes`, skipping unknown codes.
 * @param codes Array of warmup codes (e.g., ['W1', 'W3'])
 * @returns Array of Warmup objects in the requested order
 */
export function getWarmups(codes: string[]): Warmup[] {
  const codeToWarmup = new Map(WARMUPS.map((w) => [w.code, w]));
  return codes
    .map((code) => codeToWarmup.get(code))
    .filter((w) => w !== undefined) as Warmup[];
}
