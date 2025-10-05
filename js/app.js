// Main App for Algo Content Hub
class AlgoContentHubApp {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'marketplace';
    }

    async initialize() {
        try {
            console.log('Initializing Algo Content Hub...');
            
            // Initialize smart contract
            await this.initializeSmartContract();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial content
            await this.loadMarketplaceContent();
            
            // Load platform stats
            await this.loadPlatformStats();
            
            this.isInitialized = true;
            console.log('Algo Content Hub initialized successfully');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    async initializeSmartContract() {
        try {
            // Initialize BSC smart contract with mock data for demo
            const contractAddress = 'MOCK_CONTRACT_ADDRESS';
            const contractABI = {};
            
            await bscSmartContract.initialize(contractAddress, contractABI);
            console.log('BSC Smart contract initialized with mock data');
            console.log('Platform owner configured: 0x44edA89fdff579f5FB51E14253B67B557A00d16c');
        } catch (error) {
            console.error('BSC Smart contract initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Wallet connection
        document.getElementById('connect-wallet-btn').addEventListener('click', () => {
            this.toggleWalletConnection();
        });

        document.getElementById('disconnect-wallet').addEventListener('click', () => {
            metaMaskWallet.disconnectWallet();
        });

        // Content viewer modal
        document.getElementById('close-viewer').addEventListener('click', () => {
            contentManager.closeContentViewer();
        });

        // Payment modal
        document.getElementById('close-payment-modal').addEventListener('click', () => {
            contentManager.closePaymentModal();
        });

        // Content actions
        document.getElementById('pay-to-view').addEventListener('click', () => {
            contentManager.payToView();
        });

        document.getElementById('pay-to-own').addEventListener('click', () => {
            contentManager.payToOwn();
        });

        // Upload form
        document.getElementById('upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUploadForm();
        });

        // File upload
        this.setupFileUpload();

        // Search and filters
        document.getElementById('search-input').addEventListener('input', () => {
            this.debounce(() => contentManager.searchContent(), 300)();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            contentManager.searchContent();
        });

        document.getElementById('sort-filter').addEventListener('change', () => {
            contentManager.searchContent();
        });

        // Load more content
        document.getElementById('load-more-btn').addEventListener('click', () => {
            this.loadMoreContent();
        });

        // Mobile navigation
        document.getElementById('nav-toggle').addEventListener('click', () => {
            this.toggleMobileNav();
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // QR Modal events
        document.getElementById('close-qr-modal').addEventListener('click', () => {
            walletManager.closeQRModal();
        });
    }

    setupFileUpload() {
        const fileInput = document.getElementById('content-file');
        const uploadArea = document.getElementById('file-upload-area');
        const filePreview = document.getElementById('file-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                fileInput.files = e.dataTransfer.files;
                this.handleFileSelect(file);
            }
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Remove file
        document.getElementById('remove-file').addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetFileUpload();
        });

        // Content type change
        document.getElementById('content-type-select').addEventListener('change', (e) => {
            const urlGroup = document.getElementById('url-input-group');
            if (e.target.value === 'url') {
                urlGroup.style.display = 'block';
            } else {
                urlGroup.style.display = 'none';
            }
        });
    }

    handleFileSelect(file) {
        const filePreview = document.getElementById('file-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');

        // Show file preview
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        uploadPlaceholder.style.display = 'none';
        filePreview.style.display = 'flex';
    }

    resetFileUpload() {
        const filePreview = document.getElementById('file-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        
        filePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
        
        document.getElementById('content-file').value = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async toggleWalletConnection() {
        try {
            if (metaMaskWallet.isConnected) {
                metaMaskWallet.disconnectWallet();
            } else {
                const connected = await metaMaskWallet.connectWallet();
                if (connected) {
                    await this.loadUserDashboard();
                }
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showToast('Wallet connection failed', 'error');
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        if (sectionName === 'dashboard' && metaMaskWallet.isConnected) {
            this.loadUserDashboard();
        }
    }

    async loadMarketplaceContent() {
        try {
            await contentManager.loadMarketplaceContent();
        } catch (error) {
            console.error('Failed to load marketplace content:', error);
            this.showToast('Failed to load content', 'error');
        }
    }

    async loadPlatformStats() {
        try {
            const stats = await bscSmartContract.getPlatformStats();
            
            document.getElementById('total-content').textContent = stats.totalContent;
            document.getElementById('total-creators').textContent = stats.totalUsers;
            document.getElementById('total-revenue').textContent = stats.totalRevenue.toFixed(1);
        } catch (error) {
            console.error('Failed to load platform stats:', error);
        }
    }

    async loadUserDashboard() {
        try {
            if (!metaMaskWallet.isConnected) {
                return;
            }
            
            const userAddress = metaMaskWallet.address;
            
            // Get user content
            const userContent = await bscSmartContract.getUserContent(userAddress);
            
            // Get user payments
            const userPayments = await bscSmartContract.getUserPayments(userAddress);
            
            // Get user revenue (simplified)
            let userRevenue = 0;
            for (const contentId of userContent) {
                const revenue = await bscSmartContract.getCreatorRevenue(contentId);
                userRevenue += revenue;
            }
            
            // Update dashboard
            document.getElementById('user-content-count').textContent = userContent.length;
            document.getElementById('user-revenue').textContent = `${userRevenue.toFixed(2)} USDC`;
            document.getElementById('user-payments').textContent = `${userPayments.toFixed(2)} USDC`;
            document.getElementById('user-views').textContent = Math.floor(Math.random() * 1000); // Mock views
            
            // Load user content list
            this.loadUserContentList(userContent);
            
        } catch (error) {
            console.error('Failed to load user dashboard:', error);
            this.showToast('Failed to load dashboard', 'error');
        }
    }

    async loadUserContentList(userContentIds) {
        try {
            const userContentList = document.getElementById('user-content-list');
            userContentList.innerHTML = '';
            
            if (userContentIds.length === 0) {
                userContentList.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-upload" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No content uploaded yet</p>
                    </div>
                `;
                return;
            }
            
            // Load content details for each ID
            for (const contentId of userContentIds) {
                try {
                    const contentInfo = await bscSmartContract.getContentInfo(contentId);
                    const contentCard = this.createUserContentCard(contentId, contentInfo);
                    userContentList.appendChild(contentCard);
                } catch (error) {
                    console.error('Failed to load content info:', contentId, error);
                }
            }
        } catch (error) {
            console.error('Failed to load user content list:', error);
        }
    }

    createUserContentCard(contentId, contentInfo) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
            <div class="content-card-body">
                <h3 class="content-card-title">${contentInfo.title || 'Untitled'}</h3>
                <p class="content-card-description">${contentInfo.description || 'No description'}</p>
                <div class="content-card-meta">
                    <span class="content-card-type">${contentInfo.contentType}</span>
                    <span class="content-card-price">${contentInfo.viewPrice} USDC</span>
                </div>
                <div class="content-card-footer">
                    <div class="content-card-actions">
                        <button class="btn btn-primary btn-sm" onclick="contentManager.loadContent('${contentId}')">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    async handleUploadForm() {
        try {
            await contentManager.uploadContent();
        } catch (error) {
            console.error('Upload form handling failed:', error);
            this.showToast('Upload failed', 'error');
        }
    }

    openFaucet() {
        // Open BSC TestNet faucet in new tab
        const faucetUrl = 'https://testnet.bnbchain.org/faucet-smart';
        window.open(faucetUrl, '_blank');
        
        // Show instructions
        this.showToast('Faucet opened! Enter your wallet address to get test BNB for gas fees.', 'info');
    }

    async loadMoreContent() {
        try {
            // For demo purposes, just reload current content
            await this.loadMarketplaceContent();
            this.showToast('Content refreshed', 'info');
        } catch (error) {
            console.error('Failed to load more content:', error);
            this.showToast('Failed to load more content', 'error');
        }
    }

    toggleMobileNav() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new AlgoContentHubApp();
    await app.initialize();
    
    // Make app globally available
    window.app = app;
});