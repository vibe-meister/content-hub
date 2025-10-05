# Algo Content Hub Deployment Configuration

## 🚀 **DEPLOYMENT OVERVIEW**

This document provides step-by-step instructions for deploying the Algo Content Hub DApp.

## 📋 **PREREQUISITES**

### **Development Environment**
```bash
# Install AlgoKit
pip install algokit

# Install Python dependencies
pip install algopy

# Install Node.js dependencies
npm install @algorandfoundation/algokit-utils
```

### **Required Tools**
- AlgoKit CLI
- Python 3.8+
- Node.js 16+
- Docker (for LocalNet)
- Algorand wallet (Pera Wallet, MyAlgo)

## 🏗️ **SMART CONTRACT DEPLOYMENT**

### **Step 1: Compile Smart Contract**
```bash
# Navigate to smart contracts directory
cd algo-content-hub/smart_contracts

# Compile Python smart contract
algokit compile python

# Verify compilation
ls -la *.teal
```

### **Step 2: Deploy to LocalNet (Testing)**
```bash
# Start LocalNet
algokit localnet start

# Deploy contract to LocalNet
algokit localnet deploy

# Verify deployment
algokit localnet status
```

### **Step 3: Deploy to TestNet**
```bash
# Configure TestNet
algokit testnet configure

# Deploy to TestNet
algokit testnet deploy

# Verify deployment
algokit testnet status
```

### **Step 4: Deploy to MainNet (Production)**
```bash
# Configure MainNet
algokit mainnet configure

# Deploy to MainNet
algokit mainnet deploy

# Verify deployment
algokit mainnet status
```

## 🌐 **FRONTEND DEPLOYMENT**

### **Step 1: Build Frontend**
```bash
# Navigate to frontend directory
cd algo-content-hub/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### **Step 2: Deploy to Web Server**
```bash
# Copy built files to web server
cp -r dist/* /var/www/html/

# Configure web server (nginx/apache)
# Add CORS headers for Algorand API calls
```

### **Step 3: Configure Environment**
```bash
# Set environment variables
export CONTRACT_ADDRESS="YOUR_CONTRACT_ADDRESS"
export NETWORK="testnet" # or "mainnet"
export IPFS_GATEWAY="https://ipfs.io/ipfs/"
```

## 🔧 **CONFIGURATION FILES**

### **Smart Contract Configuration**
```python
# deploy_config.py
class DeployConfig:
    def __init__(self):
        self.contract_name = "AlgoContentHub"
        self.platform_name = "AlgoContentHub"
        self.platform_version = "1.0"
        self.platform_fee = 5  # 5% platform fee
        self.network = "testnet"  # or "mainnet"
```

### **Frontend Configuration**
```javascript
// config.js
const CONFIG = {
    CONTRACT_ADDRESS: "YOUR_CONTRACT_ADDRESS",
    NETWORK: "testnet",
    IPFS_GATEWAY: "https://ipfs.io/ipfs/",
    WALLET_PROVIDERS: ["pera", "myalgo"],
    PLATFORM_FEE: 5
};
```

## 🚀 **DEPLOYMENT STEPS**

### **Phase 1: Development Setup**
```bash
# 1. Clone repository
git clone <repository-url>
cd algo-content-hub

# 2. Install dependencies
pip install -r requirements.txt
npm install

# 3. Start LocalNet
algokit localnet start

# 4. Deploy to LocalNet
algokit localnet deploy
```

### **Phase 2: Testing**
```bash
# 1. Test smart contract functions
algokit localnet test

# 2. Test frontend integration
npm run test

# 3. Test wallet integration
# Connect wallet and test payments
```

### **Phase 3: TestNet Deployment**
```bash
# 1. Deploy to TestNet
algokit testnet deploy

# 2. Update frontend configuration
# Set CONTRACT_ADDRESS to TestNet address

# 3. Test on TestNet
# Verify all functions work correctly
```

### **Phase 4: Production Deployment**
```bash
# 1. Deploy to MainNet
algokit mainnet deploy

# 2. Update frontend configuration
# Set CONTRACT_ADDRESS to MainNet address

# 3. Deploy frontend to production server
# Configure web server and SSL
```

## 🔐 **SECURITY CONFIGURATION**

### **Smart Contract Security**
```python
# Security settings
SECURITY_CONFIG = {
    "max_content_size": 100 * 1024 * 1024,  # 100MB
    "max_metadata_size": 10 * 1024,  # 10KB
    "min_view_price": 0.001,  # 0.001 ALGO
    "max_view_price": 1000,  # 1000 ALGO
    "session_duration": 24 * 60 * 60,  # 24 hours
    "platform_fee_min": 1,  # 1%
    "platform_fee_max": 10  # 10%
}
```

### **Frontend Security**
```javascript
// Security headers
const SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};
```

## 📊 **MONITORING AND ANALYTICS**

### **Smart Contract Monitoring**
```python
# Monitoring configuration
MONITORING_CONFIG = {
    "track_payments": True,
    "track_content_uploads": True,
    "track_user_activity": True,
    "log_level": "INFO"
}
```

### **Frontend Analytics**
```javascript
// Analytics configuration
const ANALYTICS_CONFIG = {
    "track_page_views": True,
    "track_user_interactions": True,
    "track_payment_events": True,
    "privacy_compliant": True
};
```

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Smart contract compiled successfully
- [ ] All tests passing
- [ ] Frontend built for production
- [ ] Environment variables configured
- [ ] Security settings verified

### **Deployment**
- [ ] Smart contract deployed to target network
- [ ] Contract address updated in frontend
- [ ] Frontend deployed to web server
- [ ] SSL certificate configured
- [ ] Domain name configured

### **Post-Deployment**
- [ ] All functions tested
- [ ] Wallet integration verified
- [ ] Payment processing tested
- [ ] Content upload/download tested
- [ ] Monitoring configured
- [ ] Analytics configured

## 🔧 **TROUBLESHOOTING**

### **Common Issues**
```
1. Smart Contract Deployment Failed
   - Check network configuration
   - Verify account has sufficient ALGO
   - Check contract compilation

2. Frontend Not Loading
   - Check web server configuration
   - Verify CORS headers
   - Check JavaScript console for errors

3. Wallet Connection Failed
   - Check wallet provider configuration
   - Verify network settings
   - Check browser compatibility
```

### **Support Resources**
- AlgoKit Documentation
- Algorand Developer Resources
- Smart Contract Development Guides
- Frontend Development Guides

## 📈 **PERFORMANCE OPTIMIZATION**

### **Smart Contract Optimization**
```python
# Optimization settings
OPTIMIZATION_CONFIG = {
    "batch_size": 100,
    "cache_size": 1000,
    "optimize_storage": True,
    "compress_data": True
}
```

### **Frontend Optimization**
```javascript
// Performance settings
const PERFORMANCE_CONFIG = {
    "lazy_loading": True,
    "image_optimization": True,
    "caching": True,
    "compression": True
};
```

---

**This deployment guide provides complete instructions for deploying the Algo Content Hub DApp!** 🚀
