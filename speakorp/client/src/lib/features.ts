import type { SegmentFeatures } from '@shared/types';

/**
 * Compute MVP audio feature proxies from transcript and duration.
 *
 * This is a deterministic, client-side function that estimates acoustic properties
 * without access to raw audio. All metrics are proxies based on transcript analysis.
 *
 * @param transcript - The spoken text captured/corrected by the user
 * @param durationSec - Recording duration in seconds (clamped >= 0)
 * @returns SegmentFeatures with wordCount, wordsPerMinute, pauseCount, longestPauseSec
 */
export function computeFeatures(transcript: string, durationSec: number): SegmentFeatures {
  // Clamp duration to >= 0
  const clampedDuration = Math.max(0, durationSec);

  // Word count: split on whitespace, filter empties
  const words = transcript.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Words per minute: avoid division by zero
  let wordsPerMinute = 0;
  if (clampedDuration > 0) {
    const minutes = clampedDuration / 60;
    wordsPerMinute = Math.round(wordCount / minutes);
  }

  // Pause estimation (proxy): count sentence-ending punctuation as pause
  // boundaries. Intentionally excludes hyphens/en-dashes so in-word hyphens
  // ("state-of-the-art") and decimals ("3.5") don't inflate the count.
  const pauseMatches = transcript.match(/[.?!…]|—/g);
  const pauseCount = pauseMatches ? pauseMatches.length : 0;

  // Longest pause: if any pauses exist, use a small constant proxy (0.8 seconds)
  // Otherwise 0 (no pauses detected)
  const longestPauseSec = pauseCount > 0 ? 0.8 : 0;

  return {
    durationSec: clampedDuration,
    wordCount,
    wordsPerMinute,
    pauseCount,
    longestPauseSec,
  };
}
