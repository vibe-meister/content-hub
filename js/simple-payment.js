// Simple Payment Processor - No Smart Contract Needed!
class SimplePaymentProcessor {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        this.platformOwner = '0x44edA89fdff579f5FB51E14253B67B557A00d16c'; // Your wallet
        this.platformFee = 5; // 5% platform fee
        this.contentList = [];
        this.pendingPayments = [];
        
        // Simple BSC configuration
        this.bscConfig = {
            chainId: '0x38', // BSC MainNet
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
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

            // Switch to BSC if needed
            const chainId = await this.provider.getNetwork();
            if (chainId.chainId !== 56) {
                await this.switchToBSC();
            }

            app.showToast('MetaMask connected! Ready to process payments.', 'success');
            this.updateWalletUI();
            return true;

        } catch (error) {
            console.error('Connection failed:', error);
            app.showToast('Failed to connect: ' + error.message, 'error');
            return false;
        }
    }

    async switchToBSC() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [this.bscConfig]
            });
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.bscConfig.chainId }]
            });
            app.showToast('Switched to BSC!', 'success');
        } catch (error) {
            console.error('Failed to switch to BSC:', error);
            app.showToast('Please switch to BSC manually in MetaMask.', 'warning');
        }
    }

    async getBNBBalance() {
        if (!this.isConnected) return 0;
        try {
            const balance = await this.provider.getBalance(this.address);
            return parseFloat(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error('Failed to get BNB balance:', error);
            return 0;
        }
    }

    // Process payment from user to platform
    async processPayment(contentId, amount, creatorAddress) {
        try {
            if (!this.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            // Calculate fees
            const platformFeeAmount = (amount * this.platformFee) / 100;
            const creatorAmount = amount - platformFeeAmount;

            // Record the payment
            const payment = {
                id: 'payment_' + Date.now(),
                contentId: contentId,
                amount: amount,
                platformFee: platformFeeAmount,
                creatorAmount: creatorAmount,
                creatorAddress: creatorAddress,
                userAddress: this.address,
                timestamp: new Date(),
                status: 'pending'
            };

            this.pendingPayments.push(payment);

            // Simulate payment processing (in real app, you'd send to your wallet)
            app.showToast(`Payment processed! Platform fee: ${platformFeeAmount.toFixed(2)} USDC, Creator gets: ${creatorAmount.toFixed(2)} USDC`, 'success');
            
            // Update content access
            this.grantContentAccess(contentId, this.address);
            
            return payment;

        } catch (error) {
            console.error('Payment processing failed:', error);
            app.showToast('Payment failed: ' + error.message, 'error');
            throw error;
        }
    }

    // Grant access to content (no blockchain needed)
    grantContentAccess(contentId, userAddress) {
        const accessKey = `access_${contentId}_${userAddress}`;
        localStorage.setItem(accessKey, JSON.stringify({
            contentId: contentId,
            userAddress: userAddress,
            timestamp: new Date(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }));
    }

    // Check if user has access to content
    hasContentAccess(contentId, userAddress) {
        const accessKey = `access_${contentId}_${userAddress}`;
        const access = localStorage.getItem(accessKey);
        
        if (!access) return false;
        
        const accessData = JSON.parse(access);
        const now = new Date();
        const expires = new Date(accessData.expires);
        
        return now < expires;
    }

    // Upload content (no blockchain needed)
    async uploadContent(contentData) {
        try {
            const content = {
                id: 'content_' + Date.now(),
                title: contentData.title,
                description: contentData.description,
                creator: this.address,
                contentType: contentData.contentType,
                viewPrice: contentData.viewPrice,
                ownershipPrice: contentData.ownershipPrice,
                thumbnail: contentData.thumbnail || 'https://via.placeholder.com/300x200/0d98ba/ffffff?text=Content',
                uploadDate: new Date(),
                views: 0,
                status: 'active'
            };

            this.contentList.unshift(content);
            
            // Save to localStorage
            localStorage.setItem('drip_content', JSON.stringify(this.contentList));
            
            app.showToast('Content uploaded successfully!', 'success');
            return content;

        } catch (error) {
            console.error('Content upload failed:', error);
            app.showToast('Upload failed: ' + error.message, 'error');
            throw error;
        }
    }

    // Get content list
    getContentList() {
        const saved = localStorage.getItem('drip_content');
        if (saved) {
            this.contentList = JSON.parse(saved);
        }
        return this.contentList;
    }

    // Get platform stats
    getPlatformStats() {
        const totalContent = this.contentList.length;
        const totalRevenue = this.pendingPayments.reduce((sum, payment) => sum + payment.platformFee, 0);
        const totalPaidToCreators = this.pendingPayments.reduce((sum, payment) => sum + payment.creatorAmount, 0);
        
        return {
            totalContent: totalContent,
            totalRevenue: totalRevenue,
            totalPaidToCreators: totalPaidToCreators,
            pendingPayments: this.pendingPayments.length
        };
    }

    // Admin function to pay creators (you would do this manually or with a script)
    async payCreator(creatorAddress, amount) {
        try {
            // In real implementation, you'd send USDC/BNB to creator
            app.showToast(`Creator payment: ${amount} USDC to ${creatorAddress}`, 'info');
            
            // Mark payment as completed
            const payment = this.pendingPayments.find(p => p.creatorAddress === creatorAddress);
            if (payment) {
                payment.status = 'completed';
            }
            
            return true;
        } catch (error) {
            console.error('Creator payment failed:', error);
            app.showToast('Creator payment failed: ' + error.message, 'error');
            return false;
        }
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
                this.getBNBBalance().then(balance => {
                    walletBalanceEl.textContent = `Balance: ${balance.toFixed(4)} BNB`;
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

    disconnectWallet() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.provider = null;
        this.signer = null;
        app.showToast('Wallet disconnected.', 'info');
        this.updateWalletUI();
    }
}

const simplePayment = new SimplePaymentProcessor();
