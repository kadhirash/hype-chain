# HypeChain Test Suite

## Overview
This directory contains tests for the HypeChain project, covering smart contracts and API routes.

## Test Structure

```
src/test/
├── HypeChain.test.ts          # Smart contract tests (Hardhat/Chai)
└── api/                        # API route test documentation
    ├── content.test.md         # Content API test cases
    ├── shares.test.md          # Shares API test cases
    ├── engagements.test.md     # Engagements API test cases
    └── revenue.test.md         # Revenue distribution test cases
```

## Smart Contract Tests

### Running Smart Contract Tests
```bash
npx hardhat test
```

### Coverage
- Content creation and NFT minting
- Share creation with parent-child relationships
- Engagement tracking (views, clicks, shares)
- Edge cases and validation
- Event emissions

## API Route Tests

### Current Status
API route tests are documented in markdown files with checkboxes indicating manual testing status. These document:
- Valid input scenarios
- Invalid input scenarios
- Edge cases
- Data integrity checks
- Performance considerations

### Manual Testing
All API routes have been manually tested using curl commands. See test documentation files for details on what has been verified.

## Test Coverage Summary

### Smart Contracts
- [x] 13 comprehensive tests
- [x] All core functionality covered
- [x] Edge cases tested
- [x] Event emissions verified

### API Routes
- [x] Revenue distribution (fully tested)
  - Valid inputs with various amounts
  - Decimal, negative, zero validation
  - String and NaN handling
  - Max safe integer validation
  - Rounding error handling
  - Distribution algorithm verification
- [x] Content creation (manual testing)
- [x] Share creation (manual testing)
- [x] Engagement tracking (manual testing)
- [x] Viral tree generation (manual testing)

## Testing Philosophy

For this hackathon MVP, we prioritize:
1. Manual API testing with real data
2. Comprehensive smart contract tests
3. Edge case documentation
4. Input validation at API level

This approach ensures core functionality works correctly while maintaining rapid development speed.

## Future Improvements

For production:
- Add Jest + Supertest for automated API testing
- Add integration tests for full user flows
- Add load testing for viral chain performance
- Add E2E tests with Playwright/Cypress
- Add CI/CD pipeline with automated test runs

