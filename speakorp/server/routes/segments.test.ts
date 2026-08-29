import { describe, expect, it } from 'vitest';
import { validateUploadBody } from './segments';
import type { UploadSegmentRequest } from '../../shared/api';

describe('validateUploadBody', () => {
  it('accepts a well-formed upload body', () => {
    const body: UploadSegmentRequest = {
      transcript: 'Hello world, this is a test.',
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(true);
  });

  it('rejects when transcript is missing', () => {
    const body = {
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when transcript is not a string', () => {
    const body = {
      transcript: 123,
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when hasVideo is not a boolean', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: 'yes',
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when hasVideo is missing', () => {
    const body = {
      transcript: 'Hello world',
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when features is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when durationSec is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when wordCount is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when wordsPerMinute is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when pauseCount is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when longestPauseSec is missing', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: 5.5,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when a feature value is NaN', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: NaN,
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when a feature value is not a number', () => {
    const body = {
      transcript: 'Hello world',
      hasVideo: true,
      features: {
        durationSec: '5.5',
        wordCount: 6,
        wordsPerMinute: 65,
        pauseCount: 2,
        longestPauseSec: 1.2,
      },
    };
    expect(validateUploadBody(body)).toBe(false);
  });

  it('rejects when body is null', () => {
    expect(validateUploadBody(null)).toBe(false);
  });

  it('rejects when body is not an object', () => {
    expect(validateUploadBody('not an object')).toBe(false);
    expect(validateUploadBody(123)).toBe(false);
  });
});
