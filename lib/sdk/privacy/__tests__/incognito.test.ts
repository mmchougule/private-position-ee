/**
 * Unit tests for incognito wallet module
 */

import {
  deriveIncognitoAddress,
  getIncognitoBalance,
  isValidIncognitoAddress,
} from '../incognito';

describe('Incognito Module', () => {
  const mockMainWallet = '0x1234567890123456789012345678901234567890';
  const mockToken = 'USDC' as const;
  const chainId = 1;

  describe('deriveIncognitoAddress', () => {
    it('should derive incognito address from main wallet', async () => {
      const result = await deriveIncognitoAddress(mockMainWallet, chainId);

      expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result).not.toBe(mockMainWallet);
    });

    it('should derive same address for same inputs', async () => {
      const result1 = await deriveIncognitoAddress(mockMainWallet, chainId);
      const result2 = await deriveIncognitoAddress(mockMainWallet, chainId);

      expect(result1).toBe(result2);
    });

    it('should derive different address for different chain IDs', async () => {
      const result1 = await deriveIncognitoAddress(mockMainWallet, 1);
      const result2 = await deriveIncognitoAddress(mockMainWallet, 137);

      expect(result1).not.toBe(result2);
    });

    it('should derive different address for different main wallets', async () => {
      const wallet2 = '0x9876543210987654321098765432109876543210';
      const result1 = await deriveIncognitoAddress(mockMainWallet, chainId);
      const result2 = await deriveIncognitoAddress(wallet2, chainId);

      expect(result1).not.toBe(result2);
    });

    it('should reject invalid main wallet address', async () => {
      await expect(
        deriveIncognitoAddress('invalid', chainId)
      ).rejects.toThrow('Invalid main wallet address');
    });

    it('should reject empty main wallet address', async () => {
      await expect(
        deriveIncognitoAddress('', chainId)
      ).rejects.toThrow('Invalid main wallet address');
    });
  });

  describe('getIncognitoBalance', () => {
    it('should return balance as string', async () => {
      const mockIncognitoAddress = '0x9876543210987654321098765432109876543210';
      const result = await getIncognitoBalance(
        mockIncognitoAddress,
        mockToken,
        chainId
      );

      expect(typeof result).toBe('string');
      expect(result).toBe('0');
    });

    it('should reject invalid incognito address', async () => {
      await expect(
        getIncognitoBalance('invalid', mockToken, chainId)
      ).rejects.toThrow('Invalid incognito address');
    });

    it('should reject empty incognito address', async () => {
      await expect(
        getIncognitoBalance('', mockToken, chainId)
      ).rejects.toThrow('Invalid incognito address');
    });
  });

  describe('isValidIncognitoAddress', () => {
    it('should return true for valid address', () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      expect(isValidIncognitoAddress(validAddress)).toBe(true);
    });

    it('should return false for invalid address', () => {
      expect(isValidIncognitoAddress('invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidIncognitoAddress('')).toBe(false);
    });

    it('should return false for address without 0x prefix', () => {
      expect(isValidIncognitoAddress('1234567890123456789012345678901234567890')).toBe(false);
    });

    it('should return false for too short address', () => {
      expect(isValidIncognitoAddress('0x123')).toBe(false);
    });

    it('should return false for too long address', () => {
      expect(isValidIncognitoAddress('0x12345678901234567890123456789012345678901')).toBe(false);
    });

    it('should return false for address with invalid characters', () => {
      expect(isValidIncognitoAddress('0x123456789012345678901234567890123456789g')).toBe(false);
    });
  });
});
