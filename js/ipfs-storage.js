// IPFS Storage Integration for Free Video Hosting
class IPFSStorage {
    constructor() {
        this.ipfsGateway = 'https://ipfs.io/ipfs/';
        this.pinataApiKey = null; // Optional: for pinning
        this.pinataSecretKey = null; // Optional: for pinning
    }

    async uploadToIPFS(file) {
        try {
            console.log('Uploading to IPFS:', file.name);
            
            // Method 1: Direct IPFS upload (free)
            const formData = new FormData();
            formData.append('file', file);
            
            // Use public IPFS gateway for upload
            const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('IPFS upload failed');
            }
            
            const result = await response.json();
            const ipfsHash = result.Hash;
            
            console.log('File uploaded to IPFS:', ipfsHash);
            return {
                hash: ipfsHash,
                url: `${this.ipfsGateway}${ipfsHash}`,
                size: file.size,
                type: file.type
            };
            
        } catch (error) {
            console.error('IPFS upload failed:', error);
            
            // Fallback: Use local storage for demo
            return this.uploadToLocalStorage(file);
        }
    }

    async uploadToLocalStorage(file) {
        try {
            // Convert file to base64 for local storage
            const base64 = await this.fileToBase64(file);
            const fileId = 'local_' + Date.now();
            
            // Store in localStorage for demo
            localStorage.setItem(`file_${fileId}`, base64);
            
            return {
                hash: fileId,
                url: `data:${file.type};base64,${base64}`,
                size: file.size,
                type: file.type,
                isLocal: true
            };
        } catch (error) {
            console.error('Local storage upload failed:', error);
            throw error;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    async getFromIPFS(hash) {
        try {
            const url = `${this.ipfsGateway}${hash}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from IPFS');
            }
            
            return response;
        } catch (error) {
            console.error('Failed to get from IPFS:', error);
            throw error;
        }
    }

    async pinToIPFS(hash) {
        try {
            if (!this.pinataApiKey) {
                console.log('Pinata API key not set, skipping pinning');
                return false;
            }
            
            const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                },
                body: JSON.stringify({
                    hashToPin: hash,
                    pinataMetadata: {
                        name: 'Content Hub Video'
                    }
                })
            });
            
            if (response.ok) {
                console.log('File pinned to IPFS:', hash);
                return true;
            } else {
                console.log('Pinata pinning failed, file still accessible via IPFS');
                return false;
            }
        } catch (error) {
            console.error('Pinata pinning failed:', error);
            return false;
        }
    }

    // Get file info from IPFS
    async getFileInfo(hash) {
        try {
            const response = await fetch(`${this.ipfsGateway}${hash}?format=json`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Failed to get file info:', error);
            return null;
        }
    }

    // Check if file exists on IPFS
    async checkFileExists(hash) {
        try {
            const response = await fetch(`${this.ipfsGateway}${hash}`, {
                method: 'HEAD'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Get multiple files from IPFS
    async getMultipleFiles(hashes) {
        const results = [];
        for (const hash of hashes) {
            try {
                const exists = await this.checkFileExists(hash);
                results.push({
                    hash,
                    exists,
                    url: exists ? `${this.ipfsGateway}${hash}` : null
                });
            } catch (error) {
                results.push({
                    hash,
                    exists: false,
                    url: null,
                    error: error.message
                });
            }
        }
        return results;
    }

    // Set Pinata credentials (optional)
    setPinataCredentials(apiKey, secretKey) {
        this.pinataApiKey = apiKey;
        this.pinataSecretKey = secretKey;
        console.log('Pinata credentials set');
    }

    // Get storage stats
    getStorageStats() {
        const localFiles = Object.keys(localStorage).filter(key => key.startsWith('file_'));
        return {
            localFiles: localFiles.length,
            totalSize: this.calculateLocalStorageSize(),
            ipfsGateway: this.ipfsGateway
        };
    }

    calculateLocalStorageSize() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('file_')) {
                const value = localStorage.getItem(key);
                totalSize += value ? value.length : 0;
            }
        }
        return totalSize;
    }
}

// Initialize IPFS storage
const ipfsStorage = new IPFSStorage();
