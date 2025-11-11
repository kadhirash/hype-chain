# Engagements API Test Cases

## POST /api/engagements

### Valid Inputs
- [ ] Records view engagement
- [ ] Records click engagement
- [ ] Records share engagement
- [ ] Increments click_count on share for clicks
- [ ] Increments total_engagements on content
- [ ] Returns success response

### Invalid Inputs
- [ ] Rejects missing share_id
- [ ] Rejects missing engagement_type
- [ ] Rejects invalid engagement_type
- [ ] Rejects invalid share_id

### Edge Cases
- [ ] Handles non-existent share_id gracefully
- [ ] Handles rapid concurrent engagements
- [ ] Handles very high engagement counts (millions)
- [ ] Prevents negative engagement counts
- [ ] Handles missing content_id in share data

### Engagement Types
- [ ] Accepts 'view' type
- [ ] Accepts 'click' type
- [ ] Accepts 'share' type
- [ ] Rejects unknown types

### Data Integrity
- [ ] Ensures click_count never decreases
- [ ] Ensures total_engagements never decreases
- [ ] Handles database update failures gracefully
- [ ] Maintains consistency across tables

