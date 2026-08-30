import { describe, it, expect } from 'vitest';
import { bandLabel, bandClasses } from './bandColor';

describe('bandColor', () => {
  describe('bandLabel', () => {
    it('maps needs_work to "Needs work"', () => {
      expect(bandLabel('needs_work')).toBe('Needs work');
    });

    it('maps developing to "Developing"', () => {
      expect(bandLabel('developing')).toBe('Developing');
    });

    it('maps strong to "Strong"', () => {
      expect(bandLabel('strong')).toBe('Strong');
    });
  });

  describe('bandClasses', () => {
    it('returns red classes for needs_work', () => {
      const classes = bandClasses('needs_work');
      expect(classes).toBe('bg-red-100 text-red-800');
    });

    it('returns amber classes for developing', () => {
      const classes = bandClasses('developing');
      expect(classes).toBe('bg-amber-100 text-amber-800');
    });

    it('returns emerald classes for strong', () => {
      const classes = bandClasses('strong');
      expect(classes).toBe('bg-emerald-100 text-emerald-800');
    });

    it('returns distinct non-empty class strings per band', () => {
      const needsWorkClasses = bandClasses('needs_work');
      const developingClasses = bandClasses('developing');
      const strongClasses = bandClasses('strong');

      expect(needsWorkClasses).toBeTruthy();
      expect(developingClasses).toBeTruthy();
      expect(strongClasses).toBeTruthy();

      expect(needsWorkClasses).not.toBe(developingClasses);
      expect(developingClasses).not.toBe(strongClasses);
      expect(needsWorkClasses).not.toBe(strongClasses);
    });
  });
});
