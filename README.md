# Private Position Entry/Exit Library

A TypeScript library for private trading operations using privacy pools. Enables zero-knowledge position entry and exit with incognito wallet management, ensuring on-chain privacy for trading activities.

## Features

- **Privacy Pool Integration**: Shield and unshield tokens through privacy pools
- **Incognito Wallet Management**: Derive privacy-preserving wallets from main wallets
- **Complete Trading Flow**: Support for entry, trading, and exit phases
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Well-Tested**: 90+ tests with >90% coverage
- **Modular Architecture**: Separated concerns for shield, unshield, and wallet operations

## Installation

```bash
npm install private-position-ee
```

## Quick Start

```typescript
import { PrivateTradingService, TradeType } from 'private-position-ee';

// Initialize service
const service = new PrivateTradingService(1); // Chain ID 1 for Ethereum mainnet

// Derive incognito wallet
const incognitoWallet = await service.deriveIncognitoWallet(
  mainWalletAddress,
  'My Private Trading Wallet'
);

// Shield tokens to privacy pool
const config = {
  tradeType: TradeType.ENTRY,
  token: 'USDC',
  amount: '10000',
  slippageTolerance: 0.5,
};

const shieldTx = await service.preparePrivateFunds(mainWalletAddress, config);

// Wait for confirmation
await service.waitForTransactionConfirmation(shieldTx.txHash);

// Unshield to incognito wallet for trading
const unshieldTx = await service.unshieldForTrading(incognitoWallet, config);

// Check status
const status = await service.checkPrivateFundsStatus(
  mainWalletAddress,
  incognitoWallet.address,
  'USDC'
);

console.log('Ready to trade:', status.isReady);
```

## Core Concepts

### Privacy Flow

1. **Shield**: Transfer tokens from main wallet to privacy pool
2. **Unshield**: Transfer tokens from privacy pool to incognito wallet
3. **Trade**: Execute trades using incognito wallet (external to this library)
4. **Exit**: Shield tokens back from incognito wallet to privacy pool
5. **Withdraw**: Unshield to main wallet (completes the cycle)

### Zero-Knowledge Privacy

The library ensures:
- No on-chain linkage between main and incognito wallets
- Deterministic but non-reversible wallet derivation
- Privacy-preserving balance queries
- Separation of trading activity from main wallet identity

## API Reference

### PrivateTradingService

Main service class for private trading operations.

#### Constructor

```typescript
new PrivateTradingService(chainId: number)
```

#### Methods

##### `deriveIncognitoWallet(mainWalletAddress: string, label?: string): Promise<IncognitoWallet>`

Derives an incognito wallet from a main wallet address.

```typescript
const wallet = await service.deriveIncognitoWallet(
  '0x1234...',
  'Trading Wallet'
);
```

##### `preparePrivateFunds(mainWalletAddress: string, config: PrivateTradeConfig): Promise<ShieldTransaction>`

Shields tokens from main wallet into privacy pool.

```typescript
const tx = await service.preparePrivateFunds(mainWallet, {
  tradeType: TradeType.ENTRY,
  token: 'USDC',
  amount: '1000',
  slippageTolerance: 0.5,
});
```

##### `unshieldForTrading(incognitoWallet: IncognitoWallet, config: PrivateTradeConfig): Promise<UnshieldTransaction>`

Unshields tokens from privacy pool to incognito wallet.

```typescript
const tx = await service.unshieldForTrading(incognitoWallet, config);
```

##### `checkPrivateFundsStatus(mainWalletAddress: string, incognitoAddress: string, token: SupportedToken): Promise<PrivateFundsStatus>`

Checks the current status of funds across all locations.

```typescript
const status = await service.checkPrivateFundsStatus(
  mainWallet,
  incognitoAddress,
  'USDC'
);
```

##### `exitPrivatePosition(incognitoWallet: IncognitoWallet, config: PrivateTradeConfig): Promise<ShieldTransaction>`

Shields tokens back from incognito wallet to privacy pool.

```typescript
const tx = await service.exitPrivatePosition(incognitoWallet, {
  tradeType: TradeType.EXIT,
  token: 'USDC',
  amount: '1500',
  slippageTolerance: 0.5,
});
```

##### `waitForTransactionConfirmation(txHash: string, maxWaitTime?: number): Promise<TransactionState>`

Waits for a transaction to be confirmed and indexed.

```typescript
await service.waitForTransactionConfirmation(tx.txHash, 70000);
```

### Types

All core types are exported from the main package:

```typescript
import {
  SupportedToken,
  TransactionState,
  PrivacyPoolStatus,
  TradeType,
  PrivateTradeMode,
  PrivateTradeConfig,
  PrivateFundsStatus,
  IncognitoWallet,
  ShieldTransaction,
  UnshieldTransaction,
  PrivateTradeSession,
  PrivateTradeDialogProps,
} from 'private-position-ee';
```

