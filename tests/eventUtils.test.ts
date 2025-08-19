import { describe, it, expect } from 'vitest';
import { normalizeListInput } from '../src/lib/eventUtils';

describe('normalizeListInput', () => {
  it('parses JSON array input', () => {
    expect(normalizeListInput('["AI","Web"]')).toEqual(['AI','Web']);
  });

  it('parses newline-separated input', () => {
    expect(normalizeListInput('AI\nWeb\n')).toEqual(['AI','Web']);
  });

  it('parses comma-separated input', () => {
    expect(normalizeListInput('AI, Web')).toEqual(['AI','Web']);
  });

  it('returns undefined for undefined input', () => {
    expect(normalizeListInput(undefined)).toBeUndefined();
  });
});
