from algopy import ARC4Contract, GlobalStateUint64, GlobalStateBytes, GlobalStateMap, UInt64, Bytes, abimethod, arc4
from algopy.arc4 import UInt64 as ARC4UInt64, Bytes as ARC4Bytes

class AlgoContentHub(ARC4Contract):
    """
    Algo Content Hub - Content viewing and payment system
    Handles: Content registry, payment processing, access control, revenue distribution
    """
    
    def __init__(self):
        # Content registry
        self.content_hashes = GlobalStateMap[Bytes, Bytes]()  # Content ID -> IPFS hash
        self.content_owners = GlobalStateMap[Bytes, Bytes]()  # Content ID -> Owner address
        self.content_prices = GlobalStateMap[Bytes, UInt64]()  # Content ID -> View price
        self.content_types = GlobalStateMap[Bytes, Bytes]()  # Content ID -> Content type
        self.content_metadata = GlobalStateMap[Bytes, Bytes]()  # Content ID -> Metadata hash
        
        # Access control
        self.view_permissions = GlobalStateMap[Bytes, Bytes]()  # Content ID -> User permissions
        self.view_sessions = GlobalStateMap[Bytes, UInt64]()  # Content ID -> Session expiry
        self.ownership_tokens = GlobalStateMap[Bytes, UInt64]()  # Content ID -> Ownership price
        
        # Revenue management
        self.platform_fee = GlobalStateUint64()  # Platform fee percentage (1-10%)
        self.total_revenue = GlobalStateUint64()  # Total platform revenue
        self.creator_revenue = GlobalStateMap[Bytes, UInt64]()  # Content ID -> Creator revenue
        self.payment_history = GlobalStateMap[Bytes, UInt64]()  # User -> Total payments
        
        # Content verification
        self.verified_content = GlobalStateMap[Bytes, Bytes]()  # Content ID -> Verification status
        self.content_registry = GlobalStateMap[Bytes, Bytes]()  # Content ID -> Registry data
        
        # NFT ownership
        self.nft_metadata = GlobalStateMap[Bytes, Bytes]()  # Content ID -> NFT metadata hash
        self.nft_owners = GlobalStateMap[Bytes, Bytes]()  # Content ID -> NFT owner
        self.nft_created = GlobalStateMap[Bytes, Bytes]()  # Content ID -> NFT creation status
        
        # Platform settings
        self.platform_name = GlobalStateBytes()  # "AlgoContentHub"
        self.platform_version = GlobalStateBytes()  # "1.0"
        self.platform_owner = GlobalStateBytes()  # Platform owner wallet address
        self.total_content = GlobalStateUint64()  # Total content count
        self.total_users = GlobalStateUint64()  # Total user count
    
    @abimethod()
    def initialize_platform(
        self,
        platform_name: Bytes,
        platform_version: Bytes,
        platform_fee_percentage: UInt64,
        platform_owner: Bytes
    ):
        """Initialize the Algo Content Hub platform"""
        # Set platform details
        self.platform_name = platform_name
        self.platform_version = platform_version
        self.platform_fee = platform_fee_percentage
        self.platform_owner = platform_owner
        
        # Initialize counters
        self.total_content = 0
        self.total_users = 0
        self.total_revenue = 0
        
        # Emit platform initialization event
        self.emit_platform_initialized_event(platform_name, platform_version)
    
    @abimethod()
    def upload_content(
        self,
        content_id: Bytes,
        ipfs_hash: Bytes,
        content_type: Bytes,  # "video", "image", "url"
        view_price: UInt64,
        ownership_price: UInt64,
        metadata_hash: Bytes
    ):
        """Upload content to the platform"""
        # Store content data
        self.content_hashes[content_id] = ipfs_hash
        self.content_owners[content_id] = get_caller_address()
        self.content_prices[content_id] = view_price
        self.content_types[content_id] = content_type
        self.content_metadata[content_id] = metadata_hash
        self.ownership_tokens[content_id] = ownership_price
        
        # Mark as verified
        self.verified_content[content_id] = "verified"
        
        # Create content registry entry
        registry_data = self.create_content_registry_entry(content_id, ipfs_hash, content_type)
        self.content_registry[content_id] = registry_data
        
        # Update counters
        self.total_content += 1
        
        # Emit content uploaded event
        self.emit_content_uploaded_event(content_id, ipfs_hash, content_type, view_price)
    
    @abimethod()
    def pay_to_view(
        self,
        content_id: Bytes,
        payment_amount: UInt64
    ):
        """Pay to view content"""
        # Verify content exists
        assert self.verified_content[content_id] == "verified"
        
        # Verify payment amount
        required_payment = self.content_prices[content_id]
        assert payment_amount >= required_payment
        
        # Calculate fees
        platform_fee = (payment_amount * self.platform_fee) // 100
        creator_payment = payment_amount - platform_fee
        
        # Send payment to creator
        creator_address = self.content_owners[content_id]
        send_payment(creator_address, creator_payment)
        
        # Update revenue tracking
        self.total_revenue += platform_fee
        self.creator_revenue[content_id] += creator_payment
        
        # Update user payment history
        user_address = get_caller_address()
        self.payment_history[user_address] += payment_amount
        
        # Grant view access
        self.grant_view_access(content_id, user_address)
        
        # Emit payment processed event
        self.emit_payment_processed_event(content_id, user_address, payment_amount)
    
    @abimethod()
    def pay_to_own(
        self,
        content_id: Bytes,
        payment_amount: UInt64
    ):
        """Pay to own content (get NFT)"""
        # Verify content exists
        assert self.verified_content[content_id] == "verified"
        
        # Verify payment amount
        required_payment = self.ownership_tokens[content_id]
        assert payment_amount >= required_payment
        
        # Calculate fees
        platform_fee = (payment_amount * self.platform_fee) // 100
        creator_payment = payment_amount - platform_fee
        
        # Send payment to creator
        creator_address = self.content_owners[content_id]
        send_payment(creator_address, creator_payment)
        
        # Update revenue tracking
        self.total_revenue += platform_fee
        self.creator_revenue[content_id] += creator_payment
        
        # Create ownership NFT
        self.create_ownership_nft(content_id, get_caller_address())
        
        # Emit ownership granted event
        self.emit_ownership_granted_event(content_id, get_caller_address(), payment_amount)
    
    @abimethod()
    def grant_view_access(self, content_id: Bytes, user_address: Bytes):
        """Grant view access to user"""
        # Create view session (24 hours)
        session_duration = 24 * 60 * 60  # 24 hours in seconds
        session_expiry = get_current_timestamp() + session_duration
        
        # Store view permission
        self.view_permissions[content_id] = user_address
        self.view_sessions[content_id] = session_expiry
        
        # Emit access granted event
        self.emit_access_granted_event(content_id, user_address, session_expiry)
    
    @abimethod()
    def verify_view_access(self, content_id: Bytes, user_address: Bytes) -> bool:
        """Verify if user can view content"""
        # Check if user has permission
        if self.view_permissions[content_id] != user_address:
            return False
        
        # Check if session is still valid
        session_expiry = self.view_sessions[content_id]
        if get_current_timestamp() > session_expiry:
            return False
        
        return True
    
    @abimethod()
    def create_ownership_nft(self, content_id: Bytes, owner_address: Bytes):
        """Create NFT for content ownership"""
        # Create NFT metadata
        nft_metadata = {
            "content_id": content_id,
            "owner": owner_address,
            "platform": "AlgoContentHub",
            "blockchain": "Algorand",
            "timestamp": get_current_timestamp(),
            "ipfs_hash": self.content_hashes[content_id]
        }
        
        # Store NFT metadata hash
        nft_metadata_hash = self.store_nft_metadata(nft_metadata)
        self.nft_metadata[content_id] = nft_metadata_hash
        self.nft_owners[content_id] = owner_address
        self.nft_created[content_id] = "created"
        
        # Emit NFT created event
        self.emit_nft_created_event(content_id, owner_address, nft_metadata_hash)
    
    @abimethod()
    def get_content_info(self, content_id: Bytes) -> (Bytes, Bytes, Bytes, UInt64, Bytes):
        """Get content information for DApp"""
        return (
            self.content_hashes[content_id],  # IPFS hash
            self.content_metadata[content_id],  # Metadata hash
            self.content_owners[content_id],  # Owner address
            self.content_prices[content_id],  # View price
            self.content_types[content_id]  # Content type
        )
    
    @abimethod()
    def get_user_content(self, user_address: Bytes) -> Bytes:
        """Get all content owned by user"""
        user_content = []
        
        for content_id in self.content_registry:
            if self.content_owners[content_id] == user_address:
                user_content.append(content_id)
        
        return user_content
    
    @abimethod()
    def get_platform_stats(self) -> (UInt64, UInt64, UInt64, UInt64):
        """Get platform statistics"""
        return (
            self.total_content,  # Total content count
            self.total_users,  # Total user count
            self.total_revenue,  # Total platform revenue
            self.platform_fee  # Platform fee percentage
        )
    
    @abimethod()
    def get_creator_revenue(self, content_id: Bytes) -> UInt64:
        """Get creator revenue for specific content"""
        return self.creator_revenue[content_id]
    
    @abimethod()
    def get_user_payments(self, user_address: Bytes) -> UInt64:
        """Get total payments made by user"""
        return self.payment_history[user_address]
    
    # Helper functions
    def create_content_registry_entry(self, content_id: Bytes, ipfs_hash: Bytes, content_type: Bytes) -> Bytes:
        """Create content registry entry"""
        registry_entry = {
            "content_id": content_id,
            "ipfs_hash": ipfs_hash,
            "content_type": content_type,
            "platform": "AlgoContentHub",
            "blockchain": "Algorand",
            "timestamp": get_current_timestamp(),
            "verified": True
        }
        return registry_entry
    
    def store_nft_metadata(self, nft_metadata: dict) -> Bytes:
        """Store NFT metadata and return hash"""
        # This would store metadata on IPFS and return hash
        # For now, return a placeholder hash
        return "nft_metadata_hash"
    
    def emit_platform_initialized_event(self, platform_name: Bytes, platform_version: Bytes):
        """Emit platform initialization event"""
        pass
    
    def emit_content_uploaded_event(self, content_id: Bytes, ipfs_hash: Bytes, content_type: Bytes, view_price: UInt64):
        """Emit content uploaded event"""
        pass
    
    def emit_payment_processed_event(self, content_id: Bytes, user_address: Bytes, payment_amount: UInt64):
        """Emit payment processed event"""
        pass
    
    def emit_access_granted_event(self, content_id: Bytes, user_address: Bytes, session_expiry: UInt64):
        """Emit access granted event"""
        pass
    
    def emit_ownership_granted_event(self, content_id: Bytes, owner_address: Bytes, payment_amount: UInt64):
        """Emit ownership granted event"""
        pass
    
    def emit_nft_created_event(self, content_id: Bytes, owner_address: Bytes, nft_metadata_hash: Bytes):
        """Emit NFT created event"""
        pass
    
    def get_caller_address(self) -> Bytes:
        """Get caller address"""
        return get_caller_address()
    
    def get_current_timestamp(self) -> UInt64:
        """Get current timestamp"""
        return get_current_timestamp()
    
    def send_payment(self, recipient: Bytes, amount: UInt64):
        """Send payment to recipient"""
        # This would send ALGO payment
        pass
