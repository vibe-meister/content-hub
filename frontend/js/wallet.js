// Wallet Integration for Algo Content Hub
class WalletManager {
    constructor() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.provider = null;
    }

    async connectWallet() {
        try {
            this.showLoading(true);
            
            // Try Pera Wallet (mobile app)
            if (typeof window !== 'undefined' && window.algorand) {
                this.provider = 'pera';
                this.wallet = window.algorand;
                await this.wallet.enable();
                
                const accounts = await this.wallet.getAccounts();
                if (accounts.length > 0) {
                    this.address = accounts[0].address;
                    this.isConnected = true;
                    await this.getBalance();
                    this.updateWalletUI();
                    this.showToast('Pera Wallet connected successfully!', 'success');
                    return true;
                }
            }
            
            // Try Defly Wallet
            if (typeof window !== 'undefined' && window.defly) {
                this.provider = 'defly';
                this.wallet = window.defly;
                const accounts = await this.wallet.connect();
                if (accounts.length > 0) {
                    this.address = accounts[0].address;
                    this.isConnected = true;
                    await this.getBalance();
                    this.updateWalletUI();
                    this.showToast('Defly Wallet connected successfully!', 'success');
                    return true;
                }
            }
            
            // Try KMD (Key Management Daemon) for local wallets
            if (typeof window !== 'undefined' && window.kmd) {
                this.provider = 'kmd';
                this.wallet = window.kmd;
                const accounts = await this.wallet.connect();
                if (accounts.length > 0) {
                    this.address = accounts[0].address;
                    this.isConnected = true;
                    await this.getBalance();
                    this.updateWalletUI();
                    this.showToast('KMD Wallet connected successfully!', 'success');
                    return true;
                }
            }
            
            // If no wallet found, show QR code modal for mobile connection
            console.log('No desktop wallet found, showing QR code for mobile connection');
            this.showQRCodeModal();
            return false;
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showToast('Failed to connect wallet: ' + error.message, 'error');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    async getBalance() {
        try {
            if (!this.wallet || !this.address) {
                return 0;
            }

            // For demo purposes, return a mock balance
            // In production, this would call the actual wallet API
            this.balance = Math.random() * 100; // Mock balance
            return this.balance;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return 0;
        }
    }

    async sendPayment(recipient, amount) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet not connected');
            }

            this.showLoading(true);
            
            // Convert ALGO to microALGO
            const microALGO = Math.round(amount * 1000000);

            // Create payment transaction
            const transaction = {
                from: this.address,
                to: recipient,
                amount: microALGO,
                note: 'Algo Content Hub Payment'
            };

            // For demo purposes, simulate transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const txId = 'demo_tx_' + Date.now();
            console.log('Payment sent:', txId);
            this.showToast('Payment sent successfully!', 'success');
            return txId;
            
        } catch (error) {
            console.error('Payment failed:', error);
            this.showToast('Payment failed: ' + error.message, 'error');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async signMessage(message) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet not connected');
            }

            // For demo purposes, simulate message signing
            const signature = 'demo_signature_' + Date.now();
            return signature;
        } catch (error) {
            console.error('Message signing failed:', error);
            throw error;
        }
    }

    updateWalletUI() {
        const walletInfo = document.getElementById('wallet-info');
        const walletConnect = document.getElementById('wallet-connect');
        const walletAddressText = document.getElementById('wallet-address-text');
        const walletBalanceText = document.getElementById('wallet-balance-text');

        if (this.isConnected) {
            walletInfo.style.display = 'flex';
            walletConnect.style.display = 'none';
            walletAddressText.textContent = this.formatAddress(this.address);
            walletBalanceText.textContent = `${this.balance.toFixed(2)} ALGO`;
        } else {
            walletInfo.style.display = 'none';
            walletConnect.style.display = 'block';
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }

    disconnectWallet() {
        this.wallet = null;
        this.address = null;
        this.balance = 0;
        this.isConnected = false;
        this.provider = null;
        this.updateWalletUI();
        this.showToast('Wallet disconnected', 'info');
        console.log('Wallet disconnected');
    }

    getAddress() {
        return this.address;
    }

    getBalance() {
        return this.balance;
    }

    isWalletConnected() {
        return this.isConnected;
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('active');
            } else {
                loadingOverlay.classList.remove('active');
            }
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

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 5 seconds
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

    showQRCodeModal() {
        const modal = document.getElementById('qr-modal');
        if (!modal) return;

        // Generate QR code
        this.generateQRCode();
        
        // Show modal
        modal.classList.add('active');
        
        // Set up event listeners
        this.setupQRModalEvents();
    }

    async generateQRCode() {
        try {
            const qrContainer = document.getElementById('qr-code');
            if (!qrContainer) {
                console.error('QR container not found');
                return;
            }

            // Get current website URL and replace localhost with actual IP
            let currentUrl = window.location.href;
            if (currentUrl.includes('localhost')) {
                currentUrl = currentUrl.replace('localhost', '192.168.1.79');
            }
            console.log('Current URL:', currentUrl);
            console.log('QRCode library available:', typeof QRCode !== 'undefined');
            
            // Check if QRCode library is loaded
            if (typeof QRCode === 'undefined') {
                console.log('QRCode library not loaded, trying alternative method');
                
                // Try alternative QR code generation
                if (typeof qrcode !== 'undefined') {
                    try {
                        const qr = qrcode(0, 'M');
                        qr.addData(currentUrl);
                        qr.make();
                        
                        const qrHtml = qr.createImgTag(4, 8);
                        qrContainer.innerHTML = `
                            <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px;">
                                <h4 style="margin-bottom: 1rem; color: #0d98ba;">Mobile Connection</h4>
                                <p style="margin-bottom: 1rem; color: #666;">Scan this QR code with your mobile wallet:</p>
                                <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                                    ${qrHtml}
                                </div>
                                <p style="font-size: 0.8rem; color: #666; word-break: break-all;">${currentUrl}</p>
                            </div>
                        `;
                        return;
                    } catch (error) {
                        console.error('Alternative QR generation failed:', error);
                    }
                }
                
                // Final fallback
                qrContainer.innerHTML = window.generateFallbackQR ? window.generateFallbackQR(currentUrl) : `
                    <div style="padding: 2rem; text-align: center; color: #666;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>QR Code library not loaded</p>
                        <p>URL: ${currentUrl}</p>
                    </div>
                `;
                return;
            }
            console.log('Generating QR code for:', currentUrl);
            
            // Clear previous QR code
            qrContainer.innerHTML = '';
            
            // Show loading state
            qrContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #666;">
                    <div class="spinner" style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #0d98ba; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p>Generating QR code...</p>
                </div>
            `;
            
            // Generate QR code
            try {
                const canvas = document.createElement('canvas');
                await QRCode.toCanvas(canvas, currentUrl, {
                    width: 200,
                    height: 200,
                    color: {
                        dark: '#0d98ba',
                        light: '#ffffff'
                    },
                    margin: 2,
                    errorCorrectionLevel: 'M'
                });
                
                // Clear loading state and add canvas
                qrContainer.innerHTML = '';
                qrContainer.appendChild(canvas);
                console.log('QR code generated successfully');
            } catch (error) {
                console.error('QR code generation failed:', error);
                // Fallback to text display
                qrContainer.innerHTML = `
                    <div style="padding: 2rem; text-align: center; background: white; border-radius: 12px;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
                        <h4 style="margin-bottom: 1rem; color: #0d98ba;">Mobile Connection</h4>
                        <p style="margin-bottom: 1rem; color: #666;">Scan this URL with your mobile wallet:</p>
                        <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; word-break: break-all; font-family: monospace; font-size: 0.9rem;">
                            ${currentUrl}
                        </div>
                        <button onclick="navigator.clipboard.writeText('${currentUrl}')" style="background: #0d98ba; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                            Copy URL
                        </button>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            const qrContainer = document.getElementById('qr-code');
            if (qrContainer) {
                qrContainer.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: #666;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Failed to generate QR code</p>
                        <small>Error: ${error.message}</small>
                    </div>
                `;
            }
        }
    }

    setupQRModalEvents() {
        // Close QR modal
        const closeBtn = document.getElementById('close-qr-modal');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeQRModal();
        }

        // Refresh QR code
        const refreshBtn = document.getElementById('refresh-qr');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.generateQRCode();
        }

        // Copy URL
        const copyBtn = document.getElementById('copy-url');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyURL();
        }
    }

    closeQRModal() {
        const modal = document.getElementById('qr-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async copyURL() {
        try {
            const currentUrl = window.location.href;
            await navigator.clipboard.writeText(currentUrl);
            this.showToast('URL copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.showToast('Failed to copy URL', 'error');
        }
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Export for use in other modules
window.walletManager = walletManager;