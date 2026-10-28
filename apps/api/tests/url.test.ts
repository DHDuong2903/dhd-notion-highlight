import { describe, it, expect } from 'vitest';
import { canonicalizeUrl } from '../src/utils/url.js';

describe('canonicalizeUrl', () => {
  it('should remove UTM and tracking parameters', () => {
    const raw =
      'https://example.com/article?utm_source=twitter&utm_medium=social&utm_campaign=launch&id=123';
    const canonical = canonicalizeUrl(raw);
    expect(canonical).toBe('https://example.com/article?id=123');
  });

  it('should strip fragments / hash', () => {
    const raw = 'https://example.com/blog/post-1#section-intro';
    const canonical = canonicalizeUrl(raw);
    expect(canonical).toBe('https://example.com/blog/post-1');
  });

  it('should normalize trailing slashes on pathname', () => {
    const rawWithSlash = 'https://example.com/news/tech/';
    const rawWithoutSlash = 'https://example.com/news/tech';

    expect(canonicalizeUrl(rawWithSlash)).toBe(canonicalizeUrl(rawWithoutSlash));
    expect(canonicalizeUrl(rawWithSlash)).toBe('https://example.com/news/tech');
  });

  it('should preserve root domain slash', () => {
    const root = 'https://example.com/';
    expect(canonicalizeUrl(root)).toBe('https://example.com/');
  });

  it('should lowercase hostnames', () => {
    const raw = 'https://EXAMPLE.COM/Guide';
    expect(canonicalizeUrl(raw)).toBe('https://example.com/Guide');
  });

  it('should sort query params deterministically', () => {
    const url1 = 'https://example.com/item?b=2&a=1';
    const url2 = 'https://example.com/item?a=1&b=2';
    expect(canonicalizeUrl(url1)).toBe(canonicalizeUrl(url2));
  });
});