### SDK Modules

Low-level SDK modules are also exported:

```typescript
import {
  ShieldModule,
  UnshieldModule,
  IncognitoModule,
} from 'private-position-ee';
```

## Configuration

### Environment Variables

The library requires the following environment setup:

```bash
# Network Configuration
CHAIN_ID=1                    # Network chain ID (1 for Ethereum mainnet)

# Privacy Pool Configuration
PRIVACY_POOL_ADDRESS=0x...    # Address of the privacy pool contract
PRIVACY_POOL_INDEXING_TIME=70 # Max time to wait for UTXO indexing (seconds)

# Wallet Configuration
MAIN_WALLET_PROVIDER=...      # Web3 provider for main wallet
```

### Supported Tokens

Currently supported tokens for private trading:
- USDC
- USDT
- DAI
- WETH
- WBTC

### Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build
npm run build

# Type check
npm run type-check
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- privateTradingService.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Project Structure

```
lib/
├── types/                      # Type definitions
│   ├── private-trading.ts      # Core types
│   └── __tests__/
│       └── private-trading.test.ts
├── sdk/                        # Privacy SDK modules
│   └── privacy/
│       ├── shield.ts           # Shield operations
│       ├── unshield.ts         # Unshield operations
│       ├── incognito.ts        # Incognito wallet management
│       └── __tests__/
│           ├── shield.test.ts
│           ├── unshield.test.ts
│           └── incognito.test.ts
├── privateTradingService.ts    # Main service class
├── index.ts                    # Public API exports
└── __tests__/
    ├── privateTradingService.test.ts
    └── e2e/
        └── private-trading-complete.test.ts
```

## Troubleshooting

### Common Issues

#### Issue: "Insufficient balance" error during shield

**Cause**: Main wallet doesn't have enough tokens or gas.

**Solution**: Ensure main wallet has sufficient token balance and ETH for gas fees.

```typescript
// Check balance before shielding
const balance = await checkTokenBalance(mainWallet, token);
if (parseFloat(balance) < parseFloat(amount)) {
  throw new Error('Insufficient token balance');
}
```

#### Issue: "Transaction confirmation timeout"

**Cause**: Network congestion or insufficient gas price.

**Solution**: Increase the max waiting time or check gas prices.

```typescript
// Increase timeout
await service.waitForTransactionConfirmation(txHash, 120000); // 120 seconds

// Or handle timeout gracefully
try {
  await service.waitForTransactionConfirmation(txHash, 70000);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Retry or notify user
    console.log('Transaction is still pending, please check status manually');
  }
}
```

#### Issue: "ZK proof generation failed"

**Cause**: Privacy pool indexing not complete or network issues.

**Solution**: Wait for indexing to complete before unshielding.

```typescript
const config = {
  tradeType: TradeType.ENTRY,
  token: 'USDC',
  amount: '1000',
  slippageTolerance: 0.5,
  maxIndexingTime: 90, // Increase indexing wait time
};
```

#### Issue: "Invalid incognito address"

**Cause**: Attempting to use an address that wasn't properly derived.

**Solution**: Always use `deriveIncognitoWallet` to create incognito wallets.

```typescript
// Correct
const incognito = await service.deriveIncognitoWallet(mainWallet);

// Incorrect - don't create addresses manually
const incognito = { address: '0x...' }; // ❌ Don't do this
```

### Privacy Pool Integration Issues

#### Issue: Privacy pool not initialized

**Solution**: Ensure privacy pool contract is deployed and configured correctly.

```typescript
const status = await service.checkPrivateFundsStatus(
  mainWallet,
  incognitoAddress,
  'USDC'
);

if (status.privacyPoolStatus === PrivacyPoolStatus.NOT_INITIALIZED) {
  console.error('Privacy pool not initialized for this network');
}
```

#### Issue: UTXO not indexed yet

**Solution**: Wait longer for indexing or check indexing status.

```typescript
// Poll for ready status
async function waitForReady(
  service: PrivateTradingService,
  mainWallet: string,
  incognitoAddress: string,
  token: string
): Promise<void> {
  let attempts = 0;
  const maxAttempts = 35; // 70 seconds with 2-second intervals

  while (attempts < maxAttempts) {
    const status = await service.checkPrivateFundsStatus(
      mainWallet,
      incognitoAddress,
      token
    );

    if (status.isReady) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Timeout waiting for funds to be ready');
}
```

### Network-Specific Issues

#### Ethereum Mainnet
- High gas fees during network congestion
- Longer confirmation times
- **Solution**: Monitor gas prices and set appropriate slippage tolerance

