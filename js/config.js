// Algo Content Hub - Configuration
class AlgoContentHubConfig {
    constructor() {
        this.config = {
            // Platform Settings
            platformName: 'Algo Content Hub',
            platformVersion: '2.0.0',
            platformFee: 5, // 5% platform fee
            
            // Network Configuration
            network: 'testnet', // 'localnet', 'testnet', or 'mainnet'
            
            // Contract Configuration
            contractAddress: 'DEMO_CONTRACT_ADDRESS', // Will be updated on deployment
            
            // Platform Owner (YOUR WALLET ADDRESS)
            platformOwner: '4E7PHGNF7HJDAVKWQMOLH3WGTN2UL3O2OYSRNB26KXLADVCOHRM6HGQPXA', // Your main wallet address
            
            // IPFS Configuration
            ipfsGateway: 'https://ipfs.io/ipfs/',
            
            // Wallet Configuration
            supportedWallets: ['pera', 'defly', 'kmd'],
            
            // Feature Flags
            features: {
                qrCodeConnection: true,
                mobileWalletSupport: true,
                realTimePayments: true,
                nftOwnership: true,
                contentVerification: true
            }
        };
    }
    
    // Set platform owner wallet address
    setPlatformOwner(walletAddress) {
        this.config.platformOwner = walletAddress;
        console.log('Platform owner set:', walletAddress);
        console.log('All platform fees will be sent to:', walletAddress);
    }
    
    // Get platform owner
    getPlatformOwner() {
        return this.config.platformOwner;
    }
    
    // Update contract address
    setContractAddress(address) {
        this.config.contractAddress = address;
        console.log('Contract address updated:', address);
    }
    
    // Get configuration
    getConfig() {
        return this.config;
    }
    
    // Validate configuration
    validateConfig() {
        const errors = [];
        
        if (!this.config.platformOwner) {
            errors.push('Platform owner wallet address not set');
        }
        
        if (this.config.contractAddress === 'DEMO_CONTRACT_ADDRESS') {
            errors.push('Contract address not deployed');
        }
        
        if (errors.length > 0) {
            console.warn('Configuration issues:', errors);
            return false;
        }
        
        return true;
    }
    
    // Get platform fee info
    getPlatformFeeInfo() {
        return {
            feePercentage: this.config.platformFee,
            platformOwner: this.config.platformOwner,
            description: `${this.config.platformFee}% of all payments go to platform owner`
        };
    }
}

// Initialize configuration
const config = new AlgoContentHubConfig();

// Export for use in other modules
window.config = config;
