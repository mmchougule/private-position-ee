/**
 * Private Trading Types and Interfaces
 *
 * Core types for privacy pool integration, incognito wallet management,
 * and private trade flows using Railgun privacy pools.
 */

/**
 * Supported tokens for private trading
 */
export type SupportedToken = 'USDC' | 'USDT' | 'DAI' | 'WETH' | 'WBTC';

/**
 * Transaction states for shield/unshield operations
 */
export enum TransactionState {
  IDLE = 'idle',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  INDEXING = 'indexing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Privacy pool status
 */
export enum PrivacyPoolStatus {
  NOT_INITIALIZED = 'not_initialized',
  READY = 'ready',
  SHIELDING = 'shielding',
  UNSHIELDING = 'unshielding',
  ERROR = 'error'
}

/**
 * Trade type for private trading
 */
export enum TradeType {
  ENTRY = 'entry',
  EXIT = 'exit'
}

/**
 * Configuration for private trade operations
 */
export interface PrivateTradeConfig {
  /**
   * Type of trade (entry or exit)
   */
  tradeType: TradeType;

  /**
   * Token to trade
   */
  token: SupportedToken;

  /**
   * Amount to trade (in token units)
   */
  amount: string;

  /**
   * Slippage tolerance (percentage, e.g., 0.5 for 0.5%)
   */
  slippageTolerance: number;

  /**
   * Whether to auto-unshield after shielding
   */
  autoUnshield?: boolean;

  /**
   * Maximum time to wait for UTXO indexing (in seconds)
   * Default: 70 seconds
   */
  maxIndexingTime?: number;
}

/**
 * Status of private funds in the system
 */
export interface PrivateFundsStatus {
  /**
   * Balance in the privacy pool (shielded)
   */
  shieldedBalance: string;

  /**
   * Balance in the incognito wallet
   */
  incognitoBalance: string;

  /**
   * Balance in the main wallet
   */
  mainWalletBalance: string;

  /**
   * Current privacy pool status
   */
  privacyPoolStatus: PrivacyPoolStatus;

  /**
   * Whether the system is ready for private trading
   */
  isReady: boolean;

  /**
   * Current transaction state
   */
  transactionState: TransactionState;

  /**
   * Optional error message
   */
  error?: string;

  /**
   * Timestamp of last update
   */
  lastUpdated: number;
}

/**
 * Incognito wallet configuration and details
 */
export interface IncognitoWallet {
  /**
   * Derived incognito wallet address
   */
  address: string;

  /**
   * Main wallet address that derived this incognito wallet
   */
  mainWalletAddress: string;

  /**
   * Chain ID for the network
   */
  chainId: number;

  /**
   * Whether this wallet is currently active for trading
   */
  isActive: boolean;

  /**
   * Timestamp when this wallet was created
   */
  createdAt: number;

  /**
   * Optional label for this wallet
   */
  label?: string;
}

/**
 * Shield transaction details
 */
export interface ShieldTransaction {
  /**
   * Transaction hash
   */
  txHash: string;

  /**
   * Token being shielded
   */
  token: SupportedToken;

  /**
   * Amount being shielded
   */
  amount: string;

  /**
   * Current transaction state
   */
  state: TransactionState;

  /**
   * Timestamp when shielding started
   */
  startedAt: number;

  /**
   * Timestamp when transaction was confirmed (if applicable)
   */
  confirmedAt?: number;

  /**
   * Error message if transaction failed
   */
  error?: string;
}

/**
 * Unshield transaction details
 */
export interface UnshieldTransaction {
  /**
   * Transaction hash
   */
  txHash: string;

  /**
   * Token being unshielded
   */
  token: SupportedToken;

  /**
   * Amount being unshielded
   */
  amount: string;

  /**
   * Destination address (incognito wallet)
   */
  destinationAddress: string;

  /**
   * Current transaction state
   */
  state: TransactionState;

  /**
   * Timestamp when unshielding started
   */
  startedAt: number;

  /**
   * Timestamp when transaction was completed (if applicable)
   */
  completedAt?: number;

  /**
   * Error message if transaction failed
   */
  error?: string;
}

/**
 * Private trade session details
 */
export interface PrivateTradeSession {
  /**
   * Unique session ID
   */
  sessionId: string;

  /**
   * Main wallet address
   */
  mainWalletAddress: string;

  /**
   * Incognito wallet being used
   */
  incognitoWallet: IncognitoWallet;

  /**
   * Shield transaction (if applicable)
   */
  shieldTransaction?: ShieldTransaction;

  /**
   * Unshield transaction (if applicable)
   */
  unshieldTransaction?: UnshieldTransaction;

  /**
   * Trade configuration
   */
  config: PrivateTradeConfig;

  /**
   * Current status
   */
  status: PrivateFundsStatus;

  /**
   * Timestamp when session started
   */
  startedAt: number;

  /**
   * Timestamp when session ended (if applicable)
   */
  endedAt?: number;
}

/**
 * Private trade mode for UI components
 */
export enum PrivateTradeMode {
  SHIELD = 'shield',
  PREPARE = 'prepare',
  UNSHIELD = 'unshield',
  TRADE = 'trade',
  EXIT = 'exit'
}

/**
 * Props for private trade dialog component
 * For use in UI implementations that consume this library
 */
export interface PrivateTradeDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Current trade mode/step
   */
  mode: PrivateTradeMode;

  /**
   * Current trade session (if active)
   */
  session?: PrivateTradeSession;

  /**
   * Callback when dialog is closed
   */
  onClose: () => void;

  /**
   * Callback when trade is initiated
   */
  onTradeInitiated?: (config: PrivateTradeConfig) => void;

  /**
   * Callback when trade is completed
   */
  onTradeCompleted?: (session: PrivateTradeSession) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: string) => void;
}
