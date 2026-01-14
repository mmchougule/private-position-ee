/**
 * Unit tests for shield module
 */

import {
  shieldTokens,
  getShieldedBalance,
  getTransactionStatus,
} from '../shield';
import { TransactionState } from '../../../types/private-trading';

describe('Shield Module', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';
  const mockToken = 'USDC' as const;
  const chainId = 1;

  describe('shieldTokens', () => {
    it('should return transaction details when shielding tokens', async () => {
      const result = await shieldTokens(mockWalletAddress, mockToken, '1000', chainId);

      expect(result).toHaveProperty('txHash');
      expect(result).toHaveProperty('state');
      expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(result.state).toBe(TransactionState.PENDING);
    });

    it('should reject invalid wallet address', async () => {
      await expect(
        shieldTokens('invalid', mockToken, '1000', chainId)
      ).rejects.toThrow('Invalid wallet address');
    });

    it('should reject empty wallet address', async () => {
      await expect(
        shieldTokens('', mockToken, '1000', chainId)
      ).rejects.toThrow('Invalid wallet address');
    });

    it('should reject invalid amount', async () => {
      await expect(
        shieldTokens(mockWalletAddress, mockToken, '0', chainId)
      ).rejects.toThrow('Invalid amount');
    });

    it('should reject negative amount', async () => {
      await expect(
        shieldTokens(mockWalletAddress, mockToken, '-100', chainId)
      ).rejects.toThrow('Invalid amount');
    });

    it('should reject empty amount', async () => {
      await expect(
        shieldTokens(mockWalletAddress, mockToken, '', chainId)
      ).rejects.toThrow('Invalid amount');
    });
  });

  describe('getShieldedBalance', () => {
    it('should return balance as string', async () => {
      const result = await getShieldedBalance(mockWalletAddress, mockToken, chainId);

      expect(typeof result).toBe('string');
      expect(result).toBe('0');
    });

    it('should reject invalid wallet address', async () => {
      await expect(
        getShieldedBalance('invalid', mockToken, chainId)
      ).rejects.toThrow('Invalid wallet address');
    });

    it('should reject empty wallet address', async () => {
      await expect(
        getShieldedBalance('', mockToken, chainId)
      ).rejects.toThrow('Invalid wallet address');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return transaction state', async () => {
      const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const result = await getTransactionStatus(mockTxHash);

      expect(result).toBe(TransactionState.COMPLETED);
    });

    it('should reject invalid transaction hash', async () => {
      await expect(
        getTransactionStatus('invalid')
      ).rejects.toThrow('Invalid transaction hash');
    });

    it('should reject short transaction hash', async () => {
      await expect(
        getTransactionStatus('0xabc')
      ).rejects.toThrow('Invalid transaction hash');
    });

    it('should reject empty transaction hash', async () => {
      await expect(
        getTransactionStatus('')
      ).rejects.toThrow('Invalid transaction hash');
    });
  });
});
