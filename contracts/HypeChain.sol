// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HypeChain
 * @dev Proof-of-Hype: On-chain viral attribution system
 * Tracks content NFTs and viral share chains with parent-child relationships
 */
contract HypeChain {
    // Content struct
    struct Content {
        address creator;
        string contentURI;  // IPFS or media URL
        uint256 totalShares;
        uint256 timestamp;
        bool exists;
    }

    // Share struct
    struct Share {
        uint256 contentId;
        address sharer;
        uint256 parentShareId;  // 0 if no parent (creator's initial share)
        uint256 depth;          // Depth in viral tree
        uint256 timestamp;
        bool exists;
    }

    // State variables
    uint256 private contentCounter;
    uint256 private shareCounter;

    mapping(uint256 => Content) public contents;
    mapping(uint256 => Share) public shares;
    mapping(uint256 => uint256) public contentToCreatorShare;  // contentId => first share ID

    // Events for Somnia Data Streams to listen to
    event ContentCreated(
        uint256 indexed contentId,
        address indexed creator,
        string contentURI,
        uint256 timestamp
    );

    event ShareCreated(
        uint256 indexed shareId,
        uint256 indexed contentId,
        address indexed sharer,
        uint256 parentShareId,
        uint256 depth,
        uint256 timestamp
    );

    event EngagementRecorded(
        uint256 indexed shareId,
        uint256 indexed contentId,
        address indexed user,
        string engagementType,  // "view", "click", "share"
        uint256 timestamp
    );

    /**
     * @dev Create new viral content and initial share
     * @param contentURI IPFS hash or media URL
     * @return contentId The ID of created content
     * @return shareId The ID of creator's initial share
     */
    function createContent(string memory contentURI) 
        external 
        returns (uint256 contentId, uint256 shareId) 
    {
        contentCounter++;
        contentId = contentCounter;

        contents[contentId] = Content({
            creator: msg.sender,
            contentURI: contentURI,
            totalShares: 0,
            timestamp: block.timestamp,
            exists: true
        });

        // Create initial share for creator (depth 0, no parent)
        shareCounter++;
        shareId = shareCounter;

        shares[shareId] = Share({
            contentId: contentId,
            sharer: msg.sender,
            parentShareId: 0,  // No parent
            depth: 0,          // Creator is depth 0
            timestamp: block.timestamp,
            exists: true
        });

        contentToCreatorShare[contentId] = shareId;

        emit ContentCreated(contentId, msg.sender, contentURI, block.timestamp);
        emit ShareCreated(shareId, contentId, msg.sender, 0, 0, block.timestamp);

        return (contentId, shareId);
    }

    /**
     * @dev Create a viral share link
     * @param contentId ID of content being shared
     * @param parentShareId ID of parent share (whose link was used)
     * @return shareId The ID of new share
     */
    function createShare(uint256 contentId, uint256 parentShareId)
        external
        returns (uint256 shareId)
    {
        require(contents[contentId].exists, "Content does not exist");
        require(parentShareId == 0 || shares[parentShareId].exists, "Parent share does not exist");

        // Calculate depth
        uint256 depth = 0;
        if (parentShareId != 0) {
            depth = shares[parentShareId].depth + 1;
        }

        shareCounter++;
        shareId = shareCounter;

        shares[shareId] = Share({
            contentId: contentId,
            sharer: msg.sender,
            parentShareId: parentShareId,
            depth: depth,
            timestamp: block.timestamp,
            exists: true
        });

        // Increment total shares for content
        contents[contentId].totalShares++;

        emit ShareCreated(shareId, contentId, msg.sender, parentShareId, depth, block.timestamp);

        return shareId;
    }

    /**
     * @dev Record an engagement (view, click, share)
     * @param shareId ID of share being engaged with
     * @param engagementType Type of engagement ("view", "click", "share")
     */
    function recordEngagement(uint256 shareId, string memory engagementType) external {
        require(shares[shareId].exists, "Share does not exist");

        uint256 contentId = shares[shareId].contentId;

        emit EngagementRecorded(
            shareId,
            contentId,
            msg.sender,
            engagementType,
            block.timestamp
        );
    }

    /**
     * @dev Get content details
     */
    function getContent(uint256 contentId) 
        external 
        view 
        returns (
            address creator,
            string memory contentURI,
            uint256 totalShares,
            uint256 timestamp
        ) 
    {
        require(contents[contentId].exists, "Content does not exist");
        Content memory content = contents[contentId];
        return (content.creator, content.contentURI, content.totalShares, content.timestamp);
    }

    /**
     * @dev Get share details
     */
    function getShare(uint256 shareId)
        external
        view
        returns (
            uint256 contentId,
            address sharer,
            uint256 parentShareId,
            uint256 depth,
            uint256 timestamp
        )
    {
        require(shares[shareId].exists, "Share does not exist");
        Share memory share = shares[shareId];
        return (share.contentId, share.sharer, share.parentShareId, share.depth, share.timestamp);
    }

    /**
     * @dev Get current counters
     */
    function getCounters() external view returns (uint256 totalContents, uint256 totalShares) {
        return (contentCounter, shareCounter);
    }
}

