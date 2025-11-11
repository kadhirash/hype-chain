# Content API Test Cases

## POST /api/content

### Valid Inputs
- [ ] Creates content with valid data
- [ ] Generates unique NFT address
- [ ] Creates initial share for creator
- [ ] Returns content and share in response
- [ ] Share has unique shareId for URL

### Invalid Inputs
- [ ] Rejects missing title
- [ ] Rejects missing media_url
- [ ] Rejects missing creator_wallet
- [ ] Rejects invalid media_url format
- [ ] Rejects duplicate nft_address

### Edge Cases
- [ ] Handles very long titles (1000+ chars)
- [ ] Handles special characters in title
- [ ] Handles invalid wallet address format
- [ ] Handles malformed JSON

## GET /api/content

### Valid Requests
- [ ] Returns all content with pagination
- [ ] Returns accurate total_shares count (live query)
- [ ] Returns content sorted by created_at desc
- [ ] Includes all required fields

### Query Parameters
- [ ] Respects limit parameter
- [ ] Respects offset parameter
- [ ] Defaults to reasonable limit

### Edge Cases
- [ ] Returns empty array when no content exists
- [ ] Handles very large offset values
- [ ] Handles invalid limit values (negative, string)

## GET /api/content/:id

### Valid Requests
- [ ] Returns content details with stats
- [ ] Includes aggregated shares count
- [ ] Includes aggregated engagements count
- [ ] Includes top sharers data

### Invalid Requests
- [ ] Returns 404 for non-existent content ID
- [ ] Returns 400 for malformed content ID

### Edge Cases
- [ ] Handles content with no shares
- [ ] Handles content with no engagements
- [ ] Handles very large stats (1M+ shares)

