# Shares API Test Cases

## POST /api/shares

### Valid Inputs
- [ ] Creates share with valid data
- [ ] Calculates correct share_depth (parent depth + 1)
- [ ] Generates unique share_url with share ID
- [ ] Links to parent_share_id correctly
- [ ] Initializes earnings_lamports to 0
- [ ] Increments total_shares on content

### Invalid Inputs
- [ ] Rejects missing content_id
- [ ] Rejects missing wallet_address
- [ ] Rejects invalid content_id
- [ ] Rejects invalid parent_share_id

### Edge Cases
- [ ] Allows same wallet to create multiple shares
- [ ] Handles creating share without parent (depth 0)
- [ ] Handles very deep chains (depth 100+)
- [ ] Prevents share of non-existent content
- [ ] Handles concurrent share creations

## GET /api/share/:shareId

### Valid Requests
- [ ] Returns share by ID
- [ ] Includes all share fields
- [ ] Returns content_id for navigation

### Invalid Requests
- [ ] Returns 404 for non-existent share ID
- [ ] Returns 400 for malformed share ID

## GET /api/shares/:contentId/tree

### Valid Requests
- [ ] Returns hierarchical tree structure
- [ ] Root node is creator share
- [ ] Children are nested correctly
- [ ] Includes all share fields in nodes
- [ ] Calculates maxDepth correctly

### Edge Cases
- [ ] Returns single node for content with one share
- [ ] Handles content with no shares
- [ ] Handles very wide trees (100+ children per node)
- [ ] Handles very deep trees (depth 50+)
- [ ] Handles orphaned shares (parent deleted)
- [ ] Returns 404 for non-existent content