#### Layer 2 Networks (Arbitrum, Optimism)
- Different confirmation patterns
- Faster but requires bridge awareness
- **Solution**: Use network-specific configuration

#### Polygon
- Different native token (MATIC) for gas
- Faster block times
- **Solution**: Ensure wallet has MATIC for gas fees

## Security Considerations

### Best Practices

1. **Never expose private keys**: This library doesn't handle private keys directly
2. **Validate addresses**: Always validate wallet addresses before operations
3. **Check balances**: Verify sufficient balance before shielding
4. **Monitor transactions**: Track transaction states throughout the flow
5. **Handle errors**: Implement proper error handling and recovery
6. **Test thoroughly**: Use testnet before mainnet deployment

### Privacy Guarantees

- **On-chain privacy**: Main and incognito wallets are not linkable on-chain
- **Deterministic derivation**: Same inputs always produce same incognito address
- **Zero-knowledge proofs**: Privacy pool operations use ZK proofs
- **No metadata leakage**: Transaction patterns don't reveal wallet relationships

### Audit Recommendations

Before production use:
1. Security audit of privacy pool integration
2. Review of cryptographic implementations
3. Testing on testnets with real scenarios
4. Gas optimization review
5. Edge case and failure mode analysis

## Examples

### Complete Trading Flow

```typescript
import { PrivateTradingService, TradeType } from 'private-position-ee';

async function privateTradeExample() {
  const service = new PrivateTradingService(1);
  const mainWallet = '0x1234...';

  try {
    // 1. Derive incognito wallet
    console.log('Deriving incognito wallet...');
    const incognito = await service.deriveIncognitoWallet(
      mainWallet,
      'Private Trade #1'
    );
    console.log('Incognito wallet:', incognito.address);

    // 2. Shield tokens
    console.log('Shielding tokens...');
    const shieldTx = await service.preparePrivateFunds(mainWallet, {
      tradeType: TradeType.ENTRY,
      token: 'USDC',
      amount: '10000',
      slippageTolerance: 0.5,
      autoUnshield: true,
      maxIndexingTime: 70,
    });
    console.log('Shield tx:', shieldTx.txHash);

    // 3. Wait for shield confirmation
    console.log('Waiting for shield confirmation...');
    await service.waitForTransactionConfirmation(shieldTx.txHash);
    console.log('Shield confirmed!');

    // 4. Unshield to incognito wallet
    console.log('Unshielding to incognito wallet...');
    const unshieldTx = await service.unshieldForTrading(incognito, {
      tradeType: TradeType.ENTRY,
      token: 'USDC',
      amount: '10000',
      slippageTolerance: 0.5,
    });
    console.log('Unshield tx:', unshieldTx.txHash);

    // 5. Check status
    const status = await service.checkPrivateFundsStatus(
      mainWallet,
      incognito.address,
      'USDC'
    );
    console.log('Funds ready:', status.isReady);
    console.log('Incognito balance:', status.incognitoBalance);

    // 6. Execute trades using incognito wallet (external to library)
    // ... your trading logic here ...

    // 7. Exit position
    console.log('Exiting position...');
    const exitTx = await service.exitPrivatePosition(incognito, {
      tradeType: TradeType.EXIT,
      token: 'USDC',
      amount: '11500', // Including profits
      slippageTolerance: 0.5,
    });
    console.log('Exit tx:', exitTx.txHash);

    console.log('Private trade flow completed successfully!');
  } catch (error) {
    console.error('Error in private trade:', error);
    throw error;
  }
}
```

### Error Handling

```typescript
async function robustPrivateTrade() {
  const service = new PrivateTradingService(1);

  try {
    const incognito = await service.deriveIncognitoWallet(mainWallet);

    // Shield with retry logic
    let shieldTx;
    let retries = 3;
    while (retries > 0) {
      try {
        shieldTx = await service.preparePrivateFunds(mainWallet, config);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Shield failed, retrying... (${retries} left)`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // Wait with timeout handling
    try {
      await service.waitForTransactionConfirmation(shieldTx.txHash, 70000);
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('Transaction pending, checking status...');
        // Implement custom status polling
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Fatal error:', error);
    // Implement cleanup or rollback logic
  }
}
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass and coverage remains >80%
5. Submit a pull request

### Development Guidelines

- Follow existing code style (TypeScript + ESLint)
- Write comprehensive tests (unit + integration)
- Update documentation for API changes
- Add JSDoc comments for public methods
- Follow semantic versioning for releases

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/private-position-ee/issues](https://github.com/yourusername/private-position-ee/issues)
- Documentation: [Full API docs](https://docs.example.com)

## Changelog

### v1.0.0 (2026-01-14)
- Initial release
- Core privacy trading functionality
- Shield/unshield operations
- Incognito wallet management
- Comprehensive test suite (90+ tests)
- Full TypeScript support
