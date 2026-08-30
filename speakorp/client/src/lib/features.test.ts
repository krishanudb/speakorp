import { describe, it, expect } from 'vitest';
import { computeFeatures } from './features';

describe('computeFeatures', () => {
  it('computes wordCount correctly', () => {
    const result = computeFeatures('one two three', 60);
    expect(result.wordCount).toBe(3);
  });

  it('computes wordsPerMinute correctly', () => {
    const result = computeFeatures('one two three', 60);
    expect(result.wordsPerMinute).toBe(3);
  });

  it('returns 0 wordsPerMinute when duration is 0', () => {
    const result = computeFeatures('one two three', 0);
    expect(result.wordsPerMinute).toBe(0);
  });

  it('returns 0 wordCount for empty transcript', () => {
    const result = computeFeatures('', 60);
    expect(result.wordCount).toBe(0);
  });

  it('returns 0 wordCount for whitespace-only transcript', () => {
    const result = computeFeatures('   ', 60);
    expect(result.wordCount).toBe(0);
  });

  it('counts pauseCount from punctuation', () => {
    const result = computeFeatures('hello. world! how are you?', 60);
    expect(result.pauseCount).toBe(3);
  });

  it('sets longestPauseSec to 0.8 when pauses exist', () => {
    const result = computeFeatures('hello. world', 60);
    expect(result.longestPauseSec).toBe(0.8);
  });

  it('sets longestPauseSec to 0 when no pauses exist', () => {
    const result = computeFeatures('hello world', 60);
    expect(result.longestPauseSec).toBe(0);
  });

  it('clamps negative duration to 0', () => {
    const result = computeFeatures('one two', -10);
    expect(result.durationSec).toBe(0);
  });

  it('echoes durationSec when clamped', () => {
    const result = computeFeatures('one two', 45.5);
    expect(result.durationSec).toBe(45.5);
  });

  it('counts em-dashes and sentence enders as pauses, not in-word hyphens/en-dashes', () => {
    // em-dash (—) counts; en-dash (–) and hyphen (-) do not (avoid over-counting
    // "state-of-the-art"/decimals).
    expect(computeFeatures('hello — world – test - end', 60).pauseCount).toBe(1);
    expect(computeFeatures('state-of-the-art design', 60).pauseCount).toBe(0);
    expect(computeFeatures('Done. Ready? Go!', 60).pauseCount).toBe(3);
  });
});
