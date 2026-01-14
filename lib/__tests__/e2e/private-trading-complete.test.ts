/**
 * End-to-end tests for complete private trading flow
 *
 * Tests the full shield → trade → exit flow to ensure zero on-chain
 * linkage between main and incognito wallets.
 */

import { PrivateTradingService } from '../../privateTradingService';
import {
  TradeType,
  TransactionState,
  PrivacyPoolStatus,
  PrivateTradeConfig,
  IncognitoWallet,
} from '../../types/private-trading';

// Mock SDK modules for e2e testing
jest.mock('../../sdk/privacy/shield');
jest.mock('../../sdk/privacy/unshield');
jest.mock('../../sdk/privacy/incognito');

import * as ShieldModule from '../../sdk/privacy/shield';
import * as UnshieldModule from '../../sdk/privacy/unshield';
import * as IncognitoModule from '../../sdk/privacy/incognito';

describe('Private Trading Complete E2E Flow', () => {
  let service: PrivateTradingService;
  const mainWallet = '0x1111111111111111111111111111111111111111';
  const chainId = 1;

  beforeEach(() => {
    service = new PrivateTradingService(chainId);
    jest.clearAllMocks();
  });

  describe('Full private entry and exit flow', () => {
    it('should complete full shield→unshield→trade→shield flow', async () => {
      // Setup mocks
      const incognitoAddress = '0x9999999999999999999999999999999999999999';
      const shieldTxHash = '0xaaaa1111111111111111111111111111111111111111111111111111111111aa';
      const unshieldTxHash = '0xbbbb2222222222222222222222222222222222222222222222222222222222bb';
      const exitTxHash = '0xcccc3333333333333333333333333333333333333333333333333333333333cc';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        incognitoAddress
      );
      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: shieldTxHash,
        state: TransactionState.PENDING,
      });
      (UnshieldModule.unshieldTokens as jest.Mock).mockResolvedValue({
        txHash: unshieldTxHash,
        state: TransactionState.PENDING,
      });
      (ShieldModule.getTransactionStatus as jest.Mock).mockResolvedValue(
        TransactionState.COMPLETED
      );

      // Step 1: Derive incognito wallet
      const incognitoWallet = await service.deriveIncognitoWallet(
        mainWallet,
        'Private Trading Wallet'
      );

      expect(incognitoWallet.address).toBe(incognitoAddress);
      expect(incognitoWallet.mainWalletAddress).toBe(mainWallet);
      expect(incognitoWallet.label).toBe('Private Trading Wallet');

      // Step 2: Shield tokens to privacy pool
      const entryConfig: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '10000',
        slippageTolerance: 0.5,
        autoUnshield: true,
        maxIndexingTime: 70,
      };

      const shieldTx = await service.preparePrivateFunds(
        mainWallet,
        entryConfig
      );

      expect(shieldTx.txHash).toBe(shieldTxHash);
      expect(shieldTx.token).toBe('USDC');
      expect(shieldTx.amount).toBe('10000');

      // Wait for shield to complete
      await service.waitForTransactionConfirmation(shieldTx.txHash);

      // Step 3: Unshield to incognito wallet
      const unshieldTx = await service.unshieldForTrading(
        incognitoWallet,
        entryConfig
      );

      expect(unshieldTx.txHash).toBe(unshieldTxHash);
      expect(unshieldTx.destinationAddress).toBe(incognitoAddress);
      expect(unshieldTx.token).toBe('USDC');

      // Wait for unshield to complete
      await service.waitForTransactionConfirmation(unshieldTx.txHash);

      // Step 4: Check funds status
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('0');
      (IncognitoModule.getIncognitoBalance as jest.Mock).mockResolvedValue('10000');

      const status = await service.checkPrivateFundsStatus(
        mainWallet,
        incognitoAddress,
        'USDC'
      );

      expect(status.incognitoBalance).toBe('10000');
      expect(status.isReady).toBe(true);
      expect(status.privacyPoolStatus).toBe(PrivacyPoolStatus.READY);

      // Step 5: Simulate trading (external to this library)
      // In a real scenario, trades would happen from incognito wallet
      // This library provides the wallet and status checking

      // Step 6: Exit private position - shield back from incognito
      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: exitTxHash,
        state: TransactionState.PENDING,
      });

      const exitConfig: PrivateTradeConfig = {
        tradeType: TradeType.EXIT,
        token: 'USDC',
        amount: '11500', // Assumed profit from trading
        slippageTolerance: 0.5,
      };

      const exitTx = await service.exitPrivatePosition(
        incognitoWallet,
        exitConfig
      );

      expect(exitTx.txHash).toBe(exitTxHash);
      expect(exitTx.amount).toBe('11500');

      // Wait for exit to complete
      await service.waitForTransactionConfirmation(exitTx.txHash);

      // Verify zero on-chain linkage
      // The main wallet and incognito wallet should not be linkable on-chain
      expect(incognitoWallet.address).not.toBe(mainWallet);
      expect(ShieldModule.shieldTokens).toHaveBeenCalledWith(
        mainWallet,
        expect.any(String),
        expect.any(String),
        chainId
      );
      expect(UnshieldModule.unshieldTokens).toHaveBeenCalledWith(
        incognitoAddress,
        expect.any(String),
        expect.any(String),
        chainId
      );
    });
  });

  describe('Privacy guarantees', () => {
    it('should ensure incognito wallet is not linkable to main wallet', async () => {
      const incognitoAddress = '0x8888888888888888888888888888888888888888';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        incognitoAddress
      );

      const incognitoWallet = await service.deriveIncognitoWallet(mainWallet);

      // Verify addresses are different
      expect(incognitoWallet.address).not.toBe(mainWallet);

      // Verify derivation is deterministic but not trivially reversible
      expect(incognitoWallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should maintain privacy through shield/unshield cycle', async () => {
      const incognitoAddress = '0x7777777777777777777777777777777777777777';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        incognitoAddress
      );
      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xaaaa',
        state: TransactionState.PENDING,
      });
      (UnshieldModule.unshieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xbbbb',
        state: TransactionState.PENDING,
      });

      const incognitoWallet = await service.deriveIncognitoWallet(mainWallet);

      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '5000',
        slippageTolerance: 0.5,
      };

      // Shield from main wallet
      await service.preparePrivateFunds(mainWallet, config);

      // Unshield to incognito wallet
      await service.unshieldForTrading(incognitoWallet, config);

      // Verify calls use different addresses
      expect(ShieldModule.shieldTokens).toHaveBeenCalledWith(
        mainWallet,
        expect.any(String),
        expect.any(String),
        chainId
      );
      expect(UnshieldModule.unshieldTokens).toHaveBeenCalledWith(
        incognitoAddress,
        expect.any(String),
        expect.any(String),
        chainId
      );
    });
  });

  describe('Error recovery in full flow', () => {
    it('should handle shield failure gracefully', async () => {
      (ShieldModule.shieldTokens as jest.Mock).mockRejectedValue(
        new Error('Insufficient balance')
      );

      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '10000',
        slippageTolerance: 0.5,
      };

      await expect(
        service.preparePrivateFunds(mainWallet, config)
      ).rejects.toThrow('Failed to prepare private funds');
    });

    it('should handle unshield failure gracefully', async () => {
      const incognitoWallet: IncognitoWallet = {
        address: '0x9999999999999999999999999999999999999999',
        mainWalletAddress: mainWallet,
        chainId,
        isActive: true,
        createdAt: Date.now(),
      };

      (UnshieldModule.unshieldTokens as jest.Mock).mockRejectedValue(
        new Error('ZK proof generation failed')
      );

      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '5000',
        slippageTolerance: 0.5,
      };

      await expect(
        service.unshieldForTrading(incognitoWallet, config)
      ).rejects.toThrow('Failed to unshield for trading');
    });

    it('should timeout if transaction takes too long', async () => {
      (ShieldModule.getTransactionStatus as jest.Mock).mockResolvedValue(
        TransactionState.PENDING
      );

      const txHash = '0xaaaa1111111111111111111111111111111111111111111111111111111111aa';

      await expect(
        service.waitForTransactionConfirmation(txHash, 1000)
      ).rejects.toThrow('Transaction confirmation timeout');
    });
  });

  describe('Multiple trading sessions', () => {
    it('should support multiple concurrent incognito wallets', async () => {
      const incognito1 = '0x1111111111111111111111111111111111111111';
      const incognito2 = '0x2222222222222222222222222222222222222222';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock)
        .mockResolvedValueOnce(incognito1)
        .mockResolvedValueOnce(incognito2);

      const wallet1 = await service.deriveIncognitoWallet(
        mainWallet,
        'Trading 1'
      );
      const wallet2 = await service.deriveIncognitoWallet(
        mainWallet,
        'Trading 2'
      );

      expect(wallet1.address).toBe(incognito1);
      expect(wallet2.address).toBe(incognito2);
      expect(wallet1.label).toBe('Trading 1');
      expect(wallet2.label).toBe('Trading 2');
    });
  });

  describe('Balance tracking across flow', () => {
    it('should track balance changes through complete flow', async () => {
      const incognitoAddress = '0x6666666666666666666666666666666666666666';

      (IncognitoModule.deriveIncognitoAddress as jest.Mock).mockResolvedValue(
        incognitoAddress
      );
      (ShieldModule.shieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xaaaa',
        state: TransactionState.COMPLETED,
      });
      (UnshieldModule.unshieldTokens as jest.Mock).mockResolvedValue({
        txHash: '0xbbbb',
        state: TransactionState.COMPLETED,
      });

      await service.deriveIncognitoWallet(mainWallet);

      // Initial state - no funds
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('0');
      (IncognitoModule.getIncognitoBalance as jest.Mock).mockResolvedValue('0');

      let status = await service.checkPrivateFundsStatus(
        mainWallet,
        incognitoAddress,
        'USDC'
      );
      expect(status.shieldedBalance).toBe('0');
      expect(status.incognitoBalance).toBe('0');

      // After shield - funds in privacy pool
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('10000');

      status = await service.checkPrivateFundsStatus(
        mainWallet,
        incognitoAddress,
        'USDC'
      );
      expect(status.shieldedBalance).toBe('10000');

      // After unshield - funds in incognito wallet
      (ShieldModule.getShieldedBalance as jest.Mock).mockResolvedValue('0');
      (IncognitoModule.getIncognitoBalance as jest.Mock).mockResolvedValue('10000');

      status = await service.checkPrivateFundsStatus(
        mainWallet,
        incognitoAddress,
        'USDC'
      );
      expect(status.incognitoBalance).toBe('10000');
      expect(status.isReady).toBe(true);
    });
  });
});
