import { describe, it, expect } from 'vitest';
import { WARMUPS, getWarmups } from './warmups';

describe('warmups', () => {
  it('should contain exactly 8 warmups', () => {
    expect(WARMUPS).toHaveLength(8);
  });

  it('should have codes W1 through W8 and all unique', () => {
    const codes = WARMUPS.map((w) => w.code);
    expect(codes).toEqual(['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']);
    expect(new Set(codes).size).toBe(8); // all unique
  });

  it('should return warmups for given codes in order', () => {
    const result = getWarmups(['W1', 'W2']);
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('W1');
    expect(result[1].code).toBe('W2');
  });

  it('should skip unknown codes', () => {
    const result = getWarmups(['W1', 'UNKNOWN', 'W2']);
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('W1');
    expect(result[1].code).toBe('W2');
  });
});
