import { describe, it, expect } from 'vitest';
import {
  encryptToken,
  decryptToken,
  createOAuthState,
  verifyOAuthState,
} from '../src/utils/crypto.js';

describe('Crypto Utilities', () => {
  it('should encrypt and decrypt access token properly', () => {
    const originalToken = 'secret_test_notion_oauth_access_token_1234567890';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.split(':').length).toBe(3);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('should create and verify HMAC OAuth state', () => {
    const userId = 'cuid-user-12345';
    const state = createOAuthState(userId);

    expect(state).toContain(userId);

    const verified = verifyOAuthState(state);
    expect(verified).toBe(userId);
  });

  it('should reject tampered OAuth state', () => {
    const userId = 'cuid-user-12345';
    const state = createOAuthState(userId);
    const tampered = state.replace('cuid-user-12345', 'cuid-user-99999');

    expect(verifyOAuthState(tampered)).toBeNull();
  });
});
