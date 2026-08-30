import type { ScoreBand } from '@shared/types';

/**
 * Convert a ScoreBand to a human-readable label.
 * @param band The score band to label
 * @returns 'Needs work' | 'Developing' | 'Strong'
 */
export function bandLabel(band: ScoreBand): string {
  switch (band) {
    case 'needs_work':
      return 'Needs work';
    case 'developing':
      return 'Developing';
    case 'strong':
      return 'Strong';
  }
}

/**
 * Get Tailwind classes for a colored badge per band.
 * @param band The score band to style
 * @returns Tailwind class string for background and text colors
 */
export function bandClasses(band: ScoreBand): string {
  switch (band) {
    case 'needs_work':
      return 'bg-red-100 text-red-800';
    case 'developing':
      return 'bg-amber-100 text-amber-800';
    case 'strong':
      return 'bg-emerald-100 text-emerald-800';
  }
}
