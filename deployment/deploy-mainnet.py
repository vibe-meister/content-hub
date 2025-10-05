#!/usr/bin/env python3
"""
Algo Content Hub - MainNet Deployment Script
Deploys smart contract to Algorand MainNet for real testing
"""

import os
import json
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error: {result.stderr}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"Exception running command: {command}")
        print(f"Exception: {e}")
        return None

def check_mainnet_prerequisites():
    """Check if required tools are installed for MainNet deployment"""
    print("🔍 Checking MainNet prerequisites...")
    
    # Check AlgoKit
    algokit_version = run_command("algokit --version")
    if not algokit_version:
        print("❌ AlgoKit not found. Installing...")
        run_command("pip install algokit")
    else:
        print(f"✅ AlgoKit: {algokit_version}")
    
    # Check if user has MainNet account
    print("\n💰 MainNet Account Requirements:")
    print("1. You need ALGO in your MainNet account for deployment")
    print("2. Minimum 0.1 ALGO for contract deployment")
    print("3. Additional ALGO for transaction fees")
    
    return True

def deploy_to_mainnet():
    """Deploy the smart contract to MainNet"""
    print("🚀 Deploying to Algorand MainNet...")
    print("⚠️  WARNING: This will use real ALGO and cost real money!")
    
    # Confirm deployment
    confirm = input("\n🤔 Are you sure you want to deploy to MainNet? (yes/no): ").lower().strip()
    if confirm != 'yes':
        print("❌ MainNet deployment cancelled")
        return None
    
    # Navigate to smart contracts directory
    contract_dir = Path("smart_contracts")
    if not contract_dir.exists():
        print("❌ Smart contracts directory not found")
        return None
    
    # Compile contract
    print("🔨 Compiling contract for MainNet...")
    result = run_command("algokit compile python", cwd=contract_dir)
    if not result:
        print("❌ Failed to compile contract")
        return None
    
    # Deploy to MainNet
    print("📦 Deploying contract to MainNet...")
    print("💸 This will cost real ALGO!")
    print("💰 Platform owner: 4E7PHGNF7HJDAVKWQMOLH3WGTN2UL3O2OYSRNB26KXLADVCOHRM6HGQPXA")
    
    result = run_command("algokit mainnet deploy", cwd=contract_dir)
    if not result:
        print("❌ Failed to deploy contract to MainNet")
        return None
    
    # Extract contract address from deployment output
    # This is a simplified extraction - you might need to adjust based on actual output
    contract_address = "MAINNET_CONTRACT_ADDRESS"  # Replace with actual extraction logic
    
    print(f"✅ Contract deployed to MainNet!")
    print(f"📍 Contract Address: {contract_address}")
    print(f"💰 Cost: Real ALGO spent")
    
    return contract_address

def update_frontend_for_mainnet(contract_address, platform_owner):
    """Update frontend configuration for MainNet"""
    print("🔧 Updating frontend for MainNet...")
    
    # Update smart-contract.js
    smart_contract_file = Path("frontend/js/smart-contract.js")
    if smart_contract_file.exists():
        with open(smart_contract_file, 'r') as f:
            content = f.read()
        
        # Replace contract address
        content = content.replace('MAINNET_CONTRACT_ADDRESS', contract_address)
        
        with open(smart_contract_file, 'w') as f:
            f.write(content)
        
        print("✅ Updated smart-contract.js with MainNet address")
    
    # Update app.js
    app_file = Path("frontend/js/app.js")
    if app_file.exists():
        with open(app_file, 'r') as f:
            content = f.read()
        
        # Replace contract address
        content = content.replace('DEMO_CONTRACT_ADDRESS', contract_address)
        
        with open(app_file, 'w') as f:
            f.write(content)
        
        print("✅ Updated app.js with MainNet address")
    
    # Create MainNet environment file
    env_file = Path("frontend/.env")
    env_content = f"""CONTRACT_ADDRESS={contract_address}
NETWORK=mainnet
IPFS_GATEWAY=https://ipfs.io/ipfs/
PLATFORM_FEE=5
PLATFORM_OWNER={platform_owner}
MAINNET=true
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✅ Created MainNet .env file")

def create_mainnet_instructions():
    """Create instructions for MainNet testing"""
    instructions = """
# 🎬 Algo Content Hub - MainNet Testing Instructions

## 📱 Mobile Testing with Pera Wallet

### 1. Desktop Setup
1. Open http://localhost:8000 in your desktop browser
2. Click "Connect Wallet" button
3. QR code will appear

### 2. Mobile Connection
1. Open Pera Wallet app on your phone
2. Look for "Connect to DApp" or "Scan QR Code" option
3. Scan the QR code from your desktop
4. Approve the connection in Pera Wallet

### 3. Testing Features
- ✅ **Content Upload**: Upload videos, images, URLs
- ✅ **Payment Processing**: Pay with real ALGO
- ✅ **Fee Collection**: 5% platform fee automatically collected
- ✅ **Revenue Tracking**: Monitor earnings in dashboard

### 4. Real ALGO Transactions
- **Content Upload**:** ~0.001 ALGO (transaction fee)
- **Pay to View**:** Content price + ~0.001 ALGO (transaction fee)
- **Pay to Own**:** Ownership price + ~0.001 ALGO (transaction fee)
- **Platform Fee**:** 5% of all payments (automatic)

### 5. Revenue Collection
- Platform automatically collects 5% fee
- Creators receive 95% of payments
- All transactions recorded on Algorand blockchain
- Real ALGO earned and spent

## ⚠️ Important Notes
- This uses real ALGO on MainNet
- All transactions are permanent
- Platform fees are real revenue
- Test with small amounts first

## 🚀 Ready to Test!
Your DApp is now connected to Algorand MainNet with real ALGO transactions!
"""
    
    with open("MAINNET_TESTING.md", "w") as f:
        f.write(instructions)
    
    print("✅ Created MainNet testing instructions")

def main():
    """Main MainNet deployment function"""
    print("🎬 Algo Content Hub - MainNet Deployment")
    print("=" * 50)
    print("⚠️  WARNING: This will use real ALGO and cost real money!")
    print("=" * 50)
    
    # Check prerequisites
    if not check_mainnet_prerequisites():
        print("❌ Prerequisites check failed")
        sys.exit(1)
    
    # Deploy contract
    contract_address = deploy_to_mainnet()
    if not contract_address:
        print("❌ MainNet deployment failed")
        sys.exit(1)
    
    # Update frontend with your wallet address
    update_frontend_for_mainnet(contract_address, '4E7PHGNF7HJDAVKWQMOLH3WGTN2UL3O2OYSRNB26KXLADVCOHRM6HGQPXA')
    
    # Create instructions
    create_mainnet_instructions()
    
    print("\n🎉 MainNet deployment completed!")
    print(f"📍 Contract Address: {contract_address}")
    print(f"🌐 Network: MainNet")
    print(f"💰 Platform Fee: 5% (real ALGO)")
    print(f"🏦 Platform Owner: 4E7PHGNF7HJDAVKWQMOLH3WGTN2UL3O2OYSRNB26KXLADVCOHRM6HGQPXA")
    print(f"📱 QR Code: Ready for Pera Wallet connection")
    
    print("\n📱 Next Steps:")
    print("1. Start server: python -m http.server 8000")
    print("2. Open http://localhost:8000")
    print("3. Click 'Connect Wallet'")
    print("4. Scan QR code with Pera Wallet")
    print("5. Test with real ALGO!")

if __name__ == "__main__":
    main()
