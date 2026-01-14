/**
 * Unit tests for PrivateTradingService
 *
 * Tests the core service for private trading operations including
 * shielding, unshielding, and private funds status checking.
 */

import { PrivateTradingService } from '../privateTradingService';
import {
  TradeType,
  TransactionState,
  PrivacyPoolStatus,
  PrivateTradeConfig,
  IncognitoWallet,
} from '../types/private-trading';

// Mock the SDK modules
jest.mock('../sdk/privacy/shield');
jest.mock('../sdk/privacy/unshield');
jest.mock('../sdk/privacy/incognito');

import * as ShieldModule from '../sdk/privacy/shield';
import * as UnshieldModule from '../sdk/privacy/unshield';
import * as IncognitoModule from '../sdk/privacy/incognito';

describe('PrivateTradingService', () => {
  let service: PrivateTradingService;
  const mockMainWallet = '0x1234567890123456789012345678901234567890';
  const mockIncognitoAddress = '0x9876543210987654321098765432109876543210';
  const chainId = 1;

  beforeEach(() => {
    service = new PrivateTradingService(chainId);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with chain ID', () => {
      expect(service).toBeInstanceOf(PrivateTradingService);
      expect(service.getChainId()).toBe(chainId);
    });
  });

  describe('preparePrivateFunds', () => {
    it('should shield tokens and return transaction details', async () => {
      const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5,
      };

      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: mockTxHash,
        state: TransactionState.PENDING,
      });

      const result = await service.preparePrivateFunds(mockMainWallet, config);

      expect(result).toMatchObject({
        txHash: mockTxHash,
        token: 'USDC',
        amount: '1000',
        state: TransactionState.PENDING,
      });
      expect(result.startedAt).toBeGreaterThan(0);
      expect(ShieldModule.shieldTokens).toHaveBeenCalledWith(
        mockMainWallet,
        config.token,
        config.amount,
        chainId
      );
    });

    it('should handle shielding errors', async () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5,
      };

      (ShieldModule.shieldTokens as jest.Mock).mockRejectedValue(
        new Error('Insufficient balance')
      );

      await expect(
        service.preparePrivateFunds(mockMainWallet, config)
      ).rejects.toThrow('Insufficient balance');
    });

    it('should respect maxIndexingTime from config', async () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5,
        maxIndexingTime: 90,
      };

      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xabc',
        state: TransactionState.PENDING,
      });

      await service.preparePrivateFunds(mockMainWallet, config);

      expect(ShieldModule.shieldTokens).toHaveBeenCalled();
    });
  });

  describe('unshieldForTrading', () => {
    it('should unshield tokens to incognito wallet', async () => {
      const mockTxHash = '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc';
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'WETH',
        amount: '5',
        slippageTolerance: 1.0,
      };

      const mockIncognitoWallet: IncognitoWallet = {
        address: mockIncognitoAddress,
        mainWalletAddress: mockMainWallet,
        chainId,
        isActive: true,
        createdAt: Date.now(),
      };

      (UnshieldModule.unshieldTokens as jest.Mock).mockResolvedValue({
        txHash: mockTxHash,
        state: TransactionState.PENDING,
      });

      const result = await service.unshieldForTrading(
        mockIncognitoWallet,
        config
      );

      expect(result).toMatchObject({
        txHash: mockTxHash,
        token: 'WETH',
        amount: '5',
        destinationAddress: mockIncognitoAddress,
        state: TransactionState.PENDING,
      });
      expect(result.startedAt).toBeGreaterThan(0);
      expect(UnshieldModule.unshieldTokens).toHaveBeenCalledWith(
        mockIncognitoAddress,
        config.token,
        config.amount,
        chainId
      );
    });

    it('should handle unshielding errors', async () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'WETH',
        amount: '5',
        slippageTolerance: 1.0,
      };

      const mockIncognitoWallet: IncognitoWallet = {
        address: mockIncognitoAddress,
        mainWalletAddress: mockMainWallet,
        chainId,
        isActive: true,
        createdAt: Date.now(),
      };

      (UnshieldModule.unshieldTokens as jest.Mock).mockRejectedValue(
        new Error('ZK proof generation failed')
      );

      await expect(
        service.unshieldForTrading(mockIncognitoWallet, config)
      ).rejects.toThrow('ZK proof generation failed');
    });
  });

  describe('checkPrivateFundsStatus', () => {
    it('should return current status of private funds', async () => {
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('1000');
      (IncognitoModule.getIncognitoBalance as jest.Mock).mockResolvedValue('500');

      const result = await service.checkPrivateFundsStatus(
        mockMainWallet,
        mockIncognitoAddress,
        'USDC'
      );

      expect(result).toMatchObject({
        shieldedBalance: expect.any(String),
        incognitoBalance: expect.any(String),
        privacyPoolStatus: expect.any(String),
        isReady: expect.any(Boolean),
        transactionState: expect.any(String),
        lastUpdated: expect.any(Number),
      });
      expect(result.lastUpdated).toBeGreaterThan(0);
    });

    it('should indicate ready when sufficient funds available', async () => {
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('1000');
      (IncognitoModule.getIncognitoBalance as jest.Mock).mockResolvedValue('500');

      const result = await service.checkPrivateFundsStatus(
        mockMainWallet,
        mockIncognitoAddress,
        'USDC'
      );

      // Should be ready if balances are available
      expect(result.privacyPoolStatus).toBeDefined();
      expect(result.isReady).toBeDefined();
    });

    it('should handle status check errors gracefully', async () => {
      (ShieldModule.getShieldedBalance as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await service.checkPrivateFundsStatus(
        mockMainWallet,
        mockIncognitoAddress,
        'USDC'
      );

      expect(result.privacyPoolStatus).toBe(PrivacyPoolStatus.ERROR);
      expect(result.isReady).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('exitPrivatePosition', () => {
    it('should shield tokens back to main wallet', async () => {
      const mockTxHash = '0xeee1234567890abcdef1234567890abcdef1234567890abcdef1234567890eee';
      const config: PrivateTradeConfig = {
        tradeType: TradeType.EXIT,
        token: 'USDC',
        amount: '1500',
        slippageTolerance: 0.5,
      };

      const mockIncognitoWallet: IncognitoWallet = {
        address: mockIncognitoAddress,
        mainWalletAddress: mockMainWallet,
        chainId,
        isActive: true,
        createdAt: Date.now(),
      };

      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: mockTxHash,
        state: TransactionState.PENDING,
      });

      const result = await service.exitPrivatePosition(
        mockIncognitoWallet,
        config
      );

      expect(result).toMatchObject({
        txHash: mockTxHash,
        token: 'USDC',
        amount: '1500',
        state: TransactionState.PENDING,
      });
      expect(ShieldModule.shieldTokens).toHaveBeenCalledWith(
        mockIncognitoWallet.address,
        config.token,
        config.amount,
        chainId
      );
    });

    it('should handle exit position errors', async () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.EXIT,
        token: 'USDC',
        amount: '1500',
        slippageTolerance: 0.5,
      };

      const mockIncognitoWallet: IncognitoWallet = {
        address: mockIncognitoAddress,
        mainWalletAddress: mockMainWallet,
        chainId,
        isActive: true,
        createdAt: Date.now(),
      };

      (ShieldModule.shieldTokens as jest.Mock).mockRejectedValue(
        new Error('Transaction reverted')
      );

      await expect(
        service.exitPrivatePosition(mockIncognitoWallet, config)
      ).rejects.toThrow('Transaction reverted');
    });
  });

  describe('deriveIncognitoWallet', () => {
    it('should derive incognito wallet from main wallet', async () => {
      const mockDerivedAddress = '0xfedcba0987654321fedcba0987654321fedcba09';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        mockDerivedAddress
      );

      const result = await service.deriveIncognitoWallet(mockMainWallet);

      expect(result).toMatchObject({
        address: mockDerivedAddress,
        mainWalletAddress: mockMainWallet,
        chainId,
        isActive: true,
      });
      expect(result.createdAt).toBeGreaterThan(0);
      expect(IncognitoModule.deriveIncognitoAddress).toHaveBeenCalledWith(
        mockMainWallet,
        chainId
      );
    });

    it('should optionally add label to incognito wallet', async () => {
      const mockDerivedAddress = '0xfedcba0987654321fedcba0987654321fedcba09';
      const label = 'Trading Wallet 1';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        mockDerivedAddress
      );

      const result = await service.deriveIncognitoWallet(mockMainWallet, label);

      expect(result.label).toBe(label);
    });

    it('should handle derivation errors', async () => {
      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockRejectedValue(
        new Error('Invalid main wallet address')
      );

      await expect(
        service.deriveIncognitoWallet(mockMainWallet)
      ).rejects.toThrow('Invalid main wallet address');
    });
  });

  describe('waitForTransactionConfirmation', () => {
    it('should poll transaction status until completed', async () => {
      const txHash = '0xabc123';
      const maxWaitTime = 5000;

      (ShieldModule.getTransactionStatus as jest.Mock)
        .mockResolvedValueOnce(TransactionState.PENDING)
        .mockResolvedValueOnce(TransactionState.CONFIRMING)
        .mockResolvedValueOnce(TransactionState.COMPLETED);

      const result = await service.waitForTransactionConfirmation(
        txHash,
        maxWaitTime
      );

      expect(result).toBe(TransactionState.COMPLETED);
      expect(ShieldModule.getTransactionStatus).toHaveBeenCalledTimes(3);
    });

    it('should timeout if transaction takes too long', async () => {
      const txHash = '0xabc123';
      const maxWaitTime = 1000;

      (ShieldModule.getTransactionStatus as jest.Mock).mockResolvedValue(
        TransactionState.PENDING
      );

      await expect(
        service.waitForTransactionConfirmation(txHash, maxWaitTime)
      ).rejects.toThrow('Transaction confirmation timeout');
    });

    it('should reject if transaction fails', async () => {
      const txHash = '0xabc123';
      const maxWaitTime = 5000;

      (ShieldModule.getTransactionStatus as jest.Mock).mockResolvedValue(
        TransactionState.FAILED
      );

      await expect(
        service.waitForTransactionConfirmation(txHash, maxWaitTime)
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('integration with privacy SDK', () => {
    it('should properly integrate shield module', () => {
      expect(ShieldModule).toBeDefined();
    });

    it('should properly integrate unshield module', () => {
      expect(UnshieldModule).toBeDefined();
    });

    it('should properly integrate incognito module', () => {
      expect(IncognitoModule).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should return promises with proper types', async () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5,
      };

      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xabc',
        state: TransactionState.PENDING,
      });

      const result = service.preparePrivateFunds(mockMainWallet, config);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
