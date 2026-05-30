# Environments Reference

This page summarizes the environment variables and target environments for StellarWork.

## Environment Variables

All environment variables are prefixed with `NEXT_PUBLIC_` to make them available in the browser.

### Required Variables

| Variable | Description | Default | Usage |
|----------|-------------|---------|-------|
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed escrow contract ID on Stellar | *None* (required) | Used in `frontend/lib/contract.ts` to identify the contract to interact with |

### Optional Variables

| Variable | Description | Default | Usage |
|----------|-------------|---------|-------|
| `NEXT_PUBLIC_NETWORK` | Target Stellar network | `testnet` | Controls network passphrase and explorer URLs. Set to `mainnet` for production. |
| `NEXT_PUBLIC_SOROBAN_RPC` | Soroban RPC endpoint URL | `https://soroban-testnet.stellar.org` | Used in `frontend/lib/stellar.ts` for RPC connections |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | Admin wallet address for admin panel access | *None* | Controls visibility of admin features in navigation, disputes, and admin pages |
| `NEXT_PUBLIC_NATIVE_TOKEN` | Default native token contract address | *None* | Pre-fills the token address field in the post-job form |

### Deprecated/Documented Variables

The following variables are documented in `frontend/README.md` but **not currently used** in the codebase:

| Variable | Status | Note |
|----------|--------|------|
| `NEXT_PUBLIC_HORIZON_URL` | Not used | Documented but not referenced in code |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Not used | Code uses `NEXT_PUBLIC_SOROBAN_RPC` instead |

## Target Environments

### Testnet (Default)

- **Network Passphrase**: `Test SDF Network ; September 2015`
- **RPC URL**: `https://soroban-testnet.stellar.org`
- **Explorer**: `https://stellar.expert/explorer/testnet/tx`
- **Purpose**: Development and testing
- **Funding**: Available via [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet)

### Mainnet (Production)

- **Network Passphrase**: `Public Global Stellar Network ; September 2015`
- **RPC URL**: Configure via `NEXT_PUBLIC_SOROBAN_RPC`
- **Explorer**: `https://stellar.expert/explorer/public/tx`
- **Purpose**: Production deployment
- **Configuration**: Set `NEXT_PUBLIC_NETWORK=mainnet`

## Configuration Files

### Frontend

Create `frontend/.env.local` from the template:

```bash
cd frontend
cp .env.example .env.local
```

**Note**: A `.env.example` file should be created to document the expected variables.

### Docker

The `docker-compose.yml` file sets the following environment variables for the frontend container:

- `NODE_ENV=development`
- `WATCHPACK_POLLING=true`
- `CHOKIDAR_USEPOLLING=true`

## Network Detection Logic

The network is determined in `frontend/lib/stellar.ts`:

```typescript
const getNetwork = () =>
  process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet" : "testnet";

const getNetworkPassphrase = () =>
  process.env.NEXT_PUBLIC_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
```

If `NEXT_PUBLIC_NETWORK` is not set or is not `"mainnet"`, the application defaults to testnet.

## Explorer URLs

Transaction explorer URLs are generated based on the network:

- **Testnet**: `https://stellar.expert/explorer/testnet/tx/{hash}`
- **Mainnet**: `https://stellar.expert/explorer/public/tx/{hash}`

See `frontend/lib/stellar.ts` `getExplorerTxUrl()` function.

## Deployment Considerations

### Testnet Deployment

Follow the [testnet deployment guide](./testnet-deployment-guide.md) for step-by-step instructions.

Key steps:
1. Configure Soroban identity and network
2. Build and deploy contract
3. Initialize contract with admin and native token
4. Set `NEXT_PUBLIC_CONTRACT_ID` in `frontend/.env.local`

### Mainnet Deployment

For mainnet deployment:

1. Set `NEXT_PUBLIC_NETWORK=mainnet`
2. Configure `NEXT_PUBLIC_SOROBAN_RPC` to mainnet RPC endpoint
3. Deploy contract to mainnet
4. Update `NEXT_PUBLIC_CONTRACT_ID` to mainnet contract ID
5. Set `NEXT_PUBLIC_ADMIN_ADDRESS` if admin access is restricted
6. Verify explorer URLs point to mainnet

## Common Issues

- **`NEXT_PUBLIC_CONTRACT_ID is not configured`**: Ensure `frontend/.env.local` exists and contains the contract ID. Restart the dev server after changes.
- **Wrong network**: Verify `NEXT_PUBLIC_NETWORK` matches the deployed contract network.
- **RPC connection errors**: Check that `NEXT_PUBLIC_SOROBAN_RPC` is accessible and matches the target network.

## Synchronization with Code

This document is synchronized with the codebase as of the latest commit. When adding new environment variables:

1. Add the variable to the appropriate section above
2. Update the `.env.example` file (if it exists)
3. Update relevant documentation (README.md, deployment guides)
4. Ensure the variable is properly documented with its default value and usage
