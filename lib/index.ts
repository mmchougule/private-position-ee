/**
 * Private Position Entry/Exit Library
 *
 * Core types and services for private trading using privacy pools
 */

// Export all types and interfaces
export {
  // Type aliases
  SupportedToken,

  // Enums
  TransactionState,
  PrivacyPoolStatus,
  TradeType,
  PrivateTradeMode,

  // Interfaces
  PrivateTradeConfig,
  PrivateFundsStatus,
  IncognitoWallet,
  ShieldTransaction,
  UnshieldTransaction,
  PrivateTradeSession,
  PrivateTradeDialogProps,
} from './types/private-trading';

// Export services
export { PrivateTradingService } from './privateTradingService';

// Export SDK modules
export * as ShieldModule from './sdk/privacy/shield';
export * as UnshieldModule from './sdk/privacy/unshield';
export * as IncognitoModule from './sdk/privacy/incognito';
