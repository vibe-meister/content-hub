# 🚀 Algo Content Hub - Deployment Guide

## Prerequisites

### 1. Install AlgoKit
```bash
# Install AlgoKit
pip install algokit

# Install Python dependencies
pip install algopy
```

### 2. Install Node.js Dependencies
```bash
cd algo-content-hub/frontend
npm install @algorandfoundation/algokit-utils
```

## Smart Contract Deployment

### 1. Deploy to LocalNet (Development)
```bash
# Start LocalNet
algokit localnet start

# Navigate to smart contracts
cd algo-content-hub/smart_contracts

# Compile contract
algokit compile python

# Deploy to LocalNet
algokit localnet deploy
```

### 2. Deploy to TestNet (Testing)
```bash
# Deploy to TestNet
algokit testnet deploy

# Get contract address
algokit testnet info
```

### 3. Deploy to MainNet (Production)
```bash
# Deploy to MainNet
algokit mainnet deploy

# Get contract address
algokit mainnet info
```

## Frontend Configuration

### 1. Update Contract Address
Edit `algo-content-hub/frontend/js/smart-contract.js`:

```javascript
// Replace with your deployed contract address
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 2. Update Network Configuration
Edit `algo-content-hub/frontend/js/app.js`:

```javascript
// Set network (localnet, testnet, or mainnet)
const NETWORK = 'testnet'; // or 'mainnet'
```

## IPFS Setup (Optional)

### 1. Install IPFS
```bash
# Install IPFS
npm install -g ipfs

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 2. Update IPFS Gateway
Edit `algo-content-hub/frontend/js/content-manager.js`:

```javascript
// Update IPFS gateway URL
const IPFS_GATEWAY = 'http://localhost:8080/ipfs/';
```

## Wallet Integration

### 1. Pera Wallet (Mobile App)
- Download Pera Wallet from App Store/Google Play
- Create or import wallet
- Use QR code to connect from mobile device

### 2. Defly Wallet (Mobile App)
- Download Defly Wallet from App Store/Google Play
- Create or import wallet
- Use QR code to connect from mobile device

### 3. KMD (Key Management Daemon)
- For local development and testing
- Integrated with AlgoKit for development wallets

## Revenue Collection

### 1. Platform Fee Collection
The smart contract automatically collects 5% platform fee from all payments.

### 2. Withdraw Platform Fees
```python
# Create withdrawal transaction
withdrawal_tx = {
    'type': 'app_call',
    'app_id': CONTRACT_ADDRESS,
    'method': 'withdraw_platform_fees',
    'args': []
}
```

### 3. Monitor Revenue
```python
# Get platform stats
stats = smart_contract.get_platform_stats()
print(f"Total Revenue: {stats[2]} microALGO")
print(f"Platform Fee: {stats[3]}%")
```

## Testing

### 1. Test Content Upload
```bash
# Test upload functionality
python test_upload.py
```

### 2. Test Payment Processing
```bash
# Test payment functionality
python test_payments.py
```

### 3. Test Wallet Connection
```bash
# Test wallet integration
python test_wallet.py
```

## Production Deployment

### 1. Environment Variables
Create `.env` file:
```
CONTRACT_ADDRESS=your_contract_address
NETWORK=mainnet
IPFS_GATEWAY=https://ipfs.io/ipfs/
PLATFORM_FEE=5
```

### 2. Security Configuration
- Enable HTTPS
- Set up CORS properly
- Validate all inputs
- Implement rate limiting

### 3. Monitoring
- Set up analytics
- Monitor transaction fees
- Track user engagement
- Monitor platform revenue

## Troubleshooting

### Common Issues:

1. **Wallet Connection Failed**
   - Check if wallet extension is installed
   - Verify network connection
   - Check browser console for errors

2. **Contract Deployment Failed**
   - Verify AlgoKit installation
   - Check network connectivity
   - Verify account has sufficient ALGO

3. **Payment Processing Failed**
   - Check contract address
   - Verify payment amount
   - Check user balance

4. **Content Upload Failed**
   - Check IPFS connection
   - Verify file size limits
   - Check network connectivity

## Support

For technical support:
- Check AlgoKit documentation
- Join Algorand Discord
- Review smart contract logs
- Check browser console errors
