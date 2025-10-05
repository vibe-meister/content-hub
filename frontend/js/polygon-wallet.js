// Polygon Mumbai Wallet Integration - CHEAPEST Option
class PolygonWalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        this.chainId = null;
        this.usdcContract = null;
        this.usdcAbi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)"
        ];
        this.usdcAddress = "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e"; // Mumbai USDC
        this.platformOwner = "0x44edA89fdff579f5FB51E14253B67B557A00d16c"; // User's wallet address
        
        // Polygon Mumbai Configuration (CHEAPEST)
        this.polygonConfig = {
            chainId: '0x13881', // 80001 in hex (Polygon Mumbai)
            chainName: 'Polygon Mumbai',
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            },
            rpcUrls: [
                'https://rpc-mumbai.maticvigil.com/',
                'https://polygon-mumbai.infura.io/v3/4458cf4d1689497c9aa109a38a0baefb'
            ],
            blockExplorerUrls: ['https://mumbai.polygonscan.com/']
        };
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                app.showToast('MetaMask is not installed!', 'error');
                return false;
            }

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();
            this.isConnected = true;

            this.chainId = (await this.provider.getNetwork()).chainId;
            if (this.chainId !== 80001) { // 80001 is Polygon Mumbai
                app.showToast('Switching to Polygon Mumbai for cheapest gas fees...', 'info');
                await this.switchToPolygon();
            }

            this.usdcContract = new ethers.Contract(this.usdcAddress, this.usdcAbi, this.signer);

            app.showToast('Connected to Polygon Mumbai! Gas fees: ~$0.001', 'success');
            this.updateWalletUI();
            return true;

        } catch (error) {
            console.error('Polygon connection failed:', error);
            app.showToast('Failed to connect: ' + error.message, 'error');
            return false;
        }
    }

    async switchToPolygon() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [this.polygonConfig]
            });
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.polygonConfig.chainId }]
            });
            this.chainId = (await this.provider.getNetwork()).chainId;
            app.showToast('Switched to Polygon Mumbai!', 'success');
            return true;
        } catch (switchError) {
            console.error('Failed to switch to Polygon:', switchError);
            app.showToast('Failed to switch to Polygon Mumbai. Please do it manually.', 'error');
            return false;
        }
    }

    async getMATICBalance() {
        if (!this.isConnected || !this.provider) return 0;
        try {
            const balance = await this.provider.getBalance(this.address);
            return parseFloat(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error('Failed to get MATIC balance:', error);
            return 0;
        }
    }

    async getUSDCBalance() {
        if (!this.isConnected || !this.usdcContract) return 0;
        try {
            const balance = await this.usdcContract.balanceOf(this.address);
            return ethers.utils.formatUnits(balance, 18);
        } catch (error) {
            console.error('Failed to get USDC balance:', error);
            return 0;
        }
    }

    async transferUSDC(toAddress, amount) {
        if (!this.isConnected || !this.usdcContract) {
            throw new Error('Wallet not connected or USDC contract not initialized.');
        }
        try {
            const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
            const tx = await this.usdcContract.transfer(toAddress, amountWei);
            await tx.wait();
            app.showToast(`Transferred ${amount} USDC to ${toAddress}`, 'success');
            return tx.hash;
        } catch (error) {
            console.error('USDC transfer failed:', error);
            app.showToast('USDC transfer failed: ' + error.message, 'error');
            throw error;
        }
    }

    disconnectWallet() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.provider = null;
        this.signer = null;
        this.chainId = null;
        this.usdcContract = null;
        app.showToast('Wallet disconnected.', 'info');
        this.updateWalletUI();
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet-btn');
        const walletAddressEl = document.getElementById('wallet-address');
        const walletBalanceEl = document.getElementById('wallet-balance');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        const walletInfo = document.getElementById('wallet-info');

        if (this.isConnected) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'block';
            if (disconnectBtn) disconnectBtn.style.display = 'block';
            
            if (walletAddressEl) {
                walletAddressEl.textContent = `Connected: ${this.address.substring(0, 6)}...${this.address.substring(this.address.length - 4)}`;
            }
            if (walletBalanceEl) {
                this.getUSDCBalance().then(balance => {
                    walletBalanceEl.textContent = `Balance: ${parseFloat(balance).toFixed(2)} USDC`;
                });
            }
        } else {
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (walletAddressEl) walletAddressEl.textContent = 'Not Connected';
            if (walletBalanceEl) walletBalanceEl.textContent = '';
        }
    }

    formatAddress(address) {
        if (!address) return 'N/A';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}

const polygonWallet = new PolygonWalletManager();
