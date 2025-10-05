// MetaMask Wallet Integration for BSC + USDC
class MetaMaskWalletManager {
    constructor() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.network = null;
        this.provider = null;
        
        // BSC Configuration
        this.bscConfig = {
            chainId: '0x38', // 56 in hex
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
        };
        
        // USDC Contract on BSC
        this.usdcContract = '0x55d398326f99059fF775485246999027B3197955';
        this.usdcDecimals = 18;
        
        // Platform owner wallet
        this.platformOwner = '0x44edA89fdff579f5FB51E14253B67B557A00d16c';
        this.platformFee = 5; // 5%
    }

    async connectWallet() {
        try {
            this.showLoading(true);
            
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                this.showToast('MetaMask not detected. Please install MetaMask.', 'error');
                return false;
            }
            
            this.provider = window.ethereum;
            
            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                this.showToast('No accounts found', 'error');
                return false;
            }
            
            this.address = accounts[0];
            this.wallet = this.provider;
            
            // Check/switch to BSC network
            await this.switchToBSC();
            
            // Get user balance
            await this.getBalance();
            
            this.isConnected = true;
            this.updateWalletUI();
            this.showToast('MetaMask connected successfully!', 'success');
            
            return true;
            
        } catch (error) {
            console.error('MetaMask connection failed:', error);
            this.showToast('Failed to connect MetaMask: ' + error.message, 'error');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    async switchToBSC() {
        try {
            // Check current network
            const chainId = await this.provider.request({ method: 'eth_chainId' });
            
            if (chainId !== this.bscConfig.chainId) {
                // Switch to BSC
                await this.provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: this.bscConfig.chainId }]
                });
            }
            
            this.network = 'BSC';
            console.log('Connected to BSC network');
            
        } catch (error) {
            // If network doesn't exist, add it
            if (error.code === 4902) {
                await this.provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [this.bscConfig]
                });
            } else {
                throw error;
            }
        }
    }

    async getBalance() {
        try {
            if (!this.address) return;
            
            // Get BNB balance
            const bnbBalance = await this.provider.request({
                method: 'eth_getBalance',
                params: [this.address, 'latest']
            });
            
            this.balance = parseInt(bnbBalance, 16) / Math.pow(10, 18);
            
            // Get USDC balance
            const usdcBalance = await this.getUSDCBalance();
            
            return {
                bnb: this.balance,
                usdc: usdcBalance
            };
            
        } catch (error) {
            console.error('Failed to get balance:', error);
            return { bnb: 0, usdc: 0 };
        }
    }

    async getUSDCBalance() {
        try {
            // USDC balance check using contract call
            const contract = new ethers.Contract(
                this.usdcContract,
                ['function balanceOf(address) view returns (uint256)'],
                this.provider
            );
            
            const balance = await contract.balanceOf(this.address);
            return parseFloat(ethers.utils.formatUnits(balance, this.usdcDecimals));
            
        } catch (error) {
            console.error('Failed to get USDC balance:', error);
            return 0;
        }
    }

    async payWithUSDC(amount, recipient) {
        try {
            this.showLoading(true);
            
            // Check USDC balance
            const usdcBalance = await this.getUSDCBalance();
            
            if (usdcBalance < amount) {
                // Show swap option
                const needsToSwap = amount - usdcBalance;
                const shouldSwap = confirm(
                    `You need ${needsToSwap.toFixed(2)} more USDC. Would you like to swap BNB to USDC?`
                );
                
                if (shouldSwap) {
                    await this.swapBNBToUSDC(needsToSwap);
                } else {
                    this.showToast('Insufficient USDC balance', 'error');
                    return false;
                }
            }
            
            // Process USDC payment
            const success = await this.transferUSDC(amount, recipient);
            
            if (success) {
                this.showToast(`Payment of ${amount} USDC successful!`, 'success');
            }
            
            return success;
            
        } catch (error) {
            console.error('USDC payment failed:', error);
            this.showToast('Payment failed: ' + error.message, 'error');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    async swapBNBToUSDC(amount) {
        try {
            // Use 1inch API for best swap rates
            const swapUrl = `https://api.1inch.io/v5.0/56/swap?fromTokenAddress=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&toTokenAddress=${this.usdcContract}&amount=${ethers.utils.parseEther(amount.toString())}&fromAddress=${this.address}&slippage=1`;
            
            const response = await fetch(swapUrl);
            const swapData = await response.json();
            
            // Execute swap transaction
            const tx = await this.provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: this.address,
                    to: swapData.tx.to,
                    data: swapData.tx.data,
                    value: swapData.tx.value,
                    gas: swapData.tx.gas
                }]
            });
            
            // Wait for transaction confirmation
            await this.waitForTransaction(tx);
            
            this.showToast('BNB swapped to USDC successfully!', 'success');
            return true;
            
        } catch (error) {
            console.error('Swap failed:', error);
            this.showToast('Swap failed: ' + error.message, 'error');
            return false;
        }
    }

    async transferUSDC(amount, recipient) {
        try {
            // Create USDC transfer transaction
            const contract = new ethers.Contract(
                this.usdcContract,
                [
                    'function transfer(address to, uint256 amount) returns (bool)',
                    'function transferFrom(address from, address to, uint256 amount) returns (bool)'
                ],
                this.provider.getSigner()
            );
            
            const amountWei = ethers.utils.parseUnits(amount.toString(), this.usdcDecimals);
            
            // Calculate platform fee
            const platformFeeAmount = (amount * this.platformFee) / 100;
            const creatorAmount = amount - platformFeeAmount;
            
            // Transfer to creator
            const creatorTx = await contract.transfer(recipient, ethers.utils.parseUnits(creatorAmount.toString(), this.usdcDecimals));
            await creatorTx.wait();
            
            // Transfer platform fee to owner
            const feeTx = await contract.transfer(this.platformOwner, ethers.utils.parseUnits(platformFeeAmount.toString(), this.usdcDecimals));
            await feeTx.wait();
            
            console.log(`Payment processed: ${creatorAmount} USDC to creator, ${platformFeeAmount} USDC platform fee`);
            return true;
            
        } catch (error) {
            console.error('USDC transfer failed:', error);
            throw error;
        }
    }

    async waitForTransaction(txHash) {
        return new Promise((resolve, reject) => {
            const checkTx = async () => {
                try {
                    const receipt = await this.provider.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    });
                    
                    if (receipt) {
                        resolve(receipt);
                    } else {
                        setTimeout(checkTx, 2000);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            checkTx();
        });
    }

    disconnectWallet() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.network = null;
        this.provider = null;
        this.updateWalletUI();
        this.showToast('Wallet disconnected', 'info');
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet-btn');
        const walletInfo = document.getElementById('wallet-info');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        
        if (this.isConnected) {
            connectBtn.style.display = 'none';
            walletInfo.style.display = 'block';
            disconnectBtn.style.display = 'block';
            
            const walletAddressEl = document.getElementById('wallet-address');
            const walletBalanceEl = document.getElementById('wallet-balance');
            
            if (walletAddressEl) {
                walletAddressEl.textContent = `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
            }
            if (walletBalanceEl) {
                walletBalanceEl.textContent = `${this.balance.toFixed(4)} BNB`;
            }
        } else {
            connectBtn.style.display = 'block';
            walletInfo.style.display = 'none';
            disconnectBtn.style.display = 'none';
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize MetaMask wallet manager
const metaMaskWallet = new MetaMaskWalletManager();
