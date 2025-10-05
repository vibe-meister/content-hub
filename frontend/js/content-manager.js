// Content Management for Algo Content Hub
class ContentManager {
    constructor() {
        this.currentContent = null;
        this.contentList = [];
        this.userContent = [];
        this.isLoading = false;
        this.searchQuery = '';
        this.categoryFilter = '';
        this.sortBy = 'newest';
    }

    async loadContent(contentId) {
        try {
            this.showLoading(true);
            
            // Get content info from BSC smart contract
            const contentInfo = await bscSmartContract.getContentInfo(contentId);
            
            // Set current content
            this.currentContent = {
                id: contentId,
                ...contentInfo
            };
            
            // Display content in modal
            this.displayContent(this.currentContent);
            
            // Check if user has access
            await this.checkUserAccess(contentId);
            
        } catch (error) {
            console.error('Failed to load content:', error);
            this.showToast('Failed to load content', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayContent(content) {
        // Show content viewer modal
        const modal = document.getElementById('content-viewer-modal');
        modal.classList.add('active');
        
        // Update content info
        document.getElementById('content-title').textContent = content.title || 'Untitled';
        document.getElementById('content-description').textContent = content.description || 'No description';
        document.getElementById('content-type').textContent = content.contentType;
        document.getElementById('content-price').textContent = `${content.viewPrice} USDC`;
        document.getElementById('content-owner').textContent = this.formatAddress(content.owner);
        
        // Display content based on type
        this.displayContentByType(content);
        
        // Update payment info
        document.getElementById('view-price').textContent = `${content.viewPrice} ALGO`;
        document.getElementById('ownership-price').textContent = `${content.ownershipPrice} ALGO`;
    }

    displayContentByType(content) {
        const contentMedia = document.getElementById('content-media');
        
        // Clear previous content
        contentMedia.innerHTML = '';
        
        switch (content.contentType) {
            case 'video':
                const video = document.createElement('video');
                video.controls = true;
                video.style.width = '100%';
                video.style.height = 'auto';
                video.style.maxHeight = '500px';
                video.src = this.getContentUrl(content);
                contentMedia.appendChild(video);
                break;
            case 'image':
                const img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '500px';
                img.style.objectFit = 'contain';
                img.src = this.getContentUrl(content);
                contentMedia.appendChild(img);
                break;
            case 'url':
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '500px';
                iframe.src = this.getContentUrl(content);
                iframe.frameBorder = '0';
                contentMedia.appendChild(iframe);
                break;
            default:
                const placeholder = document.createElement('div');
                placeholder.style.padding = '2rem';
                placeholder.style.textAlign = 'center';
                placeholder.style.color = '#666';
                placeholder.innerHTML = `
                    <i class="fas fa-file" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Content preview not available</p>
                `;
                contentMedia.appendChild(placeholder);
        }
    }

    getContentUrl(content) {
        // For demo purposes, return placeholder URLs
        const baseUrl = 'https://via.placeholder.com/';
        switch (content.contentType) {
            case 'video':
                return 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
            case 'image':
                return baseUrl + '600x400/0d98ba/ffffff?text=' + encodeURIComponent(content.title);
            case 'url':
                return 'https://example.com';
            default:
                return baseUrl + '600x400/9ca3af/ffffff?text=Content';
        }
    }

    async checkUserAccess(contentId) {
        try {
            if (!metaMaskWallet.isConnected) {
                this.showPaymentSection();
                return;
            }
            
            const hasAccess = await bscSmartContract.verifyViewAccess(contentId, metaMaskWallet.address);
            
            if (hasAccess) {
                this.showAccessSection();
            } else {
                this.showPaymentSection();
            }
        } catch (error) {
            console.error('Failed to check user access:', error);
            this.showPaymentSection();
        }
    }

    showPaymentSection() {
        document.getElementById('payment-section').style.display = 'block';
        document.getElementById('access-section').style.display = 'none';
    }

    showAccessSection() {
        document.getElementById('payment-section').style.display = 'none';
        document.getElementById('access-section').style.display = 'block';
        
        // Show session expiry
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        document.getElementById('session-expiry').textContent = `Expires: ${expiryTime.toLocaleString()}`;
    }

    async payToView() {
        try {
            if (!metaMaskWallet.isConnected) {
                this.showToast('Please connect your wallet first', 'warning');
                return;
            }
            
            const content = this.currentContent;
            const paymentAmount = content.viewPrice;
            
            // Show payment modal
            this.showPaymentModal('view', paymentAmount);
            
        } catch (error) {
            console.error('Payment failed:', error);
            this.showToast('Payment failed', 'error');
        }
    }

    async payToOwn() {
        try {
            if (!metaMaskWallet.isConnected) {
                this.showToast('Please connect your wallet first', 'warning');
                return;
            }
            
            const content = this.currentContent;
            const paymentAmount = content.ownershipPrice;
            
            // Show payment modal
            this.showPaymentModal('own', paymentAmount);
            
        } catch (error) {
            console.error('Payment failed:', error);
            this.showToast('Payment failed', 'error');
        }
    }

    showPaymentModal(type, amount) {
        const modal = document.getElementById('payment-modal');
        const paymentAmount = document.getElementById('payment-amount');
        const platformFee = document.getElementById('platform-fee');
        const creatorPayment = document.getElementById('creator-payment');
        const totalPayment = document.getElementById('total-payment');
        
        // Calculate fees (5% platform fee)
        const platformFeeAmount = amount * 0.05;
        const creatorPaymentAmount = amount - platformFeeAmount;
        const totalAmount = amount;
        
        // Update modal content
        paymentAmount.textContent = `${amount} ALGO`;
        platformFee.textContent = `${platformFeeAmount.toFixed(2)} ALGO`;
        creatorPayment.textContent = `${creatorPaymentAmount.toFixed(2)} ALGO`;
        totalPayment.textContent = `${totalAmount} ALGO`;
        
        // Show modal
        modal.classList.add('active');
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-payment');
        confirmBtn.onclick = () => this.confirmPayment(type, amount);
    }

    async confirmPayment(type, amount) {
        try {
            this.showLoading(true);
            
            const content = this.currentContent;
            
            if (type === 'view') {
                await bscSmartContract.payToView(content.id, amount);
            } else if (type === 'own') {
                await bscSmartContract.payToOwn(content.id, amount);
            }
            
            // Close modal
            this.closePaymentModal();
            
            // Refresh content access
            await this.checkUserAccess(content.id);
            
            // Show success message
            this.showToast('Payment successful!', 'success');
            
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            this.showToast('Payment failed', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    closePaymentModal() {
        document.getElementById('payment-modal').classList.remove('active');
    }

    closeContentViewer() {
        document.getElementById('content-viewer-modal').classList.remove('active');
        this.currentContent = null;
    }

    async uploadContent(formData) {
        try {
            console.log('Starting content upload...');
            this.showLoading(true);
            
            // Check wallet connection
            if (!metaMaskWallet.isConnected) {
                throw new Error('Please connect your wallet first');
            }
            
            // Check if user has BNB for gas fees
            const bnbBalance = await metaMaskWallet.getBNBBalance();
            if (bnbBalance < 0.001) {
                throw new Error('Insufficient BNB for gas fees. Please get test BNB from faucet first.');
            }
            
            // Extract form data
            const title = document.getElementById('content-title-input').value;
            const description = document.getElementById('content-description-input').value;
            const contentType = document.getElementById('content-type-select').value;
            const viewPrice = parseFloat(document.getElementById('view-price-input').value);
            const ownershipPrice = parseFloat(document.getElementById('ownership-price-input').value);
            const contentFile = document.getElementById('content-file').files[0];
            const contentUrl = document.getElementById('content-url-input').value;
            
            console.log('Form data extracted:', { title, description, contentType, viewPrice, ownershipPrice });
            
            // Generate content ID
            const contentId = this.generateContentId();
            
            // Simulate file upload to IPFS
            let ipfsHash = 'demo_ipfs_' + contentId;
            if (contentType === 'url') {
                ipfsHash = await this.uploadURLToIPFS(contentUrl);
            } else if (contentFile) {
                ipfsHash = await this.uploadFileToIPFS(contentFile);
            }
            
            // Create metadata
            const metadata = {
                title,
                description,
                contentType,
                creator: metaMaskWallet.address,
                timestamp: Date.now()
            };
            
            // Upload metadata to IPFS
            const metadataHash = await this.uploadMetadataToIPFS(metadata);
            
            // Upload to smart contract
            const uploadData = {
                contentId,
                ipfsHash,
                contentType,
                viewPrice: viewPrice, // USDC (18 decimals)
                ownershipPrice: ownershipPrice, // USDC (18 decimals)
                metadataHash,
                title,
                description
            };
            
            await bscSmartContract.uploadContent(uploadData);
            
            // Show success message
            this.showToast('Content uploaded successfully!', 'success');
            
            // Reset form
            document.getElementById('upload-form').reset();
            this.resetFileUpload();
            
            // Refresh content list
            await this.loadMarketplaceContent();
            
        } catch (error) {
            console.error('Content upload failed:', error);
            this.showToast('Content upload failed', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async uploadFileToIPFS(file) {
        try {
            // Simulate IPFS upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            return 'demo_ipfs_' + Date.now();
        } catch (error) {
            console.error('IPFS upload failed:', error);
            throw error;
        }
    }

    async uploadURLToIPFS(url) {
        try {
            // Simulate URL metadata upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            return 'demo_url_' + Date.now();
        } catch (error) {
            console.error('URL upload failed:', error);
            throw error;
        }
    }

    async uploadMetadataToIPFS(metadata) {
        try {
            // Simulate metadata upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            return 'demo_metadata_' + Date.now();
        } catch (error) {
            console.error('Metadata upload failed:', error);
            throw error;
        }
    }

    generateContentId() {
        return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async loadMarketplaceContent() {
        try {
            // Load content from smart contract
            const contentList = await bscSmartContract.getContentList();
            this.contentList = contentList;
            
            // Display content in marketplace
            this.displayContentGrid(contentList);
            
        } catch (error) {
            console.error('Failed to load marketplace content:', error);
            this.showToast('Failed to load content', 'error');
        }
    }

    displayContentGrid(contentList) {
        const contentGrid = document.getElementById('content-grid');
        contentGrid.innerHTML = '';
        
        if (contentList.length === 0) {
            contentGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No content found</p>
                </div>
            `;
            return;
        }
        
        contentList.forEach(content => {
            const contentCard = this.createContentCard(content);
            contentGrid.appendChild(contentCard);
        });
    }

    createContentCard(content) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
            <div class="content-card-image">
                <img src="${content.thumbnail}" alt="${content.title}" style="width: 100%; height: 200px; object-fit: cover;">
            </div>
            <div class="content-card-body">
                <h3 class="content-card-title">${content.title}</h3>
                <p class="content-card-description">${content.description}</p>
                <div class="content-card-meta">
                    <span class="content-card-type">${content.type}</span>
                    <span class="content-card-price">${content.viewPrice} ALGO</span>
                </div>
                <div class="content-card-footer">
                    <div class="content-card-owner">
                        <i class="fas fa-user"></i>
                        <span>${this.formatAddress(content.owner)}</span>
                    </div>
                    <div class="content-card-actions">
                        <button class="btn btn-primary btn-sm">
                            <i class="fas fa-eye"></i>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.loadContent(content.id);
        });
        
        return card;
    }

    async searchContent() {
        try {
            const query = document.getElementById('search-input').value;
            const category = document.getElementById('category-filter').value;
            const sortBy = document.getElementById('sort-filter').value;
            
            this.searchQuery = query;
            this.categoryFilter = category;
            this.sortBy = sortBy;
            
            const results = await bscSmartContract.searchContent(query, category, sortBy);
            this.displayContentGrid(results);
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showToast('Search failed', 'error');
        }
    }

    resetFileUpload() {
        const filePreview = document.getElementById('file-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        
        filePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
        
        document.getElementById('content-file').value = '';
    }

    formatAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
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
}

// Initialize content manager
const contentManager = new ContentManager();

// Export for use in other modules
window.contentManager = contentManager;
