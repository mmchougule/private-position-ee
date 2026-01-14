/**
 * Unit tests for unshield module
 */

import {
  unshieldTokens,
  getUnshieldStatus,
} from '../unshield';
import { TransactionState } from '../../../types/private-trading';

describe('Unshield Module', () => {
  const mockDestinationAddress = '0x1234567890123456789012345678901234567890';
  const mockToken = 'WETH' as const;
  const chainId = 1;

  describe('unshieldTokens', () => {
    it('should return transaction details when unshielding tokens', async () => {
      const result = await unshieldTokens(
        mockDestinationAddress,
        mockToken,
        '5',
        chainId
      );

      expect(result).toHaveProperty('txHash');
      expect(result).toHaveProperty('state');
      expect(result.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(result.state).toBe(TransactionState.PENDING);
    });

    it('should reject invalid destination address', async () => {
      await expect(
        unshieldTokens('invalid', mockToken, '5', chainId)
      ).rejects.toThrow('Invalid destination address');
    });

    it('should reject empty destination address', async () => {
      await expect(
        unshieldTokens('', mockToken, '5', chainId)
      ).rejects.toThrow('Invalid destination address');
    });

    it('should reject invalid amount', async () => {
      await expect(
        unshieldTokens(mockDestinationAddress, mockToken, '0', chainId)
      ).rejects.toThrow('Invalid amount');
    });

    it('should reject negative amount', async () => {
      await expect(
        unshieldTokens(mockDestinationAddress, mockToken, '-10', chainId)
      ).rejects.toThrow('Invalid amount');
    });

    it('should reject empty amount', async () => {
      await expect(
        unshieldTokens(mockDestinationAddress, mockToken, '', chainId)
      ).rejects.toThrow('Invalid amount');
    });
  });

  describe('getUnshieldStatus', () => {
    it('should return transaction state', async () => {
      const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const result = await getUnshieldStatus(mockTxHash);

      expect(result).toBe(TransactionState.COMPLETED);
    });

    it('should reject invalid transaction hash', async () => {
      await expect(
        getUnshieldStatus('invalid')
      ).rejects.toThrow('Invalid transaction hash');
    });

    it('should reject short transaction hash', async () => {
      await expect(
        getUnshieldStatus('0xabc')
      ).rejects.toThrow('Invalid transaction hash');
    });

    it('should reject empty transaction hash', async () => {
      await expect(
        getUnshieldStatus('')
      ).rejects.toThrow('Invalid transaction hash');
    });
  });
});
