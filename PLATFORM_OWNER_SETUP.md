# 🎬 Algo Content Hub - Platform Owner Setup Guide

## 💰 **How Platform Fees Work**

The Algo Content Hub automatically collects a **5% platform fee** from all payments and sends it directly to your wallet address. Here's how to set it up:

## 🔧 **Setup Steps**

### **1. Set Your Wallet Address**
1. Open `setup-platform-owner.html` in your browser
2. Enter your Algorand wallet address
3. Click "Set Platform Owner"
4. Click "Generate Configuration" to download config

### **2. Deploy Smart Contract**
```bash
# Deploy to MainNet (uses real ALGO)
python deployment/deploy-mainnet.py
```

### **3. Start DApp**
```bash
cd algo-content-hub/frontend
python -m http.server 8000
```

## 💰 **Fee Collection Details**

### **How It Works:**
- **User pays 10 ALGO** for content
- **Platform gets 0.5 ALGO** (5% fee)
- **Creator gets 9.5 ALGO** (95% revenue)
- **Automatic**: Fees sent directly to your wallet

### **Real ALGO Transactions:**
- ✅ **Content Upload**: ~0.001 ALGO (transaction fee)
- ✅ **Pay to View**: Content price + ~0.001 ALGO
- ✅ **Pay to Own**: Ownership price + ~0.001 ALGO
- ✅ **Platform Fee**: 5% of all payments (automatic)

## 📱 **Testing with Pera Wallet**

### **Desktop Setup:**
1. Open `http://localhost:8000`
2. Click "Connect Wallet"
3. QR code appears

### **Mobile Connection:**
1. Open Pera Wallet app
2. Scan QR code from desktop
3. Approve connection
4. Test with real ALGO!

## ⚠️ **Important Notes**

- **Real ALGO**: All transactions use real ALGO on MainNet
- **Permanent**: All transactions recorded on blockchain
- **Automatic**: Platform fees collected automatically
- **Withdrawable**: You can withdraw collected fees anytime

## 🚀 **Ready to Earn!**

Once configured, every payment on your platform will automatically send 5% to your wallet address. No manual collection needed!

---

**Need Help?** Check the console logs for platform owner status and fee collection details.
