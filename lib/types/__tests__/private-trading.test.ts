/**
 * Unit tests for private trading types and interfaces
 */

import {
  SupportedToken,
  TransactionState,
  PrivacyPoolStatus,
  TradeType,
  PrivateTradeConfig,
  PrivateFundsStatus,
  IncognitoWallet,
  ShieldTransaction,
  UnshieldTransaction,
  PrivateTradeSession
} from '../private-trading';

describe('Private Trading Types', () => {
  describe('SupportedToken', () => {
    it('should accept valid token types', () => {
      const tokens: SupportedToken[] = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];
      tokens.forEach(token => {
        expect(['USDC', 'USDT', 'DAI', 'WETH', 'WBTC']).toContain(token);
      });
    });
  });

  describe('TransactionState enum', () => {
    it('should have all expected states', () => {
      expect(TransactionState.IDLE).toBe('idle');
      expect(TransactionState.PENDING).toBe('pending');
      expect(TransactionState.CONFIRMING).toBe('confirming');
      expect(TransactionState.INDEXING).toBe('indexing');
      expect(TransactionState.COMPLETED).toBe('completed');
      expect(TransactionState.FAILED).toBe('failed');
    });
  });

  describe('PrivacyPoolStatus enum', () => {
    it('should have all expected statuses', () => {
      expect(PrivacyPoolStatus.NOT_INITIALIZED).toBe('not_initialized');
      expect(PrivacyPoolStatus.READY).toBe('ready');
      expect(PrivacyPoolStatus.SHIELDING).toBe('shielding');
      expect(PrivacyPoolStatus.UNSHIELDING).toBe('unshielding');
      expect(PrivacyPoolStatus.ERROR).toBe('error');
    });
  });

  describe('TradeType enum', () => {
    it('should have entry and exit types', () => {
      expect(TradeType.ENTRY).toBe('entry');
      expect(TradeType.EXIT).toBe('exit');
    });
  });

  describe('PrivateTradeConfig interface', () => {
    it('should accept valid configuration with required fields', () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5
      };

      expect(config.tradeType).toBe(TradeType.ENTRY);
      expect(config.token).toBe('USDC');
      expect(config.amount).toBe('1000');
      expect(config.slippageTolerance).toBe(0.5);
    });

    it('should accept optional fields', () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.EXIT,
        token: 'WETH',
        amount: '5',
        slippageTolerance: 1.0,
        autoUnshield: true,
        maxIndexingTime: 90
      };

      expect(config.autoUnshield).toBe(true);
      expect(config.maxIndexingTime).toBe(90);
    });

    it('should validate required properties exist', () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000',
        slippageTolerance: 0.5
      };

      expect(config).toHaveProperty('tradeType');
      expect(config).toHaveProperty('token');
      expect(config).toHaveProperty('amount');
      expect(config).toHaveProperty('slippageTolerance');
    });
  });

  describe('PrivateFundsStatus interface', () => {
    it('should accept valid status with all required fields', () => {
      const status: PrivateFundsStatus = {
        shieldedBalance: '1000',
        incognitoBalance: '500',
        mainWalletBalance: '2000',
        privacyPoolStatus: PrivacyPoolStatus.READY,
        isReady: true,
        transactionState: TransactionState.COMPLETED,
        lastUpdated: Date.now()
      };

      expect(status.shieldedBalance).toBe('1000');
      expect(status.incognitoBalance).toBe('500');
      expect(status.mainWalletBalance).toBe('2000');
      expect(status.privacyPoolStatus).toBe(PrivacyPoolStatus.READY);
      expect(status.isReady).toBe(true);
      expect(status.transactionState).toBe(TransactionState.COMPLETED);
      expect(typeof status.lastUpdated).toBe('number');
    });

    it('should accept optional error field', () => {
      const status: PrivateFundsStatus = {
        shieldedBalance: '0',
        incognitoBalance: '0',
        mainWalletBalance: '1000',
        privacyPoolStatus: PrivacyPoolStatus.ERROR,
        isReady: false,
        transactionState: TransactionState.FAILED,
        error: 'Transaction failed',
        lastUpdated: Date.now()
      };

      expect(status.error).toBe('Transaction failed');
    });

    it('should validate all required properties exist', () => {
      const status: PrivateFundsStatus = {
        shieldedBalance: '1000',
        incognitoBalance: '500',
        mainWalletBalance: '2000',
        privacyPoolStatus: PrivacyPoolStatus.READY,
        isReady: true,
        transactionState: TransactionState.COMPLETED,
        lastUpdated: Date.now()
      };

      expect(status).toHaveProperty('shieldedBalance');
      expect(status).toHaveProperty('incognitoBalance');
      expect(status).toHaveProperty('mainWalletBalance');
      expect(status).toHaveProperty('privacyPoolStatus');
      expect(status).toHaveProperty('isReady');
      expect(status).toHaveProperty('transactionState');
      expect(status).toHaveProperty('lastUpdated');
    });
  });

  describe('IncognitoWallet interface', () => {
    it('should accept valid wallet with required fields', () => {
      const wallet: IncognitoWallet = {
        address: '0x1234567890123456789012345678901234567890',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        chainId: 1,
        isActive: true,
        createdAt: Date.now()
      };

      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.mainWalletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.chainId).toBe(1);
      expect(wallet.isActive).toBe(true);
      expect(typeof wallet.createdAt).toBe('number');
    });

    it('should accept optional label field', () => {
      const wallet: IncognitoWallet = {
        address: '0x1234567890123456789012345678901234567890',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        chainId: 1,
        isActive: true,
        createdAt: Date.now(),
        label: 'Trading Wallet 1'
      };

      expect(wallet.label).toBe('Trading Wallet 1');
    });

    it('should validate required properties exist', () => {
      const wallet: IncognitoWallet = {
        address: '0x1234567890123456789012345678901234567890',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        chainId: 1,
        isActive: true,
        createdAt: Date.now()
      };

      expect(wallet).toHaveProperty('address');
      expect(wallet).toHaveProperty('mainWalletAddress');
      expect(wallet).toHaveProperty('chainId');
      expect(wallet).toHaveProperty('isActive');
      expect(wallet).toHaveProperty('createdAt');
    });
  });

  describe('ShieldTransaction interface', () => {
    it('should accept valid shield transaction', () => {
      const tx: ShieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'USDC',
        amount: '1000',
        state: TransactionState.COMPLETED,
        startedAt: Date.now()
      };

      expect(tx.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(tx.token).toBe('USDC');
      expect(tx.amount).toBe('1000');
      expect(tx.state).toBe(TransactionState.COMPLETED);
      expect(typeof tx.startedAt).toBe('number');
    });

    it('should accept optional fields', () => {
      const now = Date.now();
      const tx: ShieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'USDC',
        amount: '1000',
        state: TransactionState.FAILED,
        startedAt: now,
        confirmedAt: now + 1000,
        error: 'Insufficient gas'
      };

      expect(tx.confirmedAt).toBe(now + 1000);
      expect(tx.error).toBe('Insufficient gas');
    });

    it('should validate required properties exist', () => {
      const tx: ShieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'USDC',
        amount: '1000',
        state: TransactionState.PENDING,
        startedAt: Date.now()
      };

      expect(tx).toHaveProperty('txHash');
      expect(tx).toHaveProperty('token');
      expect(tx).toHaveProperty('amount');
      expect(tx).toHaveProperty('state');
      expect(tx).toHaveProperty('startedAt');
    });
  });

  describe('UnshieldTransaction interface', () => {
    it('should accept valid unshield transaction', () => {
      const tx: UnshieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'WETH',
        amount: '5',
        destinationAddress: '0x1234567890123456789012345678901234567890',
        state: TransactionState.COMPLETED,
        startedAt: Date.now()
      };

      expect(tx.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(tx.token).toBe('WETH');
      expect(tx.amount).toBe('5');
      expect(tx.destinationAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(tx.state).toBe(TransactionState.COMPLETED);
      expect(typeof tx.startedAt).toBe('number');
    });

    it('should accept optional fields', () => {
      const now = Date.now();
      const tx: UnshieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'WETH',
        amount: '5',
        destinationAddress: '0x1234567890123456789012345678901234567890',
        state: TransactionState.FAILED,
        startedAt: now,
        completedAt: now + 2000,
        error: 'ZK proof generation failed'
      };

      expect(tx.completedAt).toBe(now + 2000);
      expect(tx.error).toBe('ZK proof generation failed');
    });

    it('should validate required properties exist', () => {
      const tx: UnshieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'WETH',
        amount: '5',
        destinationAddress: '0x1234567890123456789012345678901234567890',
        state: TransactionState.PENDING,
        startedAt: Date.now()
      };

      expect(tx).toHaveProperty('txHash');
      expect(tx).toHaveProperty('token');
      expect(tx).toHaveProperty('amount');
      expect(tx).toHaveProperty('destinationAddress');
      expect(tx).toHaveProperty('state');
      expect(tx).toHaveProperty('startedAt');
    });
  });

  describe('PrivateTradeSession interface', () => {
    it('should accept valid trade session with required fields', () => {
      const session: PrivateTradeSession = {
        sessionId: 'session-123',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        incognitoWallet: {
          address: '0x1234567890123456789012345678901234567890',
          mainWalletAddress: '0x0987654321098765432109876543210987654321',
          chainId: 1,
          isActive: true,
          createdAt: Date.now()
        },
        config: {
          tradeType: TradeType.ENTRY,
          token: 'USDC',
          amount: '1000',
          slippageTolerance: 0.5
        },
        status: {
          shieldedBalance: '1000',
          incognitoBalance: '500',
          mainWalletBalance: '2000',
          privacyPoolStatus: PrivacyPoolStatus.READY,
          isReady: true,
          transactionState: TransactionState.COMPLETED,
          lastUpdated: Date.now()
        },
        startedAt: Date.now()
      };

      expect(session.sessionId).toBe('session-123');
      expect(session.mainWalletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(session.incognitoWallet).toBeDefined();
      expect(session.config).toBeDefined();
      expect(session.status).toBeDefined();
      expect(typeof session.startedAt).toBe('number');
    });

    it('should accept optional transaction fields', () => {
      const shieldTx: ShieldTransaction = {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        token: 'USDC',
        amount: '1000',
        state: TransactionState.COMPLETED,
        startedAt: Date.now()
      };

      const unshieldTx: UnshieldTransaction = {
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        token: 'USDC',
        amount: '1000',
        destinationAddress: '0x1234567890123456789012345678901234567890',
        state: TransactionState.COMPLETED,
        startedAt: Date.now()
      };

      const now = Date.now();
      const session: PrivateTradeSession = {
        sessionId: 'session-123',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        incognitoWallet: {
          address: '0x1234567890123456789012345678901234567890',
          mainWalletAddress: '0x0987654321098765432109876543210987654321',
          chainId: 1,
          isActive: true,
          createdAt: now
        },
        shieldTransaction: shieldTx,
        unshieldTransaction: unshieldTx,
        config: {
          tradeType: TradeType.ENTRY,
          token: 'USDC',
          amount: '1000',
          slippageTolerance: 0.5
        },
        status: {
          shieldedBalance: '1000',
          incognitoBalance: '500',
          mainWalletBalance: '2000',
          privacyPoolStatus: PrivacyPoolStatus.READY,
          isReady: true,
          transactionState: TransactionState.COMPLETED,
          lastUpdated: now
        },
        startedAt: now,
        endedAt: now + 5000
      };

      expect(session.shieldTransaction).toEqual(shieldTx);
      expect(session.unshieldTransaction).toEqual(unshieldTx);
      expect(session.endedAt).toBe(now + 5000);
    });

    it('should validate required properties exist', () => {
      const session: PrivateTradeSession = {
        sessionId: 'session-123',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        incognitoWallet: {
          address: '0x1234567890123456789012345678901234567890',
          mainWalletAddress: '0x0987654321098765432109876543210987654321',
          chainId: 1,
          isActive: true,
          createdAt: Date.now()
        },
        config: {
          tradeType: TradeType.ENTRY,
          token: 'USDC',
          amount: '1000',
          slippageTolerance: 0.5
        },
        status: {
          shieldedBalance: '1000',
          incognitoBalance: '500',
          mainWalletBalance: '2000',
          privacyPoolStatus: PrivacyPoolStatus.READY,
          isReady: true,
          transactionState: TransactionState.COMPLETED,
          lastUpdated: Date.now()
        },
        startedAt: Date.now()
      };

      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('mainWalletAddress');
      expect(session).toHaveProperty('incognitoWallet');
      expect(session).toHaveProperty('config');
      expect(session).toHaveProperty('status');
      expect(session).toHaveProperty('startedAt');
    });
  });

  describe('Type constraints and validation', () => {
    it('should enforce string type for amounts', () => {
      const config: PrivateTradeConfig = {
        tradeType: TradeType.ENTRY,
        token: 'USDC',
        amount: '1000.50',
        slippageTolerance: 0.5
      };

      expect(typeof config.amount).toBe('string');
    });

    it('should enforce number type for numeric fields', () => {
      const wallet: IncognitoWallet = {
        address: '0x1234567890123456789012345678901234567890',
        mainWalletAddress: '0x0987654321098765432109876543210987654321',
        chainId: 1,
        isActive: true,
        createdAt: Date.now()
      };

      expect(typeof wallet.chainId).toBe('number');
      expect(typeof wallet.createdAt).toBe('number');
    });

    it('should enforce boolean type for flags', () => {
      const status: PrivateFundsStatus = {
        shieldedBalance: '1000',
        incognitoBalance: '500',
        mainWalletBalance: '2000',
        privacyPoolStatus: PrivacyPoolStatus.READY,
        isReady: true,
        transactionState: TransactionState.COMPLETED,
        lastUpdated: Date.now()
      };

      expect(typeof status.isReady).toBe('boolean');
    });
  });
});
