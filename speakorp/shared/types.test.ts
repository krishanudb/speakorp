import { describe, expect, it } from 'vitest';
import { scoreToBand } from './types';

describe('scoreToBand', () => {
  it('maps >=90 to strong', () => {
    expect(scoreToBand(90)).toBe('strong');
    expect(scoreToBand(100)).toBe('strong');
  });

  it('maps 60..89 to developing', () => {
    expect(scoreToBand(60)).toBe('developing');
    expect(scoreToBand(89)).toBe('developing');
  });

  it('maps <60 to needs_work', () => {
    expect(scoreToBand(59)).toBe('needs_work');
    expect(scoreToBand(0)).toBe('needs_work');
  });
});
