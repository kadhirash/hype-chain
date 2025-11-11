# Revenue API Test Cases

## POST /api/revenue

### Valid Inputs
- [x] Distributes 1,000,000 lamports across 3 shares
- [x] Returns success response with distributions array
- [x] Updates earnings_lamports for all shares
- [x] Updates total_revenue_lamports on content
- [x] Gives remainder to creator on uneven division

### Edge Cases - Invalid Inputs
- [x] Rejects decimal numbers (1000.5)
- [x] Rejects negative numbers (-1000)
- [x] Rejects zero (0)
- [x] Rejects string input ("1000")
- [x] Rejects missing content_id
- [x] Rejects invalid content_id type
- [x] Rejects values > Number.MAX_SAFE_INTEGER

### Edge Cases - Data State
- [x] Returns 404 for non-existent content
- [x] Returns 404 for content with no shares
- [ ] Handles concurrent revenue distributions
- [ ] Handles very large viral chains (1000+ shares)

### Distribution Algorithm
- [x] Uses exponential decay (2^(maxDepth - currentDepth))
- [x] Creator (depth 0) receives most
- [x] Each subsequent depth receives progressively less
- [x] Total distributed equals input amount exactly

