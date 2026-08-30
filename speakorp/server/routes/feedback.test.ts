import { describe, it, expect } from 'vitest';
import { deriveFeatures } from './feedback';

describe('deriveFeatures', () => {
  it('computes wordsPerMinute correctly', () => {
    const transcript = 'one two three four five';
    const features = deriveFeatures(6, transcript); // 6 seconds = 0.1 minutes
    expect(features.wordsPerMinute).toBe(50); // 5 words / 0.1 min = 50 wpm
  });

  it('returns 0 wpm when durationSec is 0', () => {
    const transcript = 'one two three four five';
    const features = deriveFeatures(0, transcript);
    expect(features.wordsPerMinute).toBe(0);
  });

  it('counts word count correctly', () => {
    const transcript = 'hello world this is a test';
    const features = deriveFeatures(10, transcript);
    expect(features.wordCount).toBe(6);
  });

  it('handles empty transcript', () => {
    const features = deriveFeatures(10, '');
    expect(features.wordCount).toBe(0);
    expect(features.wordsPerMinute).toBe(0);
  });

  it('handles transcript with extra whitespace', () => {
    const transcript = '  hello   world   test  ';
    const features = deriveFeatures(9, transcript); // 60 seconds = 1 minute, 3 words
    expect(features.wordCount).toBe(3);
    expect(features.wordsPerMinute).toBe(20); // 3 / 0.15 = 20
  });

  it('stores durationSec correctly', () => {
    const features = deriveFeatures(15, 'test');
    expect(features.durationSec).toBe(15);
  });

  it('initializes pauseCount and longestPauseSec to 0', () => {
    const features = deriveFeatures(5, 'test transcript');
    expect(features.pauseCount).toBe(0);
    expect(features.longestPauseSec).toBe(0);
  });
});
