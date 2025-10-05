#!/usr/bin/env python3
"""
Algo Content Hub - Deployment Script
Deploys smart contract and configures frontend
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

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    python_version = run_command("python --version")
    if not python_version:
        print("❌ Python not found. Please install Python 3.8+")
        return False
    print(f"✅ Python: {python_version}")
    
    # Check AlgoKit
    algokit_version = run_command("algokit --version")
    if not algokit_version:
        print("❌ AlgoKit not found. Installing...")
        run_command("pip install algokit")
    else:
        print(f"✅ AlgoKit: {algokit_version}")
    
    # Check Node.js
    node_version = run_command("node --version")
    if not node_version:
        print("❌ Node.js not found. Please install Node.js")
        return False
    print(f"✅ Node.js: {node_version}")
    
    return True

def deploy_contract(network="localnet"):
    """Deploy the smart contract"""
    print(f"🚀 Deploying contract to {network}...")
    
    # Navigate to smart contracts directory
    contract_dir = Path("smart_contracts")
    if not contract_dir.exists():
        print("❌ Smart contracts directory not found")
        return None
    
    # Start LocalNet if needed
    if network == "localnet":
        print("🔄 Starting LocalNet...")
        result = run_command("algokit localnet start", cwd=contract_dir)
        if not result:
            print("❌ Failed to start LocalNet")
            return None
    
    # Compile contract
    print("🔨 Compiling contract...")
    result = run_command("algokit compile python", cwd=contract_dir)
    if not result:
        print("❌ Failed to compile contract")
        return None
    
    # Deploy contract
    print("📦 Deploying contract...")
    if network == "localnet":
        result = run_command("algokit localnet deploy", cwd=contract_dir)
    elif network == "testnet":
        result = run_command("algokit testnet deploy", cwd=contract_dir)
    elif network == "mainnet":
        result = run_command("algokit mainnet deploy", cwd=contract_dir)
    else:
        print(f"❌ Unknown network: {network}")
        return None
    
    if not result:
        print("❌ Failed to deploy contract")
        return None
    
    # Extract contract address from deployment output
    # This is a simplified extraction - you might need to adjust based on actual output
    contract_address = "DEMO_CONTRACT_ADDRESS"  # Replace with actual extraction logic
    
    print(f"✅ Contract deployed successfully!")
    print(f"📍 Contract Address: {contract_address}")
    
    return contract_address

def update_frontend_config(contract_address, network="testnet"):
    """Update frontend configuration with contract address"""
    print("🔧 Updating frontend configuration...")
    
    # Update smart-contract.js
    smart_contract_file = Path("frontend/js/smart-contract.js")
    if smart_contract_file.exists():
        with open(smart_contract_file, 'r') as f:
            content = f.read()
        
        # Replace contract address
        content = content.replace('DEMO_CONTRACT_ADDRESS', contract_address)
        
        with open(smart_contract_file, 'w') as f:
            f.write(content)
        
        print("✅ Updated smart-contract.js")
    
    # Update app.js
    app_file = Path("frontend/js/app.js")
    if app_file.exists():
        with open(app_file, 'r') as f:
            content = f.read()
        
        # Replace contract address
        content = content.replace('DEMO_CONTRACT_ADDRESS', contract_address)
        
        with open(app_file, 'w') as f:
            f.write(content)
        
        print("✅ Updated app.js")
    
    # Create environment file
    env_file = Path("frontend/.env")
    env_content = f"""CONTRACT_ADDRESS={contract_address}
NETWORK={network}
IPFS_GATEWAY=https://ipfs.io/ipfs/
PLATFORM_FEE=5
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file")

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install npm dependencies
    result = run_command("npm install", cwd=frontend_dir)
    if not result:
        print("❌ Failed to install npm dependencies")
        return False
    
    print("✅ Frontend dependencies installed")
    return True

def start_development_server():
    """Start the development server"""
    print("🌐 Starting development server...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    print("🚀 Server starting at http://localhost:8000")
    print("📱 QR code will be available for mobile wallet connection")
    print("💰 Platform fees will be collected automatically")
    
    # Start server (this will block)
    run_command("python -m http.server 8000", cwd=frontend_dir)

def main():
    """Main deployment function"""
    print("🎬 Algo Content Hub - Deployment Script")
    print("=" * 50)
    
    # Check prerequisites
    if not check_prerequisites():
        print("❌ Prerequisites check failed")
        sys.exit(1)
    
    # Install frontend dependencies
    if not install_frontend_dependencies():
        print("❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    # Deploy contract
    network = "localnet"  # Change to "testnet" or "mainnet" for production
    contract_address = deploy_contract(network)
    if not contract_address:
        print("❌ Contract deployment failed")
        sys.exit(1)
    
    # Update frontend configuration
    update_frontend_config(contract_address, network)
    
    print("\n🎉 Deployment completed successfully!")
    print(f"📍 Contract Address: {contract_address}")
    print(f"🌐 Network: {network}")
    print(f"💰 Platform Fee: 5%")
    print(f"🔗 QR Code: Available for mobile wallet connection")
    
    # Ask if user wants to start server
    start_server = input("\n🚀 Start development server? (y/n): ").lower().strip()
    if start_server == 'y':
        start_development_server()
    else:
        print("✅ Deployment complete. Run 'python -m http.server 8000' in frontend directory to start server.")

if __name__ == "__main__":
    main()
